import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaHandsHelping, FaCheck, FaBan, FaInfoCircle, FaClock, FaHeart } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const VoluntaryParticipation = ({ isFaculty, studentId, studentData, updatePendingCount }) => {
    const { user } = useContext(AuthContext);
    const [participations, setParticipations] = useState([]);
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
        nameOfOrganisation: '',
        yourRole: '',
        whatDidYouLearn: '',
        positiveInfluence: ''
    });

    useEffect(() => {
        if (isFaculty && studentData) {
            setParticipations(studentData.voluntaryParticipation || []);
            setLoading(false);
        } else {
            fetchParticipations();
        }
    }, [isFaculty, studentData]);

    const fetchParticipations = async () => {
        if (isFaculty) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.PROFILE, config);
            setParticipations(res.data.voluntaryParticipation || []);
        } catch (error) {
            console.error('Error fetching voluntary participations:', error);
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
                await axios.put(`${API_ENDPOINTS.VOLUNTARY_PARTICIPATION}/${editingId}`, formData, config);
                toast.success('Voluntary participation updated successfully');
            } else {
                await axios.post(API_ENDPOINTS.VOLUNTARY_PARTICIPATION, formData, config);
                toast.success('Voluntary participation added successfully');
            }

            fetchParticipations();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving voluntary participation');
        }
    };

    const handleEdit = (participation) => {
        setFormData({
            nameOfOrganisation: participation.nameOfOrganisation,
            yourRole: participation.yourRole,
            whatDidYouLearn: participation.whatDidYouLearn,
            positiveInfluence: participation.positiveInfluence
        });
        setEditingId(participation._id);
        setShowForm(true);
    };

    const handleDelete = (participation) => {
        setItemToDelete(participation);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.VOLUNTARY_PARTICIPATION}/${itemToDelete._id}`, config);
            toast.success('Voluntary participation deleted successfully');
            setDeleteModalOpen(false);
            setItemToDelete(null);
            fetchParticipations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting voluntary participation');
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
                section: 'voluntaryParticipation',
                itemId: targetItem._id,
                status,
                feedback: reviewFeedback
            };

            await axios.put(API_ENDPOINTS.FACULTY_REVIEW, payload, config);

            // Update local state
            const updated = participations.map(itm =>
                itm._id === targetItem._id
                    ? { ...itm, status, feedback: reviewFeedback }
                    : itm
            );
            setParticipations(updated);

            toast.success(`Verification ${status === 'Approved' ? 'Approved' : 'Rejected'} Successfully`);
            if (updatePendingCount) {
                updatePendingCount('voluntary');
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
            nameOfOrganisation: '',
            yourRole: '',
            whatDidYouLearn: '',
            positiveInfluence: ''
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Voluntary Participation</h2>
                    <p className="text-gray-600 mt-1">Document your volunteer work and community service</p>
                </div>
                {!showForm && !isFaculty && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                    >
                        <FaPlus /> Add Participation
                    </button>
                )}
            </div>



            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {editingId ? 'Edit Voluntary Participation' : 'Add New Voluntary Participation'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name of Organisation <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nameOfOrganisation"
                                value={formData.nameOfOrganisation}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What was your role? <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="yourRole"
                                value={formData.yourRole}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What did you learn? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="whatDidYouLearn"
                                value={formData.whatDidYouLearn}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                In what ways did your participation positively influence the overall goal of the initiative? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="positiveInfluence"
                                value={formData.positiveInfluence}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

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

            {participations.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <FaHandsHelping className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No voluntary participations added yet</p>
                    {!isFaculty && <p className="text-gray-400 text-sm mt-2">Click "Add Participation" to get started</p>}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 font-semibold text-sm">
                            <div className="col-span-6">Organisation Name</div>
                            <div className="col-span-2 text-center">Details</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100">
                        {participations.map((participation) => (
                            <div key={participation._id} className="hover:bg-gray-50 transition">
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                                    {/* Organisation Name */}
                                    <div className="col-span-6 flex items-center gap-2">
                                        <FaHeart className="text-brand-purple text-lg flex-shrink-0" />
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{participation.nameOfOrganisation}</p>
                                    </div>

                                    {/* View Details Toggle */}
                                    <div className="col-span-2 flex items-center justify-center">
                                        <button
                                            onClick={() => toggleRowExpansion(participation._id)}
                                            className="text-brand-purple hover:underline text-sm font-medium"
                                        >
                                            {expandedRows[participation._id] ? 'Hide' : 'View'} Details
                                        </button>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 flex items-center justify-center">
                                        {getStatusBadge(participation)}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex items-center justify-end gap-2 text-right">
                                        {!isFaculty ? (
                                            <>
                                                {participation.status !== 'Approved' && (
                                                    <button
                                                        onClick={() => handleEdit(participation)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(participation)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openReviewModal(participation, 'Approved')}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold ${participation.status === 'Approved'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                    disabled={participation.status === 'Approved'}
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                                <button
                                                    onClick={() => openReviewModal(participation, 'Rejected')}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold ${participation.status === 'Rejected'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        }`}
                                                    disabled={participation.status === 'Rejected'}
                                                >
                                                    <FaBan /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable Details Section */}
                                {expandedRows[participation._id] && (
                                    <div className="col-span-12 px-6 pb-6 pt-2 bg-gray-50/50 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <div className="col-span-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Role</p>
                                                <p className="text-sm text-gray-700 font-medium">{participation.yourRole}</p>
                                            </div>
                                            <div className="col-span-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">What did you learn?</p>
                                                <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{participation.whatDidYouLearn}</p>
                                            </div>
                                            <div className="col-span-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Positive Influence</p>
                                                <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{participation.positiveInfluence}</p>
                                            </div>

                                            {/* Feedback Display */}
                                            {participation.feedback && (
                                                <div className="col-span-full mt-2 pt-2 border-t border-gray-100">
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                                        <FaInfoCircle /> Faculty Feedback
                                                    </p>
                                                    <div className={`p-3 rounded-lg text-sm ${participation.status === 'Approved'
                                                        ? 'bg-green-50 text-green-800 border border-green-100'
                                                        : 'bg-yellow-50 text-yellow-800 border border-yellow-100'
                                                        }`}>
                                                        <p className="italic text-sm">"{participation.feedback}"</p>
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
                                Please provide feedback for <strong>{selectedItemForReview?.nameOfOrganisation}</strong>.
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
                itemName={itemToDelete?.role}
                isApproved={itemToDelete?.status === 'Approved'}
            />
        </div>
    );
};

export default VoluntaryParticipation;
