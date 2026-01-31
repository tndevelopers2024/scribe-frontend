export const FACULTY_ENDPOINTS = {
    STUDENTS: (id) => `/api/faculty/students`, // If using the new one
    STUDENT_PORTFOLIO: (id) => `/api/faculty/student/${id}`,
    REVIEW: `/api/faculty/review`
};
