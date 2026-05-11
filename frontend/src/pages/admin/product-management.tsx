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
  Package,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  ImageOff,
  ChevronDown,
} from "lucide-react";
import { AdminLayout } from "./admin-layout";

type ProductCategory = "Suplemen" | "Alat Kesehatan" | "Herbal" | "MPASI";
type ProductStatus = "Tersedia" | "Habis" | "Stok Rendah";
type SortOption = "nama-az" | "harga-terendah" | "harga-tertinggi" | "stok-terendah";

interface ProductData {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  stock: number;
  price: number;
  status: ProductStatus;
  image?: string;
  description?: string;
}

interface FormData {
  name: string;
  sku: string;
  category: ProductCategory;
  stock: string;
  price: string;
  status: ProductStatus;
  description: string;
}

type ModalMode = "add" | "edit" | "duplicate";

function getPaginationPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function formatRupiah(n: number): string {
  return "Rp" + n.toLocaleString("id-ID");
}

function exportCSV(data: ProductData[]): void {
  const headers = ["ID","SKU","Nama Produk","Kategori","Stok","Harga","Status"];
  const rows = data.map((p) => [p.id, p.sku, p.name, p.category, p.stock, formatRupiah(p.price), p.status]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "manajemen-produk.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const INITIAL_PRODUCTS: ProductData[] = [
  { id:"PRD-001", sku:"NS-SP-001", name:"Vitamin C 1000mg Effervescent", category:"Suplemen", stock:145, price:45000, status:"Tersedia", description:"Suplemen vitamin C untuk meningkatkan imunitas tubuh." },
  { id:"PRD-002", sku:"NS-SP-002", name:"Minyak Ikan Omega-3 Softgel", category:"Suplemen", stock:89, price:85000, status:"Tersedia", description:"Suplemen omega-3 untuk kesehatan jantung dan otak." },
  { id:"PRD-003", sku:"NS-SP-003", name:"Multivitamin Anak Chewable", category:"Suplemen", stock:234, price:65000, status:"Tersedia", description:"Vitamin lengkap untuk tumbuh kembang anak." },
  { id:"PRD-004", sku:"NS-SP-004", name:"Zinc Tablet 20mg", category:"Suplemen", stock:178, price:38000, status:"Tersedia", description:"Suplemen zinc untuk mendukung sistem imun." },
  { id:"PRD-005", sku:"NS-SP-005", name:"Probiotik Premium 30 Kapsul", category:"Suplemen", stock:7, price:125000, status:"Stok Rendah", description:"Probiotik untuk menjaga kesehatan saluran cerna." },
  { id:"PRD-006", sku:"NS-AK-001", name:"Tensimeter Digital Otomatis", category:"Alat Kesehatan", stock:56, price:350000, status:"Tersedia", description:"Alat ukur tekanan darah digital yang akurat." },
  { id:"PRD-007", sku:"NS-AK-002", name:"Termometer Infrared", category:"Alat Kesehatan", stock:34, price:180000, status:"Tersedia", description:"Termometer tanpa sentuh dengan hasil akurat." },
  { id:"PRD-008", sku:"NS-AK-003", name:"Timbangan Badan Digital", category:"Alat Kesehatan", stock:0, price:225000, status:"Habis", description:"Timbangan digital presisi tinggi." },
  { id:"PRD-009", sku:"NS-AK-004", name:"Pulse Oximeter Fingertip", category:"Alat Kesehatan", stock:12, price:155000, status:"Tersedia", description:"Alat pengukur saturasi oksigen darah." },
  { id:"PRD-010", sku:"NS-AK-005", name:"Nebulizer Portable Mesh", category:"Alat Kesehatan", stock:3, price:285000, status:"Stok Rendah", description:"Nebulizer portable untuk terapi pernafasan." },
  { id:"PRD-011", sku:"NS-HB-001", name:"Teh Herbal Jahe Merah", category:"Herbal", stock:8, price:25000, status:"Stok Rendah", description:"Teh herbal dari jahe merah pilihan." },
  { id:"PRD-012", sku:"NS-HB-002", name:"Madu Hutan Murni 500ml", category:"Herbal", stock:0, price:89000, status:"Habis", description:"Madu hutan asli murni tanpa campuran." },
  { id:"PRD-013", sku:"NS-HB-003", name:"Kapsul Kunyit Temulawak", category:"Herbal", stock:192, price:42000, status:"Tersedia", description:"Suplemen herbal dari kunyit dan temulawak." },
  { id:"PRD-014", sku:"NS-HB-004", name:"Ekstrak Daun Kelor Organik", category:"Herbal", stock:67, price:55000, status:"Tersedia", description:"Suplemen dari daun kelor organik bersertifikat." },
  { id:"PRD-015", sku:"NS-MP-001", name:"Bubur Bayi Organik Multigrain", category:"MPASI", stock:28, price:35000, status:"Tersedia", description:"MPASI bergizi untuk bayi 6 bulan ke atas." },
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

function ProductImage({ product }: { product: ProductData }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
        {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <ImageOff size={16} className="text-gray-400" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[140px] md:max-w-[200px]">{product.name}</p>
        <p className="text-xs text-gray-500">{product.sku}</p>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: ProductCategory }) {
  const styles: Record<ProductCategory, string> = {
    Suplemen: "bg-blue-100 text-blue-700 border border-blue-200",
    "Alat Kesehatan": "bg-purple-100 text-purple-700 border border-purple-200",
    Herbal: "bg-green-100 text-green-700 border border-green-200",
    MPASI: "bg-orange-100 text-orange-700 border border-orange-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${styles[category]}`}>
      {category}
    </span>
  );
}

function StockStatus({ status }: { status: ProductStatus }) {
  if (status === "Tersedia") return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
      <span className="w-2 h-2 rounded-full bg-green-500" />Tersedia
    </span>
  );
  if (status === "Stok Rendah") return (
    <span className="inline-flex items-center gap-1.5 text-sm text-amber-600">
      <span className="w-2 h-2 rounded-full bg-amber-400" />Stok Rendah
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-red-600">
      <span className="w-2 h-2 rounded-full bg-red-500" />Habis
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

function ProductModal({ mode, initialData, onSave, onClose }: { mode: ModalMode; initialData?: ProductData; onSave: (data: Omit<ProductData, "id">) => void; onClose: () => void }) {
  const [form, setForm] = useState<FormData>({
    name: initialData?.name ?? "",
    sku: initialData?.sku ?? "",
    category: initialData?.category ?? "Suplemen",
    stock: String(initialData?.stock ?? 0),
    price: String(initialData?.price ?? 0),
    status: initialData?.status ?? "Tersedia",
    description: initialData?.description ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const title = mode === "add" ? "Tambah Produk Baru" : mode === "edit" ? "Edit Produk" : "Duplikasi Produk";

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = "Nama produk wajib diisi";
    if (!form.sku.trim()) e.sku = "SKU wajib diisi";
    if (isNaN(Number(form.price)) || Number(form.price) < 0) e.price = "Harga tidak valid";
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Stok tidak valid";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ name: form.name, sku: form.sku, category: form.category, stock: Number(form.stock), price: Number(form.price), status: form.status, description: form.description, image: initialData?.image });
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Produk <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Nama produk" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">SKU <span className="text-red-500">*</span></label>
            <input type="text" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className={inputCls} placeholder="NS-SP-001" />
            {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProductCategory }))} className={inputCls + " bg-white"}>
                <option value="Suplemen">Suplemen</option>
                <option value="Alat Kesehatan">Alat Kesehatan</option>
                <option value="Herbal">Herbal</option>
                <option value="MPASI">MPASI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProductStatus }))} className={inputCls + " bg-white"}>
                <option value="Tersedia">Tersedia</option>
                <option value="Stok Rendah">Stok Rendah</option>
                <option value="Habis">Habis</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stok</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className={inputCls} />
              {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga (Rp)</label>
              <input type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputCls} />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className={inputCls + " resize-none"} placeholder="Deskripsi produk..." />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors">
              {mode === "edit" ? "Simpan Perubahan" : "Tambahkan"}
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
        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Produk</h3>
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
        <p className="text-sm text-gray-500 mb-6">Hapus <strong className="text-gray-800">{count} produk</strong> yang dipilih? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductManagement() {
  const [products, setProducts] = useState<ProductData[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [sortBy, setSortBy] = useState<SortOption>("nama-az");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; data?: ProductData }>({ open: false, mode: "add" });
  const [deleteTarget, setDeleteTarget] = useState<ProductData | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStockMin, setFilterStockMin] = useState("");
  const [filterStockMax, setFilterStockMax] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");

  const ITEMS_PER_PAGE = 10;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = products.filter((p) => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      const matchCategory = categoryFilter === "Semua Kategori" || p.category === categoryFilter;
      const matchStatus = statusFilter === "Semua Status" || p.status === statusFilter;
      
      let matchStock = true;
      if (filterStockMin && !isNaN(Number(filterStockMin))) matchStock = matchStock && p.stock >= Number(filterStockMin);
      if (filterStockMax && !isNaN(Number(filterStockMax))) matchStock = matchStock && p.stock <= Number(filterStockMax);
      
      let matchPrice = true;
      if (filterPriceMin && !isNaN(Number(filterPriceMin))) matchPrice = matchPrice && p.price >= Number(filterPriceMin);
      if (filterPriceMax && !isNaN(Number(filterPriceMax))) matchPrice = matchPrice && p.price <= Number(filterPriceMax);
      
      return matchSearch && matchCategory && matchStatus && matchStock && matchPrice;
    });
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "nama-az": return a.name.localeCompare(b.name, "id");
        case "harga-terendah": return a.price - b.price;
        case "harga-tertinggi": return b.price - a.price;
        case "stok-terendah": return a.stock - b.stock;
        default: return 0;
      }
    });
    return result;
  }, [products, search, categoryFilter, statusFilter, sortBy, filterStockMin, filterStockMax, filterPriceMin, filterPriceMax]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const stats = useMemo(() => ({ 
    total: products.length, 
    available: products.filter((p) => p.status === "Tersedia").length, 
    lowStock: products.filter((p) => p.status === "Stok Rendah").length, 
    outOfStock: products.filter((p) => p.status === "Habis").length,
  }), [products]);

  function handleSave(data: Omit<ProductData, "id">) {
    if (modal.mode === "edit" && modal.data) { 
      setProducts((prev) => prev.map((p) => p.id === modal.data!.id ? { ...p, ...data } : p)); 
      toast.success("Data produk berhasil diperbarui"); 
    } else { 
      const newId = `PRD-${String(products.length + 1).padStart(3, "0")}`; 
      setProducts((prev) => [...prev, { id: newId, ...data }]); 
      toast.success("Produk baru berhasil ditambahkan"); 
    }
    setModal({ open: false, mode: "add" });
  }

  function handleDelete() { 
    if (!deleteTarget) return; 
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id)); 
    setDeleteTarget(null); 
    toast.success("Produk berhasil dihapus"); 
  }

  function handleBulkDelete() { 
    const count = selectedIds.size; 
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id))); 
    setSelectedIds(new Set()); 
    setShowBulkDelete(false); 
    toast.success(`${count} produk berhasil dihapus`); 
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
    if (paginated.length > 0 && paginated.every((p) => selectedIds.has(p.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((p) => p.id)));
    }
  }

  function goPage(p: number) { 
    setCurrentPage(Math.max(1, Math.min(p, totalPages || 1))); 
  }

  React.useEffect(() => { 
    setCurrentPage(1); 
  }, [search, categoryFilter, statusFilter, sortBy, filterStockMin, filterStockMax, filterPriceMin, filterPriceMax]);

  const FilterModal = () => {
    const [localStockMin, setLocalStockMin] = useState(filterStockMin);
    const [localStockMax, setLocalStockMax] = useState(filterStockMax);
    const [localPriceMin, setLocalPriceMin] = useState(filterPriceMin);
    const [localPriceMax, setLocalPriceMax] = useState(filterPriceMax);

    const handleApply = () => {
      setFilterStockMin(localStockMin);
      setFilterStockMax(localStockMax);
      setFilterPriceMin(localPriceMin);
      setFilterPriceMax(localPriceMax);
      setShowFilterModal(false);
      toast.success("Filter diterapkan");
    };

    const handleReset = () => {
      setLocalStockMin("");
      setLocalStockMax("");
      setLocalPriceMin("");
      setLocalPriceMax("");
      setFilterStockMin("");
      setFilterStockMax("");
      setFilterPriceMin("");
      setFilterPriceMax("");
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rentang Stok</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={localStockMin} onChange={(e) => setLocalStockMin(e.target.value)} placeholder="Min (contoh: 10)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
                <input type="text" value={localStockMax} onChange={(e) => setLocalStockMax(e.target.value)} placeholder="Max (contoh: 1000)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rentang Harga (Rp)</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={localPriceMin} onChange={(e) => setLocalPriceMin(e.target.value)} placeholder="Min (contoh: 10000)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
                <input type="text" value={localPriceMax} onChange={(e) => setLocalPriceMax(e.target.value)} placeholder="Max (contoh: 500000)" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
              </div>
            </div>
            <p className="text-xs text-gray-400">*Masukkan angka berapa saja, contoh: 10000 atau 10000000</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola semua produk NutriShop</p>
        </div>
        <button onClick={() => setModal({ open: true, mode: "add" })} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors shadow-sm shrink-0">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Produk" value={stats.total} sub="Semua produk" icon={<Package size={18} />} color="#4a7c59" />
        <StatCard label="Tersedia" value={stats.available} sub={`${stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(1) : 0}% dari total`} icon={<CheckCircle size={18} />} color="#16a34a" />
        <StatCard label="Stok Rendah" value={stats.lowStock} sub={`${stats.total > 0 ? ((stats.lowStock / stats.total) * 100).toFixed(1) : 0}% dari total`} icon={<AlertTriangle size={18} />} color="#f59e0b" />
        <StatCard label="Habis" value={stats.outOfStock} sub={`${stats.total > 0 ? ((stats.outOfStock / stats.total) * 100).toFixed(1) : 0}% dari total`} icon={<TrendingUp size={18} />} color="#ef4444" />
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
                placeholder="Cari produk, SKU..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#4a7c59]/25 focus:border-[#4a7c59]" 
              />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectCls}>
                  <option>Semua Kategori</option>
                  <option>Suplemen</option>
                  <option>Alat Kesehatan</option>
                  <option>Herbal</option>
                  <option>MPASI</option>
                </select>
              </SelectWrapper>

              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
                  <option>Semua Status</option>
                  <option>Tersedia</option>
                  <option>Stok Rendah</option>
                  <option>Habis</option>
                </select>
              </SelectWrapper>

              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className={selectCls}>
                  <option value="nama-az">Nama A-Z</option>
                  <option value="harga-terendah">Harga Terendah</option>
                  <option value="harga-tertinggi">Harga Tertinggi</option>
                  <option value="stok-terendah">Stok Terendah</option>
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
                    checked={paginated.length > 0 && paginated.every((p) => selectedIds.has(p.id))} 
                    onChange={toggleAll} 
                    className="rounded border-gray-300 accent-[#4a7c59]" 
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">PRODUK</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">KATEGORI</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">STOK</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">HARGA</th>
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
                paginated.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50/50 ${selectedIds.has(product.id) ? "bg-green-50/30" : ""}`}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} className="rounded border-gray-300 accent-[#4a7c59]" />
                    </td>
                    <td className="px-4 py-3.5">
                      <ProductImage product={product} />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <CategoryBadge category={product.category} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-700 font-medium">{product.stock}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-gray-700 font-medium whitespace-nowrap">{formatRupiah(product.price)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StockStatus status={product.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setModal({ open: true, mode: "edit", data: product })} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button 
                          onClick={() => setModal({ open: true, mode: "duplicate", data: product })} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors text-xs font-medium"
                        >
                          <Copy size={13} /> Salin
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(product)} 
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
            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} produk
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

      {modal.open && <ProductModal mode={modal.mode} initialData={modal.data} onSave={handleSave} onClose={() => setModal({ open: false, mode: "add" })} />}
      {deleteTarget && <DeleteModal name={deleteTarget.name} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
      {showBulkDelete && <BulkDeleteModal count={selectedIds.size} onConfirm={handleBulkDelete} onClose={() => setShowBulkDelete(false)} />}
      {showFilterModal && <FilterModal />}
    </AdminLayout>
  );
}