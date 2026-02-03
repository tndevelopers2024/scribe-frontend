import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaChartBar, FaCheckCircle, FaClipboardList, FaUsers, FaUniversity, FaTimesCircle, FaChalkboardTeacher, FaUserTie, FaUserShield, FaClock } from 'react-icons/fa';

const DashboardActivity = ({ users = [], colleges = [] }) => {
    const [selectedCollege, setSelectedCollege] = useState('all');
    const [selectedFaculty, setSelectedFaculty] = useState('all');

    // 1. Get filtered list of faculties based on selected college
    const availableFaculties = users.filter(u => {
        if (u.role !== 'Faculty') return false;
        if (selectedCollege === 'all') return true;

        // Find if this faculty belongs to the college
        // We check u.leadFaculty?.college (if populated), u.college?._id (if populated), or u.college (if ID)
        // Usually Faculty -> Lead Faculty -> College

        // Check direct college
        if ((u.college?._id || u.college) === selectedCollege) return true;

        // Check lead faculty's college if available
        if (u.leadFaculty && (u.leadFaculty.college === selectedCollege || u.leadFaculty.college?._id === selectedCollege)) return true;

        return false;
    });

    // 2. Filter Students 
    const students = users.filter(u => {
        if (u.role !== 'Student') return false;

        // College Filter
        if (selectedCollege !== 'all') {
            const studentCollegeId = u.college?._id || u.college;
            if (studentCollegeId !== selectedCollege) return false;
        }

        // Faculty Filter
        if (selectedFaculty !== 'all') {
            // Check if student is assigned to this faculty
            // Fields: u.faculty (id or object) or u.assignedBy (id or object)
            const studentFacultyId = u.faculty?._id || u.faculty;
            const assignedById = u.assignedBy?._id || u.assignedBy;

            if (studentFacultyId !== selectedFaculty && assignedById !== selectedFaculty) return false;
        }

        return true;
    });

    // Reset faculty when college changes
    const handleCollegeChange = (e) => {
        setSelectedCollege(e.target.value);
        setSelectedFaculty('all');
    };

    // 3. Define Sections and Init Stats
    const sectionsConfig = [
        { key: 'academicAchievements', label: 'Academic' },
        { key: 'courseReflections', label: 'Reflections' },
        { key: 'beTheChange', label: 'Change' },
        { key: 'researchPublications', label: 'Research' },
        { key: 'interdisciplinaryCollaboration', label: 'Collab' },
        { key: 'conferenceParticipation', label: 'Conference' },
        { key: 'competitionsAwards', label: 'Awards' },
        { key: 'workshopsTraining', label: 'Workshops' },
        { key: 'clinicalExperiences', label: 'Clinical' },
        { key: 'voluntaryParticipation', label: 'Voluntary' },
        { key: 'ethicsThroughArt', label: 'Ethics' },
        { key: 'thoughtsToActions', label: 'Thoughts' }
    ];

    // Initialize map
    const sectionStats = sectionsConfig.reduce((acc, curr) => {
        acc[curr.key] = { name: curr.label, Submissions: 0, Approved: 0, Rejected: 0 };
        return acc;
    }, {});

    let grandTotalSubmissions = 0;
    let grandTotalApproved = 0;
    let grandTotalRejected = 0;

    // 4. Iterate and Aggregate
    students.forEach(student => {
        sectionsConfig.forEach(sec => {
            const items = student[sec.key];
            if (items && Array.isArray(items)) {
                const count = items.length;
                const approvedCount = items.filter(i => i.status === 'Approved').length;
                const rejectedCount = items.filter(i => i.status === 'Rejected').length;

                sectionStats[sec.key].Submissions += count;
                sectionStats[sec.key].Approved += approvedCount;
                sectionStats[sec.key].Rejected += rejectedCount;

                grandTotalSubmissions += count;
                grandTotalApproved += approvedCount;
                grandTotalRejected += rejectedCount;
            }
        });
    });

    // Convert to Array for Recharts
    const chartData = Object.values(sectionStats);

    const pieData = [
        { name: 'Approved', value: grandTotalApproved },
        { name: 'Rejected', value: grandTotalRejected },
        { name: 'Pending', value: grandTotalSubmissions - (grandTotalApproved + grandTotalRejected) }
    ];

    const COLORS = ['#10B981', '#EF4444', '#F59E0B']; // Green, Red, Amber

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Filter Section */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div className="flex items-center gap-4 text-gray-700 font-semibold">
                    <div className="flex items-center gap-2">
                        <FaUniversity className="text-brand-purple" />
                        <span>Filter Statistics:</span>
                    </div>
                    <span className="text-xs font-medium text-brand-purple bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                        Total Colleges: {colleges.length}
                    </span>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* College Dropdown */}
                    <div className="relative w-full md:w-72 lg:w-96">
                        <select
                            value={selectedCollege}
                            onChange={handleCollegeChange}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-brand-purple focus:border-brand-purple block py-2.5 pl-4 pr-10 outline-none transition-all hover:bg-white hover:shadow-md appearance-none truncate"
                        >
                            <option value="all">All Colleges</option>
                            {colleges.map(college => (
                                <option key={college._id} value={college._id}>{college.name}</option>
                            ))}
                        </select>
                        <FaUniversity className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Faculty Dropdown */}
                    <div className="relative w-full md:w-60">
                        <select
                            value={selectedFaculty}
                            onChange={(e) => setSelectedFaculty(e.target.value)}
                            disabled={selectedCollege === 'all'}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-brand-purple focus:border-brand-purple block py-2.5 pl-4 pr-10 outline-none transition-all hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed appearance-none truncate"
                        >
                            <option value="all">All Faculties</option>
                            {availableFaculties.map(faculty => (
                                <option key={faculty._id} value={faculty._id}>{faculty.name}</option>
                            ))}
                        </select>
                        <FaChalkboardTeacher className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Row 1: Lead Faculties, Faculties, Admin, Students */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><FaUserTie /></div>
                    <div>
                        <p className="text-sm text-gray-500">Lead Faculties</p>
                        <h4 className="text-2xl font-bold text-gray-800">
                            {users.filter(u => {
                                if (u.role !== 'Lead Faculty') return false;
                                if (selectedCollege === 'all') return true;
                                return (u.college?._id || u.college) === selectedCollege;
                            }).length}
                        </h4>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><FaChalkboardTeacher /></div>
                    <div>
                        <p className="text-sm text-gray-500">Faculties</p>
                        <h4 className="text-2xl font-bold text-gray-800">{availableFaculties.length}</h4>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-pink-100 p-3 rounded-xl text-pink-600"><FaUserShield /></div>
                    <div>
                        <p className="text-sm text-gray-500">Admin</p>
                        <h4 className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'Admin').length}</h4>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><FaUsers /></div>
                    <div>
                        <p className="text-sm text-gray-500">Students</p>
                        <h4 className="text-2xl font-bold text-gray-800">{students.length}</h4>
                    </div>
                </div>

                {/* Row 2: Total Submissions, Approved, Rejected, Pending */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><FaClipboardList /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Submissions</p>
                        <h4 className="text-2xl font-bold text-gray-800">{grandTotalSubmissions}</h4>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl text-green-600"><FaCheckCircle /></div>
                    <div>
                        <p className="text-sm text-gray-500">Approved</p>
                        <h4 className="text-2xl font-bold text-gray-800">{grandTotalApproved}</h4>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-xl text-red-600"><FaTimesCircle /></div>
                    <div>
                        <p className="text-sm text-gray-500">Rejected</p>
                        <h4 className="text-2xl font-bold text-gray-800">
                            {grandTotalRejected}
                        </h4>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-amber-100 p-3 rounded-xl text-amber-600"><FaClock /></div>
                    <div>
                        <p className="text-sm text-gray-500">Pending</p>
                        <h4 className="text-2xl font-bold text-gray-800">
                            {grandTotalSubmissions - (grandTotalApproved + grandTotalRejected)}
                        </h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Submissions Overview {selectedCollege !== 'all' ? '(Filtered)' : ''}</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={0} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="Submissions" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={20} name="Total" />
                                <Bar dataKey="Approved" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} name="Approved" />
                                <Bar dataKey="Rejected" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} name="Rejected" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Overall Status Breakdown</h3>
                    <div className="h-80 w-full flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardActivity;
