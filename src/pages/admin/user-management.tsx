import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  UserCheck,
  UserPlus,
  Calendar,
  AlertTriangle,
  Filter,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "./admin-layout";
import { adminService } from "../../services/admin.service";

type UserRole = "Admin" | "Pengguna" | "Ahli Gizi";
type UserStatus = "Aktif" | "Nonaktif";

interface UserData {
  id: string;
  rawId: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  lastActive: string;
  joinDateISO: string;
  lastActiveISO: string;
  avatar?: string;
}



type SortOption = "nama-az" | "nama-za" | "bergabung-terbaru" | "bergabung-terlama";

const AVATAR_COLORS = ["#4a7c59","#3b82f6","#8b5cf6","#f97316","#ec4899","#14b8a6","#f59e0b","#ef4444"];

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function getAvatarColor(name: string): string {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function formatDateID(iso: string): string {
  if (!iso) return "-";
  const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getPaginationPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function exportCSV(data: UserData[]): void {
  const headers = ["ID","Nama","Email","Peran","Status","Tanggal Bergabung","Terakhir Aktif"];
  const rows = data.map((u) => [u.id, u.name, u.email, u.role, u.status, u.joinDate, u.lastActive]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "manajemen-pengguna.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const selectCls =
  "appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-7 text-[13px] sm:text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-[#4a7c59]/25 focus:border-[#4a7c59] cursor-pointer w-full";

const OPTION_STYLE = `
  select option { 
    font-size: 13px; 
    padding: 8px 12px; 
    background: #fff; 
  }
  select option:hover, 
  select option:checked { 
    background: #f3f4f6; 
  }
  @media (max-width: 640px) {
    select option { 
      font-size: 14px; 
      padding: 10px 12px; 
    }
  }
`;

function SelectWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {children}
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function AvatarCell({ user }: { user: UserData }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: getAvatarColor(user.name) }}>
        {getInitials(user.name)}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[140px] md:max-w-[200px]">{user.name}</p>
        <p className="text-xs text-gray-500">{user.id}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    Admin: "bg-purple-100 text-purple-700 border border-purple-200",
    Pengguna: "bg-green-100 text-green-700 border border-green-200",
    "Ahli Gizi": "bg-orange-100 text-orange-700 border border-orange-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles[role]}`}>
      {role}
    </span>
  );
}


function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex flex-col gap-2 md:gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: color + "20" }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 line-clamp-1">{sub}</p>
    </div>
  );
}



function DeleteModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Pengguna</h3>
        <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus <strong className="text-gray-800">{name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua Peran");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [sortBy, setSortBy] = useState<SortOption>("nama-az");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, newUsers: 0, admins: 0 });


  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const ITEMS_PER_PAGE = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search.trim() || undefined,
      };

      if (roleFilter !== "Semua Peran") {
        params.role = roleFilter === "Admin" ? "ADMIN" : roleFilter === "Pengguna" ? "USER" : "AHLI_GIZI";
      }

      if (statusFilter !== "Semua Status") {
        params.isActive = statusFilter === "Aktif" ? "true" : "false";
      }

      params.sort = sortBy;

      if (filterDateFrom) params.createdFrom = filterDateFrom;
      if (filterDateTo) params.createdTo = filterDateTo;

      const res = await adminService.getUsers(params);

      const mapped = res.users.map((u) => ({
        id: `USR-${String(u.id).padStart(3, "0")}`,
        rawId: u.id,
        name: u.nama,
        email: u.email,
        role: (u.role === "ADMIN" ? "Admin" : u.role === "USER" ? "Pengguna" : "Ahli Gizi") as UserRole,
        status: (u.isActive ? "Aktif" : "Nonaktif") as UserStatus,
        joinDate: formatDateID(u.createdAt),
        lastActive: formatDateID(u.updatedAt),
        joinDateISO: u.createdAt.split("T")[0],
        lastActiveISO: u.updatedAt.split("T")[0],
        avatar: u.avatarUrl || undefined,
      }));

      setUsers(mapped);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
      
      setStats({
        total: res.stats.total,
        active: res.stats.active,
        admins: res.stats.admins,
        newUsers: res.stats.total - res.stats.inactive, // fallback metric
      });
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, sortBy, currentPage, filterDateFrom, filterDateTo]);

  async function handleToggleActive(user: UserData) {
    const nextActive = user.status === "Nonaktif";
    try {
      await adminService.setUserActive(user.rawId, nextActive);
      toast.success(`Status ${user.name} berhasil diubah menjadi ${nextActive ? "Aktif" : "Nonaktif"}`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah status pengguna");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const rawId = deleteTarget.rawId;
    try {
      await adminService.deleteUser(rawId);
      toast.success("Pengguna berhasil dihapus");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus pengguna");
    }
    setDeleteTarget(null);
  }

  function handleExport() {
    exportCSV(users);
    toast.success("Export berhasil");
  }

  function applyFilter() {
    setShowFilterModal(false);
    toast.success("Filter diterapkan");
  }

  function resetFilter() {
    setFilterDateFrom("");
    setFilterDateTo("");
    setShowFilterModal(false);
    toast.success("Filter direset");
  }

  function goPage(p: number) {
    setCurrentPage(Math.max(1, Math.min(p, totalPages || 1)));
  }

  useEffect(() => { setCurrentPage(1); }, [search, roleFilter, statusFilter, sortBy, filterDateFrom, filterDateTo]);

  const FilterModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowFilterModal(false)}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Filter Lanjutan</h3>
          <button onClick={() => setShowFilterModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Bergabung Dari</label>
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Bergabung Sampai</label>
            <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
          </div>
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button onClick={resetFilter} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Reset</button>
          <button onClick={applyFilter} className="flex-1 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849]">Terapkan</button>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <style>{OPTION_STYLE}</style>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola semua pengguna, keaktifan, dan tingkat akses mereka</p>
        </div>
        <div className="text-xs bg-[#ebf3ec] text-[#4a7c59] px-3.5 py-2 rounded-lg font-bold border border-[#4a7c59]/10">
          Total Terdaftar: {totalCount} Pengguna
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Pengguna" value={stats.total} sub="Terdaftar di DB" icon={<Users size={18} />} color="#4a7c59" />
        <StatCard label="Pengguna Aktif" value={stats.active} sub={`${stats.total > 0 ? ((stats.active/stats.total)*100).toFixed(1) : 0}% dari total`} icon={<UserCheck size={18} />} color="#16a34a" />
        <StatCard label="Pengguna Nonaktif" value={stats.total - stats.active} sub="Ditangguhkan" icon={<UserPlus size={18} />} color="#8b5cf6" />
        <StatCard label="Total Admin" value={stats.admins} sub="Hak akses penuh" icon={<Calendar size={18} />} color="#f97316" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Cari nama, email..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#4a7c59]/25 focus:border-[#4a7c59]" 
              />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectCls}>
                  <option>Semua Peran</option>
                  <option>Admin</option>
                  <option>Pengguna</option>
                  <option>Ahli Gizi</option>
                </select>
              </SelectWrapper>

              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
                  <option>Semua Status</option>
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
              </SelectWrapper>

              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className={selectCls}>
                  <option value="nama-az">Nama A-Z</option>
                  <option value="nama-za">Nama Z-A</option>
                  <option value="bergabung-terbaru">Bergabung Terbaru</option>
                  <option value="bergabung-terlama">Bergabung Terlama</option>
                </select>
              </SelectWrapper>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <button onClick={() => setShowFilterModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
                  <Filter size={14} /> Filter
                </button>
                <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#4a7c59]" />
              <p className="text-sm text-gray-400 font-medium">Memuat data pengguna...</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">PENGGUNA</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">PERAN</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">TANGGAL BERGABUNG</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">TERAKHIR AKTIF</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3.5">
                        <AvatarCell user={user} />
                      </td>
                      <td className="px-4 py-3.5">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-gray-600 whitespace-nowrap">{user.joinDate}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-sm text-gray-600 whitespace-nowrap">{user.lastActive}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/50 ${
                              user.status === "Aktif" ? "bg-[#4a7c59]" : "bg-gray-300"
                            }`}
                            aria-label="Toggle active status"
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                user.status === "Aktif" ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-semibold ${user.status === "Aktif" ? "text-green-700" : "text-gray-500"}`}>
                            {user.status === "Aktif" ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end">
                          <button 
                            onClick={() => setDeleteTarget(user)} 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
                          >
                            <Trash2 size={13} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-gray-100">
          <p className="text-sm text-gray-500 order-2 sm:order-1">
            Menampilkan {users.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} dari {totalCount} pengguna
          </p>
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <button 
              onClick={() => goPage(currentPage - 1)} 
              disabled={currentPage === 1} 
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            {getPaginationPages(currentPage, totalPages).map((p, i) => 
              p === "..." ? (
                <span key={`e${i}`} className="px-2 text-gray-400 text-sm">…</span>
              ) : (
                <button 
                  key={p} 
                  onClick={() => goPage(p as number)} 
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === p 
                      ? "bg-[#4a7c59] text-white" 
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button 
              onClick={() => goPage(currentPage + 1)} 
              disabled={currentPage === totalPages || totalPages === 0} 
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>


      {deleteTarget && <DeleteModal name={deleteTarget.name} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
      {showFilterModal && <FilterModal />}
    </AdminLayout>
  );
}