import { Sidebar } from '@/components/master/Sidebar';
import { Toaster } from '@/components/ui/sonner';

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
