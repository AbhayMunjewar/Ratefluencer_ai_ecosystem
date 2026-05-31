import { Outlet } from 'react-router';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AtmosphericBackground } from './components/AtmosphericBackground';

export function AppLayout() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#05080F',
      overflow: 'hidden',
    }}>
      <AtmosphericBackground />
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <Topbar />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
