// nutritionist-management.tsx
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  Search, Download, Plus, Edit2, Copy, Trash2, 
  ChevronLeft, ChevronRight, X, Users, CheckCircle, 
  Calendar, Clock, AlertTriangle, Filter, ChevronDown 
} from "lucide-react";
import { AdminLayout } from "./admin-layout";

type Specialization = "Gizi Anak" | "Diet" | "Olahraga" | "Gizi Klinis" | "Gizi Ibu Hamil";
type NutritionistStatus = "Tersedia" | "Tidak Tersedia";
type SortOption = "nama-az" | "pengalaman-terbanyak" | "pengalaman-tersedikit";

interface NutritionistData {
  id: string;
  nid: string;
  name: string;
  specialization: Specialization;
  strNumber: string;
  experience: string;
  experienceYears: number;
  status: NutritionistStatus;
  avatar?: string;
  email?: string;
  phone?: string;
}

interface FormData { 
  name: string; 
  nid: string; 
  specialization: Specialization; 
  strNumber: string; 
  experienceYears: string; 
  status: NutritionistStatus; 
  email: string; 
  phone: string; 
}

type ModalMode = "add" | "edit" | "duplicate";

const AVATAR_COLORS = ["#4a7c59","#3b82f6","#8b5cf6","#f97316","#ec4899","#14b8a6","#f59e0b","#ef4444"];

function getInitials(name: string): string { 
  return name.replace(/^Dr\.\s*/i, "").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase(); 
}

function getAvatarColor(name: string): string { 
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0); 
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]; 
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

function exportCSV(data: NutritionistData[]): void {
  const headers = ["ID","NID","Nama","Spesialisasi","No. STR","Pengalaman","Status","Email","Telepon"];
  const rows = data.map((n) => [n.id, n.nid, n.name, n.specialization, n.strNumber, n.experience, n.status, n.email ?? "", n.phone ?? ""]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "manajemen-ahli-gizi.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const INITIAL_NUTRITIONISTS: NutritionistData[] = [
  { id:"NUT-001", nid:"NUT-001", name:"Dr. Amelia Sari, SpGK", specialization:"Gizi Anak", strNumber:"889900122", experience:"7 tahun", experienceYears:7, status:"Tersedia", email:"amelia.sari@nutrigrow.id", phone:"+62 812-1111-0001" },
  { id:"NUT-002", nid:"NUT-002", name:"Dr. Bambang Susilo, SpGK", specialization:"Diet", strNumber:"889910233", experience:"9 tahun", experienceYears:9, status:"Tersedia", email:"bambang.s@nutrigrow.id", phone:"+62 812-1111-0002" },
  { id:"NUT-003", nid:"NUT-003", name:"Dr. Citra Dewi, SpGK", specialization:"Olahraga", strNumber:"889920344", experience:"6 tahun", experienceYears:6, status:"Tidak Tersedia", email:"citra.dewi@nutrigrow.id", phone:"+62 812-1111-0003" },
  { id:"NUT-004", nid:"NUT-004", name:"Dr. Diana Putri, MGizi", specialization:"Gizi Ibu Hamil", strNumber:"889930455", experience:"4 tahun", experienceYears:4, status:"Tersedia", email:"diana.putri@nutrigrow.id", phone:"+62 812-1111-0004" },
  { id:"NUT-005", nid:"NUT-005", name:"Dr. Eko Prasetyo, SpGK", specialization:"Diet", strNumber:"889940566", experience:"11 tahun", experienceYears:11, status:"Tersedia", email:"eko.p@nutrigrow.id", phone:"+62 812-1111-0005" },
  { id:"NUT-006", nid:"NUT-006", name:"Dr. Fitria Handayani, MGizi", specialization:"Olahraga", strNumber:"889950677", experience:"3 tahun", experienceYears:3, status:"Tidak Tersedia", email:"fitria.h@nutrigrow.id", phone:"+62 812-1111-0006" },
  { id:"NUT-007", nid:"NUT-007", name:"Dr. Galih Santoso, SpGK", specialization:"Gizi Anak", strNumber:"889960788", experience:"8 tahun", experienceYears:8, status:"Tersedia", email:"galih.s@nutrigrow.id", phone:"+62 812-1111-0007" },
  { id:"NUT-008", nid:"NUT-008", name:"Dr. Hani Kusumawati, MGizi", specialization:"Diet", strNumber:"889970899", experience:"5 tahun", experienceYears:5, status:"Tersedia", email:"hani.k@nutrigrow.id", phone:"+62 812-1111-0008" },
  { id:"NUT-009", nid:"NUT-009", name:"Dr. Ivan Permana, SpGK", specialization:"Olahraga", strNumber:"889980910", experience:"12 tahun", experienceYears:12, status:"Tersedia", email:"ivan.p@nutrigrow.id", phone:"+62 812-1111-0009" },
  { id:"NUT-010", nid:"NUT-010", name:"Dr. Jasmine Putri, MGizi", specialization:"Gizi Anak", strNumber:"889991011", experience:"2 tahun", experienceYears:2, status:"Tidak Tersedia", email:"jasmine.p@nutrigrow.id", phone:"+62 812-1111-0010" },
  { id:"NUT-011", nid:"NUT-011", name:"Dr. Kevin Hartanto, SpGK", specialization:"Gizi Klinis", strNumber:"889101122", experience:"10 tahun", experienceYears:10, status:"Tersedia", email:"kevin.h@nutrigrow.id", phone:"+62 812-1111-0011" },
  { id:"NUT-012", nid:"NUT-012", name:"Dr. Laila Siti, MGizi", specialization:"Olahraga", strNumber:"889111233", experience:"6 tahun", experienceYears:6, status:"Tersedia", email:"laila.s@nutrigrow.id", phone:"+62 812-1111-0012" },
  { id:"NUT-013", nid:"NUT-013", name:"Dr. Mira Anjani, SpGK", specialization:"Gizi Anak", strNumber:"889121344", experience:"7 tahun", experienceYears:7, status:"Tersedia", email:"mira.a@nutrigrow.id", phone:"+62 812-1111-0013" },
  { id:"NUT-014", nid:"NUT-014", name:"Dr. Naufal Hakim, MGizi", specialization:"Diet", strNumber:"889131455", experience:"3 tahun", experienceYears:3, status:"Tidak Tersedia", email:"naufal.h@nutrigrow.id", phone:"+62 812-1111-0014" },
  { id:"NUT-015", nid:"NUT-015", name:"Dr. Olivia Sari, SpGK", specialization:"Olahraga", strNumber:"889141566", experience:"9 tahun", experienceYears:9, status:"Tersedia", email:"olivia.s@nutrigrow.id", phone:"+62 812-1111-0015" },
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

function AvatarCell({ nutri }: { nutri: NutritionistData }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: getAvatarColor(nutri.name) }}>
        {getInitials(nutri.name)}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[140px] md:max-w-[200px]">{nutri.name}</p>
        <p className="text-xs text-gray-500">{nutri.nid}</p>
      </div>
    </div>
  );
}

function SpecializationBadge({ spec }: { spec: Specialization }) {
  const styles: Record<Specialization, string> = { 
    "Gizi Anak": "bg-pink-100 text-pink-700 border border-pink-200", 
    Diet: "bg-blue-100 text-blue-700 border border-blue-200", 
    Olahraga: "bg-green-100 text-green-700 border border-green-200", 
    "Gizi Klinis": "bg-purple-100 text-purple-700 border border-purple-200", 
    "Gizi Ibu Hamil": "bg-orange-100 text-orange-700 border border-orange-200" 
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles[spec]}`}>
      {spec}
    </span>
  );
}

function NutriStatus({ status }: { status: NutritionistStatus }) {
  return status === "Tersedia" ? (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
      <span className="w-2 h-2 rounded-full bg-green-500" />Tersedia
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
      <span className="w-2 h-2 rounded-full bg-gray-400" />Tidak Tersedia
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

function NutriModal({ mode, initialData, onSave, onClose }: { mode: ModalMode; initialData?: NutritionistData; onSave: (data: Omit<NutritionistData, "id">) => void; onClose: () => void }) {
  const [form, setForm] = useState<FormData>({ 
    name: initialData?.name ?? "", 
    nid: initialData?.nid ?? "", 
    specialization: initialData?.specialization ?? "Gizi Anak", 
    strNumber: initialData?.strNumber ?? "", 
    experienceYears: String(initialData?.experienceYears ?? 1), 
    status: initialData?.status ?? "Tersedia", 
    email: initialData?.email ?? "", 
    phone: initialData?.phone ?? "" 
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const title = mode === "add" ? "Tambah Ahli Gizi Baru" : mode === "edit" ? "Edit Ahli Gizi" : "Duplikasi Ahli Gizi";
  
  function validate(): boolean { 
    const e: Partial<Record<keyof FormData, string>> = {}; 
    if (!form.name.trim()) e.name = "Nama wajib diisi"; 
    if (!form.nid.trim()) e.nid = "NID wajib diisi"; 
    if (!form.strNumber.trim()) e.strNumber = "No. STR wajib diisi"; 
    if (!form.email.trim()) e.email = "Email wajib diisi"; 
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email tidak valid"; 
    setErrors(e); 
    return Object.keys(e).length === 0; 
  }
  
  function handleSubmit(e: React.FormEvent) { 
    e.preventDefault(); 
    if (!validate()) return; 
    const years = Math.max(1, parseInt(form.experienceYears) || 1); 
    onSave({ 
      nid: form.nid, 
      name: form.name, 
      specialization: form.specialization, 
      strNumber: form.strNumber, 
      experience: `${years} tahun`, 
      experienceYears: years, 
      status: form.status, 
      email: form.email, 
      phone: form.phone, 
      avatar: initialData?.avatar 
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
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Dr. Nama Lengkap, SpGK" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">NID <span className="text-red-500">*</span></label>
              <input type="text" value={form.nid} onChange={(e) => setForm((f) => ({ ...f, nid: e.target.value }))} className={inputCls} placeholder="NUT-001" />
              {errors.nid && <p className="mt-1 text-xs text-red-500">{errors.nid}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. STR <span className="text-red-500">*</span></label>
              <input type="text" value={form.strNumber} onChange={(e) => setForm((f) => ({ ...f, strNumber: e.target.value }))} className={inputCls} placeholder="889900122" />
              {errors.strNumber && <p className="mt-1 text-xs text-red-500">{errors.strNumber}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Spesialisasi</label>
              <select value={form.specialization} onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value as Specialization }))} className={inputCls + " bg-white"}>
                <option value="Gizi Anak">Gizi Anak</option>
                <option value="Diet">Diet</option>
                <option value="Olahraga">Olahraga</option>
                <option value="Gizi Klinis">Gizi Klinis</option>
                <option value="Gizi Ibu Hamil">Gizi Ibu Hamil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as NutritionistStatus }))} className={inputCls + " bg-white"}>
                <option value="Tersedia">Tersedia</option>
                <option value="Tidak Tersedia">Tidak Tersedia</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pengalaman (tahun)</label>
            <input type="number" min="0" value={form.experienceYears} onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))} className={inputCls} placeholder="1" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="dokter@nutrigrow.id" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nomor Telepon</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+62 812-xxxx-xxxx" />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors">
              {mode === "edit" ? "Simpan Perubahan" : "Tambah Ahli Gizi"}
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
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} className="text-red-500" /></div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Ahli Gizi</h3>
        <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus <strong className="text-gray-800">{name}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3"><button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button><button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Ya, Hapus</button></div>
      </div>
    </div>
  );
}

function BulkDeleteModal({ count, onConfirm, onClose }: { count: number; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} className="text-red-500" /></div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Data Terpilih</h3>
        <p className="text-sm text-gray-500 mb-6">Hapus <strong className="text-gray-800">{count} ahli gizi</strong> yang dipilih? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3"><button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button><button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Ya, Hapus</button></div>
      </div>
    </div>
  );
}

export default function NutritionistManagement() {
  const [nutritionists, setNutritionists] = useState<NutritionistData[]>(INITIAL_NUTRITIONISTS);
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("Semua Spesialisasi");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [sortBy, setSortBy] = useState<SortOption>("nama-az");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; data?: NutritionistData }>({ open: false, mode: "add" });
  const [deleteTarget, setDeleteTarget] = useState<NutritionistData | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterExpMin, setFilterExpMin] = useState("");
  const [filterExpMax, setFilterExpMax] = useState("");

  const ITEMS_PER_PAGE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = nutritionists.filter((n) => {
      const matchSearch = !q || n.name.toLowerCase().includes(q) || n.nid.toLowerCase().includes(q) || (n.email ?? "").toLowerCase().includes(q);
      const matchSpec = specFilter === "Semua Spesialisasi" || n.specialization === specFilter;
      const matchStatus = statusFilter === "Semua Status" || n.status === statusFilter;
      let matchExp = true;
      if (filterExpMin && !isNaN(Number(filterExpMin))) matchExp = matchExp && n.experienceYears >= Number(filterExpMin);
      if (filterExpMax && !isNaN(Number(filterExpMax))) matchExp = matchExp && n.experienceYears <= Number(filterExpMax);
      return matchSearch && matchSpec && matchStatus && matchExp;
    });
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "nama-az": return a.name.localeCompare(b.name, "id");
        case "pengalaman-terbanyak": return b.experienceYears - a.experienceYears;
        case "pengalaman-tersedikit": return a.experienceYears - b.experienceYears;
        default: return 0;
      }
    });
    return result;
  }, [nutritionists, search, specFilter, statusFilter, sortBy, filterExpMin, filterExpMax]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const stats = useMemo(() => ({ 
    total: nutritionists.length, 
    available: nutritionists.filter((n) => n.status === "Tersedia").length, 
    avgExp: nutritionists.length ? (nutritionists.reduce((s, n) => s + n.experienceYears, 0) / nutritionists.length).toFixed(1) : "0", 
    specs: new Set(nutritionists.map((n) => n.specialization)).size,
  }), [nutritionists]);

  function handleSave(data: Omit<NutritionistData, "id">) { 
    if (modal.mode === "edit" && modal.data) { 
      setNutritionists((prev) => prev.map((n) => n.id === modal.data!.id ? { ...n, ...data } : n)); 
      toast.success("Data ahli gizi berhasil diperbarui"); 
    } else { 
      const newId = `NUT-${String(nutritionists.length + 1).padStart(3, "0")}`; 
      setNutritionists((prev) => [...prev, { id: newId, ...data }]); 
      toast.success("Ahli gizi baru berhasil ditambahkan"); 
    } 
    setModal({ open: false, mode: "add" }); 
  }
  
  function handleDelete() { 
    if (!deleteTarget) return; 
    setNutritionists((prev) => prev.filter((n) => n.id !== deleteTarget.id)); 
    setDeleteTarget(null); 
    toast.success("Data berhasil dihapus"); 
  }
  
  function handleBulkDelete() { 
    const count = selectedIds.size; 
    setNutritionists((prev) => prev.filter((n) => !selectedIds.has(n.id))); 
    setSelectedIds(new Set()); 
    setShowBulkDelete(false); 
    toast.success(`${count} data berhasil dihapus`); 
  }
  
  function handleExport() { 
    exportCSV(filtered); 
    toast.success("Export berhasil"); 
  }
  
  function toggleSelect(id: string) { 
    setSelectedIds((prev) => { 
      const next = new Set(prev); 
      next.has(id) ? next.delete(id) : next.add(id); 
      return next; 
    }); 
  }
  
  function toggleAll() { 
    if (paginated.length > 0 && paginated.every((n) => selectedIds.has(n.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((n) => n.id)));
    }
  }
  
  function goPage(p: number) { 
    setCurrentPage(Math.max(1, Math.min(p, totalPages || 1))); 
  }
  
  React.useEffect(() => { 
    setCurrentPage(1); 
  }, [search, specFilter, statusFilter, sortBy, filterExpMin, filterExpMax]);

  const FilterModal = () => {
    const [localExpMin, setLocalExpMin] = useState(filterExpMin);
    const [localExpMax, setLocalExpMax] = useState(filterExpMax);

    const handleApply = () => {
      setFilterExpMin(localExpMin);
      setFilterExpMax(localExpMax);
      setShowFilterModal(false);
      toast.success("Filter diterapkan");
    };

    const handleReset = () => {
      setLocalExpMin("");
      setLocalExpMax("");
      setFilterExpMin("");
      setFilterExpMax("");
      setShowFilterModal(false);
      toast.success("Filter direset");
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowFilterModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Filter Lanjutan</h3>
            <button onClick={() => setShowFilterModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rentang Pengalaman (tahun)</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={localExpMin} onChange={(e) => setLocalExpMin(e.target.value)} placeholder="Min (contoh: 3)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
                <input type="text" value={localExpMax} onChange={(e) => setLocalExpMax(e.target.value)} placeholder="Max (contoh: 15)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
              </div>
            </div>
            <p className="text-xs text-gray-400">*Masukkan angka berapa saja, contoh: 5 atau 12</p>
          </div>
          <div className="flex gap-3 p-5 pt-0">
            <button onClick={handleReset} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Reset</button>
            <button onClick={handleApply} className="flex-1 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849]">Terapkan</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <style>{OPTION_STYLE}</style>
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Ahli Gizi</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola semua ahli gizi Tele-Nutritionist</p>
        </div>
        <button onClick={() => setModal({ open: true, mode: "add" })} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors shadow-sm shrink-0">
          <Plus size={16} /> Tambah Ahli Gizi
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Ahli Gizi" value={stats.total} sub="Terdaftar" icon={<Users size={18} />} color="#4a7c59" />
        <StatCard label="Tersedia" value={stats.available} sub={`${stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(1) : 0}% dari total`} icon={<CheckCircle size={18} />} color="#16a34a" />
        <StatCard label="Rata-rata Exp." value={`${stats.avgExp} th`} sub="Pengalaman rata-rata" icon={<Clock size={18} />} color="#8b5cf6" />
        <StatCard label="Spesialisasi" value={stats.specs} sub="Bidang keahlian" icon={<Calendar size={18} />} color="#f97316" />
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
                placeholder="Cari nama, NID, email..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#4a7c59]/25 focus:border-[#4a7c59]" 
              />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)} className={selectCls}>
                  <option>Semua Spesialisasi</option>
                  <option>Gizi Anak</option>
                  <option>Diet</option>
                  <option>Olahraga</option>
                  <option>Gizi Klinis</option>
                  <option>Gizi Ibu Hamil</option>
                </select>
              </SelectWrapper>

              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
                  <option>Semua Status</option>
                  <option>Tersedia</option>
                  <option>Tidak Tersedia</option>
                </select>
              </SelectWrapper>

              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className={selectCls}>
                  <option value="nama-az">Nama A-Z</option>
                  <option value="pengalaman-terbanyak">Pengalaman Terbanyak</option>
                  <option value="pengalaman-tersedikit">Pengalaman Tersedikit</option>
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
                    checked={paginated.length > 0 && paginated.every((n) => selectedIds.has(n.id))} 
                    onChange={toggleAll} 
                    className="rounded border-gray-300 accent-[#4a7c59]" 
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">AHLI GIZI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">SPESIALISASI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">NO. STR</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">PENGALAMAN</th>
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
                paginated.map((nutri) => (
                  <tr key={nutri.id} className={`hover:bg-gray-50/50 ${selectedIds.has(nutri.id) ? "bg-green-50/30" : ""}`}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selectedIds.has(nutri.id)} onChange={() => toggleSelect(nutri.id)} className="rounded border-gray-300 accent-[#4a7c59]" />
                    </td>
                    <td className="px-4 py-3.5">
                      <AvatarCell nutri={nutri} />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <SpecializationBadge spec={nutri.specialization} />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-gray-600 font-mono">{nutri.strNumber}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-700 font-medium whitespace-nowrap">{nutri.experience}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <NutriStatus status={nutri.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setModal({ open: true, mode: "edit", data: nutri })} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button 
                          onClick={() => setModal({ open: true, mode: "duplicate", data: nutri })} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors text-xs font-medium"
                        >
                          <Copy size={13} /> Salin
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(nutri)} 
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
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} ahli gizi
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

      {modal.open && <NutriModal mode={modal.mode} initialData={modal.data} onSave={handleSave} onClose={() => setModal({ open: false, mode: "add" })} />}
      {deleteTarget && <DeleteModal name={deleteTarget.name} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
      {showBulkDelete && <BulkDeleteModal count={selectedIds.size} onConfirm={handleBulkDelete} onClose={() => setShowBulkDelete(false)} />}
      {showFilterModal && <FilterModal />}
    </AdminLayout>
  );
}