import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Search,
  Download,
  Plus,
  Edit2,
  Copy,
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
} from "lucide-react";
import { AdminLayout } from "./admin-layout";

type UserRole = "Admin" | "Pengguna" | "Ahli Gizi";
type UserStatus = "Aktif" | "Nonaktif";

interface UserData {
  id: string;
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

interface FormData {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  lastActive: string;
}

type ModalMode = "add" | "edit" | "duplicate";
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
  const d = new Date(iso + "T00:00:00");
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

const INITIAL_USERS: UserData[] = [
  { id:"USR-001", name:"Amanda Sari",    email:"amanda.sari@nutrigrow.id",  role:"Admin",     status:"Aktif",    joinDate:"1 Jan 2025",   lastActive:"10 Mei 2026", joinDateISO:"2025-01-01", lastActiveISO:"2026-05-10" },
  { id:"USR-002", name:"Budi Santoso",   email:"budi.santoso@gmail.com",    role:"Pengguna",  status:"Aktif",    joinDate:"15 Feb 2025",  lastActive:"9 Mei 2026",  joinDateISO:"2025-02-15", lastActiveISO:"2026-05-09" },
  { id:"USR-003", name:"Citra Dewi",     email:"citra.dewi@nutrigrow.id",   role:"Ahli Gizi", status:"Aktif",    joinDate:"20 Mar 2025",  lastActive:"8 Mei 2026",  joinDateISO:"2025-03-20", lastActiveISO:"2026-05-08" },
  { id:"USR-004", name:"Emily Johnson",  email:"emily.johnson@gmail.com",   role:"Pengguna",  status:"Aktif",    joinDate:"5 Apr 2025",   lastActive:"7 Mei 2026",  joinDateISO:"2025-04-05", lastActiveISO:"2026-05-07" },
  { id:"USR-005", name:"Andi Pratama",   email:"andi.pratama@gmail.com",    role:"Pengguna",  status:"Nonaktif", joinDate:"10 Jan 2025",  lastActive:"1 Mar 2026",  joinDateISO:"2025-01-10", lastActiveISO:"2026-03-01" },
  { id:"USR-006", name:"Anisa Putri",    email:"anisa.putri@nutrigrow.id",  role:"Ahli Gizi", status:"Aktif",    joinDate:"15 Jan 2025",  lastActive:"9 Mei 2026",  joinDateISO:"2025-01-15", lastActiveISO:"2026-05-09" },
  { id:"USR-007", name:"Hendra Wijaya",  email:"hendra.w@nutrigrow.id",     role:"Admin",     status:"Aktif",    joinDate:"20 Jan 2025",  lastActive:"10 Mei 2026", joinDateISO:"2025-01-20", lastActiveISO:"2026-05-10" },
  { id:"USR-008", name:"Mega Sari",      email:"mega.sari@gmail.com",       role:"Pengguna",  status:"Aktif",    joinDate:"25 Feb 2025",  lastActive:"5 Mei 2026",  joinDateISO:"2025-02-25", lastActiveISO:"2026-05-05" },
  { id:"USR-009", name:"Fajar Nugroho",  email:"fajar.nugroho@gmail.com",   role:"Pengguna",  status:"Nonaktif", joinDate:"1 Mar 2025",   lastActive:"15 Apr 2026", joinDateISO:"2025-03-01", lastActiveISO:"2026-04-15" },
  { id:"USR-010", name:"Ratna Dewi",     email:"ratna.dewi@nutrigrow.id",   role:"Ahli Gizi", status:"Aktif",    joinDate:"10 Mar 2025",  lastActive:"8 Mei 2026",  joinDateISO:"2025-03-10", lastActiveISO:"2026-05-08" },
  { id:"USR-011", name:"Doni Setiawan",  email:"doni.s@gmail.com",          role:"Pengguna",  status:"Aktif",    joinDate:"15 Mar 2025",  lastActive:"6 Mei 2026",  joinDateISO:"2025-03-15", lastActiveISO:"2026-05-06" },
  { id:"USR-012", name:"Lina Marlina",   email:"lina.marlina@gmail.com",    role:"Pengguna",  status:"Aktif",    joinDate:"20 Apr 2025",  lastActive:"7 Mei 2026",  joinDateISO:"2025-04-20", lastActiveISO:"2026-05-07" },
  { id:"USR-013", name:"Yoga Prasetyo",  email:"yoga.p@gmail.com",          role:"Pengguna",  status:"Aktif",    joinDate:"1 Mei 2025",   lastActive:"9 Mei 2026",  joinDateISO:"2025-05-01", lastActiveISO:"2026-05-09" },
  { id:"USR-014", name:"Nanda Pertiwi",  email:"nanda.p@nutrigrow.id",      role:"Ahli Gizi", status:"Nonaktif", joinDate:"5 Mei 2025",   lastActive:"20 Apr 2026", joinDateISO:"2025-05-05", lastActiveISO:"2026-04-20" },
  { id:"USR-015", name:"Arif Rahman",    email:"arif.rahman@gmail.com",     role:"Pengguna",  status:"Aktif",    joinDate:"8 Mei 2025",   lastActive:"9 Mei 2026",  joinDateISO:"2025-05-08", lastActiveISO:"2026-05-09" },
];

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

function StatusBadge({ status }: { status: UserStatus }) {
  return status === "Aktif" ? (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
      <span className="w-2 h-2 rounded-full bg-green-500" />Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
      <span className="w-2 h-2 rounded-full bg-gray-400" />Nonaktif
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

function UserModal({ mode, initialData, onSave, onClose }: { mode: ModalMode; initialData?: UserData; onSave: (data: Omit<UserData, "id">) => void; onClose: () => void }) {
  const [form, setForm] = useState<FormData>({
    name:       initialData?.name       ?? "",
    email:      initialData?.email      ?? "",
    role:       initialData?.role       ?? "Pengguna",
    status:     initialData?.status     ?? "Aktif",
    joinDate:   initialData?.joinDateISO   ?? new Date().toISOString().split('T')[0],
    lastActive: initialData?.lastActiveISO ?? new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const title = mode === "add" ? "Tambah Pengguna Baru" : mode === "edit" ? "Edit Pengguna" : "Duplikasi Pengguna";

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim())  e.name = "Nama wajib diisi";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email tidak valid";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name:           form.name,
      email:          form.email,
      role:           form.role,
      status:         form.status,
      joinDate:       formatDateID(form.joinDate),
      lastActive:     formatDateID(form.lastActive),
      joinDateISO:    form.joinDate,
      lastActiveISO:  form.lastActive,
      avatar:         initialData?.avatar,
    });
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Masukkan nama lengkap" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="contoh@email.com" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Peran</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))} className={inputCls + " bg-white"}>
                <option value="Admin">Admin</option>
                <option value="Pengguna">Pengguna</option>
                <option value="Ahli Gizi">Ahli Gizi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as UserStatus }))} className={inputCls + " bg-white"}>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Bergabung</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                <input type="date" value={form.joinDate} onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))} className={inputCls + " pl-9"} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Terakhir Aktif</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                <input type="date" value={form.lastActive} onChange={(e) => setForm((f) => ({ ...f, lastActive: e.target.value }))} className={inputCls + " pl-9"} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors">
              {mode === "edit" ? "Simpan Perubahan" : "Tambah Pengguna"}
            </button>
          </div>
        </form>
      </div>
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

function BulkDeleteModal({ count, onConfirm, onClose }: { count: number; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Data Terpilih</h3>
        <p className="text-sm text-gray-500 mb-6">Hapus <strong className="text-gray-800">{count} pengguna</strong> yang dipilih? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua Peran");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [sortBy, setSortBy] = useState<SortOption>("nama-az");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; data?: UserData }>({ open: false, mode: "add" });
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const ITEMS_PER_PAGE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = users.filter((u) => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
      const matchRole = roleFilter === "Semua Peran" || u.role === roleFilter;
      const matchStatus = statusFilter === "Semua Status" || u.status === statusFilter;
      
      let matchDate = true;
      if (filterDateFrom) matchDate = matchDate && u.joinDateISO >= filterDateFrom;
      if (filterDateTo) matchDate = matchDate && u.joinDateISO <= filterDateTo;
      
      return matchSearch && matchRole && matchStatus && matchDate;
    });
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "nama-az": return a.name.localeCompare(b.name, "id");
        case "nama-za": return b.name.localeCompare(a.name, "id");
        case "bergabung-terbaru": return b.joinDateISO.localeCompare(a.joinDateISO);
        case "bergabung-terlama": return a.joinDateISO.localeCompare(b.joinDateISO);
        default: return 0;
      }
    });
    return result;
  }, [users, search, roleFilter, statusFilter, sortBy, filterDateFrom, filterDateTo]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === "Aktif").length,
    newUsers: users.filter((u) => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return new Date(u.joinDateISO) >= threeMonthsAgo;
    }).length,
    admins: users.filter((u) => u.role === "Admin").length,
  }), [users]);

  function handleSave(data: Omit<UserData, "id">) {
    if (modal.mode === "edit" && modal.data) {
      setUsers((prev) => prev.map((u) => u.id === modal.data!.id ? { ...u, ...data } : u));
      toast.success("Data pengguna berhasil diperbarui");
    } else {
      const newId = `USR-${String(users.length + 1).padStart(3, "0")}`;
      setUsers((prev) => [...prev, { id: newId, ...data }]);
      toast.success("Pengguna baru berhasil ditambahkan");
    }
    setModal({ open: false, mode: "add" });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("Data berhasil dihapus");
  }

  function handleBulkDelete() {
    const count = selectedIds.size;
    setUsers((prev) => prev.filter((u) => !selectedIds.has(u.id)));
    setSelectedIds(new Set());
    setShowBulkDelete(false);
    toast.success(`${count} data berhasil dihapus`);
  }

  function handleExport() {
    exportCSV(filtered);
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

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (paginated.length > 0 && paginated.every((u) => selectedIds.has(u.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((u) => u.id)));
    }
  }

  function goPage(p: number) {
    setCurrentPage(Math.max(1, Math.min(p, totalPages || 1)));
  }

  React.useEffect(() => { setCurrentPage(1); }, [search, roleFilter, statusFilter, sortBy, filterDateFrom, filterDateTo]);

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
          <p className="text-sm text-gray-500 mt-1">Kelola semua pengguna dan tingkat akses mereka</p>
        </div>
        <button onClick={() => setModal({ open: true, mode: "add" })} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors shadow-sm shrink-0">
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Pengguna" value={stats.total} sub="+12 minggu ini" icon={<Users size={18} />} color="#4a7c59" />
        <StatCard label="Pengguna Aktif" value={stats.active} sub={`${stats.total > 0 ? ((stats.active/stats.total)*100).toFixed(1) : 0}% dari total`} icon={<UserCheck size={18} />} color="#16a34a" />
        <StatCard label="Pengguna Baru" value={stats.newUsers} sub="3 bulan terakhir" icon={<UserPlus size={18} />} color="#8b5cf6" />
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
                placeholder="Cari nama, email, ID..." 
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
                {selectedIds.size > 0 && (
                  <button onClick={() => setShowBulkDelete(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 whitespace-nowrap">
                    <Trash2 size={14} /> Hapus ({selectedIds.size})
                  </button>
                )}
                <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap">
                  <Download size={14} /> Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-10 px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={paginated.length > 0 && paginated.every((u) => selectedIds.has(u.id))} 
                    onChange={toggleAll} 
                    className="rounded border-gray-300 accent-[#4a7c59]" 
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">PENGGUNA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">PERAN</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">TANGGAL BERGABUNG</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">TERAKHIR AKTIF</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    Tidak ada data yang ditemukan
                  </td>
                </tr>
              ) : (
                paginated.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50/50 ${selectedIds.has(user.id) ? "bg-green-50/30" : ""}`}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded border-gray-300 accent-[#4a7c59]" />
                    </td>
                    <td className="px-4 py-3.5">
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
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setModal({ open: true, mode: "edit", data: user })} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button 
                          onClick={() => setModal({ open: true, mode: "duplicate", data: user })} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors text-xs font-medium"
                        >
                          <Copy size={13} /> Salin
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(user)} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium"
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
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-gray-100">
          <p className="text-sm text-gray-500 order-2 sm:order-1">
            Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} pengguna
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

      {modal.open && <UserModal mode={modal.mode} initialData={modal.data} onSave={handleSave} onClose={() => setModal({ open: false, mode: "add" })} />}
      {deleteTarget && <DeleteModal name={deleteTarget.name} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
      {showBulkDelete && <BulkDeleteModal count={selectedIds.size} onConfirm={handleBulkDelete} onClose={() => setShowBulkDelete(false)} />}
      {showFilterModal && <FilterModal />}
    </AdminLayout>
  );
}