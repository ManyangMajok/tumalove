import AdminLayout from '../layouts/AdminLayout';
import WithdrawalQueue from '../components/WithdrawalQueue';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function Payouts() {
  const { loading } = useAdminAuth();
  if (loading) return null;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Financial Operations</h1>
      <div className="max-w-3xl">
        <WithdrawalQueue />
      </div>
    </AdminLayout>
  );
}