import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaPalette, FaCheck, FaBan, FaInfoCircle, FaClock } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';

const EthicsThroughArt = ({ isFaculty, studentId, studentData }) => {
    const { user } = useContext(AuthContext);
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Review State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedItemForReview, setSelectedItemForReview] = useState(null);
    const [reviewFeedback, setReviewFeedback] = useState('');
    const [reviewAction, setReviewAction] = useState('Rejected');
    const [formData, setFormData] = useState({
        workAbout: '',
        whyThisTopic: '',
        howExpressed: '',
        whyThisFormat: ''
    });

    useEffect(() => {
        if (isFaculty && studentData) {
            setArtworks(studentData.ethicsThroughArt || []);
            setLoading(false);
        } else {
            fetchArtworks();
        }
    }, [isFaculty, studentData]);

    const fetchArtworks = async () => {
        if (isFaculty) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.PROFILE, config);
            setArtworks(res.data.ethicsThroughArt || []);
        } catch (error) {
            console.error('Error fetching ethics through art:', error);
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
                await axios.put(`${API_ENDPOINTS.ETHICS_THROUGH_ART}/${editingId}`, formData, config);
                toast.success('Ethics through art updated successfully');
            } else {
                await axios.post(API_ENDPOINTS.ETHICS_THROUGH_ART, formData, config);
                toast.success('Ethics through art added successfully');
            }

            fetchArtworks();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving ethics through art');
        }
    };

    const handleEdit = (artwork) => {
        setFormData({
            workAbout: artwork.workAbout,
            whyThisTopic: artwork.whyThisTopic,
            howExpressed: artwork.howExpressed,
            whyThisFormat: artwork.whyThisFormat
        });
        setEditingId(artwork._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this artwork?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.ETHICS_THROUGH_ART}/${id}`, config);
            toast.success('Ethics through art deleted successfully');
            fetchArtworks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting ethics through art');
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
                section: 'ethicsThroughArt',
                itemId: targetItem._id,
                status,
                feedback: reviewFeedback
            };

            await axios.put(API_ENDPOINTS.FACULTY_REVIEW, payload, config);

            // Update local state
            const updated = artworks.map(itm =>
                itm._id === targetItem._id
                    ? { ...itm, status, feedback: reviewFeedback }
                    : itm
            );
            setArtworks(updated);

            toast.success(`Ethics Through Art ${status === 'Approved' ? 'Approved' : 'Rejected'} Successfully`);
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
            workAbout: '',
            whyThisTopic: '',
            howExpressed: '',
            whyThisFormat: ''
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
                    <h2 className="text-3xl font-bold text-gray-800">Ethics Through Art</h2>
                    <p className="text-gray-600 mt-1">Express ethical concepts through creative mediums</p>
                </div>
                {!showForm && !isFaculty && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                    >
                        <FaPlus /> Add Artwork
                    </button>
                )}
            </div>



            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {editingId ? 'Edit Ethics Through Art' : 'Add New Ethics Through Art'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What is your work about? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="workAbout"
                                value={formData.workAbout}
                                onChange={handleChange}
                                required
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Why did you choose this topic? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="whyThisTopic"
                                value={formData.whyThisTopic}
                                onChange={handleChange}
                                required
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                How did you express it? <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="howExpressed"
                                value={formData.howExpressed}
                                onChange={handleChange}
                                required
                                placeholder="e.g., video, roleplaying, drawing, craft"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Why did you think, expressing your thoughts through this format is important? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="whyThisFormat"
                                value={formData.whyThisFormat}
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

            {artworks.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <FaPalette className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No ethics through art entries added yet</p>
                    {!isFaculty && <p className="text-gray-400 text-sm mt-2">Click "Add Artwork" to get started</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {artworks.map((artwork) => (
                        <div
                            key={artwork._id}
                            className={`bg-white p-6 rounded-2xl shadow-xl border relative ${artwork.status === 'Rejected' ? 'border-red-200 bg-red-50' :
                                artwork.status === 'Approved' ? 'border-green-200' : 'border-gray-100'
                                }`}
                        >
                            {/* Verification Status Badge */}
                            <div className="absolute top-4 right-4">
                                {getStatusBadge(artwork.status)}
                            </div>

                            <div className="flex justify-between items-start mb-4 mt-4">
                                <div className="flex items-center gap-3 pr-24">
                                    <FaPalette className="text-brand-pink text-2xl" />
                                    <h3 className="text-lg font-bold text-gray-800">Ethics Through Art</h3>
                                </div>
                                <div className="flex gap-2">
                                    {!isFaculty && (
                                        <>
                                            <button
                                                onClick={() => handleEdit(artwork)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(artwork._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mb-3">
                                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                    {artwork.howExpressed}
                                </span>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">About the work:</span>
                                    <p className="text-gray-600 mt-1">{artwork.workAbout}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Why this topic:</span>
                                    <p className="text-gray-600 mt-1">{artwork.whyThisTopic}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Why this format:</span>
                                    <p className="text-gray-600 mt-1">{artwork.whyThisFormat}</p>
                                </div>
                            </div>

                            {/* Feedback Display */}
                            {artwork.feedback && (
                                <div className={`mt-4 p-3 rounded-lg text-sm border ${artwork.status === 'Approved'
                                    ? 'bg-green-50 border-green-100 text-green-800'
                                    : 'bg-yellow-50 border-yellow-100 text-yellow-900'
                                    }`}>
                                    <strong className="block mb-1 flex items-center gap-1">
                                        <FaInfoCircle /> Feedback:
                                    </strong>
                                    <p className="italic">"{artwork.feedback}"</p>
                                </div>
                            )}

                            {/* Faculty Actions */}
                            {isFaculty && (
                                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                                    <button
                                        onClick={() => openReviewModal(artwork, 'Approved')}
                                        className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg transition text-sm font-medium flex justify-center items-center gap-2"
                                        disabled={artwork.status === 'Approved'}
                                    >
                                        <FaCheck /> Approve
                                    </button>
                                    <button
                                        onClick={() => openReviewModal(artwork, 'Rejected')}
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
                                Please provide feedback for this artwork.
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

export default EthicsThroughArt;
