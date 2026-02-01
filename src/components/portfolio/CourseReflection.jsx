import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaStar, FaCheck, FaBan, FaInfoCircle, FaClock } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';
import { formatDate } from '../../utils/dateUtils';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Custom Styles for DatePicker
const datePickerStyles = `
    .react-datepicker-wrapper { width: 100%; }
    .react-datepicker__input-container input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #e5e7eb; /* gray-200 */
        border-radius: 0.75rem; /* rounded-xl */
        outline: none;
        transition: all 150ms ease-in-out;
    }
    .react-datepicker__input-container input:focus {
        border-color: rgba(139, 92, 246, 0.5); /* brand-purple/50 */
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
    }
    .react-datepicker {
        font-family: inherit;
        border: 1px solid #e5e7eb;
        border-radius: 1rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    .react-datepicker__header {
        background-color: #f3f4f6; /* gray-100 */
        border-bottom: 1px solid #e5e7eb;
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
        padding-top: 1rem;
    }
    .react-datepicker__current-month {
        color: #4b5563; /* gray-700 */
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .react-datepicker__day-name {
        color: #9ca3af; /* gray-400 */
    }
    .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
        background-color: #8b5cf6 !important; /* brand-purple */
        color: white !important;
        border-radius: 0.5rem;
    }
    .react-datepicker__day:hover {
        background-color: #f3e8ff; /* purple-100 */
        border-radius: 0.5rem;
    }
    .react-datepicker__navigation-icon::before {
        border-color: #6b7280; /* gray-500 */
    }
`;

const CourseReflection = ({ isFaculty, studentId, studentData, updatePendingCount }) => {
    const { user } = useContext(AuthContext);
    const [reflections, setReflections] = useState([]);
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
    const [reviewAction, setReviewAction] = useState('Rejected');
    const [formData, setFormData] = useState({
        year: '',
        date: '',
        topicOfSession: '',
        rating: 5,
        whatWasGood: '',
        whatCanBe: '',
        whatDidILearn: ''
    });

    useEffect(() => {
        if (isFaculty && studentData) {
            setReflections(studentData.courseReflections || []);
            setLoading(false);
        } else {
            fetchReflections();
        }
    }, [isFaculty, studentData]);

    const fetchReflections = async () => {
        if (isFaculty) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.PROFILE, config);
            setReflections(res.data.courseReflections || []);
        } catch (error) {
            console.error('Error fetching reflections:', error);
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
                await axios.put(`${API_ENDPOINTS.COURSE_REFLECTIONS}/${editingId}`, formData, config);
                toast.success('Reflection updated successfully');
            } else {
                await axios.post(API_ENDPOINTS.COURSE_REFLECTIONS, formData, config);
                toast.success('Reflection added successfully');
            }

            fetchReflections();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving reflection');
        }
    };

    const handleEdit = (reflection) => {
        setFormData({
            year: reflection.year,
            date: new Date(reflection.date).toISOString().split('T')[0],
            topicOfSession: reflection.topicOfSession,
            rating: reflection.rating,
            whatWasGood: reflection.whatWasGood,
            whatCanBe: reflection.whatCanBe,
            whatDidILearn: reflection.whatDidILearn
        });
        setEditingId(reflection._id);
        setShowForm(true);
    };

    const handleDelete = (reflection) => {
        setItemToDelete(reflection);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.COURSE_REFLECTIONS}/${itemToDelete._id}`, config);
            toast.success('Reflection deleted successfully');
            setDeleteModalOpen(false);
            setItemToDelete(null);
            fetchReflections();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting reflection');
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
                section: 'courseReflections',
                itemId: targetItem._id,
                status,
                feedback: reviewFeedback
            };

            await axios.put(API_ENDPOINTS.FACULTY_REVIEW, payload, config);

            // Update local state
            const updated = reflections.map(itm =>
                itm._id === targetItem._id
                    ? { ...itm, status, feedback: reviewFeedback }
                    : itm
            );
            setReflections(updated);

            toast.success(`Reflection ${status === 'Approved' ? 'Approved' : 'Rejected'} Successfully`);
            if (updatePendingCount) {
                updatePendingCount('reflections');
            }
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

    const toggleRowExpansion = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const resetForm = () => {
        setFormData({
            year: '',
            date: '',
            topicOfSession: '',
            rating: 5,
            whatWasGood: '',
            whatCanBe: '',
            whatDidILearn: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar key={index} className={index < rating ? 'text-yellow-400' : 'text-gray-300'} />
        ));
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
                    <h2 className="text-3xl font-bold text-gray-800">Course Reflection</h2>
                    <p className="text-gray-600 mt-1">Reflect on your learning experiences</p>
                </div>
                {!showForm && !isFaculty && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                    >
                        <FaPlus /> Add Reflection
                    </button>
                )}
            </div>

            {/* Message */}


            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {editingId ? 'Edit Reflection' : 'Add New Reflection'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <style>{datePickerStyles}</style>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <DatePicker
                                    selected={formData.date ? new Date(formData.date) : null}
                                    onChange={(date) => setFormData({ ...formData, date: date ? date.toISOString().split('T')[0] : '' })}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="DD/MM/YYYY"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                    wrapperClassName="w-full"
                                    showYearDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={15}
                                    required
                                />
                            </div>

                            {/* Topic of Session */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Topic of Session <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="topicOfSession"
                                    value={formData.topicOfSession}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Rating */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rating: star })}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <FaStar
                                                    className={`text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-gray-700 font-medium">{formData.rating}/5</span>
                                </div>
                            </div>

                            {/* What was good about the session */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What was good about the session <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="whatWasGood"
                                    value={formData.whatWasGood}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* What Can Be */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What Can Be <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="whatCanBe"
                                    value={formData.whatCanBe}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* What Did I Learn */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What Did I Learn <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="whatDidILearn"
                                    value={formData.whatDidILearn}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
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

            {/* Reflections List */}
            {reflections.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <p className="text-gray-500 text-lg">No reflections added yet</p>
                    {!isFaculty && <p className="text-gray-400 text-sm mt-2">Click "Add Reflection" to get started</p>}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 font-semibold text-sm">
                            <div className="col-span-4">Date & Year</div>
                            <div className="col-span-2 text-center">Details</div>
                            <div className="col-span-3 text-center">Status</div>
                            <div className="col-span-3 text-right">Actions</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                        {reflections.map((reflection, index) => (
                            <div
                                key={reflection._id}
                                className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-gray-50 transition-colors ${reflection.status === 'Rejected' ? 'bg-red-50/30' :
                                    reflection.status === 'Approved' ? 'bg-green-50/30' : ''
                                    }`}
                            >
                                {/* Date & Year */}
                                <div className="col-span-4 flex flex-col justify-center">
                                    <p className="text-sm font-semibold text-gray-800">{reflection.year}</p>
                                    <p className="text-xs text-gray-500">{formatDate(reflection.date)}</p>
                                </div>

                                {/* View Details */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <button
                                        onClick={() => toggleRowExpansion(reflection._id)}
                                        className="text-brand-purple hover:underline text-sm font-medium"
                                    >
                                        {expandedRows[reflection._id] ? 'Hide' : 'View'} Details
                                    </button>
                                </div>

                                {/* Status */}
                                <div className="col-span-3 flex items-center justify-center">
                                    {getStatusBadge(reflection)}
                                </div>

                                {/* Actions */}
                                <div className="col-span-3 flex items-center justify-end gap-2">
                                    {!isFaculty ? (
                                        <>
                                            {reflection.status !== 'Approved' && (
                                                <button
                                                    onClick={() => handleEdit(reflection)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(reflection)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openReviewModal(reflection, 'Approved')}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold ${reflection.status === 'Approved'
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}
                                                disabled={reflection.status === 'Approved'}
                                            >
                                                <FaCheck /> Approve
                                            </button>
                                            <button
                                                onClick={() => openReviewModal(reflection, 'Rejected')}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold ${reflection.status === 'Rejected'
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    }`}
                                                disabled={reflection.status === 'Rejected'}
                                            >
                                                <FaBan /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>


                                {/* Expandable Details Section */}
                                {
                                    expandedRows[reflection._id] && (
                                        <div className="col-span-12 px-6 pb-6 pt-2 bg-gray-50/50 animate-fade-in">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <div className="col-span-2">
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Topic of Session</p>
                                                    <p className="text-sm text-gray-700 font-medium">{reflection.topicOfSession}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Rating</p>
                                                    <div className="flex gap-0.5">
                                                        {renderStars(reflection.rating)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">What was good</p>
                                                    <p className="text-sm text-gray-700 font-medium">{reflection.whatWasGood}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">What can be</p>
                                                    <p className="text-sm text-gray-700 font-medium">{reflection.whatCanBe}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">What I learned</p>
                                                    <p className="text-sm text-gray-700 font-medium">{reflection.whatDidILearn}</p>
                                                </div>

                                                {/* Feedback Display */}
                                                {reflection.feedback && (
                                                    <div className="col-span-full mt-2 pt-2 border-t border-gray-100">
                                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1 text-gray-400">
                                                            <FaInfoCircle /> Faculty Feedback
                                                        </p>
                                                        <div className={`p-3 rounded-lg text-sm ${reflection.status === 'Approved'
                                                            ? 'bg-green-50 text-green-800 border border-green-100'
                                                            : 'bg-yellow-50 text-yellow-800 border border-yellow-100'
                                                            }`}>
                                                            <p className="italic text-sm">"{reflection.feedback}"</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                </div>
            )
            }

            {/* Verification Modal for Faculty */}
            {
                reviewModalOpen && (
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
                                    Please provide feedback for <strong>{selectedItemForReview?.topicOfSession}</strong>.
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
                )
            }

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName={itemToDelete?.courseName}
                isApproved={itemToDelete?.status === 'Approved'}
            />
        </div >
    );
};

export default CourseReflection;
