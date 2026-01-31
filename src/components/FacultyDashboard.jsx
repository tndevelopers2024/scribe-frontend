import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/constants';
import { FaUserGraduate, FaSpinner, FaEye, FaArrowLeft, FaChalkboardTeacher, FaUserTie } from 'react-icons/fa';

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

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {user?.role === 'Lead Faculty' && view === 'students' && (
                        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full text-brand-purple transition">
                            <FaArrowLeft />
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            {view === 'faculties' ? 'My Faculties' : (selectedFaculty ? `Students under ${selectedFaculty.name}` : 'My Students')}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            {view === 'faculties' ? 'Manage faculties and view their student progress' : 'Manage and verify student portfolios'}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded-xl">
                    {error}
                </div>
            )}

            {/* Faculties View (Lead Only) */}
            {view === 'faculties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {faculties.map((faculty) => (
                        <div
                            key={faculty._id}
                            onClick={() => handleFacultyClick(faculty)}
                            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition flex flex-col cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-pink-100 p-3 rounded-xl text-pink-600 group-hover:scale-110 transition-transform">
                                    <FaChalkboardTeacher className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{faculty.name}</h3>
                                    <p className="text-sm text-gray-500">{faculty.email}</p>
                                </div>
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                                <span>Click to view students</span>
                                <FaArrowLeft className="rotate-180" />
                            </div>
                        </div>
                    ))}
                    {faculties.length === 0 && (
                        <div className="col-span-full bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                            <FaUserTie className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No faculties assigned yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Students View */}
            {view === 'students' && (
                <>
                    {students.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                            <FaUserGraduate className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No students found.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4">Student Name</th>
                                            <th className="px-6 py-4">Year</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student._id} className="border-b hover:bg-gray-50/50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center text-xs font-bold">
                                                            <FaUserGraduate />
                                                        </div>
                                                        {student.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {student.profile?.yearOfStudy || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {student.email}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/faculty/portfolio/${student._id}`)}
                                                        className="bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white px-3 py-1.5 rounded-lg transition text-xs font-bold inline-flex items-center gap-2"
                                                    >
                                                        <FaEye /> View Portfolio
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FacultyDashboard;
