import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/constants';
import { toast } from 'react-hot-toast';
import { FaPlus, FaCalendarAlt, FaSpinner, FaEdit, FaTrash, FaTimes, FaSave, FaChevronLeft, FaChevronRight, FaSearch, FaFilter } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SeminarManagement = () => {
    const { user } = useContext(AuthContext);
    const [seminars, setSeminars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    useEffect(() => {
        fetchSeminars();
    }, []);

    const fetchSeminars = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(API_ENDPOINTS.SEMINARS, config);
            // Sort by date initially (ascending - earliest first)
            const sortedSeminars = (res.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
            setSeminars(sortedSeminars);
        } catch (error) {
            console.error('Error fetching seminars:', error);
            toast.error('Failed to load seminars');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !date) return toast.error('Please fill all fields');

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (isEditing) {
                await axios.put(`${API_ENDPOINTS.SEMINARS}/${editingId}`, { title, date }, config);
                toast.success('Seminar updated successfully');
            } else {
                await axios.post(API_ENDPOINTS.SEMINARS, { title, date }, config);
                toast.success('Seminar added successfully');
            }
            resetForm();
            fetchSeminars();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} seminar`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (seminar) => {
        setIsEditing(true);
        setEditingId(seminar._id);
        setTitle(seminar.title);
        // Format date to YYYY-MM-DD for input type="date"
        const seminarDate = new Date(seminar.date);
        setDate(seminarDate);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteSeminar = async (id) => {
        if (!window.confirm('Are you sure you want to delete this seminar?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${API_ENDPOINTS.SEMINARS}/${id}`, config);
            toast.success('Seminar deleted successfully');
            fetchSeminars();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete seminar');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDate(new Date());
        setDateRange([null, null]);
        setIsEditing(false);
        setEditingId(null);
    };

    const filteredSeminars = useMemo(() => {
        return seminars.filter(seminar => {
            const matchesSearch = seminar.title.toLowerCase().includes(searchTerm.toLowerCase());
            const seminarDate = new Date(seminar.date);
            const matchesStart = startDate ? seminarDate >= new Date(startDate) : true;
            const matchesEnd = endDate ? seminarDate <= new Date(endDate) : true;
            return matchesSearch && matchesStart && matchesEnd;
        });
    }, [seminars, searchTerm, startDate, endDate]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
            {/* Add/Edit Seminar Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-purple/10 p-3 rounded-xl text-brand-purple text-2xl">
                            {isEditing ? <FaEdit /> : <FaCalendarAlt />}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isEditing ? 'Edit Seminar' : 'Add New Seminar'}
                        </h2>
                    </div>
                    {isEditing && (
                        <button
                            onClick={resetForm}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Cancel Edit"
                        >
                            <FaTimes size={20} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Seminar Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Bioethics Workshop Day 1"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all outline-none"
                            required
                        />
                    </div>
                    <div className="space-y-2 relative">
                        <label className="text-sm font-semibold text-gray-700">Seminar Date</label>
                        <div className="relative group">
                            <DatePicker
                                selected={date}
                                onChange={(d) => setDate(d)}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Select Date"
                                className="w-full px-11 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all outline-none bg-white cursor-pointer hover:border-brand-purple/50"
                                calendarClassName="!bg-white !rounded-2xl !shadow-2xl !border-none !p-4 !font-sans animate-scale-in"
                                dayClassName={(d) => "rounded-lg transition-colors hover:!bg-brand-purple/10"}
                                nextMonthButtonLabel={<FaChevronRight className="text-brand-purple" />}
                                previousMonthButtonLabel={<FaChevronLeft className="text-brand-purple" />}
                                fixedHeight
                                required
                            />
                            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-brand-purple transition-colors pointer-events-none" />
                        </div>
                        <style>{`
                            .react-datepicker {
                                border: none !important;
                                box-shadow: 0 25px 50px -12px rgba(139, 76, 161, 0.2) !important;
                            }
                            .react-datepicker__header {
                                background-color: #fff !important;
                                border-bottom: 1px solid #f3f4f6 !important;
                                border-top-left-radius: 1rem !important;
                                border-top-right-radius: 1rem !important;
                                padding-top: 1rem !important;
                            }
                            .react-datepicker__current-month {
                                color: #8b4ca1 !important;
                                font-weight: 800 !important;
                                font-size: 1rem !important;
                                margin-bottom: 0.5rem !important;
                            }
                            .react-datepicker__day-name {
                                color: #9ca3af !important;
                                font-weight: 600 !important;
                            }
                            .react-datepicker__day--selected {
                                background-color: #8b4ca1 !important;
                                border-radius: 0.5rem !important;
                                color: white !important;
                                font-weight: bold !important;
                            }
                            .react-datepicker__day--keyboard-selected {
                                background-color: rgba(139, 76, 161, 0.1) !important;
                                color: #8b4ca1 !important;
                            }
                            .react-datepicker__navigation {
                                top: 1.25rem !important;
                            }
                        `}</style>
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex-1 ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brand-purple hover:bg-brand-purple-dark'} text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-75`}
                        >
                            {isSubmitting ? <FaSpinner className="animate-spin" /> : (isEditing ? <FaSave /> : <FaPlus />)}
                            {isEditing ? 'Update Seminar' : 'Add Seminar'}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Seminars List */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                    <h3 className="text-xl font-bold text-gray-800">Manage Seminars</h3>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search seminars..."
                                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-purple/20 outline-none w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <DatePicker
                                    selectsRange={true}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={(update) => setDateRange(update)}
                                    isClearable={false}
                                    placeholderText="Filter by date range..."
                                    className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-brand-purple/20 outline-none w-full md:w-60 bg-white cursor-pointer"
                                    calendarClassName="!bg-white !rounded-2xl !shadow-2xl !border-none !p-4 !font-sans animate-scale-in"
                                    dayClassName={(d) => "rounded-lg transition-colors hover:!bg-brand-purple/10"}
                                    nextMonthButtonLabel={<FaChevronRight className="text-brand-purple" />}
                                    previousMonthButtonLabel={<FaChevronLeft className="text-brand-purple" />}
                                    dateFormat="dd/MM/yyyy"
                                />
                                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-brand-purple transition-colors pointer-events-none text-sm" />
                            </div>
                            {(searchTerm || startDate || endDate) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setDateRange([null, null]);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Clear Filters"
                                >
                                    <FaTimes size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <FaSpinner className="animate-spin text-brand-purple text-3xl" />
                    </div>
                ) : filteredSeminars.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
                        {searchTerm || startDate || endDate ? 'No seminars match your filters.' : 'No seminars added yet.'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredSeminars.map((seminar) => (
                            <div key={seminar._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-brand-purple/5 p-3 rounded-lg text-brand-purple">
                                        <FaCalendarAlt size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{seminar.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-sm text-gray-500">
                                                {new Date(seminar.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            <span className="text-gray-300">|</span>
                                            <p className="text-xs text-gray-400">
                                                Window: {new Date(new Date(seminar.date).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')} (00:00)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditClick(seminar)}
                                        className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit Seminar"
                                    >
                                        <FaEdit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSeminar(seminar._id)}
                                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Seminar"
                                    >
                                        <FaTrash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeminarManagement;
