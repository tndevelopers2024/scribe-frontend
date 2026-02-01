import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaUserTie, FaChalkboardTeacher, FaUserGraduate, FaArrowLeft, FaEye, FaStar, FaChevronRight, FaArrowRight, FaTrash, FaExchangeAlt, FaArrowUp, FaUserShield } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AuthContext from '../../context/AuthContext';

const CollegeHierarchy = ({ colleges, users, refreshData }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // Navigation State
    const [view, setView] = useState('colleges'); // 'colleges', 'leads', 'faculties', 'students'
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedFaculty, setSelectedFaculty] = useState(null);

    // Management State
    const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: '', name: '' });
    const [reassignModal, setReassignModal] = useState({ open: false, type: '', id: '', currentLeadId: '' });
    const [promoteModal, setPromoteModal] = useState({ open: false, faculty: null });
    const [submitting, setSubmitting] = useState(false);

    // Helpers to filter data
    const getLeads = (collegeId) => users.filter(u => u.role === 'Lead Faculty' && u.college?._id === collegeId);
    const getFaculties = (leadId) => users.filter(u => u.role === 'Faculty' && (u.leadFaculty?._id === leadId || u.assignedBy === leadId));
    const getStudents = (facultyId) => users.filter(u => u.role === 'Student' && (u.faculty?._id === facultyId || u.assignedBy === facultyId));

    // Stats Helper
    const getStudentStats = (student) => {
        const sections = [
            'academicAchievements', 'courseReflections', 'beTheChange',
            'researchPublications', 'interdisciplinaryCollaboration',
            'conferenceParticipation', 'competitionsAwards', 'workshopsTraining',
            'clinicalExperiences', 'voluntaryParticipation', 'ethicsThroughArt',
            'thoughtsToActions'
        ];
        let total = 0;
        let approved = 0;
        sections.forEach(sec => {
            if (student[sec]?.length) {
                total += student[sec].length;
                approved += student[sec].filter(i => i.status === 'Approved').length;
            }
        });
        return { total, approved };
    };

    // Navigation Handlers
    // Management Handlers
    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const endpoint = deleteModal.type === 'college'
                ? API_ENDPOINTS.DELETE_COLLEGE(deleteModal.id)
                : API_ENDPOINTS.DELETE_USER(deleteModal.id);

            await axios.delete(endpoint, config);
            toast.success(`${deleteModal.type === 'college' ? 'College' : 'User'} deleted successfully`);
            setDeleteModal({ open: false, type: '', id: '', name: '' });
            if (refreshData) refreshData();

            // Navigate back if needed
            if (deleteModal.type === 'college') {
                setSelectedCollege(null);
                setView('colleges');
            } else if (deleteModal.type === 'User') {
                // If we deleted the selected node, reset view
                if (selectedLead?._id === deleteModal.id) setView('colleges');
                if (selectedFaculty?._id === deleteModal.id) setView('leads');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error performing deletion');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReassign = async (newLeadId) => {
        if (!newLeadId) return;
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const endpoint = reassignModal.type === 'college'
                ? API_ENDPOINTS.UPDATE_COLLEGE_LEAD(reassignModal.id)
                : API_ENDPOINTS.UPDATE_FACULTY_LEAD(reassignModal.id);

            await axios.put(endpoint, { leadFacultyId: newLeadId }, config);
            toast.success('Lead Faculty reassigned successfully');
            setReassignModal({ open: false, type: '', id: '', currentLeadId: '' });
            if (refreshData) refreshData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error reassigning lead faculty');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectCollege = (college) => {
        setSelectedCollege(college);
        setView('leads');
    };

    const handleSelectLead = (lead) => {
        setSelectedLead(lead);
    };

    const handleSelectFaculty = (faculty) => {
        setSelectedFaculty(faculty);
        setView('students');
    };

    const handleViewStudent = (studentId) => {
        navigate(`/faculty/portfolio/${studentId}`);
    };

    const handlePromote = async () => {
        if (!promoteModal.faculty) return;
        const faculty = promoteModal.faculty;
        const collegeId = faculty.college?._id || faculty.college || selectedCollege?._id;

        if (!collegeId) {
            toast.error("College association not found");
            return;
        }

        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const endpoint = API_ENDPOINTS.UPDATE_COLLEGE_LEAD(collegeId);

            await axios.put(endpoint, { leadFacultyId: faculty._id }, config);
            toast.success(`${faculty.name} has been promoted to Lead Faculty!`);
            setPromoteModal({ open: false, faculty: null });
            if (refreshData) refreshData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error promoting faculty');
        } finally {
            setSubmitting(false);
        }
    };

    // CSS for the Animated Unique Tree Diagram
    const treeStyles = `
        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .tree {
            display: flex;
            justify-content: center;
            overflow-x: auto;
            padding-bottom: 50px;
        }

        .tree ul {
            padding-top: 40px; 
            position: relative;
            transition: all 0.5s;
            display: flex;
            justify-content: center;
        }
        
        .tree li {
            float: left; text-align: center;
            list-style-type: none;
            position: relative;
            padding: 40px 10px 0 10px;
            transition: all 0.5s;
        }
        
        /* Connectors */
        .tree li::before, .tree li::after {
            content: '';
            position: absolute; top: 0; right: 50%;
            border-top: 3px solid #cbd5e1; /* slate-300 */
            width: 50.2%; /* Increased slightly to prevent pixel gaps */
            height: 40px;
            transition: all 0.3s;
        }
        .tree li::after {
            right: auto; left: 50%;
            border-left: 3px solid #cbd5e1;
            width: 50.2%;
        }
        
        .tree li:only-child::after, .tree li:only-child::before {
            display: none;
        }
        
        .tree li:only-child { padding-top: 0; }
        
        .tree li:first-child::before, .tree li:last-child::after {
            border: 0 none;
        }
        
        .tree li:last-child::before{
            border-right: 3px solid #cbd5e1;
            border-radius: 0 15px 0 0;
            right: 50%; /* Anchor firmly */
        }
        .tree li:first-child::after{
            border-radius: 15px 0 0 0;
            left: 50%; /* Anchor firmly */
        }
        
        .tree ul ul::before{
            content: '';
            position: absolute; top: 0; left: 50%;
            border-left: 3px solid #cbd5e1;
            width: 0; height: 40px;
            margin-left: -1px; /* Center the 3px line properly */
        }
        
        /* Node Styles */
        .tree-node {
            padding: 20px;
            text-decoration: none;
            display: inline-block;
            border-radius: 16px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            width: 250px; /* FIXED WIDTH FOR UNIFORMITY */
            position: relative;
            z-index: 10;
            background: white;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.5);
            animation: fadeInScale 0.6s ease-out forwards;
        }

        .tree-node:hover {
            transform: scale(1.05) translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            z-index: 20;
        }

        /* Unique Level Styles */
        .node-college {
            background: linear-gradient(135deg, #ffffff 0%, #f3e8ff 100%);
            border: 2px solid #a855f7;
            width: 300px; /* Root can be slightly wider */
        }

        .node-lead {
            background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
            border-bottom: 4px solid #3b82f6;
        }

        .node-faculty {
            background: linear-gradient(135deg, #ffffff 0%, #fff1f2 100%);
            border-bottom: 4px solid #ec4899;
            cursor: pointer;
        }
        
        .node-faculty:hover {
            border-color: #be185d;
        }

        /* Connector Hover Effect */
        .tree li:hover::before, .tree li:hover::after, .tree li:hover > .tree-node ~ ul::before {
            border-color: #94a3b8;
        }
    `;

    return (
        <div className="space-y-8 animate-fade-in overflow-x-auto pb-20 pt-8 min-h-screen">
            <style>{treeStyles}</style>

            {/* Breadcrumb / Navigation */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 sticky left-0 z-30 mx-4">
                {selectedCollege && (
                    <button onClick={() => {
                        if (view === 'students') {
                            setView('leads'); // Return to tree view
                        } else {
                            setSelectedCollege(null);
                            setView('colleges');
                        }
                    }} className="p-2 hover:bg-gray-100 rounded-full text-brand-purple transition shadow-sm border border-gray-200">
                        <FaArrowLeft />
                    </button>
                )}
                <div className="flex items-center text-lg font-bold text-gray-700">
                    <span onClick={() => { setSelectedCollege(null); setView('colleges'); }} className="cursor-pointer hover:text-brand-purple transition-colors">
                        All Colleges
                    </span>
                    {selectedCollege && (
                        <>
                            <FaChevronRight className="mx-3 text-gray-300 text-sm" />
                            <span
                                className={`cursor-pointer ${view !== 'students' ? 'text-brand-purple' : 'hover:text-brand-purple'}`}
                                onClick={() => setView('leads')}
                            >
                                {selectedCollege.name}
                            </span>
                        </>
                    )}
                    {selectedFaculty && view === 'students' && (
                        <>
                            <FaChevronRight className="mx-3 text-gray-300 text-sm" />
                            <span className="text-brand-purple dropdown-anim">Students under {selectedFaculty.name}</span>
                        </>
                    )}
                </div>
            </div>

            {/* View 1: List of Colleges (Selection Step) */}
            {!selectedCollege ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                    {colleges.map((college, idx) => (
                        <div
                            key={college._id}
                            onClick={() => handleSelectCollege(college)}
                            className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 cursor-pointer transition-all duration-500 group relative overflow-hidden transform hover:-translate-y-2"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="absolute -right-8 -top-8 text-9xl text-brand-purple/5 group-hover:text-brand-purple/10 transition-colors rotate-12">
                                <FaUniversity />
                            </div>

                            <div className="relative z-10">
                                <div className="bg-gradient-to-br from-purple-100 to-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center text-brand-purple mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300 relative">
                                    <FaUniversity className="text-2xl" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteModal({ open: true, type: 'college', id: college._id, name: college.name });
                                        }}
                                        className="absolute -top-2 -left-2 bg-white p-2 rounded-lg text-red-500 shadow-md border border-red-50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                        title="Delete College"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                                <h3 className="font-ex-bold text-gray-800 text-xl mb-2 group-hover:text-brand-purple transition-colors">{college.name}</h3>
                                <p className="text-gray-500 mb-6 flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-gray-300"></span> {college.location}</p>

                                <div className="space-y-4 mt-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                        <FaUserTie className="text-blue-500" />
                                        {getLeads(college._id).length} Lead Faculties
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                        <FaChalkboardTeacher className="text-pink-500" />
                                        {users.filter(u => u.role === 'Faculty' && (u.college?._id === college._id || u.college === college._id)).length} Faculties
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                        <FaUserGraduate className="text-brand-purple" />
                                        {users.filter(u => u.role === 'Student' && (u.college?._id === college._id || u.college === college._id)).length} Students
                                    </div>
                                    <FaArrowRight className="text-gray-300 group-hover:text-brand-purple group-hover:translate-x-2 transition-all absolute bottom-8 right-8" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* View 2: The Animated Tree Hierarchy */
                selectedCollege && view !== 'students' && (
                    <div className="tree w-full flex justify-center min-w-max px-8">
                        <ul>
                            <li>
                                {/* Root: College */}
                                <div className="tree-node node-college group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-brand-purple text-2xl mb-3 shadow-sm relative">
                                            <FaUniversity />
                                        </div>
                                        <h3 className="font-bold text-xl text-gray-800 mb-1">{selectedCollege.name}</h3>
                                        <span className="text-xs font-semibold text-purple-500 uppercase tracking-wide bg-purple-50 px-3 py-1 rounded-full">Institution</span>
                                    </div>
                                </div>

                                {/* Level 1: Lead Faculties */}
                                <ul>
                                    {getLeads(selectedCollege._id).length > 0 ? (
                                        getLeads(selectedCollege._id).map(lead => (
                                            <li key={lead._id}>
                                                <div className="tree-node node-lead group">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl mb-3 shadow-sm relative">
                                                            <FaUserTie />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteModal({ open: true, type: 'User', id: lead._id, name: lead.name });
                                                                }}
                                                                className="absolute -top-1 -right-1 bg-white p-1.5 rounded-full text-red-500 shadow-sm border border-red-50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                                                title="Delete Lead Faculty"
                                                            >
                                                                <FaTrash className="text-[10px]" />
                                                            </button>
                                                        </div>
                                                        <h4 className="font-bold text-lg text-gray-800">{lead.name}</h4>
                                                        <p className="text-xs text-gray-500 mb-2">{lead.email}</p>
                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">LEAD FACULTY</span>
                                                    </div>
                                                </div>

                                                {/* Level 2: Faculties */}
                                                <ul>
                                                    {getFaculties(lead._id).length > 0 ? (
                                                        getFaculties(lead._id).map((faculty, fIdx) => (
                                                            <li key={faculty._id} style={{ animationDelay: `${fIdx * 100}ms` }}>
                                                                <div
                                                                    className="tree-node node-faculty group"
                                                                    onClick={() => {
                                                                        handleSelectFaculty(faculty);
                                                                        setView('students');
                                                                    }}
                                                                >
                                                                    <div className="flex flex-col items-center">
                                                                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 text-lg mb-3 shadow-sm group-hover:bg-pink-200 transition-all relative">
                                                                            <FaChalkboardTeacher />
                                                                            <div className="absolute -top-1 -right-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setDeleteModal({ open: true, type: 'User', id: faculty._id, name: faculty.name });
                                                                                    }}
                                                                                    className="bg-white p-1 rounded-md text-red-500 shadow-sm border border-red-50 hover:bg-red-50"
                                                                                    title="Delete Faculty"
                                                                                >
                                                                                    <FaTrash className="text-[8px]" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setPromoteModal({ open: true, faculty });
                                                                                    }}
                                                                                    className="bg-white p-1 rounded-md text-amber-500 shadow-sm border border-amber-50 hover:bg-amber-50"
                                                                                    title="Promote to Lead Faculty"
                                                                                >
                                                                                    <FaArrowUp className="text-[8px]" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <h5 className="font-bold text-gray-800 text-base">{faculty.name}</h5>
                                                                        <p className="text-xs text-gray-400 mb-3">{faculty.email}</p>
                                                                        <div className="flex items-center gap-2 bg-pink-50 px-3 py-1.5 rounded-lg border border-pink-100 group-hover:bg-pink-100 transition-colors">
                                                                            <FaUserGraduate className="text-pink-500 text-xs" />
                                                                            <span className="text-xs font-bold text-gray-700">{getStudents(faculty._id).length} Students</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li>
                                                            <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-medium bg-gray-50">
                                                                No Faculties
                                                            </div>
                                                        </li>
                                                    )}
                                                </ul>
                                            </li>
                                        ))
                                    ) : (
                                        <li>
                                            <div className="p-6 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-medium bg-gray-50 min-w-[200px]">
                                                No Lead Faculties Assigned
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </li>
                        </ul>
                    </div>
                )
            )}

            {/* Students Table Section */}
            {view === 'students' && selectedFaculty && (
                <div id="student-section" className="mt-16 border-t border-gray-100 pt-12 px-4 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-brand-purple/10 rounded-2xl text-brand-purple text-2xl">
                            <FaUserGraduate />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800">Student Portfolio Overview</h3>
                            <p className="text-gray-500">Managing students under <span className="font-bold text-brand-purple">{selectedFaculty.name}</span></p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/80">
                                    <tr>
                                        <th className="px-8 py-5">Student Name</th>
                                        <th className="px-8 py-5">Performance</th>
                                        <th className="px-8 py-5">Submissions</th>
                                        <th className="px-8 py-5 text-center">Progress</th>
                                        <th className="px-8 py-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {getStudents(selectedFaculty._id).map(student => {
                                        const stats = getStudentStats(student);
                                        const completion = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
                                        return (
                                            <tr key={student._id} className="hover:bg-purple-50/30 transition-colors duration-300">
                                                <td className="px-8 py-5 font-medium text-gray-800">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-100 to-blue-50 text-brand-purple flex items-center justify-center text-sm font-bold shadow-sm border border-white">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-base">{student.name}</div>
                                                            <div className="text-xs text-gray-400">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-amber-500 font-bold bg-amber-50 px-3 py-1 rounded-full w-fit border border-amber-100">
                                                        <FaStar className="text-sm" /> {student.points || 0}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="text-xs font-medium">
                                                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-sm font-bold">{stats.approved}</span>
                                                        <span className="text-gray-400 mx-2">of</span>
                                                        <span className="text-gray-700 font-bold text-sm">{stats.total}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="w-32 mx-auto bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                                                        <div className={`h-full rounded-full transition-all duration-1000 ${completion === 100 ? 'bg-green-500' : 'bg-brand-purple'}`} style={{ width: `${completion}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-400 mt-2 block">{completion}% Complete</span>
                                                </td>
                                                <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, type: 'User', id: student._id, name: student.name })}
                                                        className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                                                        title="Delete Student"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewStudent(student._id)}
                                                        className="bg-brand-purple text-white hover:bg-purple-700 px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-xs font-bold inline-flex items-center gap-2"
                                                    >
                                                        <FaEye /> View Portfolio
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {getStudents(selectedFaculty._id).length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-16 text-center text-gray-400 italic">
                                                No students found under this faculty.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-3xl mb-6 mx-auto shadow-inner">
                            <FaTrash />
                        </div>
                        <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Confirm Delete</h3>
                        <p className="text-gray-500 text-center mb-8 italic">
                            Are you sure you want to delete <span className="font-bold text-red-600">"{deleteModal.name}"</span>? This action is irreversible and will affect associations.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteModal({ open: false, type: '', id: '', name: '' })}
                                className="flex-1 px-6 py-3.5 bg-gray-50 text-gray-600 rounded-xl font-bold border border-gray-200 hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={submitting}
                                className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {submitting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reassign Lead Faculty Modal */}
            {reassignModal.open && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl mb-6 mx-auto shadow-inner">
                            <FaExchangeAlt />
                        </div>
                        <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Reassign Lead Faculty</h3>
                        <p className="text-gray-500 text-center mb-6">Select a new Lead Faculty to manage this {reassignModal.type}.</p>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-8 custom-scrollbar">
                            {(() => {
                                let eligibleUsers = [];
                                if (reassignModal.type === 'college') {
                                    // Can reassign to any other Lead Faculty
                                    const otherLeads = users.filter(u => u.role === 'Lead Faculty' && u._id !== reassignModal.currentLeadId);
                                    // OR promote any Faculty currently in this college
                                    const collegeFaculties = users.filter(u => u.role === 'Faculty' && (u.college?._id === reassignModal.id || u.college === reassignModal.id));
                                    eligibleUsers = [...otherLeads, ...collegeFaculties];
                                } else {
                                    // Reassigning a Faculty member to a different Lead
                                    eligibleUsers = users.filter(u => u.role === 'Lead Faculty' && u._id !== reassignModal.currentLeadId);
                                }

                                if (eligibleUsers.length > 0) {
                                    return eligibleUsers.map(l => (
                                        <button
                                            key={l._id}
                                            onClick={() => handleReassign(l._id)}
                                            disabled={submitting}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${l.role === 'Lead Faculty' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                                    {l.role === 'Lead Faculty' ? <FaUserTie /> : <FaChalkboardTeacher />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 group-hover:text-blue-600 flex items-center gap-2">
                                                        {l.name}
                                                        {l.role === 'Faculty' && (
                                                            <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md uppercase font-black tracking-tighter">Candidate for Promotion</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{l.email}</div>
                                                </div>
                                            </div>
                                            <FaArrowRight className="text-gray-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                                        </button>
                                    ));
                                }
                                return <p className="text-center text-gray-400 italic py-4">No eligible candidates available</p>;
                            })()}
                        </div>

                        <button
                            onClick={() => setReassignModal({ open: false, type: '', id: '', currentLeadId: '' })}
                            className="w-full px-6 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold border border-gray-200 hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Promote to Lead Modal */}
            {promoteModal.open && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-3xl mb-6 mx-auto shadow-inner">
                            <FaUserShield />
                        </div>
                        <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">Promote to Lead</h3>
                        <p className="text-gray-500 text-center mb-8">
                            Are you sure you want to promote <span className="font-bold text-amber-600">{promoteModal.faculty?.name}</span> to Lead Faculty?
                            <br /><br />
                            <span className="text-sm">If this college already has a Lead Faculty, they will be <span className="font-bold text-red-600">demoted to regular Faculty</span> and report to the new lead.</span>
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPromoteModal({ open: false, faculty: null })}
                                className="flex-1 px-6 py-3.5 bg-gray-50 text-gray-600 rounded-xl font-bold border border-gray-200 hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePromote}
                                disabled={submitting}
                                className="flex-1 px-6 py-3.5 bg-brand-purple text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {submitting ? 'Promoting...' : 'Confirm Promotion'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollegeHierarchy;
