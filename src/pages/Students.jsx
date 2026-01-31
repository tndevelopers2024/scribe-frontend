import { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/constants';
import { FaUserGraduate, FaSpinner, FaArrowLeft, FaChalkboardTeacher } from 'react-icons/fa';

const Students = () => {
    const { facultyId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStudents();
    }, [facultyId]);

    const fetchStudents = async () => {
        setLoading(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.STUDENTS(facultyId), config);
            setStudents(res.data);

            // Get faculty info from the first student or fetch separately
            if (res.data.length > 0 && res.data[0].faculty) {
                setFaculty(res.data[0].faculty);
            }
        } catch (err) {
            setError('Failed to load students');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-brand-purple hover:text-brand-pink transition-colors font-medium"
            >
                <FaArrowLeft />
                Back to Dashboard
            </button>

            {/* Students Section */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500 text-2xl">
                        <FaUserGraduate />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Students</h2>
                        {faculty && (
                            <div className="flex items-center gap-2 mt-1">
                                <FaChalkboardTeacher className="text-brand-purple" />
                                <p className="text-sm text-gray-600">
                                    Under <span className="font-semibold text-brand-purple">{faculty.name}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <FaSpinner className="animate-spin text-brand-purple text-3xl" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-600">
                        <p className="text-lg">{error}</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FaUserGraduate className="text-5xl mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No students assigned to this faculty yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm tracking-wide">
                                        #
                                    </th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm tracking-wide">
                                        Name
                                    </th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm tracking-wide">
                                        Email
                                    </th>
                                    <th className="text-left py-4 px-4 font-bold text-gray-700 uppercase text-sm tracking-wide">
                                        College
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr
                                        key={student._id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-4 text-gray-600 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                                                    <FaUserGraduate />
                                                </div>
                                                <span className="font-semibold text-gray-800">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-600">
                                            {student.email}
                                        </td>
                                        <td className="py-4 px-4 text-gray-600">
                                            {student.college?.name || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Students;
