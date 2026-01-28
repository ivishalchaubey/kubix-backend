export const KylasConfig = {
  BASE_URL: process.env.KYLAS_BASE_URL || "https://api.kylas.io/v1",
  API_KEY: process.env.KYLAS_API_KEY || "",

  // Custom field mappings - Update these with your actual Kylas custom field names
  CUSTOM_FIELDS: {
    CAREER_FIELD: "cf_career_field",
    SHORTLISTED_CAREERS: "cf_shortlisted_careers",
    SHORTLISTED_COURSES: "cf_shortlisted_courses",
    APPLIED_COURSES: "cf_applied_courses",
    SHORTLISTED_COLLEGES: "cf_shortlisted_colleges",
    BOARD: "cf_board",
    STREAM: "cf_stream",
    GRADE: "cf_grade",
    PLATFORM: "cf_platform",
  },

  // API configuration
  TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second

  // Default country code for India
  DEFAULT_COUNTRY_CODE: "IN",
  DEFAULT_DIAL_CODE: "+91",
};

export default KylasConfig;
