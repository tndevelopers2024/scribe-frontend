import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaUser, FaEnvelope, FaUserTag, FaSignOutAlt, FaKey } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

const Topbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setShowTooltip(false);
            }
        };

        if (showTooltip) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTooltip]);

    return (
        <nav className="bg-gradient-to-r from-brand-purple to-brand-pink shadow-lg p-4 flex justify-between items-center text-white sticky top-0 z-50">
            <img src={logo} alt="College CMS Logo" className="w-60 object-contain bg-white p-1 rounded-lg" />
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-4 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="font-medium">Welcome, {user?.name}</span>
                    <span className="text-xs bg-white text-brand-purple px-2 py-1 rounded-full font-bold uppercase">{user?.role}</span>
                </div>

                {/* User Account Icon with Tooltip */}
                <div className="relative" ref={tooltipRef}>
                    <button
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="bg-white/20 hover:bg-white/30 p-2.5 rounded-full transition-all backdrop-blur-sm"
                        aria-label="User account"
                    >
                        <FaUser className="text-lg" />
                    </button>

                    {/* Tooltip Dropdown */}
                    {showTooltip && (
                        <div className="absolute right-0 mt-2 min-w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-brand-purple to-brand-pink p-4 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                        <FaUser className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Account Details</h3>
                                        <p className="text-xs text-white/80">Your profile information</p>
                                    </div>
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="bg-brand-purple/10 p-2 rounded-lg text-brand-purple">
                                        <FaUser />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Full Name</p>
                                        <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                                        <FaEnvelope />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email Address</p>
                                        <p className="font-semibold text-gray-800 truncate">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="bg-brand-pink/10 p-2 rounded-lg text-brand-pink">
                                        <FaUserTag />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Current Role</p>
                                        <p className="font-semibold text-brand-pink">{user?.role}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer with Actions */}
                            <div className="border-t border-gray-100 p-3 space-y-2">
                                <button
                                    onClick={() => {
                                        setShowTooltip(false);
                                        navigate('/change-password');
                                    }}
                                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2.5 rounded-lg transition-all font-medium flex items-center justify-center gap-2"
                                >
                                    <FaKey />
                                    Change Password
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg transition-all font-medium flex items-center justify-center gap-2"
                                >
                                    <FaSignOutAlt />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Topbar;
