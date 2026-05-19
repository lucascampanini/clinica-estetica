import { Toaster } from '@/components/ui/sonner';

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {children}
      <Toaster richColors position="top-center" />
    </div>
  );
}
