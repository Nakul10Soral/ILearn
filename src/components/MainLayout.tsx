import { Sidebar } from './Sidebar';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="pt-16 md:pt-0 h-full">{children}</div>
      </main>
    </div>
  );
}
