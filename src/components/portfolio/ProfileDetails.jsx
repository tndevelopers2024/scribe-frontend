import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaSave, FaTimes, FaEdit, FaSpinner } from 'react-icons/fa';
import { API_ENDPOINTS, API_URL } from '../../config/constants';

const ProfileDetails = ({ isFaculty, studentId, studentData }) => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        sex: '',
        phoneNumber: '',
        fieldOfStudy: '',
        levelOfEducation: '',
        yearOfStudy: '',
        institution: '',
        country: '',
        about: '',
        vision: '',
        profilePicture: ''
    });

    const [colleges, setColleges] = useState([]);

    useEffect(() => {
        if (!isFaculty) {
            fetchColleges();
        }
    }, [isFaculty]);

    const fetchColleges = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.COLLEGES, config);
            setColleges(res.data);
        } catch (error) {
            console.error('Error fetching colleges:', error);
        }
    };

    useEffect(() => {
        if (isFaculty && studentData) {
            setProfileData({
                firstName: studentData.profile?.firstName || '',
                middleName: studentData.profile?.middleName || '',
                lastName: studentData.profile?.lastName || '',
                dateOfBirth: studentData.profile?.dateOfBirth ? new Date(studentData.profile?.dateOfBirth).toISOString().split('T')[0] : '',
                sex: studentData.profile?.sex || '',
                phoneNumber: studentData.profile?.phoneNumber || '',
                fieldOfStudy: studentData.profile?.fieldOfStudy || '',
                levelOfEducation: studentData.profile?.levelOfEducation || '',
                yearOfStudy: studentData.profile?.yearOfStudy || '',
                institution: studentData.profile?.institution || '',
                country: studentData.profile?.country || '',
                about: studentData.profile?.about || '',
                vision: studentData.profile?.vision || '',
                profilePicture: studentData.profile?.profilePicture || ''
            });
            setLoading(false);
        } else {
            fetchProfile();
        }
    }, [isFaculty, studentData]);

    const fetchProfile = async () => {
        if (isFaculty) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.PROFILE, config);

            if (res.data.profile) {
                setProfileData({
                    firstName: res.data.profile.firstName || '',
                    middleName: res.data.profile.middleName || '',
                    lastName: res.data.profile.lastName || '',
                    dateOfBirth: res.data.profile.dateOfBirth ? new Date(res.data.profile.dateOfBirth).toISOString().split('T')[0] : '',
                    sex: res.data.profile.sex || '',
                    phoneNumber: res.data.profile.phoneNumber || '',
                    fieldOfStudy: res.data.profile.fieldOfStudy || '',
                    levelOfEducation: res.data.profile.levelOfEducation || '',
                    yearOfStudy: res.data.profile.yearOfStudy || '',
                    institution: res.data.profile.institution || '',
                    country: res.data.profile.country || '',
                    about: res.data.profile.about || '',
                    vision: res.data.profile.vision || '',
                    profilePicture: res.data.profile.profilePicture || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.put(API_ENDPOINTS.PROFILE, { profile: profileData }, config);

            toast.success(res.data.message || 'Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        fetchProfile();
        setIsEditing(false);
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setLoading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.post(API_ENDPOINTS.UPLOAD, formData, config);
            setProfileData({ ...profileData, profilePicture: data });
            setLoading(false);
            toast.success('Profile picture uploaded successfully');
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('File upload failed');
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Profile Details</h2>
                    <p className="text-gray-600 mt-1">Manage your personal and educational information</p>
                </div>
                {!isEditing && !isFaculty && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                    >
                        <FaEdit /> Edit Profile
                    </button>
                )}
            </div>

            {/* Message */}


            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 border-4 border-brand-purple/20">
                        {profileData.profilePicture ? (
                            <img
                                src={`${API_URL}${profileData.profilePicture}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                                <span>📷</span>
                            </div>
                        )}
                    </div>
                    {isEditing && (
                        <div>
                            <label className="bg-brand-purple text-white px-4 py-2 rounded-lg cursor-pointer hover:opacity-90 transition text-sm">
                                Change Photo
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={uploadFileHandler}
                                    accept="image/*"
                                />
                            </label>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        />
                    </div>

                    {/* Middle Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Middle Name
                        </label>
                        <input
                            type="text"
                            name="middleName"
                            value={profileData.middleName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={profileData.dateOfBirth}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        />
                    </div>

                    {/* Sex */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sex <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="sex"
                            value={profileData.sex}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        >
                            <option value="">Select Sex</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={profileData.phoneNumber}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        />
                    </div>

                    {/* Field of Study */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Field of Study <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="fieldOfStudy"
                            value={profileData.fieldOfStudy}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        >
                            <option value="">Select Field</option>
                            <option value="Medical">Medical</option>
                            <option value="Nursing">Nursing</option>
                            <option value="Allied Health">Allied Health</option>
                            <option value="Dentistry">Dentistry</option>
                            <option value="Other Health Profession">Other Health Profession</option>
                        </select>
                    </div>

                    {/* Level of Education */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Level of Education <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="levelOfEducation"
                            value={profileData.levelOfEducation}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        >
                            <option value="">Select Level</option>
                            <option value="UG">UG (Undergraduate)</option>
                            <option value="PG">PG (Postgraduate)</option>
                        </select>
                    </div>

                    {/* Year of Study */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year of Study <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="yearOfStudy"
                            value={profileData.yearOfStudy}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            placeholder="e.g., 1st Year, 2nd Year"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        />
                    </div>

                    {/* Institution */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Institution <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="institution"
                            value={profileData.institution}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        >
                            <option value="">Select Institution</option>
                            {colleges.map((college) => (
                                <option key={college._id} value={college.name}>
                                    {college.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={profileData.country}
                            onChange={handleChange}
                            disabled={!isEditing}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        />
                    </div>
                </div>

                {/* About and Vision */}
                <div className="grid grid-cols-1 gap-6 mt-6">
                    {/* About */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Give a Brief about yourself <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="about"
                            value={profileData.about}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows="4"
                            placeholder="Share a brief introduction about yourself..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        />
                    </div>

                    {/* Vision */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vision and Goals <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="vision"
                            value={profileData.vision}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows="4"
                            placeholder="What are your future goals and vision?"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-purple/50 focus:outline-none disabled:bg-gray-50 disabled:text-gray-600"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                    <div className="flex gap-4 mt-8">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium disabled:opacity-50"
                        >
                            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition font-medium disabled:opacity-50"
                        >
                            <FaTimes /> Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ProfileDetails;
