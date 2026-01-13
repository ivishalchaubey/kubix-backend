import json
import requests
import time
import os
import concurrent.futures
import threading

# Configuration
API_URL = "http://localhost:5001/api/v1/courses/update-image"
DATA_FILE = "courses_converted.json"
MAX_WORKERS = 20  # Number of parallel threads

# Thread-safe counters, lock, and failed list
success_count = 0
failed_count = 0
skipped_count = 0
processed_count = 0
failed_items = []
print_lock = threading.Lock()
failed_items_lock = threading.Lock()

def process_course(course, total_courses):
    global success_count, failed_count, skipped_count, processed_count, failed_items
    
    course_name = course.get("courseName")
    image_url = course.get("imageUrl")
    career_name = course.get("careerName")

    if not course_name or not image_url:
        with print_lock:
            processed_count += 1
            print(f"[{processed_count}/{total_courses}] Skipping invalid entry: {course}")
            skipped_count += 1
        return

    payload = {
        "courseName": course_name,
        "imageUrl": image_url,
        "careerName": career_name
    }

    try:
        response = requests.post(API_URL, json=payload, timeout=30) # Add timeout
        
        with print_lock:
            processed_count += 1
            current_idx = processed_count
            
        if response.status_code == 200:
            resp_json = response.json()
            inner_data = resp_json.get('data', {})
            if isinstance(inner_data, dict) and 'message' in inner_data:
                msg = inner_data['message']
            else:
                msg = resp_json.get('message', 'Success')
            
            with print_lock:
                if "Skipped" in msg:
                    print(f"[{current_idx}/{total_courses}] ⏭️  {msg}")
                else:
                    print(f"[{current_idx}/{total_courses}] ✅ Success ({course_name}): {msg}")
                success_count += 1
        else:
            try:
                error_msg = response.json().get('message', response.text)
            except:
                error_msg = response.text
                
            with print_lock:
                print(f"[{current_idx}/{total_courses}] ❌ Failed ({course_name}): {response.status_code} - {error_msg}")
                failed_count += 1
            
            # Add to failed items
            course_copy = course.copy()
            course_copy['error_reason'] = f"{response.status_code} - {error_msg}"
            with failed_items_lock:
                failed_items.append(course_copy)
                
    except Exception as e:
        with print_lock:
            processed_count += 1
            print(f"[{processed_count}/{total_courses}] 💥 Exception ({course_name}): {str(e)}")
            failed_count += 1
        
        # Add to failed items
        course_copy = course.copy()
        course_copy['error_reason'] = str(e)
        with failed_items_lock:
            failed_items.append(course_copy)

def update_courses():
    # Check if file exists
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found.")
        return

    print(f"Reading {DATA_FILE}...")
    try:
        with open(DATA_FILE, 'r') as f:
            courses = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return

    total_courses = len(courses)
    print(f"Found {total_courses} courses to process.")
    print(f"Starting parallel processing with {MAX_WORKERS} workers...")
    
    start_time = time.time()

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks
        futures = [executor.submit(process_course, course, total_courses) for course in courses]
        
        # Wait for completion
        concurrent.futures.wait(futures)

    end_time = time.time()
    duration = end_time - start_time

    # Write failed items to JSON
    if failed_items:
        failed_file = "failed_courses.json"
        try:
            with open(failed_file, 'w') as f:
                json.dump(failed_items, f, indent=2)
            print(f"\n⚠️  Saved {len(failed_items)} failed items to '{failed_file}'")
        except Exception as e:
            print(f"\n❌ Error saving failed items: {e}")

    print("\n" + "="*30)
    print("SUMMARY")
    print("="*30)
    print(f"Total:      {total_courses}")
    print(f"Processed:  {success_count + failed_count + skipped_count}")
    print(f"Success:    {success_count}")
    print(f"Failed:     {failed_count}")
    print(f"Skipped:    {skipped_count}")
    print(f"Time Taken: {duration:.2f} seconds")
    print(f"Avg Speed:  {total_courses / duration:.2f} req/sec")
    print("="*30)

if __name__ == "__main__":
    update_courses()
