import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import UserDashboard from '../components/UserDashboard';
import FacultyDashboard from '../components/FacultyDashboard';
import Topbar from '../components/Topbar';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-gray-50">
            <Topbar />

            <main className="p-6">
                {user?.role === 'Super Admin' ? <SuperAdminDashboard /> :
                    (user?.role === 'Faculty' || user?.role === 'Lead Faculty') ? <FacultyDashboard /> :
                        <UserDashboard />}
            </main>
        </div>
    );
};

export default Dashboard;
