import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUniversity, FaUserTie, FaChalkboardTeacher, FaUserGraduate, FaArrowLeft, FaEye, FaStar, FaChevronRight } from 'react-icons/fa';

const CollegeHierarchy = ({ colleges, users }) => {
    const navigate = useNavigate();

    // Navigation State
    const [view, setView] = useState('colleges'); // 'colleges', 'leads', 'faculties', 'students'
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedFaculty, setSelectedFaculty] = useState(null);

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
    const goBack = () => {
        if (view === 'students') setView('faculties');
        else if (view === 'faculties') setView('leads');
        else if (view === 'leads') setView('colleges');
    };

    const handleSelectCollege = (college) => {
        setSelectedCollege(college);
        setView('leads');
    };

    const handleSelectLead = (lead) => {
        setSelectedLead(lead);
        setView('faculties');
    };

    const handleSelectFaculty = (faculty) => {
        setSelectedFaculty(faculty);
        setView('students');
    };

    // Replace modal with navigation
    const handleViewStudent = (studentId) => {
        navigate(`/faculty/portfolio/${studentId}`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Breadcrumb / Header */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                {view !== 'colleges' && (
                    <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full text-brand-purple transition">
                        <FaArrowLeft />
                    </button>
                )}
                <div className="flex items-center text-sm md:text-base overflow-x-auto whitespace-nowrap">
                    <span
                        className={`cursor-pointer hover:text-brand-purple ${view === 'colleges' ? 'font-bold text-gray-800' : 'text-gray-500'}`}
                        onClick={() => setView('colleges')}
                    >
                        Colleges
                    </span>
                    {selectedCollege && (
                        <>
                            <FaChevronRight className="mx-2 text-gray-300 text-xs" />
                            <span
                                className={`cursor-pointer hover:text-brand-purple ${view === 'leads' ? 'font-bold text-gray-800' : 'text-gray-500'}`}
                                onClick={() => setView('leads')}
                            >
                                {selectedCollege.name}
                            </span>
                        </>
                    )}
                    {selectedLead && view !== 'colleges' && view !== 'leads' && (
                        <>
                            <FaChevronRight className="mx-2 text-gray-300 text-xs" />
                            <span
                                className={`cursor-pointer hover:text-brand-purple ${view === 'faculties' ? 'font-bold text-gray-800' : 'text-gray-500'}`}
                                onClick={() => setView('faculties')}
                            >
                                {selectedLead.name}
                            </span>
                        </>
                    )}
                    {selectedFaculty && view === 'students' && (
                        <>
                            <FaChevronRight className="mx-2 text-gray-300 text-xs" />
                            <span className="font-bold text-gray-800">{selectedFaculty.name}</span>
                        </>
                    )}
                </div>
            </div>

            {/* VIEWS */}

            {/* 1. Colleges View */}
            {view === 'colleges' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colleges.map(college => (
                        <div
                            key={college._id}
                            onClick={() => handleSelectCollege(college)}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-purple-100 p-3 rounded-xl text-brand-purple group-hover:scale-110 transition-transform">
                                    <FaUniversity className="text-xl" />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="font-bold text-gray-800 truncate">{college.name}</h3>
                                    <p className="text-sm text-gray-500 truncate">{college.location}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-2 rounded-lg flex justify-between">
                                <span>Lead Faculties</span>
                                <span>{getLeads(college._id).length}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. Lead Faculties View */}
            {view === 'leads' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getLeads(selectedCollege?._id).map(lead => (
                        <div
                            key={lead._id}
                            onClick={() => handleSelectLead(lead)}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-blue-50 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                                    <FaUserTie className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{lead.name}</h3>
                                    <p className="text-xs text-gray-500">{lead.email}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-2 rounded-lg flex justify-between">
                                <span>Faculties Assigned</span>
                                <span>{getFaculties(lead._id).length}</span>
                            </div>
                        </div>
                    ))}
                    {getLeads(selectedCollege?._id).length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            No Lead Faculties found for this college.
                        </div>
                    )}
                </div>
            )}

            {/* 3. Faculties View */}
            {view === 'faculties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFaculties(selectedLead?._id).map(faculty => (
                        <div
                            key={faculty._id}
                            onClick={() => handleSelectFaculty(faculty)}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-pink-50 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-pink-100 p-3 rounded-xl text-pink-600 group-hover:scale-110 transition-transform">
                                    <FaChalkboardTeacher className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{faculty.name}</h3>
                                    <p className="text-xs text-gray-500">{faculty.email}</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-2 rounded-lg flex justify-between">
                                <span>Students Managed</span>
                                <span>{getStudents(faculty._id).length}</span>
                            </div>
                        </div>
                    ))}
                    {getFaculties(selectedLead?._id).length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            No Faculties found under this Lead.
                        </div>
                    )}
                </div>
            )}

            {/* 4. Students Table View */}
            {view === 'students' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Students under {selectedFaculty?.name}</h3>
                        <span className="text-sm bg-white px-3 py-1 rounded-full border border-gray-200">
                            Total: {getStudents(selectedFaculty?._id).length}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Points</th>
                                    <th className="px-6 py-4">Submissions</th>
                                    <th className="px-6 py-4 text-center">Completion</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getStudents(selectedFaculty?._id).map(student => {
                                    const stats = getStudentStats(student);
                                    const completion = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
                                    return (
                                        <tr key={student._id} className="border-b hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center text-xs font-bold">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{student.name}</div>
                                                        <div className="text-xs text-gray-400">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-amber-500 font-bold">
                                                    <FaStar className="text-sm" /> {student.points || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs">
                                                    <span className="text-green-600 font-bold">{stats.approved}</span> Approved
                                                    <span className="text-gray-300 mx-1">/</span>
                                                    <span className="text-gray-600 font-semibold">{stats.total}</span> Total
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${completion}%` }}></div>
                                                </div>
                                                <span className="text-xs text-gray-400 mt-1 block">{completion}%</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewStudent(student._id)}
                                                    className="bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white px-3 py-1.5 rounded-lg transition text-xs font-bold flex items-center gap-2 ml-auto"
                                                >
                                                    <FaEye /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {getStudents(selectedFaculty?._id).length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollegeHierarchy;
