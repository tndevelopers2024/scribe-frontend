// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_URL}/api/auth/login`,
    CHANGE_PASSWORD: `${API_URL}/api/auth/change-password`,
    FORGOT_PASSWORD: `${API_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_URL}/api/auth/reset-password`,

    // Profile
    PROFILE: `${API_URL}/api/profile`,
    ACHIEVEMENTS: `${API_URL}/api/profile/achievements`,
    COURSE_REFLECTIONS: `${API_URL}/api/profile/course-reflections`,
    BE_THE_CHANGE: `${API_URL}/api/profile/be-the-change`,
    RESEARCH_PUBLICATIONS: `${API_URL}/api/profile/research-publications`,
    INTERDISCIPLINARY_COLLABORATION: `${API_URL}/api/profile/interdisciplinary-collaboration`,
    CONFERENCE_PARTICIPATION: `${API_URL}/api/profile/conference-participation`,
    COMPETITIONS_AWARDS: `${API_URL}/api/profile/competitions-awards`,
    WORKSHOPS_TRAINING: `${API_URL}/api/profile/workshops-training`,
    CLINICAL_EXPERIENCES: `${API_URL}/api/profile/clinical-experiences`,
    VOLUNTARY_PARTICIPATION: `${API_URL}/api/profile/voluntary-participation`,
    ETHICS_THROUGH_ART: `${API_URL}/api/profile/ethics-through-art`,
    THOUGHTS_TO_ACTIONS: `${API_URL}/api/profile/thoughts-to-actions`,
    DISCUSSIONS: `${API_URL}/api/discussions`,
    UPLOAD: `${API_URL}/api/upload`,

    // Admin
    COLLEGES: `${API_URL}/api/admin/colleges`,
    USERS: `${API_URL}/api/admin/users`,
    COLLEGE: `${API_URL}/api/admin/college`,
    LEAD_FACULTY: `${API_URL}/api/admin/lead-faculty`,
    FACULTY: `${API_URL}/api/admin/faculty`,
    STUDENT: `${API_URL}/api/admin/student`,
    FACULTIES: (userId) => `${API_URL}/api/admin/faculties/${userId}`,
    STUDENTS: (facultyId) => `${API_URL}/api/admin/students/${facultyId}`,

    // Faculty
    FACULTY_STUDENTS: `${API_URL}/api/faculty/students`,
    FACULTY_STUDENT_PORTFOLIO: (id) => `${API_URL}/api/faculty/student/${id}`,
    FACULTY_REVIEW: `${API_URL}/api/faculty/review`,

    // Super Admin Management
    DELETE_COLLEGE: (id) => `${API_URL}/api/admin/college/${id}`,
    DELETE_USER: (id) => `${API_URL}/api/admin/user/${id}`,
    UPDATE_COLLEGE_LEAD: (id) => `${API_URL}/api/admin/college/${id}/lead`,
    UPDATE_FACULTY_LEAD: (id) => `${API_URL}/api/admin/user/${id}/lead`,
};
