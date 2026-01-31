import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaBullseye, FaCheckCircle, FaHourglassHalf, FaRegCircle, FaCheck, FaBan, FaInfoCircle, FaClock } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';

const ThoughtsToActions = ({ isFaculty, studentId, studentData }) => {
    const { user } = useContext(AuthContext);

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Review State 
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedItemForReview, setSelectedItemForReview] = useState(null);
    const [reviewFeedback, setReviewFeedback] = useState('');
    const [reviewAction, setReviewAction] = useState('Rejected');
    const [formData, setFormData] = useState({
        futurePlan: ''
    });

    useEffect(() => {
        if (isFaculty && studentData) {
            setPlans(studentData.thoughtsToActions || []);
            setLoading(false);
        } else {
            fetchPlans();
        }
    }, [isFaculty, studentData]);

    const fetchPlans = async () => {
        if (isFaculty) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.PROFILE, config);
            setPlans(res.data.thoughtsToActions || []);
        } catch (error) {
            console.error('Error fetching future plans:', error);
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
                await axios.put(`${API_ENDPOINTS.THOUGHTS_TO_ACTIONS}/${editingId}`, formData, config);
                toast.success('Future plan updated successfully');
            } else {
                await axios.post(API_ENDPOINTS.THOUGHTS_TO_ACTIONS, formData, config);
                toast.success('Future plan added successfully');
            }

            fetchPlans();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving future plan');
        }
    };

    const handleEdit = (plan) => {
        setFormData({
            futurePlan: plan.futurePlan
        });
        setEditingId(plan._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this plan?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.THOUGHTS_TO_ACTIONS}/${id}`, config);
            toast.success('Future plan deleted successfully');
            fetchPlans();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting future plan');
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
                section: 'thoughtsToActions',
                itemId: targetItem._id,
                status,
                feedback: reviewFeedback
            };

            await axios.put(API_ENDPOINTS.FACULTY_REVIEW, payload, config);

            // Update local state
            const updated = plans.map(itm =>
                itm._id === targetItem._id
                    ? { ...itm, status, feedback: reviewFeedback }
                    : itm
            );
            setPlans(updated);


            toast.success(`Plan ${status === 'Approved' ? 'Approved' : 'Rejected'} Successfully`);
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
            futurePlan: ''
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
                    <h2 className="text-3xl font-bold text-gray-800">Thoughts to Actions</h2>
                    <p className="text-gray-600 mt-1">What are your future plans? Set goals and track them.</p>
                </div>
                {!showForm && !isFaculty && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                    >
                        <FaPlus /> Add Plan
                    </button>
                )}
            </div>



            {showForm && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {editingId ? 'Edit Future Plan' : 'Add New Future Plan'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What is your future plan? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="futurePlan"
                                value={formData.futurePlan}
                                onChange={handleChange}
                                required
                                rows="3"
                                placeholder="Describe your goal..."
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

            {plans.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <FaBullseye className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No future plans set yet</p>
                    {!isFaculty && <p className="text-gray-400 text-sm mt-2">Click "Add Plan" to start tracking your goals</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {plans.map((plan) => (
                        <div
                            key={plan._id}
                            className={`bg-white p-6 rounded-2xl shadow-xl border relative ${plan.status === 'Rejected' ? 'border-red-200 bg-red-50' :
                                plan.status === 'Approved' ? 'border-green-200' : 'border-gray-100'
                                }`}
                        >
                            {/* Verification Status Badge */}
                            <div className="absolute top-4 right-4">
                                {getStatusBadge(plan.status)}
                            </div>

                            <div className="flex justify-between items-start mb-4 mt-4">
                                <div className="flex-1 pr-24">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FaBullseye className="text-brand-purple text-xl" />
                                        <h3 className="text-lg font-bold text-gray-800">{plan.futurePlan}</h3>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!isFaculty && (
                                        <>
                                            <button
                                                onClick={() => handleEdit(plan)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Feedback Display */}
                            {plan.feedback && (
                                <div className={`mt-4 p-3 rounded-lg text-sm border ${plan.status === 'Approved'
                                    ? 'bg-green-50 border-green-100 text-green-800'
                                    : 'bg-yellow-50 border-yellow-100 text-yellow-900'
                                    }`}>
                                    <strong className="block mb-1 flex items-center gap-1">
                                        <FaInfoCircle /> Feedback:
                                    </strong>
                                    <p className="italic">"{plan.feedback}"</p>
                                </div>
                            )}

                            {/* Faculty Actions */}
                            {isFaculty && (
                                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                                    <button
                                        onClick={() => openReviewModal(plan, 'Approved')}
                                        className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg transition text-sm font-medium flex justify-center items-center gap-2"
                                        disabled={plan.status === 'Approved'}
                                    >
                                        <FaCheck /> Approve
                                    </button>
                                    <button
                                        onClick={() => openReviewModal(plan, 'Rejected')}
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
                                Please provide feedback for this plan.
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

export default ThoughtsToActions;
