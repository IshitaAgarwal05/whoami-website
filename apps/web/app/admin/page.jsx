import AdminDashboardClient from './AdminDashboardClient';

export const metadata = {
    title: 'Admin Dashboard | Visitor Analytics - WhoAmI Studios',
    description: 'Real-time visitor tracking and geographic intelligence dashboard for WhoAmI Studios.',
    robots: 'noindex, nofollow'
};

export default function AdminPage() {
    return <AdminDashboardClient />;
}
