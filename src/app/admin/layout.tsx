"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (isLogin) {
    return <div className="flex flex-1 flex-col">{children}</div>;
  }

  return (
    <div className="flex flex-1 flex-col bg-neutral-950 text-white">
      <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
        <Link href="/admin" className="font-semibold">
          QR AR/VR — Admin
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="text-neutral-300 hover:text-white">
            Proyectos
          </Link>
          <Link
            href="/admin/new"
            className="rounded-full bg-white px-4 py-1.5 font-medium text-black hover:bg-neutral-200"
          >
            + Nuevo QR
          </Link>
          <button
            onClick={handleLogout}
            className="text-neutral-400 hover:text-white"
          >
            Salir
          </button>
        </nav>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
