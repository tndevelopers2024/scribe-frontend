import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import logo from '../assets/images/logo.png';
import { API_ENDPOINTS } from '../config/constants';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
            toast.success('OTP sent to your email!');
            navigate('/reset-password', { state: { email } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6 font-sans">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <img src={logo} alt="Scribe Logo" className="h-16 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Forgot Password?</h2>
                    <p className="text-gray-500 font-medium">Enter your email and we'll send you a reset code</p>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-purple/20 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-75"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-brand-purple font-bold transition-colors duration-200"
                        >
                            <FaArrowLeft className="text-sm" /> Back to Login
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-400 mt-10 text-sm font-medium">
                    © {new Date().getFullYear()} SCRIBE ePortfolio • Support
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
