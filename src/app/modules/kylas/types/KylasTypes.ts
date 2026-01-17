export interface KylasPhoneNumber {
  type: "MOBILE" | "OFFICE" | "HOME";
  code: string;
  value: string;
  dialCode: string;
  primary: boolean;
}

export interface KylasEmail {
  type: "OFFICE" | "PERSONAL";
  value: string;
  primary: boolean;
}

export interface KylasCustomFields {
  cf_career_field?: string;
  cf_shortlisted_careers?: string;
  cf_shortlisted_courses?: string;
  cf_applied_courses?: string;
  cf_shortlisted_colleges?: string;
  cf_board?: string;
  cf_stream?: string;
  cf_grade?: string;
  [key: string]: any;
}

export interface CreateLeadPayload {
  firstName: string;
  lastName: string;
  phoneNumbers?: KylasPhoneNumber[] | undefined;
  emails: KylasEmail[];
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
  requirementName?: string | undefined;
  customFieldValues?: KylasCustomFields | undefined;
}

export interface UpdateLeadPayload {
  firstName?: string;
  lastName?: string;
  phoneNumbers?: KylasPhoneNumber[];
  emails?: KylasEmail[];
  city?: string;
  state?: string;
  country?: string;
  requirementName?: string;
  customFieldValues?: KylasCustomFields;
}

export interface KylasLead {
  id: number;
  firstName: string;
  lastName: string;
  emails: KylasEmail[];
  phoneNumbers?: KylasPhoneNumber[];
  customFieldValues?: KylasCustomFields;
}

export interface KylasSearchResponse {
  totalCount: number;
  records: KylasLead[];
}

export interface KylasApiError {
  message: string;
  statusCode: number;
  details?: any;
}

export enum ActivityType {
  CAREER_FIELD_SELECTED = "career_field_selected",
  CAREER_SHORTLISTED = "career_shortlisted",
  COURSE_SHORTLISTED = "course_shortlisted",
  COURSE_APPLIED = "course_applied",
  COLLEGE_SHORTLISTED = "college_shortlisted",
  ACCOUNT_DELETED = "account_deleted",
}
