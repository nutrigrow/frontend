import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Users, ShoppingBag, UserCheck, BookOpen, ArrowRight, PlusSquare, ClipboardList, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { adminService, type DashboardResponse } from "../../services/admin.service";
import { AdminLayout } from "./admin-layout";

interface Activity {
  type: "user" | "product" | "order" | "session" | "article";
  message: string;
  sub: string;
  time: string;
}

const activityIcon: Record<Activity["type"], { bg: string; emoji: string }> = {
  user:    { bg: "bg-green-100",  emoji: "👤" },
  product: { bg: "bg-orange-100", emoji: "📦" },
  order:   { bg: "bg-blue-100",   emoji: "🛒" },
  session: { bg: "bg-purple-100", emoji: "🗓️" },
  article: { bg: "bg-yellow-100", emoji: "📝" },
};

const quickActions = [
  { label: "Tambah\nProduk",        icon: <PlusSquare size={22} />,    color: "text-blue-500",   bg: "bg-blue-50",   to: "/admin/products"          },
  { label: "Tambah\nNutritionist",  icon: <UserCheck size={22} />,     color: "text-purple-500", bg: "bg-purple-50", to: "/admin/nutritionists"     },
  { label: "Buat\nArtikel",         icon: <BookOpen size={22} />,      color: "text-orange-500", bg: "bg-orange-50", to: "/admin/articles"          },
  { label: "Transaksi\nNutriShop",  icon: <ShoppingBag size={22} />,   color: "text-teal-500",   bg: "bg-teal-50",   to: "/admin/nutrishop" },
  { label: "Transaksi\nTele-Nutritionist", icon: <ClipboardList size={22} />, color: "text-pink-500",   bg: "bg-pink-50",   to: "/admin/tele" },
];

function getRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default function AdminDashboard() {
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityPage, setActivityPage] = useState(1);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getDashboard();
        setData(res);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#4a7c59]" />
          <p className="text-sm text-gray-500 font-medium">Memuat dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  const stats = data?.stats;

  const managementCards = [
    {
      icon: <Users size={20} />, iconBg: "bg-blue-100", iconColor: "text-blue-500", headerBg: "bg-blue-50",
      title: "Manajemen Pengguna", desc: "Kelola pengguna, peran, dan hak akses dalam sistem.",
      stats: [
        { value: stats?.users.total.toString() || "0",  label: "Total Pengguna" },
        { value: stats?.users.active.toString() || "0", label: "Pengguna Aktif" },
        { value: stats?.users.admins.toString() || "0", label: "Admin"         },
      ],
      btnLabel: "Kelola Pengguna", btnColor: "text-[#4a7c59] border border-[#4a7c59] hover:bg-green-50", to: "/admin/users",
    },
    {
      icon: <ShoppingBag size={20} />, iconBg: "bg-orange-100", iconColor: "text-orange-500", headerBg: "bg-orange-50",
      title: "Manajemen NutriShop", desc: "Kelola produk, pesanan, inventaris, dan pengaturan toko.",
      stats: [
        { value: stats?.products.total.toString() || "0",      label: "Total Produk"     },
        { value: stats?.shopOrders.pending.toString() || "0",  label: "Pending Orders"   },
        { value: stats?.products.lowStock.toString() || "0",   label: "Stok Menipis"     },
      ],
      btnLabel: "Kelola NutriShop", btnColor: "bg-[#4a7c59] text-white hover:bg-[#2d5a38]", to: "/admin/products",
    },
    {
      icon: <UserCheck size={20} />, iconBg: "bg-purple-100", iconColor: "text-purple-500", headerBg: "bg-purple-50",
      title: "Manajemen Nutritionist", desc: "Kelola nutritionist, sesi, konsultasi, dan jadwal.",
      stats: [
        { value: stats?.nutritionists.total.toString() || "0",      label: "Ahli Gizi Aktif" },
        { value: stats?.consultations.confirmed.toString() || "0", label: "Sesi Confirmed"  },
        { value: stats?.consultations.total.toString() || "0",     label: "Total Sesi"      },
      ],
      btnLabel: "Kelola Nutritionist", btnColor: "text-purple-500 border border-purple-400 hover:bg-purple-50", to: "/admin/nutritionists",
    },
    {
      icon: <BookOpen size={20} />, iconBg: "bg-blue-100", iconColor: "text-blue-500", headerBg: "bg-blue-50",
      title: "Perpustakaan Artikel", desc: "Buat dan kelola artikel, kategori, dan konten.",
      stats: [
        { value: stats?.articles.total.toString() || "0",     label: "Total Artikel" },
        { value: stats?.articles.published.toString() || "0", label: "Diterbitkan"   },
        { value: stats?.articles.draft.toString() || "0",     label: "Draf"          },
      ],
      btnLabel: "Kelola Artikel", btnColor: "text-blue-500 border border-blue-400 hover:bg-blue-50", to: "/admin/articles",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Selamat datang! Berikut ringkasan NutriGrow.</p>
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-600 shadow-sm">
            🗓️ {today}
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Pendapatan NutriShop</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">Rp {(stats?.revenue.shop || 0).toLocaleString("id-ID")}</p>
            <p className="text-xs text-green-600 font-medium mt-1">Transaksi penjualan sukses</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Pendapatan Tele-Nutritionist</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">Rp {(stats?.revenue.teleNutritionist || 0).toLocaleString("id-ID")}</p>
            <p className="text-xs text-green-600 font-medium mt-1">Konsultasi ahli gizi sukses</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 bg-gradient-to-br from-[#4a7c59] to-[#3a6146] text-white">
            <p className="text-xs text-green-100 font-semibold tracking-wider uppercase">Total Akumulasi Pendapatan</p>
            <p className="text-2xl font-bold mt-2">Rp {(stats?.revenue.total || 0).toLocaleString("id-ID")}</p>
            <p className="text-xs text-green-200 font-medium mt-1">Omzet NutriGrow terverifikasi</p>
          </div>
        </div>

        {/* 4 Management Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {managementCards.map(card => (
            <div key={card.title} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition duration-200">
              {/* Colored header area */}
              <div className={`${card.headerBg} px-5 pt-5 pb-4`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center flex-shrink-0`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{card.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
                {/* Stats row */}
                <div className="flex gap-4">
                  {card.stats.map(s => (
                    <div key={s.label}>
                      <p className="text-xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-[10px] text-gray-500 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Button */}
              <div className="px-5 py-3 mt-auto">
                <Link
                  to={card.to}
                  className={`flex items-center justify-center gap-1.5 w-full border rounded-lg py-2 text-xs font-semibold transition ${card.btnColor}`}
                >
                  {card.btnLabel} <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-900">Aktivitas Terbaru</p>
                <span className="text-xs bg-green-50 text-[#4a7c59] px-2.5 py-0.5 rounded-full font-medium">Realtime</span>
              </div>
              <div className="space-y-4">
                {(!data?.activities || data.activities.length === 0) ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Belum ada aktivitas terbaru</div>
                ) : (
                  data.activities.slice((activityPage - 1) * 3, activityPage * 3).map((act, i) => {
                    const cfg = activityIcon[act.type];
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full ${cfg?.bg || "bg-gray-100"} flex items-center justify-center flex-shrink-0 text-sm`}>
                          {cfg?.emoji || "🔔"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{act.message}</p>
                          <p className="text-xs text-gray-400 truncate">{act.sub}</p>
                        </div>
                        <p className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">{getRelativeTime(act.at)}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {Math.ceil((data?.activities?.length || 0) / 3) > 1 && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                <span className="text-[11px] text-gray-400 font-medium">
                  Halaman {activityPage} dari {Math.ceil((data?.activities?.length || 0) / 3)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                    disabled={activityPage === 1}
                    className="p-1 rounded bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setActivityPage((p) => Math.min(Math.ceil((data?.activities?.length || 0) / 3), p + 1))}
                    disabled={activityPage === Math.ceil((data?.activities?.length || 0) / 3)}
                    className="p-1 rounded bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="font-semibold text-gray-900 mb-4">Aksi Cepat</p>
            <div className="space-y-3">
              {/* Row 1: 3 Columns */}
              <div className="grid grid-cols-3 gap-3">
                {quickActions.slice(0, 3).map(action => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition text-center group bg-white"
                  >
                    <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      {action.icon}
                    </div>
                    <p className="text-[11px] font-medium text-gray-600 leading-tight whitespace-pre-line">{action.label}</p>
                  </Link>
                ))}
              </div>
              {/* Row 2: 2 Columns */}
              <div className="grid grid-cols-2 gap-3">
                {quickActions.slice(3).map(action => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition text-center group bg-white"
                  >
                    <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      {action.icon}
                    </div>
                    <p className="text-[11px] font-medium text-gray-600 leading-tight whitespace-pre-line">{action.label}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}