import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaMedal, FaCheck, FaBan, FaInfoCircle, FaClock, FaChevronDown, FaChevronUp, FaTrophy } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { formatDate } from '../../utils/dateUtils';
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

const CompetitionsAwards = ({ isFaculty, studentId, studentData, updatePendingCount }) => {
    const { user } = useContext(AuthContext);
    const [competitions, setCompetitions] = useState([]);
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
        competition: '',
        venue: '',
        date: '',
        mode: '',
        summaryOfWork: '',
        awardsReceived: ''
    });

    useEffect(() => {
        if (isFaculty && studentData) {
            setCompetitions(studentData.competitionsAwards || []);
            setLoading(false);
        } else {
            fetchCompetitions();
        }
    }, [isFaculty, studentData]);

    const fetchCompetitions = async () => {
        if (isFaculty) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.PROFILE, config);
            setCompetitions(res.data.competitionsAwards || []);
        } catch (error) {
            console.error('Error fetching competitions:', error);
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
                await axios.put(`${API_ENDPOINTS.COMPETITIONS_AWARDS}/${editingId}`, formData, config);
                toast.success('Competition/Award updated successfully');
            } else {
                await axios.post(API_ENDPOINTS.COMPETITIONS_AWARDS, formData, config);
                toast.success('Competition/Award added successfully');
            }

            fetchCompetitions();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving competition');
        }
    };

    const handleEdit = (competition) => {
        setFormData({
            competition: competition.competition,
            venue: competition.venue,
            date: competition.date ? new Date(competition.date).toISOString().split('T')[0] : '',
            mode: competition.mode,
            summaryOfWork: competition.summaryOfWork,
            awardsReceived: competition.awardsReceived
        });
        setEditingId(competition._id);
        setShowForm(true);
    };

    const handleDelete = (competition) => {
        setItemToDelete(competition);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.COMPETITIONS_AWARDS}/${itemToDelete._id}`, config);
            toast.success('Competition/Award deleted successfully');
            setDeleteModalOpen(false);
            setItemToDelete(null);
            fetchCompetitions();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting competition');
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
                section: 'competitionsAwards',
                itemId: targetItem._id,
                status,
                feedback: reviewFeedback
            };

            await axios.put(API_ENDPOINTS.FACULTY_REVIEW, payload, config);

            // Update local state
            const updated = competitions.map(itm =>
                itm._id === targetItem._id
                    ? { ...itm, status, feedback: reviewFeedback }
                    : itm
            );
            setCompetitions(updated);

            toast.success(`Submission ${status === 'Approved' ? 'Approved' : 'Rejected'} Successfully`);
            if (updatePendingCount) {
                updatePendingCount('awards');
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
            competition: '',
            venue: '',
            date: '',
            mode: '',
            summaryOfWork: '',
            awardsReceived: ''
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
                    <h2 className="text-3xl font-bold text-gray-800">Competitions and Awards</h2>
                    <p className="text-gray-600 mt-1">Track your competitive achievements and recognitions</p>
                </div>
                {!showForm && !isFaculty && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                    >
                        <FaPlus /> Add Competition
                    </button>
                )}
            </div>

            {/* Message */}


            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {editingId ? 'Edit Competition/Award' : 'Add New Competition/Award'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Competition */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Competition <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="competition"
                                    value={formData.competition}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Venue */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Venue <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
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

                            {/* Mode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mode <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="mode"
                                    value={formData.mode}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                >
                                    <option value="">Select Mode</option>
                                    <option value="Virtual">Virtual</option>
                                    <option value="On-site">On-site</option>
                                </select>
                            </div>

                            {/* Awards Received */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Awards Received <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="awardsReceived"
                                    value={formData.awardsReceived}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Summary of Work */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Summary of Work <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="summaryOfWork"
                                    value={formData.summaryOfWork}
                                    onChange={handleChange}
                                    required
                                    rows="4"
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

            {/* Competitions List */}
            {competitions.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <FaMedal className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No competitions/awards added yet</p>
                    {!isFaculty && <p className="text-gray-400 text-sm mt-2">Click "Add Competition" to get started</p>}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 font-semibold text-sm">
                            <div className="col-span-6">Competition Name</div>
                            <div className="col-span-2 text-center">Details</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                        {competitions.map((competition) => (
                            <div
                                key={competition._id}
                                className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-gray-50 transition-colors ${competition.status === 'Rejected' ? 'bg-red-50/30' :
                                    competition.status === 'Approved' ? 'bg-green-50/30' : ''
                                    }`}
                            >
                                {/* Competition Name */}
                                <div className="col-span-6 flex items-center gap-2">
                                    <FaTrophy className="text-brand-purple text-lg flex-shrink-0" />
                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{competition.competition}</p>
                                </div>

                                {/* View Details Toggle */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <button
                                        onClick={() => toggleRowExpansion(competition._id)}
                                        className="text-brand-purple hover:underline text-sm font-medium"
                                    >
                                        {expandedRows[competition._id] ? 'Hide' : 'View'} Details
                                    </button>
                                </div>

                                {/* Status */}
                                <div className="col-span-2 flex items-center justify-center">
                                    {getStatusBadge(competition)}
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex items-center justify-end gap-2 text-right">
                                    {!isFaculty ? (
                                        <>
                                            {competition.status !== 'Approved' && (
                                                <button
                                                    onClick={() => handleEdit(competition)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(competition)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openReviewModal(competition, 'Approved')}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold ${competition.status === 'Approved'
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}
                                                disabled={competition.status === 'Approved'}
                                            >
                                                <FaCheck /> Approve
                                            </button>
                                            <button
                                                onClick={() => openReviewModal(competition, 'Rejected')}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold ${competition.status === 'Rejected'
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    }`}
                                                disabled={competition.status === 'Rejected'}
                                            >
                                                <FaBan /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Expandable Details Section */}
                                {expandedRows[competition._id] && (
                                    <div className="col-span-12 px-6 pb-6 pt-2 bg-gray-50/50 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Venue</p>
                                                <p className="text-sm text-gray-700 font-medium">{competition.venue}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Mode</p>
                                                <p className="text-sm text-gray-700 font-medium">{competition.mode}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Awards</p>
                                                <p className="text-sm text-gray-700 font-medium">{competition.awardsReceived}</p>
                                            </div>
                                            <div className="col-span-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Summary of Work</p>
                                                <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{competition.summaryOfWork}</p>
                                            </div>

                                            {/* Feedback Display */}
                                            {competition.feedback && (
                                                <div className="col-span-full mt-2 pt-2 border-t border-gray-100">
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                                        <FaInfoCircle /> Faculty Feedback
                                                    </p>
                                                    <div className={`p-3 rounded-lg text-sm ${competition.status === 'Approved'
                                                        ? 'bg-green-50 text-green-800 border border-green-100'
                                                        : 'bg-yellow-50 text-yellow-800 border border-yellow-100'
                                                        }`}>
                                                        <p className="italic text-sm">"{competition.feedback}"</p>
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
                                Please provide feedback for <strong>{selectedItemForReview?.competition}</strong>.
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
                itemName={itemToDelete?.competition}
                isApproved={itemToDelete?.status === 'Approved'}
            />
        </div>
    );
};

export default CompetitionsAwards;
