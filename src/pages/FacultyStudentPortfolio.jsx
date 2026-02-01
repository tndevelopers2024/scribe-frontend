import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation, Link, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/constants';
import {
    FaArrowLeft, FaSpinner, FaUser, FaMedal, FaBook, FaLightbulb,
    FaFlask, FaHandshake, FaMicrophone, FaTrophy, FaChalkboardTeacher,
    FaNotesMedical, FaHandsHelping, FaPalette, FaBullseye, FaUserGraduate,
    FaComments, FaDownload
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Topbar from '../components/Topbar';

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
import Feedback from '../components/portfolio/Feedback';

const FacultyStudentPortfolio = () => {
    const { studentId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingCounts, setPendingCounts] = useState({});
    const [isDownloading, setIsDownloading] = useState(false);

    // Determine active section from URL path
    // Path format: /faculty/portfolio/:studentId/:section
    const pathParts = location.pathname.split('/');
    const currentPath = pathParts[pathParts.indexOf(studentId) + 1] || 'profile';

    useEffect(() => {
        fetchStudentData();
    }, [studentId, user]);

    const fetchStudentData = async () => {
        if (!user || !user.token) {
            console.warn('[FRONTEND DEBUG] fetchStudentData stalled: No user or token');
            return;
        }

        console.log(`[FRONTEND DEBUG] Fetching portfolio for ${studentId} with token: ${user.token.substring(0, 10)}...`);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.FACULTY_STUDENT_PORTFOLIO(studentId), config);

            // Extract pending counts from response
            const { pendingCounts: counts, ...studentData } = res.data;
            setPendingCounts(counts || {});
            setStudent(studentData);
        } catch (err) {
            console.error('[PORTFOLIO ERROR]', err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError(`Authorization Error: You do not have permission to view ${studentId}.`);
            } else {
                setError('Failed to load student portfolio. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-3xl text-brand-purple" /></div>;
    if (error) return <div className="text-red-600 p-12 text-center">{error}</div>;
    if (!student) return <div className="p-12 text-center">Student not found</div>;

    const sidebarSections = [
        { id: 'profile', label: 'Profile Details', icon: FaUser },
        { id: 'achievements', label: 'Academic Achievements', icon: FaMedal },
        {
            id: 'reflections',
            label: 'Personal Reflections',
            icon: FaLightbulb,
            children: [
                { id: 'reflections', label: 'Course Reflection', icon: FaBook },
                { id: 'bethechange', label: 'Be the Change', icon: FaLightbulb }
            ]
        },
        {
            id: 'projects',
            label: 'Projects',
            icon: FaFlask,
            children: [
                { id: 'research', label: 'Research and Publications', icon: FaFlask },
                { id: 'collaboration', label: 'Interdisciplinary Collaboration', icon: FaHandshake }
            ]
        },
        {
            id: 'activity',
            label: 'Activity',
            icon: FaMicrophone,
            children: [
                { id: 'conference', label: 'Conference Participation', icon: FaMicrophone },
                { id: 'awards', label: 'Competitions and Awards', icon: FaTrophy },
                { id: 'workshops', label: 'Workshops and Training', icon: FaChalkboardTeacher },
                { id: 'clinical', label: 'Clinical Experiences', icon: FaNotesMedical },
                { id: 'voluntary', label: 'Voluntary Participation', icon: FaHandsHelping },
                { id: 'ethics', label: 'Ethics Through Art', icon: FaPalette }
            ]
        },
        { id: 'thoughts', label: 'Thoughts to Actions', icon: FaBullseye },
        { id: 'feedback', label: 'Feedback', icon: FaComments }
    ];

    const getPendingCount = (itemId) => {
        // Direct match
        if (pendingCounts[itemId]) return pendingCounts[itemId];

        // Map UI IDs to API response IDs if they differ
        const mapping = {
            'reflections': 'reflections', // Course Reflection
            'achievements': 'achievements'
        };

        return pendingCounts[itemId] || 0;
    };

    const updatePendingCount = (sectionId) => {
        setPendingCounts(prev => ({
            ...prev,
            [sectionId]: Math.max(0, (prev[sectionId] || 0) - 1)
        }));
    };

    const props = {
        isFaculty: true,
        studentId: studentId,
        studentData: student,
        updatePendingCount: updatePendingCount
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Topbar />
            <div className="flex flex-1 overflow-hidden">
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
                                {student.faculty && (
                                    <p className="text-[10px] text-brand-purple font-medium mt-0.5">
                                        Reporting Faculty: {student.faculty.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <nav className="p-4 space-y-1">
                        {sidebarSections.map((section) => (
                            <div key={section.id}>
                                {section.children ? (
                                    <>
                                        {/* Parent Header (Not Clickable for Navigation, just Label) */}
                                        <div className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 font-bold bg-gray-50/50 mb-1">
                                            <div className="flex items-center gap-3">
                                                <section.icon className="text-lg" />
                                                <span className="font-medium text-sm">{section.label}</span>
                                            </div>
                                        </div>

                                        {/* Children Items (Always Visible/Expanded) */}
                                        <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
                                            {section.children.map((child) => {
                                                const count = pendingCounts[child.id] || 0;
                                                return (
                                                    <Link
                                                        key={child.id}
                                                        to={`/faculty/portfolio/${studentId}/${child.id}`}
                                                        className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all text-sm block ${currentPath === child.id
                                                            ? 'bg-brand-purple text-white shadow-md'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <child.icon className="text-base" />
                                                            <span>{child.label}</span>
                                                        </div>
                                                        {count > 0 && (
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm ${currentPath === child.id
                                                                ? 'bg-white text-brand-purple'
                                                                : 'bg-brand-purple text-white'
                                                                }`}>
                                                                {count}
                                                            </span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        key={section.id}
                                        to={`/faculty/portfolio/${studentId}/${section.id}`}
                                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm block ${currentPath === section.id
                                            ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <section.icon className="text-lg" />
                                            {section.label}
                                        </div>
                                        {(pendingCounts[section.id] || 0) > 0 && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm ${currentPath === section.id
                                                ? 'bg-white text-brand-purple'
                                                : 'bg-brand-purple text-white'
                                                }`}>
                                                {pendingCounts[section.id]}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-gray-100">
                        {/* Kudos Box */}
                        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-4 text-center shadow-sm">
                            <h3 className="text-lg font-bold text-[#8b4ca1] mb-1">Kudos</h3>
                            <h4 className="text-sm font-bold text-gray-800 mb-2">{student.name}</h4>

                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-600">
                                    1 Achievement = <span className="text-[#8b4ca1] font-bold">1 pts</span>
                                </p>
                                <p className="text-sm font-bold text-gray-800 pt-1 border-t border-[#bae6fd]/50">
                                    Total Points : <span className="text-[#8b4ca1]">{student.points || 0}</span>
                                </p>
                            </div>
                        </div>

                        {/* Download Button */}
                        <button
                            onClick={async () => {
                                try {
                                    setIsDownloading(true);
                                    const toastId = toast.loading('Generating your portfolio PDF...');
                                    const { generatePortfolioPDF } = await import('../utils/pdfGenerator');
                                    await generatePortfolioPDF(student);
                                    toast.success('Portfolio PDF downloaded successfully!', { id: toastId });
                                } catch (error) {
                                    console.error('PDF Generation Error:', error);
                                    toast.error('Failed to generate PDF. Please try again.');
                                } finally {
                                    setIsDownloading(false);
                                }
                            }}
                            disabled={isDownloading}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2.5 rounded-xl hover:bg-gray-900 transition text-sm font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <>
                                    <FaSpinner className="animate-spin text-xs" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <FaDownload className="text-xs" />
                                    Download Portfolio PDF
                                </>
                            )}
                        </button>
                    </div>
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
                            <Route path="feedback" element={<Feedback {...props} />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyStudentPortfolio;
