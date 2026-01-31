import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaCheck, FaBan, FaInfoCircle, FaClock } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';

const InterdisciplinaryCollaboration = ({ isFaculty, studentId, studentData }) => {
    const { user } = useContext(AuthContext);
    const [collaborations, setCollaborations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Review State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedItemForReview, setSelectedItemForReview] = useState(null);
    const [reviewFeedback, setReviewFeedback] = useState('');
    const [reviewAction, setReviewAction] = useState('Rejected');
    const [formData, setFormData] = useState({
        projectTitle: '',
        topic: '',
        disciplinesInvolved: '',
        anticipatedDuration: '',
        significance: '',
        teamExperience: '',
        whatWentWell: '',
        whatCanBeImproved: ''
    });

    useEffect(() => {
        if (isFaculty && studentData) {
            setCollaborations(studentData.interdisciplinaryCollaboration || []);
            setLoading(false);
        } else {
            fetchCollaborations();
        }
    }, [isFaculty, studentData]);

    const fetchCollaborations = async () => {
        if (isFaculty) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.PROFILE, config);
            setCollaborations(res.data.interdisciplinaryCollaboration || []);
        } catch (error) {
            console.error('Error fetching collaborations:', error);
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
                await axios.put(`${API_ENDPOINTS.INTERDISCIPLINARY_COLLABORATION}/${editingId}`, formData, config);
                toast.success('Collaboration updated successfully');
            } else {
                await axios.post(API_ENDPOINTS.INTERDISCIPLINARY_COLLABORATION, formData, config);
                toast.success('Collaboration added successfully');
            }

            fetchCollaborations();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving collaboration');
        }
    };

    const handleEdit = (collaboration) => {
        setFormData({
            projectTitle: collaboration.projectTitle,
            topic: collaboration.topic,
            disciplinesInvolved: collaboration.disciplinesInvolved,
            anticipatedDuration: collaboration.anticipatedDuration,
            significance: collaboration.significance,
            teamExperience: collaboration.teamExperience,
            whatWentWell: collaboration.whatWentWell,
            whatCanBeImproved: collaboration.whatCanBeImproved
        });
        setEditingId(collaboration._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this collaboration?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.INTERDISCIPLINARY_COLLABORATION}/${id}`, config);
            toast.success('Collaboration deleted successfully');
            fetchCollaborations();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting collaboration');
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
                section: 'interdisciplinaryCollaboration',
                itemId: targetItem._id,
                status,
                feedback: reviewFeedback
            };

            await axios.put(API_ENDPOINTS.FACULTY_REVIEW, payload, config);

            // Update local state
            const updated = collaborations.map(item =>
                item._id === targetItem._id
                    ? { ...item, status, feedback: reviewFeedback }
                    : item
            );
            setCollaborations(updated);

            toast.success(`Collaboration ${status === 'Approved' ? 'Approved' : 'Rejected'} Successfully`);
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
            projectTitle: '',
            topic: '',
            disciplinesInvolved: '',
            anticipatedDuration: '',
            significance: '',
            teamExperience: '',
            whatWentWell: '',
            whatCanBeImproved: ''
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
                    <h2 className="text-3xl font-bold text-gray-800">Interdisciplinary Collaboration</h2>
                    <p className="text-gray-600 mt-1">Document your collaborative projects across disciplines</p>
                </div>
                {!showForm && !isFaculty && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                    >
                        <FaPlus /> Add Collaboration
                    </button>
                )}
            </div>

            {/* Message */}


            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {editingId ? 'Edit Collaboration' : 'Add New Collaboration'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Project Title */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="projectTitle"
                                    value={formData.projectTitle}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Topic */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Topic <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Disciplines Involved */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Disciplines Involved <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="disciplinesInvolved"
                                    value={formData.disciplinesInvolved}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Computer Science, Biology"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Anticipated Duration */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Anticipated Duration <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="anticipatedDuration"
                                    value={formData.anticipatedDuration}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., 6 months, 1 year"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Significance of the Project */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Significance of the Project <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="significance"
                                    value={formData.significance}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* Describe your experience working in teams */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Describe your experience working in teams <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="teamExperience"
                                    value={formData.teamExperience}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* What went well? */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What went well? <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="whatWentWell"
                                    value={formData.whatWentWell}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                                />
                            </div>

                            {/* What can be improved? */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    What can be improved? <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="whatCanBeImproved"
                                    value={formData.whatCanBeImproved}
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

            {/* Collaborations List */}
            {collaborations.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <p className="text-gray-500 text-lg">No collaborations added yet</p>
                    {!isFaculty && <p className="text-gray-400 text-sm mt-2">Click "Add Collaboration" to get started</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {collaborations.map((collaboration) => (
                        <div
                            key={collaboration._id}
                            className={`bg-white p-6 rounded-2xl shadow-xl border relative ${collaboration.status === 'Rejected' ? 'border-red-200 bg-red-50' :
                                collaboration.status === 'Approved' ? 'border-green-200' : 'border-gray-100'
                                }`}
                        >
                            {/* Verification Status Badge */}
                            <div className="absolute top-4 right-4">
                                {getStatusBadge(collaboration.status)}
                            </div>

                            <div className="flex justify-between items-start mb-4 mt-4">
                                <div className="flex-1 pr-24">
                                    <h3 className="text-xl font-bold text-gray-800">{collaboration.projectTitle}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {collaboration.topic} • {collaboration.anticipatedDuration}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {!isFaculty && (
                                        <>
                                            <button
                                                onClick={() => handleEdit(collaboration)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(collaboration._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Disciplines:</span>
                                    <p className="text-gray-600">{collaboration.disciplinesInvolved}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Significance:</span>
                                    <p className="text-gray-600">{collaboration.significance}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Team Experience:</span>
                                    <p className="text-gray-600">{collaboration.teamExperience}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">What went well:</span>
                                    <p className="text-gray-600">{collaboration.whatWentWell}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">What can be improved:</span>
                                    <p className="text-gray-600">{collaboration.whatCanBeImproved}</p>
                                </div>
                            </div>

                            {/* Feedback Display */}
                            {collaboration.feedback && (
                                <div className={`mt-4 p-3 rounded-lg text-sm border ${collaboration.status === 'Approved'
                                    ? 'bg-green-50 border-green-100 text-green-800'
                                    : 'bg-yellow-50 border-yellow-100 text-yellow-900'
                                    }`}>
                                    <strong className="block mb-1 flex items-center gap-1">
                                        <FaInfoCircle /> Feedback:
                                    </strong>
                                    <p className="italic">"{collaboration.feedback}"</p>
                                </div>
                            )}

                            {/* Faculty Actions */}
                            {isFaculty && (
                                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                                    <button
                                        onClick={() => openReviewModal(collaboration, 'Approved')}
                                        className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg transition text-sm font-medium flex justify-center items-center gap-2"
                                        disabled={collaboration.status === 'Approved'}
                                    >
                                        <FaCheck /> Approve
                                    </button>
                                    <button
                                        onClick={() => openReviewModal(collaboration, 'Rejected')}
                                        className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition text-sm font-medium flex justify-center items-center gap-2"
                                    >
                                        <FaBan /> Reject
                                    </button>
                                </div>
                            )}
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
                                Please provide feedback for <strong>{selectedItemForReview?.projectTitle}</strong>.
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

export default InterdisciplinaryCollaboration;
