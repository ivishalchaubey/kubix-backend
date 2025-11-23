# University

```

Here
College Name -> collegeName
College Code -> collegeCode
City -> city
State -> state
About -> description
Course Offered -> courses
Phone Number -> phoneNumber
Website -> website
Address -> address
Year founded -> foundedYear
Major Stream -> specialization
```

```json
{
    "collegeName":"",
    "collegeCode":"",
    "countryCode:"",
    "phoneNumber":"",
    "website":"",
    "address":"",
    "email":"",
    "password":"",
    "profileImage":"",
    "bannerYoutubeVideoLink":"",
    "specialization":"",
    "description":"",

    // New Fields

    "state":"",
    "city":"",
    "courses:[
        {
            "courseName":"",
            "courseDuration":"",
        }
    ],
    "foundedYear":"",
    "bannerImage":"",
}
```

# Category

```
*** Here ***

Career Field -> parentId
Career Name -> name
Career Details -> description
Required Technical Skillset -> technical_skills
Required Soft Skillset -> soft_skills
Potential Earnings -> potential_earnings
Earnings Range -> salary_range
Required Qualifications -> qualifying_exams[]
A Day in the Life -> a_day_in_life
Education Pathway -> checklist
Growth Path -> growth_path
Future Growth and Oppurtunities -> future_growth
Pros -> pros
Cons -> cons
Myth -> myth
Fact -> reality
Person 1 -> superstar1
Person 2 -> superstar2
Person 3 -> superstar3
Related Careers -> related_careers
```

```json
{
  "name": "",
  "description": "",
  "salary_range": "",
  "qualifying_exams": [],
  "pros": "",
  "cons": "",
  "myth": "",
  "superstar1": "",
  "superstar2": "",
  "superstar3": "",
  "reality": "",
  "image": "",
  "related_careers": [],
  "checklist": [],

  // New Fields
  "technical_skills": "",
  "potential_earnings": [],
  "future_growth": ""
}
```

# Course (DONE)

```
*** Here ***

Course Name -> name
Duration -> duration
Course Fees Low -> course_fees_low
Course Fees High -> course_fees_high
Course Type -> course_type
About -> description
Subjects Per Semester -> semesters
Eligibility Criteria -> eligibility_criteria
Is this Course right for you -> is_this_course_right_for_you
```

```json
{
  "name": "",
  "duration": "",
  "description": "",
  "image": "",
  "currency": "",

  // New Fields
  "course_fees_low": "",
  "course_fees_high": "",
  "course_type": "",
  "semesters": [
    {
      "title": "",
      "description": ""
    }
  ],
  "eligibility_criteria": "",
  "is_this_course_right_for_you": ""
}
```
