import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { Toaster } from "sonner";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  UserCheck,
  BookOpen,
  ShoppingCart,
  Phone,
  Menu,
  X,
  LogOut,
  Leaf,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "ADMIN CONSOLE",
    items: [{ label: "Dashboard", path: "/admin", icon: <LayoutDashboard size={17} /> }],
  },
  {
    title: "MANAJEMEN",
    items: [
      { label: "Pengguna", path: "/admin/users", icon: <Users size={17} /> },
      { label: "NutriShop", path: "/admin/products", icon: <ShoppingBag size={17} /> },
      { label: "Tele-Nutritionist", path: "/admin/nutritionists", icon: <UserCheck size={17} /> },
      { label: "Artikel", path: "/admin/articles", icon: <BookOpen size={17} /> },
    ],
  },
  {
    title: "TRANSAKSI",
    items: [
      { label: "Transaksi NutriShop", path: "/admin/transactions/shop", icon: <ShoppingCart size={17} /> },
      { label: "Transaksi Tele-Nutri", path: "/admin/transactions/tele", icon: <Phone size={17} /> },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <Toaster position="top-right" richColors duration={3000} />

      {/* Overlay untuk tablet & mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-white border-r border-gray-200 z-30 transition-transform duration-300 flex flex-col shadow-xl lg:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center gap-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-gradient-to-br from-[#4a7c59] to-[#2d5a38] rounded-lg flex items-center justify-center shrink-0">
              <Leaf size={14} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-[15px] text-gray-900">
                Nutri<span className="text-[#4a7c59]">Grow</span>
              </span>
              <p className="text-[9px] font-semibold text-gray-400 tracking-widest uppercase leading-none">
                Admin Console
              </p>
            </div>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="px-4 mb-1 text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
                {section.title}
              </p>
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/admin" && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-lg text-[13px] transition-all mb-0.5 ${
                      isActive
                        ? "bg-[#ebf3ec] text-[#4a7c59] font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className={`shrink-0 ${isActive ? "text-[#4a7c59]" : "text-gray-400"}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom user info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4a7c59] to-[#2d5a38] flex items-center justify-center text-white text-xs font-bold shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-gray-800 truncate">Super Admin</p>
              <p className="text-[11px] text-gray-500 truncate">admin@nutrigrow.id</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-[12px] text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-10 shrink-0">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4a7c59] to-[#2d5a38] flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold text-gray-800 leading-tight">Admin</p>
              <p className="text-[11px] text-gray-500">Super Admin</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}