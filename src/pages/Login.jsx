import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import authIllustration from '../assets/auth_illustration.png';
import logo from '../assets/images/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans overflow-hidden">
            {/* Left Side - Illustration (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-brand-purple/5 h-screen text-white">
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

            {/* Right Side - Login Form */}
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
                        <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 font-medium text-lg">Sign in to your dashboard</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-brand-pink p-4 mb-8 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-pink shrink-0" />
                            <p className="text-red-600 text-sm font-semibold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-gray-700 text-sm font-bold ml-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all duration-300 font-medium placeholder:text-gray-300 shadow-sm"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-gray-700 text-sm font-bold">Password</label>
                            </div>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple transition-all duration-300 pr-14 font-medium placeholder:text-gray-300 shadow-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-purple transition-colors duration-200"
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end ml-1">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm font-bold text-brand-purple hover:text-brand-purple/80 transition-colors duration-200"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-purple/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 hover:translate-y-[-2px]"
                            >
                                Sign In
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-gray-500 mt-10 text-sm font-medium">
                        © {new Date().getFullYear()} SCRIBE ePortfolio • Secure Login
                    </p>
                </div>
            </div >
        </div >
    );
};

export default Login;
