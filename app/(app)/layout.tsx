import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { SessionProvider } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const user = getSessionUser();
  if (!user) redirect("/login");

  return (
    <SessionProvider user={user}>
      <div className="flex min-h-screen bg-muted/20">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-x-hidden p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
