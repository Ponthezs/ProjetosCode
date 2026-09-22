import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { useApp } from '../context/AppContext';

export function AppLayout() {
  const { authenticated } = useApp();
  if (!authenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen grid-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
