import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation, Link, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/constants';
import {
    FaArrowLeft, FaSpinner, FaUser, FaMedal, FaBook, FaLightbulb,
    FaFlask, FaHandshake, FaMicrophone, FaTrophy, FaChalkboardTeacher,
    FaNotesMedical, FaHandsHelping, FaPalette, FaBullseye, FaUserGraduate
} from 'react-icons/fa';

import ProfileDetails from '../components/portfolio/ProfileDetails';
import AcademicAchievements from '../components/portfolio/AcademicAchievements';
import CourseReflection from '../components/portfolio/CourseReflection';
import BeTheChange from '../components/portfolio/BeTheChange';
import ResearchPublications from '../components/portfolio/ResearchPublications';
import InterdisciplinaryCollaboration from '../components/portfolio/InterdisciplinaryCollaboration';
import ConferenceParticipation from '../components/portfolio/ConferenceParticipation';
import CompetitionsAwards from '../components/portfolio/CompetitionsAwards';
import WorkshopsTraining from '../components/portfolio/WorkshopsTraining';
import ClinicalExperiences from '../components/portfolio/ClinicalExperiences';
import VoluntaryParticipation from '../components/portfolio/VoluntaryParticipation';
import EthicsThroughArt from '../components/portfolio/EthicsThroughArt';
import ThoughtsToActions from '../components/portfolio/ThoughtsToActions';

const FacultyStudentPortfolio = () => {
    const { studentId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Determine active section from URL path
    // Path format: /faculty/portfolio/:studentId/:section
    const pathParts = location.pathname.split('/');
    const currentPath = pathParts[pathParts.indexOf(studentId) + 1] || 'profile';

    useEffect(() => {
        fetchStudentData();
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.FACULTY_STUDENT_PORTFOLIO(studentId), config);
            setStudent(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load student portfolio.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-3xl text-brand-purple" /></div>;
    if (error) return <div className="text-red-600 p-12 text-center">{error}</div>;
    if (!student) return <div className="p-12 text-center">Student not found</div>;

    const navItems = [
        { id: 'profile', label: 'Profile Details', icon: FaUser },
        { id: 'achievements', label: 'Academic Achievements', icon: FaMedal },
        { id: 'reflections', label: 'Course Reflections', icon: FaBook },
        { id: 'bethechange', label: 'Be The Change', icon: FaLightbulb },
        { id: 'research', label: 'Research Publications', icon: FaFlask },
        { id: 'collaboration', label: 'Interdisciplinary', icon: FaHandshake },
        { id: 'conference', label: 'Conference Participation', icon: FaMicrophone },
        { id: 'awards', label: 'Competitions & Awards', icon: FaTrophy },
        { id: 'workshops', label: 'Workshops & Training', icon: FaChalkboardTeacher },
        { id: 'clinical', label: 'Clinical Experiences', icon: FaNotesMedical },
        { id: 'voluntary', label: 'Voluntary Participation', icon: FaHandsHelping },
        { id: 'ethics', label: 'Ethics Through Art', icon: FaPalette },
        { id: 'thoughts', label: 'Thoughts to Actions', icon: FaBullseye },
    ];

    const props = {
        isFaculty: true,
        studentId: studentId,
        studentData: student
    };

    return (
        <div className="flex h-[calc(100vh-80px)]">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-100 overflow-y-auto flex-shrink-0">
                <div className="p-4 border-b border-gray-100">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-500 hover:text-brand-purple transition mb-4"
                    >
                        <FaArrowLeft /> Back to List
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-purple/10 p-2 rounded-full text-brand-purple">
                            <FaUserGraduate />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800">{student.name}</h2>
                            <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                    </div>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            to={`/faculty/portfolio/${studentId}/${item.id}`}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm block ${currentPath === item.id
                                ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon className={currentPath === item.id ? 'text-white' : 'text-gray-400'} />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-gray-50 overflow-y-auto p-8">
                <div className="animate-fade-in">
                    <Routes>
                        <Route path="/" element={<Navigate to="profile" replace />} />
                        <Route path="profile" element={<ProfileDetails {...props} />} />
                        <Route path="achievements" element={<AcademicAchievements {...props} />} />
                        <Route path="reflections" element={<CourseReflection {...props} />} />
                        <Route path="bethechange" element={<BeTheChange {...props} />} />
                        <Route path="research" element={<ResearchPublications {...props} />} />
                        <Route path="collaboration" element={<InterdisciplinaryCollaboration {...props} />} />
                        <Route path="conference" element={<ConferenceParticipation {...props} />} />
                        <Route path="awards" element={<CompetitionsAwards {...props} />} />
                        <Route path="workshops" element={<WorkshopsTraining {...props} />} />
                        <Route path="clinical" element={<ClinicalExperiences {...props} />} />
                        <Route path="voluntary" element={<VoluntaryParticipation {...props} />} />
                        <Route path="ethics" element={<EthicsThroughArt {...props} />} />
                        <Route path="thoughts" element={<ThoughtsToActions {...props} />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default FacultyStudentPortfolio;
