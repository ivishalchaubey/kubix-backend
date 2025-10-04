import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models (using compiled JS versions from dist folder)
import { Course } from './dist/app/modules/courses/models/Course.js';
import User from './dist/app/modules/auth/models/User.js';
import Category from './dist/app/modules/admin/categories/models/Category.js';

// Database configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vishalchaubey0011:tyVQdc92r1i1uzZi@cluster0.zajfs.mongodb.net/";

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Function to find university by name (searching in collegeName field)
async function findUniversityByName(universityName) {
  try {
    const university = await User.findOne({ 
      collegeName: { $regex: new RegExp(universityName, 'i') },
      role: 'university' // Assuming universities have role 'university'
    });
    
    if (!university) {
      console.log(`⚠️  University not found: ${universityName}`);
      return null;
    }
    
    return university._id;
  } catch (error) {
    console.error(`❌ Error finding university ${universityName}:`, error);
    return null;
  }
}

// Function to find category by name
async function findCategoryByName(categoryName) {
  try {
    const category = await Category.findOne({ 
      name: { $regex: new RegExp(categoryName, 'i') }
    });
    
    if (!category) {
      console.log(`⚠️  Category not found: ${categoryName}`);
      return null;
    }
    
    return category._id;
  } catch (error) {
    console.error(`❌ Error finding category ${categoryName}:`, error);
    return null;
  }
}

// Function to find parent category (assuming categories have parentId)
async function findParentCategory(categoryId) {
  try {
    const category = await Category.findById(categoryId);
    if (category && category.parentId) {
      return category.parentId;
    }
    return null;
  } catch (error) {
    console.error(`❌ Error finding parent category:`, error);
    return null;
  }
}

// Main function to populate courses
async function populateCourses() {
  try {
    // Read courses data from JSON file
    const coursesDataPath = path.join(__dirname, 'courses.json');
    const coursesData = JSON.parse(fs.readFileSync(coursesDataPath, 'utf8'));
    
    console.log(`📚 Found ${coursesData.length} courses to process`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const courseData of coursesData) {
      try {
        console.log(`\n🔄 Processing: ${courseData.name}`);
        
        // Find university ID
        const universityId = await findUniversityByName(courseData.universityName);
        if (!universityId) {
          console.log(`❌ Skipping course - University not found: ${courseData.universityName}`);
          errorCount++;
          continue;
        }
        
        // Find category ID
        const categoryId = await findCategoryByName(courseData.categoryName);
        if (!categoryId) {
          console.log(`❌ Skipping course - Category not found: ${courseData.categoryName}`);
          errorCount++;
          continue;
        }
        
        // Find parent category ID
        const parentCategoryId = await findParentCategory(categoryId);
        
        // Check if course already exists
        const existingCourse = await Course.findOne({ name: courseData.name });
        if (existingCourse) {
          console.log(`⚠️  Course already exists: ${courseData.name}`);
          continue;
        }
        
        // Create course object
        const courseObject = {
          name: courseData.name,
          categoryId: [categoryId],
          parentCategoryId: parentCategoryId ? [parentCategoryId] : [],
          description: courseData.description,
          image: "", // Default empty image
          duration: courseData.duration,
          UniversityId: universityId,
          amount: courseData.amount,
          currency: courseData.currency,
          chapters: courseData.chapters
        };
        
        // Save course to database
        const course = new Course(courseObject);
        await course.save();
        
        console.log(`✅ Successfully created course: ${courseData.name}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error processing course ${courseData.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully created: ${successCount} courses`);
    console.log(`❌ Errors: ${errorCount} courses`);
    console.log(`📚 Total processed: ${coursesData.length} courses`);
    
  } catch (error) {
    console.error('❌ Error in populateCourses:', error);
  }
}

// Function to create sample universities if they don't exist
async function createSampleUniversities() {
  const universities = [
    {
      firstName: "IIT",
      lastName: "Delhi",
      email: "admin@iitd.ac.in",
      collegeName: "Indian Institute of Technology Delhi",
      password: "password123",
      role: "university",
      countryCode: "+91",
      phoneNumber: "9876543210",
      isEmailVerified: true
    },
    {
      firstName: "IISc",
      lastName: "Bangalore",
      email: "admin@iisc.ac.in",
      collegeName: "Indian Institute of Science Bangalore",
      password: "password123",
      role: "university",
      countryCode: "+91",
      phoneNumber: "9876543211",
      isEmailVerified: true
    },
    {
      firstName: "XIM",
      lastName: "Bhubaneswar",
      email: "admin@xim.edu.in",
      collegeName: "Xavier Institute of Management",
      password: "password123",
      role: "university",
      countryCode: "+91",
      phoneNumber: "9876543212",
      isEmailVerified: true
    },
    {
      firstName: "IIM",
      lastName: "Ahmedabad",
      email: "admin@iima.ac.in",
      collegeName: "Indian Institute of Management Ahmedabad",
      password: "password123",
      role: "university",
      countryCode: "+91",
      phoneNumber: "9876543213",
      isEmailVerified: true
    },
    {
      firstName: "NIT",
      lastName: "Trichy",
      email: "admin@nitt.edu",
      collegeName: "National Institute of Technology Trichy",
      password: "password123",
      role: "university",
      countryCode: "+91",
      phoneNumber: "9876543214",
      isEmailVerified: true
    },
    {
      firstName: "BITS",
      lastName: "Pilani",
      email: "admin@bits-pilani.ac.in",
      collegeName: "Birla Institute of Technology and Science",
      password: "password123",
      role: "university",
      countryCode: "+91",
      phoneNumber: "9876543215",
      isEmailVerified: true
    },
    {
      firstName: "IIT",
      lastName: "Bombay",
      email: "admin@iitb.ac.in",
      collegeName: "Indian Institute of Technology Bombay",
      password: "password123",
      role: "university",
      countryCode: "+91",
      phoneNumber: "9876543216",
      isEmailVerified: true
    },
    {
      firstName: "IIT",
      lastName: "Madras",
      email: "admin@iitm.ac.in",
      collegeName: "Indian Institute of Technology Madras",
      password: "password123",
      role: "university",
      countryCode: "+91",
      phoneNumber: "9876543217",
      isEmailVerified: true
    },
    {
      firstName: "ISB",
      lastName: "Hyderabad",
      email: "admin@isb.edu",
      collegeName: "Indian School of Business",
      password: "password123",
      role: "university",
      countryCode: "+91",
      phoneNumber: "9876543218",
      isEmailVerified: true
    },
    {
      firstName: "IIT",
      lastName: "Kanpur",
      email: "admin@iitk.ac.in",
      collegeName: "Indian Institute of Technology Kanpur",
      password: "password123",
      role: "university",
      countryCode: "+91",
      phoneNumber: "9876543219",
      isEmailVerified: true
    }
  ];

  console.log('🏫 Creating sample universities...');
  
  for (const university of universities) {
    try {
      const existingUniversity = await User.findOne({ email: university.email });
      if (!existingUniversity) {
        const newUniversity = new User(university);
        await newUniversity.save();
        console.log(`✅ Created university: ${university.collegeName}`);
      } else {
        console.log(`⚠️  University already exists: ${university.collegeName}`);
      }
    } catch (error) {
      console.error(`❌ Error creating university ${university.collegeName}:`, error.message);
    }
  }
}

// Function to create sample categories if they don't exist
async function createSampleCategories() {
  const categories = [
    {
      name: "Computer Science",
      description: "Computer Science and Programming",
      order: 1,
      isLeafNode: false
    },
    {
      name: "Data Science",
      description: "Data Science and Analytics",
      order: 2,
      isLeafNode: false
    },
    {
      name: "Marketing",
      description: "Digital Marketing and Advertising",
      order: 3,
      isLeafNode: false
    },
    {
      name: "Finance",
      description: "Finance and Investment",
      order: 4,
      isLeafNode: false
    },
    {
      name: "Information Technology",
      description: "IT and Cybersecurity",
      order: 5,
      isLeafNode: false
    },
    {
      name: "Mobile Development",
      description: "Mobile App Development",
      order: 6,
      isLeafNode: false
    },
    {
      name: "Cloud Computing",
      description: "Cloud and DevOps",
      order: 7,
      isLeafNode: false
    },
    {
      name: "Artificial Intelligence",
      description: "AI and Machine Learning",
      order: 8,
      isLeafNode: false
    },
    {
      name: "Business Intelligence",
      description: "Business Analytics and Intelligence",
      order: 9,
      isLeafNode: false
    },
    {
      name: "Blockchain",
      description: "Blockchain and Cryptocurrency",
      order: 10,
      isLeafNode: false
    }
  ];

  console.log('📂 Creating sample categories...');
  
  for (const category of categories) {
    try {
      const existingCategory = await Category.findOne({ name: category.name });
      if (!existingCategory) {
        const newCategory = new Category(category);
        await newCategory.save();
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⚠️  Category already exists: ${category.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating category ${category.name}:`, error.message);
    }
  }
}

// Main execution function
async function main() {
  try {
    await connectDB();
    
    console.log('🚀 Starting course population process...\n');
    
    // Create sample universities and categories first
    await createSampleUniversities();
    console.log('');
    await createSampleCategories();
    console.log('');
    
    // Populate courses
    await populateCourses();
    
    console.log('\n🎉 Course population process completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📴 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
main();

export { populateCourses, createSampleUniversities, createSampleCategories };
