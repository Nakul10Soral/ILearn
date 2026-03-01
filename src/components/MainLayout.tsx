import { useState } from 'react';
import { Sidebar } from './Sidebar';

type MainLayoutProps = { children: React.ReactNode };

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <div className="pt-16 md:pt-0 h-full">{children}</div>
      </main>
    </div>
  );
}