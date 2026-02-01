import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaTrophy, FaCheck, FaBan, FaInfoCircle, FaClock, FaChevronDown, FaChevronUp, FaAward, FaGraduationCap } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';
import { formatDate } from '../../utils/dateUtils';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const AcademicAchievements = ({ isFaculty, studentId, studentData, updatePendingCount }) => {
    const { user } = useContext(AuthContext);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

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

    const handleDelete = (achievement) => {
        setItemToDelete(achievement);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.ACHIEVEMENTS}/${itemToDelete._id}`, config);
            toast.success('Achievement deleted successfully');
            setDeleteModalOpen(false);
            setItemToDelete(null);
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

    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
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

            // Update sidebar badge count
            if (updatePendingCount) {
                updatePendingCount('achievements');
            }

            toast.success(`Achievement ${status === 'Approved' ? 'Approved' : 'Rejected'} Successfully`);
            setReviewModalOpen(false);
            setSelectedItemForReview(null);
        } catch (error) {
            console.error(error);
            toast.error('Error updating review');
        }
    };

    const getStatusBadge = (item) => {
        const { status, reviewedBy } = item;
        let reviewerName = '';
        if (reviewedBy) {
            if (reviewedBy.profile && (reviewedBy.profile.firstName || reviewedBy.profile.lastName)) {
                reviewerName = `${reviewedBy.profile.firstName} ${reviewedBy.profile.lastName}`.trim();
            } else if (reviewedBy.name) {
                reviewerName = reviewedBy.name;
            }
        }

        switch (status) {
            case 'Approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"><FaCheck /> Approved {reviewerName && `by ${reviewerName}`}</span>;
            case 'Rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1"><FaBan /> Rejected {reviewerName && `by ${reviewerName}`}</span>;
            case 'Resubmitted': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1"><FaClock /> Resubmitted</span>;
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

            {/* Achievements List - Table Layout */}
            {achievements.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No achievements added yet</p>
                    {!isFaculty && <p className="text-gray-400 text-sm mt-2">Click "Add Achievement" to get started</p>}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 font-semibold text-sm">
                            <div className="col-span-4">Degree/Course Details</div>
                            <div className="col-span-2 text-center">Details</div>
                            <div className="col-span-3 text-center">Status</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100">
                        {achievements.map((achievement) => (
                            <div key={achievement._id} className="hover:bg-gray-50 transition">
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                                    {/* Degree/Course */}
                                    <div className="col-span-4 flex items-center gap-3">
                                        <FaGraduationCap className="text-brand-purple text-xl flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{achievement.courseName}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{achievement.offeredBy}</p>
                                        </div>
                                    </div>

                                    {/* View Details Toggle */}
                                    <div className="col-span-2 flex items-center justify-center">
                                        <button
                                            onClick={() => toggleRowExpansion(achievement._id)}
                                            className="text-brand-purple hover:underline text-sm font-medium"
                                        >
                                            {expandedRows[achievement._id] ? 'Hide' : 'View'} Details
                                        </button>
                                    </div>

                                    {/* Verification Status */}
                                    <div className="col-span-3 flex items-center justify-center">
                                        {getStatusBadge(achievement)}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-3 flex items-center justify-end gap-2">
                                        {!isFaculty ? (
                                            <>
                                                {achievement.status !== 'Approved' && (
                                                    <button
                                                        onClick={() => handleEdit(achievement)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(achievement)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openReviewModal(achievement, 'Approved')}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold ${achievement.status === 'Approved'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                    disabled={achievement.status === 'Approved'}
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                                <button
                                                    onClick={() => openReviewModal(achievement, 'Rejected')}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold ${achievement.status === 'Rejected'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        }`}
                                                    disabled={achievement.status === 'Rejected'}
                                                >
                                                    <FaBan /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable Details Row */}
                                {expandedRows[achievement._id] && (
                                    <div className="px-6 pb-6 pt-2 bg-gray-50/50 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Offered By</p>
                                                <p className="text-sm text-gray-700 font-medium">{achievement.offeredBy}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Mode of Study</p>
                                                <p className="text-sm text-gray-700 font-medium">{achievement.modeOfStudy}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Duration</p>
                                                <p className="text-sm text-gray-700">{achievement.duration || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Completion Status</p>
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${achievement.currentStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    achievement.currentStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {achievement.currentStatus}
                                                </span>
                                            </div>

                                            {/* Feedback Display */}
                                            {achievement.feedback && (
                                                <div className="col-span-full mt-2 pt-2 border-t border-gray-100">
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                                        <FaInfoCircle /> Faculty Feedback
                                                    </p>
                                                    <div className={`p-3 rounded-lg text-sm ${achievement.status === 'Approved'
                                                        ? 'bg-green-50 text-green-800 border border-green-100'
                                                        : 'bg-yellow-50 text-yellow-800 border border-yellow-100'
                                                        }`}>
                                                        <p className="italic">"{achievement.feedback}"</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
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

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName={itemToDelete?.courseName}
                isApproved={itemToDelete?.status === 'Approved'}
            />
        </div>
    );
};

export default AcademicAchievements;
