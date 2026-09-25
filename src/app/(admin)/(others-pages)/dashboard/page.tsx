import Dashboard from '@/components/dashboards/Dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cars Dashboard YTH',
  description: 'Dashboard YTH',
  // other metadata
};
export default function page() {
  return (
    <div>
      <Dashboard />
    </div>
  );
}
