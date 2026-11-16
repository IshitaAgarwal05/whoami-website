import AdminDashboardClient from './AdminDashboardClient';
import { AdminAuthProvider } from '../../context/AdminAuthContext';

export const metadata = {
    title: 'Admin Portal | WhoAmI Studios',
    description: 'Administrative portal, visitor telemetry, and brand studio for WhoAmI Studios.',
    robots: 'noindex, nofollow'
};

export default function AdminPage() {
    return (
        <AdminAuthProvider>
            <AdminDashboardClient />
        </AdminAuthProvider>
    );
}
