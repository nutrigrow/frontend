import { Link } from "react-router";
import { Users, ShoppingBag, UserCheck, BookOpen, ArrowRight, UserPlus, PlusSquare, ClipboardList } from "lucide-react";

interface Activity {
  type: "user" | "product" | "order" | "session" | "article";
  message: string;
  sub: string;
  time: string;
}

const activities: Activity[] = [
  { type: "user",    message: "Pengguna baru terdaftar",    sub: "Olivia Martin telah bergabung ke platform",         time: "2 menit lalu"   },
  { type: "product", message: "Produk diperbarui",           sub: "Organic Veggie Puree telah diperbarui",             time: "15 menit lalu"  },
  { type: "order",   message: "Pesanan baru diterima",       sub: "Pesanan #ORD-0035 telah dibuat",                    time: "1 jam lalu"     },
  { type: "session", message: "Sesi baru dijadwalkan",       sub: "Sesi dengan Sarah Jenkins",                         time: "1 jam lalu"     },
  { type: "article", message: "Artikel diterbitkan",         sub: "10 Tips Nutrisi Sehat untuk Ibu Hamil diterbitkan", time: "2 jam lalu"     },
];

const activityIcon: Record<Activity["type"], { bg: string; emoji: string }> = {
  user:    { bg: "bg-green-100",  emoji: "👤" },
  product: { bg: "bg-orange-100", emoji: "📦" },
  order:   { bg: "bg-blue-100",   emoji: "🛒" },
  session: { bg: "bg-purple-100", emoji: "📅" },
  article: { bg: "bg-yellow-100", emoji: "📝" },
};

const quickActions = [
  { label: "Tambah\nPengguna",      icon: <UserPlus size={22} />,      color: "text-[#4a7c59]",  bg: "bg-green-50",  to: "/admin/users"             },
  { label: "Tambah\nProduk",        icon: <PlusSquare size={22} />,    color: "text-blue-500",   bg: "bg-blue-50",   to: "/admin/products"          },
  { label: "Tambah\nNutritionist",  icon: <UserCheck size={22} />,     color: "text-purple-500", bg: "bg-purple-50", to: "/admin/nutritionists"     },
  { label: "Buat\nArtikel",         icon: <BookOpen size={22} />,      color: "text-orange-500", bg: "bg-orange-50", to: "/admin/articles"          },
  { label: "Transaksi\nNutriShop",  icon: <ShoppingBag size={22} />,   color: "text-teal-500",   bg: "bg-teal-50",   to: "/admin/transactions/shop" },
  { label: "Transaksi\nKonsultasi", icon: <ClipboardList size={22} />, color: "text-pink-500",   bg: "bg-pink-50",   to: "/admin/transactions/tele" },
];

const managementCards = [
  {
    icon: <Users size={20} />, iconBg: "bg-blue-100", iconColor: "text-blue-500", headerBg: "bg-blue-50",
    title: "Manajemen Pengguna", desc: "Kelola pengguna, peran, dan hak akses dalam sistem.",
    stats: [
      { value: "856",  label: "Total Pengguna" },
      { value: "24",   label: "Pengguna Aktif" },
      { value: "642",  label: "Member"         },
    ],
    btnLabel: "Kelola Pengguna", btnColor: "text-[#4a7c59] border border-[#4a7c59] hover:bg-green-50", to: "/admin/users",
  },
  {
    icon: <ShoppingBag size={20} />, iconBg: "bg-orange-100", iconColor: "text-orange-500", headerBg: "bg-orange-50",
    title: "Manajemen NutriShop", desc: "Kelola produk, pesanan, inventaris, dan pengaturan toko.",
    stats: [
      { value: "1.248", label: "Total Produk"     },
      { value: "32",    label: "Pesanan Hari Ini" },
      { value: "56",    label: "Stok Menipis"     },
    ],
    btnLabel: "Kelola NutriShop", btnColor: "bg-[#4a7c59] text-white hover:bg-[#2d5a38]", to: "/admin/products",
  },
  {
    icon: <UserCheck size={20} />, iconBg: "bg-purple-100", iconColor: "text-purple-500", headerBg: "bg-purple-50",
    title: "Manajemen Nutritionist", desc: "Kelola nutritionist, sesi, konsultasi, dan jadwal.",
    stats: [
      { value: "42", label: "Nutritionist Aktif" },
      { value: "18", label: "Sesi Hari Ini"      },
      { value: "27", label: "Sesi Mendatang"     },
    ],
    btnLabel: "Kelola Nutritionist", btnColor: "text-purple-500 border border-purple-400 hover:bg-purple-50", to: "/admin/nutritionists",
  },
  {
    icon: <BookOpen size={20} />, iconBg: "bg-blue-100", iconColor: "text-blue-500", headerBg: "bg-blue-50",
    title: "Perpustakaan Artikel", desc: "Buat dan kelola artikel, kategori, dan konten.",
    stats: [
      { value: "218", label: "Total Artikel" },
      { value: "156", label: "Diterbitkan"   },
      { value: "62",  label: "Draf"          },
    ],
    btnLabel: "Kelola Artikel", btnColor: "text-blue-500 border border-blue-400 hover:bg-blue-50", to: "/admin/articles",
  },
];

export default function AdminDashboard() {
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Selamat datang kembali! Berikut ringkasan NutriGrow.</p>
        </div>
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-600">
          📅 {today}
        </div>
      </div>

      {/* 4 Management Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {managementCards.map(card => (
          <div key={card.title} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
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
            <div className="px-5 py-3">
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-900">Aktivitas Terbaru</p>
            <button className="text-xs text-[#4a7c59] hover:underline font-medium">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {activities.map((act, i) => {
              const cfg = activityIcon[act.type];
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 text-sm`}>
                    {cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{act.message}</p>
                    <p className="text-xs text-gray-400 truncate">{act.sub}</p>
                  </div>
                  <p className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">{act.time}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="font-semibold text-gray-900 mb-4">Aksi Cepat</p>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(action => (
              <Link
                key={action.label}
                to={action.to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition text-center group"
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
  );
}