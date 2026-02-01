import React from 'react';
import { FaShieldAlt, FaEnvelope, FaUserShield, FaGlobe, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Topbar />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-brand-purple transition mb-8 group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition" /> Back
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-brand-purple p-8 text-white text-center">
                        <FaShieldAlt className="text-5xl mx-auto mb-4 opacity-90" />
                        <h1 className="text-3xl font-bold">SCRIBE - ePortfolio Data Privacy Statement</h1>
                        <p className="mt-2 opacity-80 italic">Your privacy is our priority</p>
                    </div>

                    <div className="p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <FaUserShield className="text-brand-purple" /> Our Commitment
                            </h2>
                            <p>
                                Protecting your privacy is a priority at <strong>SCRIBE</strong>. When you sign up for our ePortfolio, we collect basic information like your name, email, and educational background to personalize your learning journey. Your data is crucial for creating and maintaining your ePortfolio, tracking your progress, and providing tailored educational content.
                            </p>
                        </section>

                        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Security Measures</h2>
                            <p>
                                Rest assured, we take the security of your information seriously. Our platform is equipped with industry-standard security measures to safeguard your data from unauthorized access, disclosure, or alteration. We employ encryption technologies to ensure secure transmission of data over the internet, and our staff undergo regular training to uphold data protection standards.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Data Sharing & Transparency</h2>
                            <p className="mb-4">
                                We don't believe in selling your data to third parties for marketing purposes. Any sharing of information with trusted service providers is done under strict confidentiality agreements to ensure your privacy is maintained. Additionally, we only disclose your data if required by law or to protect the rights and safety of our users.
                            </p>
                            <p>
                                At SCRIBE, transparency is key to how we handle your data. When you input details into our platform for tracking your progress and providing feedback, it's important to note that <strong>course providers will have access to this information</strong>. This allows them to tailor their teaching methods and offer targeted feedback to enhance your learning experience.
                            </p>
                        </section>

                        <section className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Educational Purpose</h2>
                            <p>
                                Your details are shared with course providers solely for educational purposes within the SCRIBE platform. Rest assured, we ensure that all course providers adhere to strict privacy and confidentiality standards to protect your data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Control</h2>
                            <p>
                                You're in control of your information. You can access, update, or delete your personal data at any time, and manage your communication preferences through your account settings. Our commitment to your privacy is unwavering, and we continuously review and improve our data protection practices to ensure your trust in us.
                            </p>
                        </section>

                        <hr className="border-gray-100" />

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-8">
                                <FaEnvelope className="text-brand-purple" /> Contact Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 p-4 rounded-xl hover:bg-gray-50 transition">
                                    <p className="font-bold text-gray-900">Dr. Russel Franco D'souza</p>
                                    <p className="text-sm">Head and Chair, Department of Education</p>
                                    <p className="text-sm text-gray-500">International Chair in Bioethics<br />UNESCO Chair in Bioethics, Haifa</p>
                                    <p className="text-sm">Melbourne, Australia</p>
                                    <a href="mailto:russell.f.dsouza@gmail.com" className="text-brand-purple hover:underline text-sm font-medium">russell.f.dsouza@gmail.com</a>
                                </div>

                                <div className="space-y-2 p-4 rounded-xl hover:bg-gray-50 transition">
                                    <p className="font-bold text-gray-900">Dr. Mary Mathew</p>
                                    <p className="text-sm">Professor & Head of the Department of Pathology</p>
                                    <p className="text-sm text-gray-500">Kasturba Medical College, Manipal,<br />Manipal Academy of Higher Education (MAHE), India</p>
                                    <a href="mailto:marymathew883@gmail.com" className="text-brand-purple hover:underline text-sm font-medium">marymathew883@gmail.com</a>
                                </div>

                                <div className="space-y-2 p-4 rounded-xl hover:bg-gray-50 transition">
                                    <p className="font-bold text-gray-900">Dr. Princy Louis Palatty</p>
                                    <p className="text-sm">Professor & Head of the Department of Pharmacology</p>
                                    <p className="text-sm text-gray-500">Amrita Vishwa Vidhyapeetham, School of Medicine, Kochi, India</p>
                                    <a href="mailto:princylouispalatty@aims.amrita.edu" className="text-brand-purple hover:underline text-sm font-medium">princylouispalatty@aims.amrita.edu</a>
                                </div>

                                <div className="space-y-2 p-4 rounded-xl hover:bg-gray-50 transition">
                                    <p className="font-bold text-gray-900">Dr. Krishna Mohan Surapaneni</p>
                                    <p className="text-sm">Vice Principal and Professor</p>
                                    <p className="text-sm text-gray-500">Head of Department of Medical Education & Bioethics Unit<br />Panimalar Medical College Hospital & Research Institute, Chennai, India</p>
                                    <a href="mailto:krishnamohan.surapaneni@gmail.com" className="text-brand-purple hover:underline text-sm font-medium">krishnamohan.surapaneni@gmail.com</a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
