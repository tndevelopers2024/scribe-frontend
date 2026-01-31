import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaChartBar, FaCheckCircle, FaClipboardList, FaUsers } from 'react-icons/fa';

const DashboardActivity = ({ users = [] }) => {
    const students = users.filter(u => u.role === 'Student');

    // 1. Define Sections and Init Stats
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
        acc[curr.key] = { name: curr.label, Submissions: 0, Approved: 0 };
        return acc;
    }, {});

    let grandTotalSubmissions = 0;
    let grandTotalApproved = 0;

    // 2. Iterate and Aggregate
    students.forEach(student => {
        sectionsConfig.forEach(sec => {
            const items = student[sec.key];
            if (items && Array.isArray(items)) {
                const count = items.length;
                const approvedCount = items.filter(i => i.status === 'Approved').length;

                sectionStats[sec.key].Submissions += count;
                sectionStats[sec.key].Approved += approvedCount;

                grandTotalSubmissions += count;
                grandTotalApproved += approvedCount;
            }
        });
    });

    // Convert to Array for Recharts
    const chartData = Object.values(sectionStats);

    const pieData = [
        { name: 'Approved', value: grandTotalApproved },
        { name: 'Pending/Rejected', value: grandTotalSubmissions - grandTotalApproved }
    ];

    const COLORS = ['#10B981', '#F59E0B']; // Green, Amber

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><FaUsers /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Students</p>
                        <h4 className="text-2xl font-bold text-gray-800">{students.length}</h4>
                    </div>
                </div>
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
                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600"><FaChartBar /></div>
                    <div>
                        <p className="text-sm text-gray-500">Approval Rate</p>
                        <h4 className="text-2xl font-bold text-gray-800">
                            {grandTotalSubmissions > 0 ? Math.round((grandTotalApproved / grandTotalSubmissions) * 100) : 0}%
                        </h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Overall Submissions by Category</h3>
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
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Overall Status</h3>
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
