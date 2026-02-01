import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaLock, FaEye, FaEyeSlash, FaKey, FaEnvelope } from 'react-icons/fa';
import logo from '../assets/images/logo.png';
import { API_ENDPOINTS } from '../config/constants';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);

        try {
            await axios.post(API_ENDPOINTS.RESET_PASSWORD, { email, otp, password });
            toast.success('Password reset successful! You can now login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6 font-sans">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <img src={logo} alt="Scribe Logo" className="h-16 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Set New Password</h2>
                    <p className="text-gray-500 font-medium">Enter the OTP sent to your email and your new password</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-gray-700 text-sm font-bold ml-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaEnvelope />
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all duration-300 font-medium placeholder:text-gray-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 text-sm font-bold ml-1">OTP Code</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FaKey />
                                </span>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all duration-300 font-medium placeholder:text-gray-300 tracking-widest"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 text-sm font-bold ml-1">New Password</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple">
                                    <FaLock />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all duration-300 font-medium placeholder:text-gray-300 shadow-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-purple transition-colors duration-200"
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-700 text-sm font-bold ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple">
                                    <FaLock />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-14 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all duration-300 font-medium placeholder:text-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-purple/20 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-75"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-gray-400 mt-10 text-sm font-medium">
                    © {new Date().getFullYear()} SCRIBE ePortfolio • Security
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
