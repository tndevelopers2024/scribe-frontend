import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/constants';
import { FaChartPie, FaUniversity, FaChalkboardTeacher, FaUserTie, FaUserGraduate, FaArrowRight, FaCheckCircle, FaExclamationCircle, FaSpinner, FaFileUpload } from 'react-icons/fa';

import DashboardActivity from './admin/DashboardActivity';
import CollegeHierarchy from './admin/CollegeHierarchy';

const SuperAdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [colleges, setColleges] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Overview Sub-tabs
    const [overviewTab, setOverviewTab] = useState('activity'); // 'activity' or 'hierarchy'

    // Forms State
    const [collegeForm, setCollegeForm] = useState({ name: '', location: '' });
    const [leadForm, setLeadForm] = useState({ name: '', email: '', collegeId: '' });
    const [facultyForm, setFacultyForm] = useState({ name: '', email: '', leadFacultyId: '' });
    const [studentForm, setStudentForm] = useState({ name: '', email: '', collegeId: '' });
    const [adminForm, setAdminForm] = useState({ name: '', email: '' });
    const [submitting, setSubmitting] = useState(false);

    // Bulk Upload State
    const [bulkFile, setBulkFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [bulkStep, setBulkStep] = useState('upload'); // 'upload', 'review'
    const [bulkCollegeId, setBulkCollegeId] = useState('');

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const collegesRes = await axios.get(API_ENDPOINTS.COLLEGES, config);
            const usersRes = await axios.get(API_ENDPOINTS.USERS, config); // Get all users
            setColleges(collegesRes.data);
            setUsers(usersRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e, type) => {
        e.preventDefault();
        setSubmitting(true);
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        try {
            let res;
            if (type === 'college') {
                res = await axios.post(API_ENDPOINTS.COLLEGE, collegeForm, config);
                setCollegeForm({ name: '', location: '' });
                toast.success(res.data.message || 'College created successfully');
            } else if (type === 'lead') {
                res = await axios.post(API_ENDPOINTS.LEAD_FACULTY, leadForm, config);
                setLeadForm({ name: '', email: '', collegeId: '' });
                // Show different toast based on email status
                if (res.data.emailSent) {
                    toast.success(res.data.message || 'Lead Faculty created and email sent successfully');
                } else {
                    toast.error(res.data.message || 'Lead Faculty created but email failed to send', { duration: 6000 });
                }
            } else if (type === 'faculty') {
                res = await axios.post(API_ENDPOINTS.FACULTY, facultyForm, config);
                setFacultyForm({ name: '', email: '', leadFacultyId: '' });
                if (res.data.emailSent) {
                    toast.success(res.data.message || 'Faculty created and email sent successfully');
                } else {
                    toast.error(res.data.message || 'Faculty created but email failed to send', { duration: 6000 });
                }
            } else if (type === 'student') {
                res = await axios.post(API_ENDPOINTS.STUDENT, studentForm, config);
                setStudentForm({ name: '', email: '', collegeId: '' });
                if (res.data.emailSent) {
                    toast.success(res.data.message || 'Student created and email sent successfully');
                } else {
                    toast.error(res.data.message || 'Student created but email failed to send', { duration: 6000 });
                }
                if (res.data.emailSent) {
                    toast.success(res.data.message || 'Student created and email sent successfully');
                } else {
                    toast.error(res.data.message || 'Student created but email failed to send', { duration: 6000 });
                }
            } else if (type === 'admin') {
                res = await axios.post(`${API_ENDPOINTS.USERS.replace('/api/admin/users', '')}/api/admin/admin`, adminForm, config);
                setAdminForm({ name: '', email: '' });
                if (res.data.emailSent) {
                    toast.success(res.data.message || 'Admin created and email sent successfully');
                } else {
                    toast.error(res.data.message || 'Admin created but email failed to send', { duration: 6000 });
                }
            }
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || `Error adding ${type}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePreview = async (e) => {
        e.preventDefault();
        if (!bulkFile || !bulkCollegeId) {
            toast.error('Please select a college and a CSV file');
            return;
        }

        const formData = new FormData();
        formData.append('file', bulkFile);
        formData.append('collegeId', bulkCollegeId);

        setSubmitting(true);
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };
            const previewUrl = `${API_ENDPOINTS.USERS.replace('/users', '')}/preview-students`; // Construct URL manually if needed or add to constants
            // Actually API_ENDPOINTS.USERS is /api/admin/users. we want /api/admin/preview-students
            const res = await axios.post(previewUrl, formData, config);

            setPreviewData(res.data.students);
            setBulkStep('review');
            toast.success('Preview generated successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error generating preview');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmBulk = async () => {
        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const confirmUrl = `${API_ENDPOINTS.USERS.replace('/users', '')}/confirm-students`;

            const res = await axios.post(confirmUrl, {
                students: previewData,
                collegeId: bulkCollegeId
            }, config);

            toast.success(res.data.message);
            // Reset
            setBulkFile(null);
            setPreviewData([]);
            setBulkStep('upload');
            setBulkCollegeId('');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error confirming upload');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    const handleDeleteClick = (userId) => {
        setDeleteTargetId(userId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const baseUrl = API_ENDPOINTS.USERS.replace('/users', '/user');
            await axios.delete(`${baseUrl}/${deleteTargetId}`, config);
            toast.success('Admin removed successfully');
            fetchData();
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting admin');
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
    };

    // Data Filtering for Dropdowns
    const leadFaculties = users.filter(u => u.role === 'Lead Faculty');
    const faculties = users.filter(u => u.role === 'Faculty');

    if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div></div>;

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full text-left px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${activeTab === id ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:pl-8'}`}
        >
            <span className="text-xl"><Icon /></span>
            <span>{label}</span>
            {activeTab === id && <span className="ml-auto text-white/50"><FaArrowRight /></span>}
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-8xl mx-auto items-start">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-82 flex-shrink-0 sticky top-24 self-start">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</h3>
                    <div className="space-y-2">
                        <TabButton id="overview" label="Overview" icon={FaChartPie} />
                        {user?.role === 'Super Admin' && (
                            <>
                                <TabButton id="addCollege" label="Add New College" icon={FaUniversity} />
                                <TabButton id="addLead" label="Add Lead Faculty" icon={FaUserTie} />
                                <TabButton id="addFaculty" label="Add Faculty" icon={FaChalkboardTeacher} />
                                <TabButton id="addStudent" label="Add Student" icon={FaUserGraduate} />
                                {/* <TabButton id="bulkStudent" label="Batch Student Upload" icon={FaFileUpload} /> */}
                                <TabButton id="addAdmin" label="Add Admin" icon={FaUserTie} />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full overflow-auto">
                <div className="bg-transparent">

                    <div className="transition-all duration-500 ease-in-out">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <FaChartPie className="text-brand-purple" /> Dashboard Overview
                                    </h2>
                                    {/* Sub-tabs switch */}
                                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
                                        <button
                                            onClick={() => setOverviewTab('activity')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${overviewTab === 'activity' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Activity Updates
                                        </button>
                                        <button
                                            onClick={() => setOverviewTab('hierarchy')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${overviewTab === 'hierarchy' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            College Hierarchy
                                        </button>
                                    </div>
                                </div>

                                {overviewTab === 'activity' ? (
                                    <DashboardActivity users={users} colleges={colleges} />
                                ) : (
                                    <CollegeHierarchy colleges={colleges} users={users} refreshData={fetchData} />
                                )}
                            </div>
                        )}

                        {activeTab === 'addCollege' && (
                            <form onSubmit={(e) => handleSubmit(e, 'college')} className="bg-white p-8 rounded-2xl shadow-xl">
                                <h3 className="font-bold text-2xl text-gray-800 text-brand-purple mb-6 border-b pb-4">Add New College</h3>
                                <div className="p-4 bg-brand-purple/5 rounded-xl mb-6 border border-brand-purple/10">
                                    <h4 className="font-semibold text-brand-purple mb-4 flex items-center gap-2">
                                        <FaUniversity className="text-xl" /> College Details
                                    </h4>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                                            <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none transition-all" value={collegeForm.name} onChange={e => setCollegeForm({ ...collegeForm, name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                            <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none transition-all" value={collegeForm.location} onChange={e => setCollegeForm({ ...collegeForm, location: e.target.value })} required />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-brand-purple to-brand-pink text-white py-4 rounded-xl hover:opacity-95 transition-all font-bold shadow-lg transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <FaSpinner className="animate-spin" /> Adding...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle /> Create College
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {activeTab === 'addLead' && (
                            <form onSubmit={(e) => handleSubmit(e, 'lead')} className="bg-white p-8 rounded-2xl shadow-xl">
                                <h3 className="font-bold text-2xl text-gray-800 mb-6">Add Lead Faculty (Existing College)</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none" value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign to College</label>
                                        <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none bg-white" value={leadForm.collegeId} onChange={e => setLeadForm({ ...leadForm, collegeId: e.target.value })} required>
                                            <option value="">Select College</option>
                                            {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-brand-purple text-white py-3 rounded-xl hover:opacity-90 transition font-bold shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <FaSpinner className="animate-spin" /> Assigning...
                                            </>
                                        ) : (
                                            'Assign Lead Faculty'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'addFaculty' && (
                            <form onSubmit={(e) => handleSubmit(e, 'faculty')} className="bg-white p-8 rounded-2xl shadow-xl">
                                <h3 className="font-bold text-2xl text-gray-800 mb-6">Add Faculty</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none" value={facultyForm.name} onChange={e => setFacultyForm({ ...facultyForm, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none" value={facultyForm.email} onChange={e => setFacultyForm({ ...facultyForm, email: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reporting To (Lead Faculty)</label>
                                        <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none bg-white" value={facultyForm.leadFacultyId} onChange={e => setFacultyForm({ ...facultyForm, leadFacultyId: e.target.value })} required>
                                            <option value="">Select Reporting Lead Faculty</option>
                                            {leadFaculties.map(l => <option key={l._id} value={l._id}>{l.name} ({l.email})</option>)}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-brand-purple text-white py-3 rounded-xl hover:opacity-90 transition font-bold shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <FaSpinner className="animate-spin" /> Adding...
                                            </>
                                        ) : (
                                            'Add Faculty'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'addStudent' && (
                            <form onSubmit={(e) => handleSubmit(e, 'student')} className="bg-white p-8 rounded-2xl shadow-xl">
                                <h3 className="font-bold text-2xl text-gray-800 mb-6">Add Student</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none" value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none" value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                                        <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none bg-white" value={studentForm.collegeId} onChange={e => setStudentForm({ ...studentForm, collegeId: e.target.value })} required>
                                            <option value="">Select College</option>
                                            {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Student will be automatically assigned to a faculty in this college</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-brand-purple text-white py-3 rounded-xl hover:opacity-90 transition font-bold shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <FaSpinner className="animate-spin" /> Adding...
                                            </>
                                        ) : (
                                            'Add Student'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'bulkStudent' && (
                            <div className="bg-white p-8 rounded-2xl shadow-xl">
                                <h3 className="font-bold text-2xl text-gray-800 mb-6 flex items-center gap-2">
                                    <FaFileUpload className="text-brand-purple" /> Batch Student Upload
                                </h3>

                                {bulkStep === 'upload' ? (
                                    <form onSubmit={handlePreview} className="space-y-6">
                                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-800">
                                            <p className="font-semibold mb-1">Instructions:</p>
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>For best results, upload a <strong>.csv</strong> file.</li>
                                                <li>The CSV should have headers: <strong>Name, Email</strong>.</li>
                                                <li>This tool will automatically distribute students among the faculties of the selected college to ensure balanced load.</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Target College</label>
                                            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none bg-white" value={bulkCollegeId} onChange={e => setBulkCollegeId(e.target.value)} required>
                                                <option value="">Select College</option>
                                                {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV File</label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={(e) => setBulkFile(e.target.files[0])}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    required
                                                />
                                                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                                                    <FaFileUpload className="text-4xl text-gray-400" />
                                                    <p className="text-gray-600 font-medium">
                                                        {bulkFile ? bulkFile.name : 'Click to select or drag and drop CSV file'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-brand-purple text-white py-3 rounded-xl hover:opacity-90 transition font-bold shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <FaSpinner className="animate-spin" /> Generating Preview...
                                                </>
                                            ) : (
                                                'Generate Preview'
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-lg text-gray-700">Preview Distribution</h4>
                                            <button
                                                onClick={() => setBulkStep('upload')}
                                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                                            >
                                                Cancel & Re-upload
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 text-gray-600 uppercase">
                                                    <tr>
                                                        <th className="px-4 py-3 font-bold">S.No.</th>
                                                        <th className="px-4 py-3 font-bold">Student Name</th>
                                                        <th className="px-4 py-3 font-bold">Email</th>
                                                        <th className="px-4 py-3 font-bold">Assigned To (Faculty)</th>
                                                        <th className="px-4 py-3 font-bold">Role</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {previewData.map((std, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-gray-500 font-medium">{idx + 1}</td>
                                                            <td className="px-4 py-3">{std.name}</td>
                                                            <td className="px-4 py-3">{std.email}</td>
                                                            <td className="px-4 py-3 font-medium text-brand-purple">
                                                                {std.assignedFacultyName} <br />
                                                                <span className="text-xs text-gray-400 font-normal">{std.assignedFacultyEmail}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-500">Student</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex items-center justify-end gap-4 pt-4 border-t">
                                            <p className="text-sm text-gray-500">
                                                Review the assignments above. Clicking confirm will create these accounts and email credentials.
                                            </p>
                                            <button
                                                onClick={handleConfirmBulk}
                                                disabled={submitting}
                                                className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition font-bold shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <FaSpinner className="animate-spin" /> Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaCheckCircle /> Confirm & Upload
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'addAdmin' && (
                            <>
                                <form onSubmit={(e) => handleSubmit(e, 'admin')} className="bg-white p-8 rounded-2xl shadow-xl">
                                    <h3 className="font-bold text-2xl text-gray-800 mb-6">Add Admin</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none" value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} required />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-brand-purple text-white py-3 rounded-xl hover:opacity-90 transition font-bold shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <FaSpinner className="animate-spin" /> Adding...
                                                </>
                                            ) : (
                                                'Create Admin'
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* List of Admins */}
                                <div className="bg-white p-8 rounded-2xl shadow-xl mt-8">
                                    <h3 className="font-bold text-xl text-gray-800 mb-6 border-b pb-4">Existing Admins</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-purple-50 text-purple-800 text-sm uppercase">
                                                    <th className="px-6 py-4 font-bold rounded-l-lg">Name</th>
                                                    <th className="px-6 py-4 font-bold">Email</th>
                                                    <th className="px-6 py-4 font-bold rounded-r-lg text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {users.filter(u => u.role === 'Admin').sort((a, b) => a.name.localeCompare(b.name)).length > 0 ? (
                                                    users.filter(u => u.role === 'Admin').sort((a, b) => a.name.localeCompare(b.name)).map(admin => (
                                                        <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 font-medium text-gray-700">{admin.name}</td>
                                                            <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                {user?.role === 'Super Admin' && (
                                                                    <button
                                                                        onClick={() => handleDeleteClick(admin._id)}
                                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all text-sm font-semibold"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-400 italic">
                                                            No Admins found. Create one above.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full transform transition-all scale-100 animate-scaleIn">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <FaExclamationCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
                            <p className="text-sm text-gray-500 mb-8">
                                Are you sure you want to remove this Admin? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
