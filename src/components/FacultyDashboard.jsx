import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/constants';
import { FaUserGraduate, FaSpinner, FaEye, FaArrowLeft, FaChalkboardTeacher, FaUserTie, FaExclamationCircle } from 'react-icons/fa';

const FacultyDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [view, setView] = useState('loading'); // 'loading', 'faculties', 'students'
    const [faculties, setFaculties] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.role === 'Lead Faculty') {
            fetchFaculties();
        } else {
            fetchMyStudents();
        }
    }, [user]);

    const fetchFaculties = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.FACULTIES(user._id), config);
            setFaculties(res.data);
            setView('faculties');
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load faculties');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyStudents = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.FACULTY_STUDENTS, config);
            setStudents(res.data);
            setView('students');
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleFacultyClick = async (faculty) => {
        try {
            setLoading(true);
            setSelectedFaculty(faculty);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.STUDENTS(faculty._id), config);
            setStudents(res.data);
            setView('students');
        } catch (err) {
            console.error(err);
            setError('Failed to load students for this faculty');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (user?.role === 'Lead Faculty' && view === 'students') {
            setView('faculties');
            setSelectedFaculty(null);
            setStudents([]);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-brand-purple text-4xl" />
            </div>
        );
    }

    const calculateStats = (student) => {
        const sections = [
            'academicAchievements', 'courseReflections', 'beTheChange',
            'researchPublications', 'interdisciplinaryCollaboration',
            'conferenceParticipation', 'competitionsAwards', 'workshopsTraining',
            'clinicalExperiences', 'voluntaryParticipation',
            'ethicsThroughArt', 'thoughtsToActions'
        ];

        let stats = { total: 0, approved: 0, rejected: 0, pending: 0 };

        sections.forEach(section => {
            if (student[section] && Array.isArray(student[section])) {
                stats.total += student[section].length;
                student[section].forEach(item => {
                    if (item.status === 'Approved') stats.approved++;
                    else if (item.status === 'Rejected') stats.rejected++;
                    else if (item.status === 'Pending') stats.pending++;
                });
            }
        });

        return stats;
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-8xl mx-auto items-start p-4 md:p-8 animate-fade-in font-outfit">
            {/* Left Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0 sticky top-24 self-start">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Menu</h3>
                    <div className="space-y-3">
                        {user?.role === 'Lead Faculty' && (
                            <button
                                onClick={() => {
                                    fetchFaculties();
                                    setSelectedFaculty(null);
                                }}
                                className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 ${view === 'faculties' || (view === 'students' && selectedFaculty) ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-lg shadow-purple-100' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <FaChalkboardTeacher className="text-lg" />
                                <span>Faculty List</span>
                                {(view === 'faculties' || (view === 'students' && selectedFaculty)) && <FaArrowLeft className="rotate-180 ml-auto text-xs opacity-50" />}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                fetchMyStudents();
                                setSelectedFaculty(null);
                            }}
                            className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 ${(view === 'students' && !selectedFaculty) ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-lg shadow-purple-100' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <FaUserGraduate className="text-lg" />
                            <span>Student List</span>
                            {(view === 'students' && !selectedFaculty) && <FaArrowLeft className="rotate-180 ml-auto text-xs opacity-50" />}
                        </button>
                    </div>
                </div>

                {/* Info Card in Sidebar */}
                <div className="mt-6 bg-gradient-to-br from-brand-purple/5 to-brand-pink/5 rounded-2xl p-6 border border-purple-100/50 hidden md:block">
                    <div className="flex items-center gap-2 text-brand-purple font-bold text-sm mb-2">
                        <FaChalkboardTeacher /> Role:
                    </div>
                    <div className="text-gray-800 font-extrabold text-base mb-1 uppercase tracking-tight">{user?.role}</div>
                    <div className="text-xs text-gray-500 italic">Access restricted to authorized faculty members only.</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full space-y-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {user?.role === 'Lead Faculty' && view === 'students' && selectedFaculty && (
                            <button onClick={handleBack} className="p-3 bg-white hover:bg-gray-50 rounded-xl text-brand-purple shadow-sm border border-gray-100 transition-all hover:scale-105 active:scale-95">
                                <FaArrowLeft />
                            </button>
                        )}
                        <div>
                            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                                {view === 'faculties' ? 'My Faculties' : (selectedFaculty ? `Students under ${selectedFaculty.name}` : 'My Students')}
                            </h2>
                            <p className="text-gray-500 font-medium mt-1">
                                {view === 'faculties' ? 'Manage faculties and view their student progress' : 'Manage and verify student portfolios'}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="bg-red-100 p-2 rounded-lg text-red-600">
                            <FaExclamationCircle />
                        </div>
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {/* Faculties View (Lead Only) */}
                {view === 'faculties' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {faculties.map((faculty) => (
                            <div
                                key={faculty._id}
                                onClick={() => handleFacultyClick(faculty)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-purple/20 transition-all duration-300 flex flex-col cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="flex items-center gap-5 mb-4 relative z-10">
                                    <div className="bg-gradient-to-tr from-pink-500 to-rose-400 p-4 rounded-2xl text-white shadow-lg shadow-pink-100 group-hover:rotate-6 transition-transform">
                                        <FaChalkboardTeacher className="text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-xl text-gray-800 group-hover:text-brand-purple transition-colors">{faculty.name}</h3>
                                        <p className="text-sm text-gray-400 font-medium">{faculty.email}</p>
                                    </div>
                                </div>
                                <div className="mt-auto pt-5 border-t border-gray-50 flex justify-between items-center text-xs font-bold text-brand-purple tracking-widest uppercase relative z-10">
                                    <span>View Portfolio Students</span>
                                    <FaArrowLeft className="rotate-180 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        ))}
                        {faculties.length === 0 && (
                            <div className="col-span-full bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center">
                                <FaUserTie className="text-7xl text-gray-200 mx-auto mb-6" />
                                <p className="text-gray-400 text-xl font-bold italic">No faculties assigned to your college yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Students View */}
                {view === 'students' && (
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden animate-slide-up">
                        {students.length === 0 ? (
                            <div className="p-20 text-center">
                                <FaUserGraduate className="text-8xl text-gray-100 mx-auto mb-6" />
                                <p className="text-gray-300 text-2xl font-black tracking-tight">No students found.</p>
                                <p className="text-gray-400 mt-2">There are currently no students assigned to this {selectedFaculty ? 'faculty' : 'profile'}.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-gray-400 uppercase tracking-[0.2em] bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-6">Student Explorer</th>
                                            <th className="px-6 py-6 text-center">Batch / Year</th>
                                            <th className="px-6 py-6 text-center">Portfolio Audit</th>
                                            <th className="px-8 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {students.map((student) => {
                                            const stats = calculateStats(student);
                                            return (
                                                <tr key={student._id} className="group hover:bg-purple-50/30 transition-colors duration-300">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-purple to-indigo-500 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-purple-100 group-hover:scale-110 transition-transform">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-extrabold text-gray-800 text-base">{student.name}</div>
                                                                <div className="text-[10px] text-gray-400 font-medium">{student.email}</div>
                                                                {user?.role === 'Lead Faculty' && student.faculty && (
                                                                    <div className="text-[10px] text-brand-purple font-bold mt-0.5">
                                                                       Reporting Faculty: {student.faculty.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                                                            {student.profile?.yearOfStudy || 'N/A'} YEAR
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex justify-center gap-1.5">
                                                            <div className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100 shadow-sm" title="Total Submissions">
                                                                {stats.total} TOTAL
                                                            </div>
                                                            <div className="px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 text-[10px] font-black border border-green-100 shadow-sm" title="Accepted">
                                                                {stats.approved} ACC
                                                            </div>
                                                            <div className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-black border border-red-100 shadow-sm" title="Rejected">
                                                                {stats.rejected} REJ
                                                            </div>
                                                            {stats.pending > 0 && (
                                                                <div className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-black border border-amber-100 shadow-sm animate-pulse" title="Pending">
                                                                    {stats.pending} PEN
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => navigate(`/faculty/portfolio/${student._id}`)}
                                                            className="bg-brand-purple text-white hover:bg-purple-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-purple-100 hover:shadow-lg hover:-translate-y-0.5 text-xs font-black uppercase tracking-tighter flex items-center gap-2 ml-auto"
                                                        >
                                                            <FaEye className="text-sm" /> <span>View Portfolio</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyDashboard;
