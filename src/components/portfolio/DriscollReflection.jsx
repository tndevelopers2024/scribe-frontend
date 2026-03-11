import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/constants';
import { toast } from 'react-hot-toast';
import {
    FaLightbulb, FaInfoCircle, FaCalendarAlt, FaChevronDown,
    FaChevronUp, FaClock, FaCheckCircle, FaExclamationTriangle,
    FaArrowRight, FaQuestionCircle, FaChartLine, FaSpinner, FaTimes,
    FaCheck, FaBan, FaUser, FaSearch, FaFilter
} from 'react-icons/fa';
import reflectionImage from '../../assets/Reflection.png';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaSync, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ReflectionInfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-purple/10 p-2.5 rounded-xl text-brand-purple text-xl">
                            <FaInfoCircle />
                        </div>
                        <h2 className="text-2xl font-black text-red-600 tracking-tight" style={{ fontFamily: 'serif' }}>
                            Driscoll's Reflection Model
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-10 custom-scrollbar">
                    <section className="space-y-4">
                        <p className="font-bold text-gray-900 leading-relaxed text-lg italic">
                            One of the simplest frameworks of reflection – by moving through three reflective stages, you will think about an experience, its implications, and what that means for the future.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Overview</h3>
                            <div className="space-y-4 text-gray-700 leading-relaxed">
                                <p>
                                    Driscoll (1994) developed this model of reflection based on the three simple questions – What? So what? Now what? – originally asked by Terry Borton (1970). The model provides one of the simplest frameworks for reflection. In practice you should ask yourself the three questions after a critical incident that has taken place and you want to extract learning from.
                                </p>
                                <ul className="space-y-4 pl-2">
                                    <li className="flex gap-6">
                                        <div className="font-bold text-brand-purple whitespace-nowrap min-w-[100px]">‘What?’</div>
                                        <div className="flex-1">helps you describe the situation you want to learn from. You should identify the facts and feelings of the situation.</div>
                                    </li>
                                    <li className="flex gap-6">
                                        <div className="font-bold text-brand-pink whitespace-nowrap min-w-[100px]">‘So What?’</div>
                                        <div className="flex-1">allows you to extract the meaning of ‘What?’. Moreover, you should question what knowledge you and others had in the situation, and what knowledge or theories that could help you make sense of the situation.</div>
                                    </li>
                                    <li className="flex gap-6">
                                        <div className="font-bold text-orange-500 whitespace-nowrap min-w-[100px]">‘Now what?’</div>
                                        <div className="flex-1">allows you to create an action plan for the future based on the previous questions.</div>
                                    </li>
                                </ul>
                                <p>Below is further information on the model – each stage includes guiding questions to ask yourself and a couple of examples of how this might look in a reflection.</p>
                                <p className="text-sm border-t border-gray-200 pt-4 mt-4 italic text-gray-600">
                                    This is just one model of reflection. Test it out and see how it works for you. If you find that only some of the outlined questions are helpful, focus on those. However, by thinking about each stage you are likely to engage more critically with your learning experience.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Diagram Illustration */}
                    <section className="flex flex-col items-center justify-center p-12 rounded-3xl border border-brand-purple/10">
                        <div className="text-center mb-8">
                            <h4 className="font-bold text-gray-900">Rolfe et al’s (2001) reflective model</h4>
                        </div>
                        <div className="max-w-md w-full">
                            <img
                                src={reflectionImage}
                                alt="Driscoll Reflection Model Diagram"
                                className="w-full h-auto rounded-2xl"
                            />
                        </div>
                        <div className="mt-8 text-sm text-gray-600 max-w-2xl text-center leading-relaxed">
                            <p>The simplicity of this model is both a great strength and a possible limitation. It is very easy to remember and can be applied to any field or experience. However, there is a possibility that by just answering the three main questions the reflection does not achieve a meaningful and critical depth.</p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <p className="text-gray-700 leading-relaxed">
                            To ensure that you have depth and breadth it can be helpful to work through the question prompts outlined below for each stage. You don’t have to answer all of them, but they can guide you to what sort of things make sense to include in that stage. You might have others questions that work better for you.
                        </p>
                        <p className="text-gray-600 italic text-sm">
                            Some people might also recognise this model as work done by Rolfe et al. (2001). This is also correct as many theorists have changed and adapted the original approach by Borton.
                        </p>
                    </section>

                    {/* Stage 1: What? */}
                    <section className="space-y-6">
                        <div className="border-l-4 border-brand-purple pl-6">
                            <h3 className="text-2xl font-bold text-gray-900">What?</h3>
                            <p className="text-lg font-bold text-gray-800 mt-1">The experience of the situation</p>
                        </div>
                        <div className="space-y-4">
                            <p className="font-medium text-gray-700">Helpful questions to answer could be:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm text-gray-600">
                                <ul className="space-y-2">
                                    <li className="flex gap-2"><span>•</span> ... is the context?</li>
                                    <li className="flex gap-2"><span>•</span> ... is the problem/situation/difficulty/reason for being stuck/reason for success?</li>
                                    <li className="flex gap-2"><span>•</span> ... was I/we/others trying to achieve?</li>
                                    <li className="flex gap-2"><span>•</span> ... was the outcome of the situation?</li>
                                    <li className="flex gap-2"><span>•</span> ... was my role in the situation?</li>
                                </ul>
                                <ul className="space-y-2">
                                    <li className="flex gap-2"><span>•</span> ... was the role of other people in the situation (if others were involved)?</li>
                                    <li className="flex gap-2"><span>•</span> ... feelings did the situation evoke in me? And in others (to the extent you know)?</li>
                                    <li className="flex gap-2"><span>•</span> ... were the consequences for me? And for others?</li>
                                    <li className="flex gap-2"><span>•</span> ... was good/bad about the experience?</li>
                                </ul>
                            </div>
                        </div>

                        {/* Examples Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-left text-sm border-collapse">
                                <caption className="p-4 font-bold text-gray-800 text-left bg-gray-50 border-b border-gray-200">Examples of 'What?'</caption>
                                <thead>
                                    <tr className="bg-gray-50 divide-x divide-gray-200">
                                        <th className="p-4 font-bold text-gray-900 border-b border-gray-200 w-1/2">Getting an assignment back</th>
                                        <th className="p-4 font-bold text-gray-900 border-b border-gray-200 w-1/2">Participation in workshops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="divide-x divide-gray-100 italic text-gray-600 leading-relaxed">
                                        <td className="p-4">
                                            I just got an essay back with a mark I’m not happy with. I wrote it in one day, but I read it thoroughly before handing it in. I was hoping to get a B, and have previously been able to do so. I’m fairly disappointed in myself and starting to feel stressed about the overall mark for the course. One of my friends had offered to give feedback on it, however I said that I didn't have time to get it to them before the deadline.
                                        </td>
                                        <td className="p-4">
                                            In a workshop this week, I didn't contribute to the discussion despite having ideas. I was in a group with people I haven't worked with before. I think I was afraid of being wrong as I find the new topic difficult. The other students in the group seemed to know each other and just started talking and discussing as soon as the workshop began. Nobody asked for my ideas and therefore it was easy not to contribute. I also lost focus at some points as I wasn’t a part of the discussion and I still don't understand all the material.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Stage 2: So what? */}
                    <section className="space-y-6 pt-6">
                        <div className="border-l-4 border-brand-pink pl-6">
                            <h3 className="text-2xl font-bold text-gray-900">So what?</h3>
                            <p className="text-lg font-bold text-gray-800 mt-1">The implications of the situation</p>
                        </div>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                You might want to supplement your own knowledge and thoughts with other people’s ideas, references, and theories. This can be to show what helped shape your thoughts and further explore them. This comes down to how much you are looking to formalise your reflections. This can especially be important if the reflection is assessed.
                            </p>
                            <p className="font-medium text-gray-700">Helpful questions could be:</p>
                            <ul className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                                <li className="flex gap-2"><span>•</span> ... does this tell me/teach me/imply about the situation/my attitude/my practice/the problem?</li>
                                <li className="flex gap-2"><span>•</span> ... was going through my mind in the situation?</li>
                                <li className="flex gap-2"><span>•</span> ... did I base my decisions/actions on?</li>
                                <li className="flex gap-2"><span>•</span> ... other information/theories/models/literature can I use to help understand the situation?</li>
                                <li className="flex gap-2"><span>•</span> ... could I have done differently to get a more desirable outcome?</li>
                                <li className="flex gap-2"><span>•</span> ... is my new understanding of the situation?</li>
                                <li className="flex gap-2"><span>•</span> ... does this experience tell me about the way I work?</li>
                            </ul>
                        </div>

                        {/* Examples Table: So what? */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-left text-sm border-collapse">
                                <caption className="p-4 font-bold text-gray-800 text-left bg-gray-50 border-b border-gray-200">Examples of 'So what?'</caption>
                                <thead>
                                    <tr className="bg-gray-50 divide-x divide-gray-200">
                                        <th className="p-4 font-bold text-gray-900 border-b border-gray-200 w-1/2">Getting an assignment back</th>
                                        <th className="p-4 font-bold text-gray-900 border-b border-gray-200 w-1/2">Participation in workshops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="divide-x divide-gray-100 italic text-gray-600 leading-relaxed">
                                        <td className="p-4">
                                            My experience tells me that I hadn’t given myself enough time to work on my essay. I'm basing this on the fact that I had the opportunity to get feedback from my friend which would have been really useful, but I didn't have the time to both finish the essay and get the feedback. Moreover, I was stressed when writing it so I didn't really spend enough time thinking about the content - my head was just filled with 'how will I get this essay done in time'.
                                            <br /><br />
                                            In general, I think that I leave things until the very end, which means I don't have time to do them properly. I end up being disappointed in myself. I think I need to give myself more structure, to save myself time and allow time to receive and act upon feedback from others.
                                        </td>
                                        <td className="p-4">
                                            I think there are a lot of things I can do differently. I remember that I was aware of not saying what I wanted to in the workshop. I think I acted as I did because it's easier not to challenge myself. I tried to speak out in a tutorial in year one, but was shut down by another student. I know everyone is not like that, but I think it still holds me back.
                                            <br /><br />
                                            I need to give myself challenges to improve myself. I spoke with my personal tutor about this at the beginning of the year and they gave me some resources with tips - I think I need to have a look at those resources.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Stage 3: Now what? */}
                    <section className="space-y-6 pt-6">
                        <div className="border-l-4 border-orange-500 pl-6">
                            <h3 className="text-2xl font-bold text-gray-900">Now what?</h3>
                            <p className="text-lg font-bold text-gray-800 mt-1">The action plan</p>
                        </div>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Ensure that you are concrete in your action plan and not only saying generic comments such as 'I will do things differently/better'. The more concrete you can be regarding what you want to do, how you will do it, and how you will remind yourself, the easier and more likely it will be to implement.
                            </p>
                            <p className="font-medium text-gray-700">Helpful questions could be:</p>
                            <ul className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                                <li className="flex gap-2"><span>•</span> ... do I need to do in the future to do better/fix a similar situation/stop being stuck?</li>
                                <li className="flex gap-2"><span>•</span> ... might be the consequences of this new action?</li>
                                <li className="flex gap-2"><span>•</span> ... considerations do I need about me/others/the situation to make sure this plan is successful?</li>
                                <li className="flex gap-2"><span>•</span> ... do I need to do to ensure that I will follow my plan?</li>
                            </ul>
                        </div>

                        {/* Examples Table: Now what? */}
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full text-left text-sm border-collapse">
                                <caption className="p-4 font-bold text-gray-800 text-left bg-gray-50 border-b border-gray-200">Examples of 'Now what?'</caption>
                                <thead>
                                    <tr className="bg-gray-50 divide-x divide-gray-200">
                                        <th className="p-4 font-bold text-gray-900 border-b border-gray-200 w-1/2">Getting an assignment back</th>
                                        <th className="p-4 font-bold text-gray-900 border-b border-gray-200 w-1/2">Participation in workshops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="divide-x divide-gray-100 italic text-gray-600 leading-relaxed">
                                        <td className="p-4">
                                            I realise that I have to develop a better structure for working and time management. When I do my essays this means ensuring I get them finished with enough time for others to review and offer feedback.
                                            <br /><br />
                                            Once an essay question is released, I will immediately write a deadline 4 days earlier in my planner/calendar. I will also plan times when I have to work on it and set a reminder on my phone. I will then make plans with friends to read it through and commit to having it reviewed by my new deadline so I can revise any issues identified. This will keep me accountable for the new deadline.
                                            <br /><br />
                                            I think this will help me start essays earlier and hopefully have less stress when writing them.
                                        </td>
                                        <td className="p-4">
                                            This weekend, I will read the resources that my personal tutor suggested to me, which can help me revise this current plan. I think I will have to pair-up with a friend during workshops and tell them that I am working on contributing more. I will invite them to ask me questions during tutorials so that I can get used to speaking and then hopefully from there begin speaking even when I'm not addressed.
                                            <br /><br />
                                            I need to know what I am going to say and be confident in this before I will speak up. To be able to do this, I will prepare for the workshop by reading the material which will be used in the session. I already have a study plan that I can use for this.
                                            <br /><br />
                                            If I contribute more, I think I will also become better at asking questions when there is something I don't understand. Therefore I will get a better understanding of the material and hopefully this will improve my grades.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* References Section */}
                    <section className="bg-gray-50 p-6 rounded-2xl space-y-4">
                        <h4 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Adapted from</h4>
                        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                            <p>Borton. T. (1970). Reach Touch and Teach: Student Concerns and Process Education. McGraw-Hill, New York</p>
                            <p>Driscoll J. (1994). Reflective practice for practise. Senior Nurse, 13, 47 -50</p>
                            <p>Rolfe, G., Freshwater, D., Jasper, M. (2001). Critical reflection in nursing and the helping professions: a user’s guide. Basingstoke: Palgrave Macmillan.</p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all transform hover:scale-[1.02] active:scale-98 shadow-lg"
                    >
                        Close
                    </button>
                </div>
            </div >
        </div >
    );
};

const CountdownTimer = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = new Date(endTime) - now;

            if (difference <= 0) {
                return 'Expired';
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            return `${hours}h ${minutes}m ${seconds}s left`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return <span>{timeLeft}</span>;
};

const getStatusBadge = (item) => {
    if (!item) return null;
    const { status, reviewedBy } = item;
    let reviewerName = '';
    if (reviewedBy) {
        if (reviewedBy.profile && (reviewedBy.profile.firstName || reviewedBy.profile.lastName)) {
            reviewerName = `${reviewedBy.profile.firstName} ${reviewedBy.profile.lastName}`.trim();
        } else if (reviewedBy.name) {
            reviewerName = reviewedBy.name;
        }
    }

    switch (status) {
        case 'Approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaCheck /> Approved {reviewerName && `by ${reviewerName}`}</span>;
        case 'Rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaBan /> Rejected {reviewerName && `by ${reviewerName}`}</span>;
        case 'Resubmitted': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaClock /> Resubmitted</span>;
        default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold flex items-center gap-1"><FaClock /> Pending</span>;
    }
};

const DriscollReflection = ({ isFaculty, studentId, studentData, updatePendingCount }) => {
    const { user } = useContext(AuthContext);
    const [seminars, setSeminars] = useState([]);
    const [userReflections, setUserReflections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSeminar, setExpandedSeminar] = useState(null);
    const [formData, setFormData] = useState({ what: '', soWhat: '', nowWhat: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    // Review State for Faculty
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedItemForReview, setSelectedItemForReview] = useState(null);
    const [reviewFeedback, setReviewFeedback] = useState('');
    const [reviewAction, setReviewAction] = useState('Rejected');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                if (isFaculty && studentData) {
                    // In Faculty mode, data is passed via props (already populated from student portfolio)
                    // But we might need seminars to show all possible reflection points or just show what's there
                    // To keep UI consistent, let's fetch ALL seminars, then match student's reflections
                    const seminarsRes = await axios.get(API_ENDPOINTS.SEMINARS, config);
                    // Sort seminars date wise initially (ascending - earliest first)
                    const sortedSeminars = (seminarsRes.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
                    setSeminars(sortedSeminars);
                    setUserReflections(studentData.driscollReflections || []);
                } else {
                    const [seminarsRes, reflectionsRes] = await Promise.all([
                        axios.get(API_ENDPOINTS.SEMINARS, config),
                        axios.get(API_ENDPOINTS.MY_DRISCOLL_REFLECTIONS, config)
                    ]);
                    // Sort seminars date wise initially (ascending - earliest first)
                    const sortedSeminars = (seminarsRes.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
                    setSeminars(sortedSeminars);
                    setUserReflections(reflectionsRes.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, isFaculty, studentData]);

    const getReflectionForSeminar = (seminarId) => {
        return userReflections.find(r => r.seminar?._id === seminarId || r.seminar === seminarId);
    };

    const getStatusInfo = (seminar) => {
        const now = new Date();
        const seminarDate = new Date(seminar.date);

        // Window start: 6:00 PM IST (12:30 PM UTC) on the seminar date
        const startTime = new Date(seminarDate);
        startTime.setUTCHours(12, 30, 0, 0);

        // Window end: 10:00 PM IST (4:30 PM UTC) on the next day
        const endTime = new Date(seminarDate);
        endTime.setUTCDate(endTime.getUTCDate() + 1);
        endTime.setUTCHours(16, 30, 0, 0);

        if (now < startTime) return { status: 'upcoming', message: 'Yet to start', startTime, endTime, color: 'text-blue-500', bgColor: 'bg-blue-50', icon: FaClock };
        if (now > endTime) return { status: 'expired', message: 'Window closed', startTime, endTime, color: 'text-red-500', bgColor: 'bg-red-50', icon: FaExclamationTriangle };

        // active window
        return { status: 'active', message: 'Active', startTime, endTime, color: 'text-green-500', bgColor: 'bg-green-50', icon: FaClock };
    };

    const handleToggle = (seminar) => {
        if (expandedSeminar === seminar._id) {
            setExpandedSeminar(null);
        } else {
            setExpandedSeminar(seminar._id);
            const existing = getReflectionForSeminar(seminar._id);
            if (existing) {
                setFormData({ what: existing.what, soWhat: existing.soWhat, nowWhat: existing.nowWhat });
            } else {
                setFormData({ what: '', soWhat: '', nowWhat: '' });
            }
        }
    };

    const handleSubmit = async (seminarId) => {
        if (!formData.what || !formData.soWhat || !formData.nowWhat) {
            return toast.error('Please fill all fields');
        }

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.post(API_ENDPOINTS.DRISCOLL_REFLECTION, {
                seminarId,
                ...formData
            }, config);

            toast.success('Reflection submitted successfully');

            // Update local state
            const updatedReflections = [...userReflections];
            const index = updatedReflections.findIndex(r => r.seminar?._id === seminarId || r.seminar === seminarId);
            if (index > -1) {
                updatedReflections[index] = res.data;
            } else {
                updatedReflections.push(res.data);
            }
            setUserReflections(updatedReflections);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit reflection');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openReviewModal = (reflection, action) => {
        setSelectedItemForReview(reflection);
        setReviewFeedback(reflection.feedback || '');
        setReviewAction(action);
        setReviewModalOpen(true);
    };

    const handleReviewSubmit = async (status) => {
        if (!selectedItemForReview) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                studentId,
                reflectionId: selectedItemForReview._id,
                status,
                feedback: reviewFeedback
            };

            const res = await axios.put(API_ENDPOINTS.REVIEW_DRISCOLL_REFLECTION, payload, config);

            // Update local state
            const updatedReflections = userReflections.map(r =>
                r._id === selectedItemForReview._id ? res.data.reflection : r
            );
            setUserReflections(updatedReflections);

            // Update sidebar badge
            if (updatePendingCount) {
                updatePendingCount('reflections');
            }

            toast.success(`Reflection ${status} Successfully`);
            setReviewModalOpen(false);
            setSelectedItemForReview(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating review');
        }
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
        <div className="max-w-8xl mx-auto p-4 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-purple/10 p-3 rounded-xl text-brand-purple text-2xl">
                        <FaLightbulb />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Course Reflection</h2>
                        <p className="text-sm text-gray-500">Reflect on your learning experiences</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium text-sm"
                >
                    <FaInfoCircle className="text-brand-purple" />
                    How it works?
                </button>
            </div>

            <ReflectionInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by seminar title..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <DatePicker
                                selectsRange={true}
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(update) => setDateRange(update)}
                                isClearable={false}
                                placeholderText="Filter by date range..."
                                className="pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm w-full md:w-64 bg-white cursor-pointer"
                                calendarClassName="!bg-white !rounded-2xl !shadow-2xl !border-none !p-4 !font-sans animate-scale-in"
                                dayClassName={(d) => "rounded-lg transition-colors hover:!bg-brand-purple/10"}
                                nextMonthButtonLabel={<FaChevronRight className="text-brand-purple" />}
                                previousMonthButtonLabel={<FaChevronLeft className="text-brand-purple" />}
                                dateFormat="dd/MM/yyyy"
                            />
                            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-brand-purple transition-colors pointer-events-none" />
                        </div>

                        {(searchTerm || startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setDateRange([null, null]);
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Clear All Filters"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Seminars Accordion */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <FaSpinner className="animate-spin text-brand-purple text-3xl" />
                    </div>
                ) : filteredSeminars.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
                        {searchTerm || startDate || endDate ? 'No seminars match your filters.' : 'No seminars available for reflection yet.'}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSeminars.map((seminar) => {
                            const statusInfo = getStatusInfo(seminar);
                            const existing = getReflectionForSeminar(seminar._id);
                            const isExpanded = expandedSeminar === seminar._id;
                            const isExpired = statusInfo.status === 'expired';
                            const isUpcoming = statusInfo.status === 'upcoming';
                            const isDisabled = (isExpired || isUpcoming) && !isFaculty;
                            const canEdit = !isFaculty && (existing?.status !== 'Approved') && (!isDisabled || (existing && ['Rejected', 'Resubmitted'].includes(existing.status)));

                            return (
                                <div key={seminar._id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${isExpanded ? 'ring-2 ring-brand-purple ring-offset-2' : 'border-gray-100 hover:shadow-md'}`}>
                                    <button
                                        onClick={() => handleToggle(seminar)}
                                        className="w-full px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${isExpanded ? 'bg-brand-purple text-white' : 'bg-brand-purple/10 text-brand-purple'}`}>
                                                <FaCalendarAlt />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-lg">{seminar.title}</h4>
                                                <p className="text-sm text-gray-500">{new Date(seminar.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {existing && getStatusBadge(existing)}
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                <statusInfo.icon />
                                                {statusInfo.status === 'active' ? (
                                                    <CountdownTimer endTime={statusInfo.endTime} />
                                                ) : (
                                                    statusInfo.message
                                                )}
                                            </div>
                                            {isExpanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="px-6 pb-8 space-y-6 animate-slide-down border-t border-gray-50 pt-6">
                                            {/* Window Status Alert */}
                                            {isDisabled && !existing && (
                                                <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${isUpcoming ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                                    <div className="mt-0.5">
                                                        {isUpcoming ? <FaClock /> : <FaExclamationTriangle />}
                                                    </div>
                                                    <p>
                                                        {isUpcoming
                                                            ? `The reflection window will open automatically on ${new Date(seminar.date).toLocaleDateString('en-GB')} at 6:00 PM.`
                                                            : `The reflection window for this seminar is now closed (Closed on ${statusInfo.endTime ? new Date(statusInfo.endTime).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}).`}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-6">
                                                {/* Stage 1: What? */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                            <span className="bg-brand-purple text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">1</span>
                                                            What?
                                                        </label>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Facts & Feelings</span>
                                                    </div>
                                                    <textarea
                                                        value={formData.what}
                                                        onChange={(e) => setFormData({ ...formData, what: e.target.value })}
                                                        disabled={!canEdit || isSubmitting}
                                                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none min-h-[120px] text-sm leading-relaxed disabled:bg-gray-50/50 disabled:text-gray-500"
                                                        placeholder="What happened? What was the context? What were your feelings?..."
                                                    />
                                                </div>

                                                {/* Stage 2: So What? */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                            <span className="bg-brand-pink text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">2</span>
                                                            So What?
                                                        </label>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Meaning & Theory</span>
                                                    </div>
                                                    <textarea
                                                        value={formData.soWhat}
                                                        onChange={(e) => setFormData({ ...formData, soWhat: e.target.value })}
                                                        disabled={!canEdit || isSubmitting}
                                                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-brand-pink/10 focus:border-brand-pink transition-all outline-none min-h-[120px] text-sm leading-relaxed disabled:bg-gray-50/50 disabled:text-gray-500"
                                                        placeholder="What did you learn? Why did it happen? What theories apply?..."
                                                    />
                                                </div>

                                                {/* Stage 3: Now What? */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                            <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">3</span>
                                                            Now What?
                                                        </label>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Concrete Action</span>
                                                    </div>
                                                    <textarea
                                                        value={formData.nowWhat}
                                                        onChange={(e) => setFormData({ ...formData, nowWhat: e.target.value })}
                                                        disabled={!canEdit || isSubmitting}
                                                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none min-h-[120px] text-sm leading-relaxed disabled:bg-gray-50/50 disabled:text-gray-500"
                                                        placeholder="What will you do differently? How will you prepare next time?..."
                                                    />
                                                </div>

                                                {/* Faculty Review Buttons (Faculty Only) */}
                                                {isFaculty && existing && (
                                                    <div className="col-span-1 pt-4 border-t border-gray-100 flex gap-4">
                                                        <button
                                                            onClick={() => openReviewModal(existing, 'Approved')}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${existing.status === 'Approved'
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                                }`}
                                                            disabled={existing.status === 'Approved'}
                                                        >
                                                            <FaCheck /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => openReviewModal(existing, 'Rejected')}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${existing.status === 'Rejected'
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                                }`}
                                                            disabled={existing.status === 'Rejected'}
                                                        >
                                                            <FaBan /> Reject
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Feedback Display for Student / Faculty */}
                                                {existing?.feedback && (
                                                    <div className="pt-2">
                                                        <div className={`p-4 rounded-xl border ${existing.status === 'Approved' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-yellow-50 border-yellow-100 text-yellow-800'}`}>
                                                            <p className="text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                                                <FaInfoCircle /> Faculty Feedback
                                                            </p>
                                                            <p className="text-sm italic">"{existing.feedback}"</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {canEdit && (
                                                    <div className="pt-4">
                                                        <button
                                                            onClick={() => handleSubmit(seminar._id)}
                                                            disabled={isSubmitting}
                                                            className="w-full bg-brand-purple text-white font-bold py-4 rounded-2xl hover:bg-brand-purple-dark transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-purple/20"
                                                        >
                                                            {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                                                            {existing ? (['Rejected', 'Resubmitted'].includes(existing.status) ? 'Resubmit Reflection' : 'Update Reflection') : 'Save Reflection'}
                                                        </button>
                                                    </div>
                                                )}

                                                {!canEdit && !isFaculty && (
                                                    <div className="pt-4">
                                                        <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                                                            <FaInfoCircle className="text-brand-purple" />
                                                            {existing
                                                                ? (existing.status === 'Approved'
                                                                    ? 'This reflection has been approved and cannot be edited.'
                                                                    : `The reflection window is closed (Closed on ${statusInfo.endTime ? new Date(statusInfo.endTime).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}). Editing is no longer possible.`)
                                                                : `The reflection will be closed on ${statusInfo.endTime ? new Date(statusInfo.endTime).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}.`}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Review Modal for Faculty */}
            {reviewModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                        <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${reviewAction === 'Approved' ? 'bg-green-50' : 'bg-red-50'
                            }`}>
                            <h3 className={`font-bold text-lg ${reviewAction === 'Approved' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {reviewAction === 'Approved' ? 'Approve Reflection' : 'Reject Reflection'}
                            </h3>
                            <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs text-brand-purple font-bold uppercase mb-1">Student</p>
                                <p className="text-sm font-bold text-gray-800">{studentData?.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Feedback {reviewAction === 'Rejected' && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    value={reviewFeedback}
                                    onChange={(e) => setReviewFeedback(e.target.value)}
                                    rows="4"
                                    placeholder={`Provide ${reviewAction === 'Approved' ? 'some encouraging feedback...' : 'reasons for rejection and guidance for improvement...'}`}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple outline-none transition-all text-sm"
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => handleReviewSubmit(reviewAction)}
                                    disabled={reviewAction === 'Rejected' && !reviewFeedback.trim()}
                                    className={`flex-1 text-white px-4 py-3 rounded-xl transition font-bold shadow-lg disabled:opacity-50 ${reviewAction === 'Approved'
                                        ? 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                        : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                        }`}
                                >
                                    Confirm {reviewAction}
                                </button>
                                <button
                                    onClick={() => setReviewModalOpen(false)}
                                    className="px-4 py-3 text-gray-500 hover:text-gray-700 font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriscollReflection;
