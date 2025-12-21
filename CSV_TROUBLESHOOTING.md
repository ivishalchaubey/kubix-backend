# CSV Upload Troubleshooting Guide

## Common Issues and Solutions

### 1. "Invalid Record Length" Error

**Error Message**: `Invalid Record Length: columns length is 13, got X on line Y`

**Cause**: The CSV file has inconsistent column counts between rows.

**Solutions**:
- Ensure every row has exactly 13 columns
- Check for missing commas in rows
- Use proper CSV formatting with quotes around fields containing commas
- Verify the header row has all 13 column names

**Example of Correct Format**:
```csv
name,level,description,image,isLeafNode,a_day_in_life,core_skills_technical,core_skills_soft,educational_path_ug,educational_path_pg,salary_range,future_outlook_demand,future_outlook_reason
Engineering,1,,,,false,,,,,,,
Computer Science,2,,,,false,,,,,,,
```

### 2. Missing Required Fields

**Error**: Categories are skipped during processing

**Required Fields**:
- `name` - Category name (cannot be empty)
- `level` - Hierarchy level (must be a number: 1, 2, 3, 4...)

**Solution**: Ensure these fields are populated in every row.

### 3. CSV Format Issues

**Common Problems**:
- Extra spaces around commas
- Missing quotes around fields with commas
- Inconsistent line endings (Windows vs Unix)
- Hidden characters or encoding issues

**Solutions**:
- Use a proper CSV editor (Excel, Google Sheets, VS Code)
- Save as UTF-8 encoding
- Use quotes around fields containing commas: `"SQL,Analytics,Testing"`
- Ensure consistent line endings

### 4. File Upload Issues

**Problems**:
- File not being sent
- Wrong file type
- File too large

**Solutions**:
- Ensure the form field name is `csvFile`
- Use only CSV files (.csv extension)
- Keep file size under 5MB
- Check that `Content-Type` is `multipart/form-data`

## CSV Template Best Practices

### 1. Use Quotes for Complex Fields
```csv
name,level,description
Simple Name,1,Basic description
"Complex Name, with comma",2,"Description with, commas and quotes"
```

### 2. Handle Arrays Properly
```csv
core_skills_technical,core_skills_soft
"SQL,Analytics,Testing","Leadership,Communication"
```

### 3. Consistent Empty Fields
```csv
name,level,description,image
Category1,1,,,
Category2,2,Some description,,
```

## Testing Your CSV

### 1. Validate Structure
- Count commas in each row (should be 12 commas = 13 columns)
- Check that required fields are populated
- Ensure proper quoting around complex fields

### 2. Test with Simple Data First
Start with a minimal CSV file:
```csv
name,level,description,image,isLeafNode,a_day_in_life,core_skills_technical,core_skills_soft,educational_path_ug,educational_path_pg,salary_range,future_outlook_demand,future_outlook_reason
Test1,1,,,,false,,,,,,,
Test2,2,,,,false,,,,,,,
```

### 3. Check Server Logs
The improved CSV parser now logs:
- CSV content preview
- Number of parsed records
- Sample record structure
- Skipped records

## Debugging Steps

1. **Check CSV Format**: Open in a text editor to see raw content
2. **Validate Columns**: Count commas in each row
3. **Test Upload**: Try with the simple test file first
4. **Check Logs**: Look for parsing information in server console
5. **Verify Data**: Ensure all required fields are present

## Example of a Working CSV

```csv
name,level,description,image,isLeafNode,a_day_in_life,core_skills_technical,core_skills_soft,educational_path_ug,educational_path_pg,salary_range,future_outlook_demand,future_outlook_reason
Engineering,1,,,,false,,,,,,,
Computer Science,2,,,,false,,,,,,,
Software Engineer,3,,,,false,,,,,,,
Frontend Developer,4,"Builds user interfaces","https://example.com/image.png",true,"Code review and development","JavaScript,React,HTML","Communication,Problem Solving","B.Tech,BCA","MCA,MS","₹6-15 LPA","High","Growing demand for web apps"
```

## Getting Help

If you continue to have issues:
1. Check the server console for detailed error messages
2. Verify your CSV format matches the template exactly
3. Test with the provided sample files
4. Ensure all required dependencies are installed 