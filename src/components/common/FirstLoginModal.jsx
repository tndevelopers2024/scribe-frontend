import { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaLock, FaUserShield, FaExclamationTriangle, FaEye, FaEyeSlash } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/constants';

const FirstLoginModal = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const togglePassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            toast.error('New password cannot be the same as the current password');
            return;
        }

        setSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(API_ENDPOINTS.CHANGE_PASSWORD, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, config);

            toast.success('Password changed successfully! Welcome to your dashboard.');

            // Update context to hide modal
            updateUser({ isFirstLogin: false });

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn border-t-4 border-yellow-500">

                {/* Header */}
                <div className="bg-yellow-50 p-6 flex flex-col items-center text-center border-b border-yellow-100">
                    <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                        <FaUserShield className="text-3xl text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome, {user.name}!</h2>
                    <p className="text-yellow-700 mt-2 text-sm flex items-center gap-2">
                        <FaExclamationTriangle /> Action Required: Security Update
                    </p>
                    <p className="text-gray-500 text-sm mt-2 px-4">
                        For your security, please update your temporary password to continue.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">

                    {/* Current Password - To verify ownership */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Current Password (Temporary)</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none transition-all"
                                placeholder="Enter current password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword('current')}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">New Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none transition-all"
                                placeholder="Enter strong new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword('new')}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Confirm New Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none transition-all"
                                placeholder="Retype new password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePassword('confirm')}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-yellow-200 hover:shadow-xl hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Updating...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FirstLoginModal;
