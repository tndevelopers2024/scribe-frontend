import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-gray-500 text-sm">
                        &copy; {currentYear} <strong>SCRIBE ePortfolio</strong>. All rights reserved.
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/privacy-policy"
                            className="text-gray-500 hover:text-brand-purple text-sm transition font-medium"
                        >
                            Privacy Policy
                        </Link>
                        <span className="text-gray-300">|</span>
                        <div className="text-gray-400 text-xs">
                            Developed with excellence for medical education.
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
