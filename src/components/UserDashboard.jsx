import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, useLocation, Link, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaChalkboardTeacher,
    FaSpinner,
    FaUser,
    FaTrophy,
    FaLightbulb,
    FaProjectDiagram,
    FaRunning,
    FaBullseye,
    FaComments,
    FaChevronDown,
    FaChevronRight,
    FaBook,
    FaHeart,
    FaFlask,
    FaHandshake,
    FaMicrophone,
    FaMedal,
    FaGraduationCap,
    FaStethoscope,
    FaHandsHelping,
    FaPalette,
    FaFileDownload,
    FaDownload
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import ProfileDetails from './portfolio/ProfileDetails';
import AcademicAchievements from './portfolio/AcademicAchievements';
import CourseReflection from './portfolio/CourseReflection';
import BeTheChange from './portfolio/BeTheChange';
import ResearchPublications from './portfolio/ResearchPublications';
import InterdisciplinaryCollaboration from './portfolio/InterdisciplinaryCollaboration';
import ConferenceParticipation from './portfolio/ConferenceParticipation';
import CompetitionsAwards from './portfolio/CompetitionsAwards';
import WorkshopsTraining from './portfolio/WorkshopsTraining';
import ClinicalExperiences from './portfolio/ClinicalExperiences';
import VoluntaryParticipation from './portfolio/VoluntaryParticipation';
import EthicsThroughArt from './portfolio/EthicsThroughArt';
import ThoughtsToActions from './portfolio/ThoughtsToActions';
import Feedback from './portfolio/Feedback';
import { API_ENDPOINTS } from '../config/constants';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [faculties, setFaculties] = useState([]);
    const [loadingFaculties, setLoadingFaculties] = useState(false);
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    // Determine active section from URL path
    // Remove '/dashboard/' prefix and split to find the current section
    const pathParts = location.pathname.split('/');
    // Handle both /dashboard/section and /dashboard/section/sub-section if any
    const currentPath = pathParts[pathParts.indexOf('dashboard') + 1] || 'profile';

    const [expandedSections, setExpandedSections] = useState({
        reflections: false,
        projects: false,
        activity: false
    });

    // State for live points update
    const [currentPoints, setCurrentPoints] = useState(user.points || 0);
    const [fullProfileData, setFullProfileData] = useState(null);

    useEffect(() => {
        if (user.role === 'Lead Faculty') {
            fetchFaculties();
        } else if (user.role === 'Student') {
            fetchStudentProfile();
        }
    }, [user]);

    const fetchStudentProfile = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.PROFILE, config);
            if (res.data) {
                setCurrentPoints(res.data.points || 0);
                setFullProfileData(res.data);
            }
        } catch (error) {
            console.error('Error fetching profile for points:', error);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setIsDownloading(true);
            const toastId = toast.loading('Generating your portfolio PDF...');

            if (!fullProfileData) {
                await fetchStudentProfile();
            }

            if (fullProfileData) {
                const { generatePortfolioPDF } = await import('../utils/pdfGenerator');
                await generatePortfolioPDF(fullProfileData);
                toast.success('Portfolio PDF downloaded successfully!', { id: toastId });
            } else {
                toast.error('Could not fetch profile data for PDF generation.', { id: toastId });
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Keep parent sections expanded if child is active
    useEffect(() => {
        if (['course-reflection', 'be-the-change'].includes(currentPath)) {
            setExpandedSections(prev => ({ ...prev, reflections: true }));
        } else if (['research', 'collaboration', 'conference'].includes(currentPath)) {
            setExpandedSections(prev => ({ ...prev, projects: true }));
        } else if (['competitions', 'workshops', 'clinical', 'voluntary', 'ethics'].includes(currentPath)) {
            setExpandedSections(prev => ({ ...prev, activity: true }));
        }
    }, [currentPath]);

    const fetchFaculties = async () => {
        setLoadingFaculties(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.FACULTIES(user._id), config);
            setFaculties(res.data);
        } catch (err) {
            setError('Failed to load faculties');
            console.error(err);
        } finally {
            setLoadingFaculties(false);
        }
    };

    const handleFacultyClick = (faculty) => {
        navigate(`/students/${faculty._id}`);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const sidebarSections = [
        { id: 'profile', label: 'Profile Details', icon: FaUser },
        { id: 'academic', label: 'Academic Achievements', icon: FaTrophy },
        {
            id: 'reflections',
            label: 'Personal Reflections',
            icon: FaLightbulb,
            expandable: true,
            children: [
                { id: 'course-reflection', label: 'Course Reflection', icon: FaBook },
                { id: 'be-the-change', label: 'Be the Change', icon: FaHeart }
            ]
        },
        {
            id: 'projects',
            label: 'Projects',
            icon: FaProjectDiagram,
            expandable: true,
            children: [
                { id: 'research', label: 'Research and Publications', icon: FaFlask },
                { id: 'collaboration', label: 'Interdisciplinary Collaboration', icon: FaHandshake }
            ]
        },
        {
            id: 'activity',
            label: 'Activity',
            icon: FaRunning,
            expandable: true,
            children: [
                { id: 'conference', label: 'Conference Participation', icon: FaMicrophone },
                { id: 'competitions', label: 'Competitions and Awards', icon: FaMedal },
                { id: 'workshops', label: 'Workshops and Training', icon: FaGraduationCap },
                { id: 'clinical', label: 'Clinical Experiences', icon: FaStethoscope },
                { id: 'voluntary', label: 'Voluntary Participation', icon: FaHandsHelping },
                { id: 'ethics', label: 'Ethics Through Art', icon: FaPalette }
            ]
        },
        { id: 'thoughts', label: 'Thoughts to Actions', icon: FaBullseye },
        { id: 'feedback', label: 'Feedback', icon: FaComments }
    ];

    // Lead Faculty View
    if (user.role === 'Lead Faculty') {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-brand-purple/10 p-3 rounded-xl text-brand-purple text-2xl">
                            <FaChalkboardTeacher />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">My Faculties</h3>
                    </div>

                    {loadingFaculties ? (
                        <div className="flex justify-center items-center py-12">
                            <FaSpinner className="animate-spin text-brand-purple text-3xl" />
                        </div>
                    ) : error && !faculties.length ? (
                        <div className="text-center py-8 text-red-600">{error}</div>
                    ) : faculties.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg">No faculties assigned yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {faculties.map((faculty) => (
                                <div
                                    key={faculty._id}
                                    onClick={() => handleFacultyClick(faculty)}
                                    className="p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] border-gray-200 bg-white hover:border-brand-purple/50"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple">
                                            <FaChalkboardTeacher className="text-xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 text-lg truncate">{faculty.name}</h4>
                                            <p className="text-sm text-gray-600 truncate">{faculty.email}</p>
                                            {faculty.college && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">{faculty.college.name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Student E-Portfolio View
    return (
        <div className="flex flex-col md:flex-row gap-6 max-w-8xl mx-auto items-start">
            {/* Sidebar */}
            <div className="w-full md:w-82 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-fit sticky top-24">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">E-Portfolio</h3>
                    <div className="bg-brand-purple/10 px-3 py-1 rounded-full flex items-center gap-2">
                        <FaTrophy className="text-brand-purple text-sm" />
                        <span className="text-brand-purple font-bold text-sm">{currentPoints} Pts</span>
                    </div>
                </div>

                {/* Profile Header in Sidebar for Student */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="bg-brand-purple/10 p-2 rounded-full text-brand-purple">
                        <FaGraduationCap />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm truncate">{user.name}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                        {fullProfileData?.faculty && (
                            <p className="text-[10px] text-brand-purple font-medium mt-0.5 truncate">
                                Faculty: {fullProfileData.faculty.name}
                            </p>
                        )}
                    </div>
                </div>

                <nav className="space-y-1 mb-6">
                    {sidebarSections.map((section) => (
                        <div key={section.id}>
                            {section.expandable ? (
                                <>
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${expandedSections[section.id]
                                            ? 'bg-brand-purple/10 text-brand-purple'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <section.icon className="text-lg" />
                                            <span className="font-medium text-sm">{section.label}</span>
                                        </div>
                                        {expandedSections[section.id] ? <FaChevronDown /> : <FaChevronRight />}
                                    </button>

                                    {section.children && (
                                        <div className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${expandedSections[section.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                            }`}>
                                            {section.children.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    to={`/dashboard/${child.id}`}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm block ${currentPath === child.id
                                                        ? 'bg-brand-pink text-white'
                                                        : 'text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <child.icon className="text-base" />
                                                    <span>{child.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={`/dashboard/${section.id}`}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all block ${currentPath === section.id
                                        ? 'bg-brand-purple text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <section.icon className="text-lg" />
                                        <span className="font-medium text-sm">{section.label}</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="pt-4 border-t border-gray-100 space-y-4">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2.5 rounded-xl hover:bg-gray-900 transition text-sm font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <FaDownload /> Download Portfolio PDF
                            </>
                        )}
                    </button>

                    {/* Kudos Box */}
                    <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-4 text-center shadow-sm">
                        <h3 className="text-lg font-bold text-[#8b4ca1] mb-1">Kudos</h3>
                        <h4 className="text-sm font-bold text-gray-800 mb-2">{fullProfileData?.name || user?.name || 'Student'}</h4>

                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-600">
                                1 Achievement = <span className="text-[#8b4ca1] font-bold">1 pts</span>
                            </p>
                            <p className="text-sm font-bold text-gray-800 pt-1 border-t border-[#bae6fd]/50">
                                Total Points : <span className="text-[#8b4ca1]">{currentPoints || 0}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <div className="animate-fade-in">
                    <Routes>
                        <Route path="/" element={<Navigate to="profile" replace />} />
                        <Route path="profile" element={<ProfileDetails />} />
                        <Route path="academic" element={<AcademicAchievements />} />
                        <Route path="course-reflection" element={<CourseReflection />} />
                        <Route path="be-the-change" element={<BeTheChange />} />
                        <Route path="research" element={<ResearchPublications />} />
                        <Route path="collaboration" element={<InterdisciplinaryCollaboration />} />
                        <Route path="conference" element={<ConferenceParticipation />} />
                        <Route path="competitions" element={<CompetitionsAwards />} />
                        <Route path="workshops" element={<WorkshopsTraining />} />
                        <Route path="clinical" element={<ClinicalExperiences />} />
                        <Route path="voluntary" element={<VoluntaryParticipation />} />
                        <Route path="ethics" element={<EthicsThroughArt />} />
                        <Route path="thoughts" element={<ThoughtsToActions />} />
                        <Route path="feedback" element={<Feedback />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
