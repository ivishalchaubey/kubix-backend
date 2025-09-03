# CSV Upload Format Guide for Categories Under Parent

## New Endpoint

```
POST /api/v1/admin/categories/upload-csv-under-parent
```

## Request Format

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Headers**:
  - `Authorization: Bearer <your-jwt-token>`
  - `Content-Type: multipart/form-data`

## Form Data Parameters

- `csvFile`: The CSV file (required)
- `parentId`: The ID of the parent category (required)
- `order`: The order number for all categories in the CSV (required)

## CSV Format

### Required Columns

- `name`: Category name (required)

### Optional Columns

- `description`: Category description
- `image`: Image URL or path
- `isLeafNode`: true/false or 1/0 (default: false)
- `a_day_in_life`: Description of a day in the life of this career
- `core_skills_technical`: Comma-separated technical skills
- `core_skills_soft`: Comma-separated soft skills
- `educational_path_ug`: Comma-separated undergraduate courses
- `educational_path_pg`: Comma-separated postgraduate courses
- `salary_range`: Salary range information
- `future_outlook_demand`: Future demand outlook
- `future_outlook_reason`: Reason for the outlook

## Example CSV Content

```csv
name,description,image,isLeafNode,a_day_in_life,core_skills_technical,core_skills_soft,educational_path_ug,educational_path_pg,salary_range,future_outlook_demand,future_outlook_reason
Software Engineer,Develops software applications,https://example.com/software-engineer.jpg,true,Start day with standup meeting,"JavaScript,Python","Communication,Problem Solving","Computer Science","Software Engineering",3-8 LPA,High,Digital transformation
Data Scientist,Analyzes data to find insights,https://example.com/data-scientist.jpg,true,Analyze datasets and build models,"Python,R,SQL","Statistical Analysis","Mathematics","Data Science",4-12 LPA,Very High,AI and ML growth
Product Manager,Manages product development,https://example.com/pm.jpg,true,Plan sprints and coordinate teams,"Product Strategy","User Research,Leadership","Business Administration","MBA",5-15 LPA,High,Product-driven economy
```

## Example cURL Request

```bash
curl -X POST 'http://localhost:5000/api/v1/admin/categories/upload-csv-under-parent' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -F 'csvFile=@categories.csv' \
  -F 'parentId=68b875db72c590e7e15f9862' \
  -F 'order=3'
```

## Response Format

```json
{
  "success": true,
  "message": "Categories uploaded successfully under parent from CSV",
  "data": {
    "result": {
      "message": "Categories uploaded successfully under parent",
      "parentId": "68b875db72c590e7e15f9862",
      "order": 3,
      "totalProcessed": 3,
      "totalSaved": 3,
      "categories": [
        {
          "_id": "...",
          "name": "Software Engineer",
          "parentId": "68b875db72c590e7e15f9862",
          "order": 3,
          "description": "Develops software applications",
          "image": "https://example.com/software-engineer.jpg",
          "isLeafNode": true,
          "a_day_in_life": "Start day with standup meeting",
          "core_skills": {
            "technical": ["JavaScript", "Python"],
            "soft": ["Communication", "Problem Solving"]
          },
          "educational_path": {
            "ug_courses": ["Computer Science"],
            "pg_courses": ["Software Engineering"]
          },
          "salary_range": "3-8 LPA",
          "future_outlook": {
            "demand": "High",
            "reason": "Digital transformation"
          },
          "createdAt": "2025-01-03T...",
          "updatedAt": "2025-01-03T..."
        }
        // ... more categories
      ]
    }
  },
  "statusCode": 201
}
```

## Notes

- All categories in the CSV will be created under the same parent with the same order
- The `parentId` must be a valid existing category ID
- The `order` should be the level you want these categories to be at (e.g., 2 for subcategories, 3 for sub-subcategories)
- Empty fields will be set to default values
- Comma-separated fields (like skills) will be automatically split into arrays
- Boolean fields accept "true"/"false" or "1"/"0"
