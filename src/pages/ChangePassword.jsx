import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/constants';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import authIllustration from '../assets/auth_illustration.png';
import logo from '../assets/images/logo.png';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.put(API_ENDPOINTS.CHANGE_PASSWORD, {
                currentPassword,
                newPassword
            }, config);

            updateUser({ isFirstLogin: false }); // Update local state
            setMessage('Password changed successfully. Redirecting...');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error changing password');
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans overflow-hidden">
            {/* Left Side - Illustration (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-brand-purple/5 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/40 to-brand-pink/30 z-10 max-h-screen" />
                <img
                    src={authIllustration}
                    alt="Authentication Illustration"
                    className="w-full h-screen object-cover z-0 transition-transform duration-1000 hover:scale-105"
                />

                {/* Brand Overlay */}
                <div className="absolute top-12 left-12 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-80 bg-white rounded-xl flex items-center justify-center p-2 shadow-xl ring-4 ring-white/20">
                            <img src={logo} alt="Scribe Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-12 left-12 right-12 z-20">
                    <h2 className="text-4xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                        SCRIBE <br />
                        <span className="text-xl font-bold opacity-90 block mb-2">(Systematic Collection of Reflections and Individual experiences in Bioethics Education)</span>
                        <span className="text-white/90">"An ePortfolio for Bioethics Education"</span>
                    </h2>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50 relative">
                <div className="max-w-md w-full">
                    <div className="mb-10 lg:hidden">
                        <div className="flex items-center gap-2 mb-6 justify-center">
                            <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                S
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-gray-900">
                                SCRIBE
                            </h1>
                        </div>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Security Update</h2>
                        <p className="text-gray-500 font-medium text-lg italic">Please change your password to proceed</p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl mb-8 text-center font-bold shadow-sm border ${message.includes('success')
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-gray-700 text-sm font-bold ml-1">Current Password</label>
                            <div className="relative group">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all duration-300 pr-14 font-medium placeholder:text-gray-300 shadow-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-purple transition-colors duration-200"
                                >
                                    {showCurrentPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 text-sm font-bold ml-1">New Password</label>
                            <div className="relative group">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all duration-300 pr-14 font-medium placeholder:text-gray-300 shadow-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-purple transition-colors duration-200"
                                >
                                    {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-purple/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 hover:translate-y-[-2px]"
                            >
                                Update Security Profile
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-gray-500 mt-10 text-sm font-medium">
                        © {new Date().getFullYear()} SCRIBE ePortfolio • Enterprise Security
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
