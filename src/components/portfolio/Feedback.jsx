import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { FaSpinner, FaComments, FaPaperPlane, FaUserCircle, FaTrash, FaThumbsUp, FaRegThumbsUp, FaReply } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/constants';
import { formatDate } from '../../utils/dateUtils';

const Feedback = () => {
    const { user } = useContext(AuthContext);
    const [discussions, setDiscussions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchDiscussions();
    }, []);

    const fetchDiscussions = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.DISCUSSIONS, config);
            setDiscussions(res.data);
        } catch (error) {
            console.error('Error fetching discussions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.title.trim() || !newPost.content.trim()) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.post(API_ENDPOINTS.DISCUSSIONS, newPost, config);
            setDiscussions([res.data, ...discussions]);
            setNewPost({ title: '', content: '' });
            setMessage('Post created successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error creating post');
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.DISCUSSIONS}/${id}`, config);
            setDiscussions(discussions.filter(d => d._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-brand-purple text-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Feedback</h2>

            {/* Create Post Form */}
            <div className="bg-white rounded-xl p-8">
                <form onSubmit={handlePostSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Discussion Forum
                        </label>
                        <textarea
                            rows="2"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-black rounded-lg focus:ring-0 focus:border-black transition resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Comments
                        </label>
                        <textarea
                            rows="4"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/50 focus:outline-none resize-none"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!newPost.title.trim() || !newPost.content.trim()}
                            className="bg-brand-purple text-white px-8 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
                        >
                            Submit
                        </button>
                    </div>
                </form>
                {message && <p className="text-green-600 mt-2 text-sm">{message}</p>}
            </div>

            {/* Discussions List */}
            <div className="space-y-6">
                {discussions.map((discussion) => (
                    <div key={discussion._id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-start mb-4 mt-4">
                            <div className="flex items-center gap-3">
                                <FaUserCircle className="text-gray-400 text-3xl" />
                                <div>
                                    <h4 className="font-bold text-gray-800">{discussion.title}</h4>
                                    <p className="text-xs text-gray-500">
                                        By {discussion.user?.name || 'Unknown User'} • {formatDate(discussion.createdAt)}
                                    </p>
                                </div>
                            </div>
                            {discussion.user?._id === user._id && (
                                <button
                                    onClick={() => handleDeletePost(discussion._id)}
                                    className="text-red-400 hover:text-red-600 p-2"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>

                        <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feedback;
