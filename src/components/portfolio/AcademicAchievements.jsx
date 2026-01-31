import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaTrophy, FaCheck, FaBan, FaInfoCircle, FaClock } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';

const AcademicAchievements = ({ isFaculty, studentId, studentData }) => {
    const { user } = useContext(AuthContext);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Review State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedItemForReview, setSelectedItemForReview] = useState(null);
    const [reviewFeedback, setReviewFeedback] = useState('');
    const [reviewAction, setReviewAction] = useState('Rejected'); // 'Approved' or 'Rejected'
    const [formData, setFormData] = useState({
        courseName: '',
        offeredBy: '',
        modeOfStudy: '',
        duration: '',
        currentStatus: ''
    });

    useEffect(() => {
        if (isFaculty && studentData) {
            setAchievements(studentData.academicAchievements || []);
            setLoading(false);
        } else {
            fetchAchievements();
        }
    }, [isFaculty, studentData]);

    const fetchAchievements = async () => {
        if (isFaculty) return; // Don't fetch if in faculty mode (data passed via props)
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.PROFILE, config);
            setAchievements(res.data.academicAchievements || []);
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            if (editingId) {
                // Update existing achievement
                await axios.put(`${API_ENDPOINTS.ACHIEVEMENTS}/${editingId}`, formData, config);
                toast.success('Achievement updated successfully');
            } else {
                // Add new achievement
                await axios.post(API_ENDPOINTS.ACHIEVEMENTS, formData, config);
                toast.success('Achievement added successfully');
            }

            fetchAchievements();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving achievement');
        }
    };

    const handleEdit = (achievement) => {
        setFormData({
            courseName: achievement.courseName,
            offeredBy: achievement.offeredBy,
            modeOfStudy: achievement.modeOfStudy,
            duration: achievement.duration || '',
            currentStatus: achievement.currentStatus
        });
        setEditingId(achievement._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this achievement?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.ACHIEVEMENTS}/${id}`, config);
            toast.success('Achievement deleted successfully');
            fetchAchievements();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting achievement');
        }
    };

    // Faculty Review Functions
    const openReviewModal = (item, action) => {
        setSelectedItemForReview(item);
        setReviewFeedback(item.feedback || '');
        setReviewAction(action);
        setReviewModalOpen(true);
    };

    const handleReviewSubmit = async (status, item = null) => {
        const targetItem = item || selectedItemForReview;
        if (!targetItem) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                studentId,
                section: 'academicAchievements',
                itemId: targetItem._id,
                status,
                feedback: reviewFeedback
            };

            await axios.put(API_ENDPOINTS.FACULTY_REVIEW, payload, config);

            // Update local state
            const updated = achievements.map(itm =>
                itm._id === targetItem._id
                    ? { ...itm, status, feedback: reviewFeedback }
                    : itm
            );
            setAchievements(updated);

            toast.success(`Achievement ${status === 'Approved' ? 'Approved' : 'Rejected'} Successfully`);
            setReviewModalOpen(false);
            setSelectedItemForReview(null);
        } catch (error) {
            console.error(error);
            toast.error('Error updating review');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"><FaCheck /> Approved</span>;
            case 'Rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1"><FaBan /> Rejected</span>;
            default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1"><FaClock /> Pending</span>;
        }
    };

    const resetForm = () => {
        setFormData({
            courseName: '',
            offeredBy: '',
            modeOfStudy: '',
            duration: '',
            currentStatus: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-brand-purple text-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Academic Achievements</h2>
                    <p className="text-gray-600 mt-1">Additional courses and certifications</p>
                </div>
                {!showForm && !isFaculty && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                    >
                        <FaPlus /> Add Achievement
                    </button>
                )}
            </div>



            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {editingId ? 'Edit Achievement' : 'Add New Achievement'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Course Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name of Course <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Offered By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Offered by <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="offeredBy"
                                    value={formData.offeredBy}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Mode of Study */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mode of Study <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="modeOfStudy"
                                    value={formData.modeOfStudy}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                >
                                    <option value="">Select Mode</option>
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration of Course
                                </label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g., 3 months, 1 year"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Current Status */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="currentStatus"
                                    value={formData.currentStatus}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Completed">Completed</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Planned">Planned</option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                            >
                                <FaSave /> {editingId ? 'Update' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition font-medium"
                            >
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Achievements List */}
            {achievements.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No achievements added yet</p>
                    {!isFaculty && <p className="text-gray-400 text-sm mt-2">Click "Add Achievement" to get started</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) => (
                        <div
                            key={achievement._id}
                            className={`bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition flex flex-col relative ${achievement.status === 'Rejected' ? 'border-red-200 bg-red-50' :
                                achievement.status === 'Approved' ? 'border-green-200' : 'border-gray-100'
                                }`}
                        >
                            {/* Verification Status Badge */}
                            <div className="absolute top-4 right-4">
                                {getStatusBadge(achievement.status)}
                            </div>

                            <div className="mb-4 pr-16 bg-brand-purple/5 w-12 h-12 rounded-xl flex items-center justify-center text-brand-purple text-xl">
                                <FaTrophy className='!text-brand-purple' />
                            </div>

                            {/* Content Display */}
                            <h3 className="font-bold text-lg text-gray-800 line-clamp-1 mb-1">{achievement.courseName}</h3>
                            <p className="text-sm text-gray-500 mb-4">{achievement.offeredBy}</p>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Mode:</span>
                                    <span className="font-medium text-gray-700">{achievement.modeOfStudy}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Duration:</span>
                                    <span className="font-medium text-gray-700">{achievement.duration}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Status:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${achievement.currentStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                        achievement.currentStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {achievement.currentStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Feedback Display */}
                            {achievement.feedback && (
                                <div className={`mb-4 p-3 rounded-lg text-sm border ${achievement.status === 'Approved'
                                    ? 'bg-green-50 border-green-100 text-green-800'
                                    : 'bg-yellow-50 border-yellow-100 text-yellow-900'
                                    }`}>
                                    <strong className="block mb-1 flex items-center gap-1">
                                        <FaInfoCircle /> Feedback:
                                    </strong>
                                    <p className="italic">"{achievement.feedback}"</p>
                                </div>
                            )}

                            <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
                                {!isFaculty ? (
                                    <>
                                        {/* Student Actions: Edit/Delete - Disable if Approved? Optional */}
                                        <button
                                            onClick={() => handleEdit(achievement)}
                                            className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600 px-4 py-2 rounded-lg transition text-sm font-medium flex justify-center items-center gap-2"
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(achievement._id)}
                                            className="flex-1 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-lg transition text-sm font-medium flex justify-center items-center gap-2"
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Faculty Actions: Approve/Reject */}
                                        <button
                                            onClick={() => openReviewModal(achievement, 'Approved')}
                                            className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg transition text-sm font-medium flex justify-center items-center gap-2"
                                            disabled={achievement.status === 'Approved'}
                                        >
                                            <FaCheck /> Approve
                                        </button>
                                        <button
                                            onClick={() => openReviewModal(achievement, 'Rejected')}
                                            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition text-sm font-medium flex justify-center items-center gap-2"
                                        >
                                            <FaBan /> Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Verification Modal for Faculty */}
            {reviewModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                        <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${reviewAction === 'Approved' ? 'bg-green-50' : 'bg-red-50'
                            }`}>
                            <h3 className={`font-bold text-lg ${reviewAction === 'Approved' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {reviewAction === 'Approved' ? 'Approve & Feedback' : 'Reject & Feedback'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 text-sm">
                                Please provide feedback for <strong>{selectedItemForReview?.courseName}</strong>.
                                {reviewAction === 'Approved' && " (Optional but recommended)"}
                                {reviewAction === 'Rejected' && " (Required)"}
                            </p>
                            <textarea
                                value={reviewFeedback}
                                onChange={(e) => setReviewFeedback(e.target.value)}
                                rows="4"
                                placeholder={`Enter your feedback here...`}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            ></textarea>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => handleReviewSubmit(reviewAction)}
                                    disabled={reviewAction === 'Rejected' && !reviewFeedback.trim()}
                                    className={`flex-1 text-white px-4 py-2 rounded-xl transition font-medium disabled:opacity-50 ${reviewAction === 'Approved'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                >
                                    Confirm {reviewAction}
                                </button>
                                <button
                                    onClick={() => setReviewModalOpen(false)}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicAchievements;
