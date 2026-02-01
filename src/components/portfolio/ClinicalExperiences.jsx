import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaStethoscope, FaCheck, FaBan, FaInfoCircle, FaClock } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const ClinicalExperiences = ({ isFaculty, studentId, studentData, updatePendingCount }) => {
    const { user } = useContext(AuthContext);
    const [experiences, setExperiences] = useState([]);
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
        ethicalDilemma: '',
        bioethicsPrinciple: '',
        whatWasDone: '',
        yourPerspective: '',
        howToManage: ''
    });

    useEffect(() => {
        if (isFaculty && studentData) {
            setExperiences(studentData.clinicalExperiences || []);
            setLoading(false);
        } else {
            fetchExperiences();
        }
    }, [isFaculty, studentData]);

    const fetchExperiences = async () => {
        if (isFaculty) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.PROFILE, config);
            setExperiences(res.data.clinicalExperiences || []);
        } catch (error) {
            console.error('Error fetching clinical experiences:', error);
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
                await axios.put(`${API_ENDPOINTS.CLINICAL_EXPERIENCES}/${editingId}`, formData, config);
                toast.success('Clinical experience updated successfully');
            } else {
                await axios.post(API_ENDPOINTS.CLINICAL_EXPERIENCES, formData, config);
                toast.success('Clinical experience added successfully');
            }

            fetchExperiences();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving clinical experience');
        }
    };

    const handleEdit = (experience) => {
        setFormData({
            ethicalDilemma: experience.ethicalDilemma,
            bioethicsPrinciple: experience.bioethicsPrinciple,
            whatWasDone: experience.whatWasDone,
            yourPerspective: experience.yourPerspective,
            howToManage: experience.howToManage
        });
        setEditingId(experience._id);
        setShowForm(true);
    };

    const handleDelete = (experience) => {
        setItemToDelete(experience);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.CLINICAL_EXPERIENCES}/${itemToDelete._id}`, config);
            toast.success('Clinical experience deleted successfully');
            setDeleteModalOpen(false);
            setItemToDelete(null);
            fetchExperiences();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting clinical experience');
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
                section: 'clinicalExperiences',
                itemId: targetItem._id,
                status,
                feedback: reviewFeedback
            };

            await axios.put(API_ENDPOINTS.FACULTY_REVIEW, payload, config);

            // Update local state
            const updated = experiences.map(itm =>
                itm._id === targetItem._id
                    ? { ...itm, status, feedback: reviewFeedback }
                    : itm
            );
            setExperiences(updated);

            toast.success(`Clinical Experience ${status === 'Approved' ? 'Approved' : 'Rejected'} Successfully`);
            if (updatePendingCount) {
                updatePendingCount('clinical');
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
            ethicalDilemma: '',
            bioethicsPrinciple: '',
            whatWasDone: '',
            yourPerspective: '',
            howToManage: ''
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
                    <h2 className="text-3xl font-bold text-gray-800">Clinical Experiences</h2>
                    <p className="text-gray-600 mt-1">Reflect on ethical dilemmas and bioethics principles</p>
                </div>
                {!showForm && !isFaculty && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                    >
                        <FaPlus /> Add Experience
                    </button>
                )}
            </div>



            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {editingId ? 'Edit Clinical Experience' : 'Add New Clinical Experience'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Briefly describe the ethical dilemma you encountered <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="ethicalDilemma"
                                value={formData.ethicalDilemma}
                                onChange={handleChange}
                                required
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Which Principle of bioethics will you apply in this scenario? <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="bioethicsPrinciple"
                                value={formData.bioethicsPrinciple}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What was done? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="whatWasDone"
                                value={formData.whatWasDone}
                                onChange={handleChange}
                                required
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What is your perspective towards the action done? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="yourPerspective"
                                value={formData.yourPerspective}
                                onChange={handleChange}
                                required
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                How will you manage the situation? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="howToManage"
                                value={formData.howToManage}
                                onChange={handleChange}
                                required
                                rows="3"
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

            {experiences.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <FaStethoscope className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No clinical experiences added yet</p>
                    {!isFaculty && <p className="text-gray-400 text-sm mt-2">Click "Add Experience" to get started</p>}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 font-semibold text-sm">
                            <div className="col-span-6">Ethical Dilemma</div>
                            <div className="col-span-2 text-center">Details</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100">
                        {experiences.map((experience) => (
                            <div key={experience._id} className="hover:bg-gray-50 transition">
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                                    {/* Ethical Dilemma */}
                                    <div className="col-span-6 flex items-center gap-2">
                                        <FaStethoscope className="text-brand-purple text-lg flex-shrink-0" />
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{experience.ethicalDilemma}</p>
                                    </div>

                                    {/* View Details Toggle */}
                                    <div className="col-span-2 flex items-center justify-center">
                                        <button
                                            onClick={() => toggleRowExpansion(experience._id)}
                                            className="text-brand-purple hover:underline text-sm font-medium"
                                        >
                                            {expandedRows[experience._id] ? 'Hide' : 'View'} Details
                                        </button>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 flex items-center justify-center">
                                        {getStatusBadge(experience)}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex items-center justify-end gap-2 text-right">
                                        {!isFaculty ? (
                                            <>
                                                {experience.status !== 'Approved' && (
                                                    <button
                                                        onClick={() => handleEdit(experience)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(experience)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openReviewModal(experience, 'Approved')}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold ${experience.status === 'Approved'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                    disabled={experience.status === 'Approved'}
                                                >
                                                    <FaCheck /> Approve
                                                </button>
                                                <button
                                                    onClick={() => openReviewModal(experience, 'Rejected')}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold ${experience.status === 'Rejected'
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        }`}
                                                    disabled={experience.status === 'Rejected'}
                                                >
                                                    <FaBan /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable Details Section */}
                                {expandedRows[experience._id] && (
                                    <div className="col-span-12 px-6 pb-6 pt-2 bg-gray-50/50 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <div className="col-span-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Bioethics Principle</p>
                                                <p className="text-sm text-gray-700 font-medium">{experience.bioethicsPrinciple}</p>
                                            </div>
                                            <div className="col-span-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">What was done</p>
                                                <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{experience.whatWasDone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Your Perspective</p>
                                                <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{experience.yourPerspective}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">How to Manage</p>
                                                <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{experience.howToManage}</p>
                                            </div>

                                            {/* Feedback Display */}
                                            {experience.feedback && (
                                                <div className="col-span-full mt-2 pt-2 border-t border-gray-100">
                                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                                                        <FaInfoCircle /> Faculty Feedback
                                                    </p>
                                                    <div className={`p-3 rounded-lg text-sm ${experience.status === 'Approved'
                                                        ? 'bg-green-50 text-green-800 border border-green-100'
                                                        : 'bg-yellow-50 text-yellow-800 border border-yellow-100'
                                                        }`}>
                                                        <p className="italic text-sm">"{experience.feedback}"</p>
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
                                Please provide feedback for <strong>{selectedItemForReview?.nameOfClinic}</strong>.
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
                itemName="Clinical Experience"
                isApproved={itemToDelete?.status === 'Approved'}
            />
        </div>
    );
};

export default ClinicalExperiences;
