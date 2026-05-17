import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  Download,
  Plus,
  Edit2,
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
  Loader2,
} from "lucide-react";
import { AdminLayout } from "./admin-layout";
import { adminService, type Product } from "../../services/admin.service";

type ProductCategory = "Suplemen" | "Alat Kesehatan" | "Herbal" | "MPASI";
type ProductStatus = "Tersedia" | "Habis" | "Stok Rendah";
type SortOption = "nama-az" | "harga-terendah" | "harga-tertinggi" | "stok-terendah";

interface ProductData {
  id: string;
  rawId: number;
  name: string;
  category: ProductCategory;
  stock: number;
  price: number;
  status: ProductStatus;
  image?: string;
  description?: string;
}

interface FormDataState {
  name: string;
  category: ProductCategory;
  stock: string;
  price: string;
  description: string;
}

type ModalMode = "add" | "edit";

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
  const headers = ["ID","Nama Produk","Kategori","Stok","Harga","Status","Deskripsi"];
  const rows = data.map((p) => [p.id, p.name, p.category, p.stock, formatRupiah(p.price), p.status, p.description || ""]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "manajemen-produk.csv";
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

function ProductImage({ product }: { product: ProductData }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
        {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <ImageOff size={16} className="text-gray-400" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[140px] md:max-w-[200px]">{product.name}</p>
        <p className="text-xs text-gray-500">{product.id}</p>
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${styles[category]}`}>
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

function ProductModal({ mode, initialData, onSave, onClose }: { mode: ModalMode; initialData?: ProductData; onSave: (formData: any) => void; onClose: () => void }) {
  const [form, setForm] = useState<FormDataState>({
    name: initialData?.name ?? "",
    category: initialData?.category ?? "Suplemen",
    stock: String(initialData?.stock ?? 0),
    price: String(initialData?.price ?? 0),
    description: initialData?.description ?? "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormDataState, string>>>({});
  const title = mode === "add" ? "Tambah Produk Baru" : "Edit Produk";

  function validate(): boolean {
    const e: Partial<Record<keyof FormDataState, string>> = {};
    if (!form.name.trim()) e.name = "Nama produk wajib diisi";
    if (isNaN(Number(form.price)) || Number(form.price) < 0) e.price = "Harga tidak valid";
    if (isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Stok tidak valid";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Map Category name to Backend enum category
    const mapCategory = (cat: ProductCategory) => {
      switch (cat) {
        case "Suplemen": return "SUPLEMEN";
        case "Alat Kesehatan": return "ALAT";
        case "Herbal": return "PAKET";
        case "MPASI": return "MPASI";
      }
    };

    const data = new FormData();
    data.append("namaProduk", form.name);
    data.append("deskripsi", form.description);
    data.append("kategori", mapCategory(form.category));
    data.append("harga", form.price);
    data.append("stok", form.stock);
    data.append("isActive", "true");
    if (imageFile) {
      data.append("gambar", imageFile);
    }

    onSave(data);
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
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Contoh: Vitamin C Effervescent" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gambar Produk</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-[#4a7c59] hover:file:bg-green-100 cursor-pointer border border-gray-300 rounded-lg p-1" />
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
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className={inputCls + " resize-none"} placeholder="Masukkan deskripsi khasiat produk..." />
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
        <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menonaktifkan/menghapus produk <strong className="text-gray-800">{name}</strong>? Pembeli tidak akan melihat produk ini.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductManagement() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [sortBy, setSortBy] = useState<SortOption>("nama-az");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ total: 0, available: 0, lowStock: 0, outOfStock: 0 });
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; data?: ProductData }>({ open: false, mode: "add" });
  const [deleteTarget, setDeleteTarget] = useState<ProductData | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [filterStockMin, setFilterStockMin] = useState("");
  const [filterStockMax, setFilterStockMax] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");

  const ITEMS_PER_PAGE = 10;

  const mapBackendProduct = (p: Product): ProductData => {
    // Map backend categories
    const mapCategoryName = (c: string): ProductCategory => {
      switch (c) {
        case "SUPLEMEN": return "Suplemen";
        case "ALAT": return "Alat Kesehatan";
        case "PAKET": return "Herbal";
        case "MPASI": return "MPASI";
        default: return "Suplemen";
      }
    };

    // Map status strictly based on stock
    const mapStatus = (stock: number): ProductStatus => {
      if (stock <= 0) return "Habis";
      if (stock <= 5) return "Stok Rendah";
      return "Tersedia";
    };

    return {
      id: `PRD-${String(p.id).padStart(3, "0")}`,
      rawId: p.id,
      name: p.namaProduk,
      category: mapCategoryName(p.kategori),
      stock: p.stok,
      price: p.harga,
      status: mapStatus(p.stok),
      image: p.gambarUrl || undefined,
      description: p.deskripsi || undefined,
    };
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search.trim() || undefined,
        includeInactive: "true",
      };

      if (categoryFilter !== "Semua Kategori") {
        params.kategori = categoryFilter === "Suplemen" ? "SUPLEMEN" : categoryFilter === "Alat Kesehatan" ? "ALAT" : categoryFilter === "Herbal" ? "PAKET" : "MPASI";
      }

      params.sort = sortBy;

      if (filterStockMin) params.minStock = filterStockMin;
      if (filterStockMax) params.maxStock = filterStockMax;
      if (filterPriceMin) params.minPrice = filterPriceMin;
      if (filterPriceMax) params.maxPrice = filterPriceMax;

      const res = await adminService.getProducts(params);

      // We do local filtering on front-end for status because back-end status gets calculated dynamically but does not support status query param directly.
      let mapped = res.products.map(mapBackendProduct);
      if (statusFilter !== "Semua Status") {
        mapped = mapped.filter(p => p.status === statusFilter);
      }

      setProducts(mapped);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
      
      setStats({
        total: res.stats.total,
        available: res.stats.available,
        lowStock: res.stats.lowStock,
        outOfStock: res.stats.outOfStock,
      });
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, statusFilter, sortBy, currentPage, filterStockMin, filterStockMax, filterPriceMin, filterPriceMax]);

  async function handleSave(formData: any) {
    try {
      if (modal.mode === "edit" && modal.data) {
        await adminService.updateProduct(modal.data.rawId, formData);
        toast.success("Produk berhasil diperbarui");
      } else {
        await adminService.createProduct(formData);
        toast.success("Produk baru berhasil ditambahkan");
      }
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan produk");
    } finally {
      setModal({ open: false, mode: "add" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await adminService.deleteProduct(deleteTarget.rawId);
      toast.success("Produk berhasil dinonaktifkan");
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus produk");
    } finally {
      setDeleteTarget(null);
    }
  }


  function handleExport() {
    exportCSV(products);
    toast.success("Export berhasil");
  }

  function goPage(p: number) {
    setCurrentPage(Math.max(1, Math.min(p, totalPages || 1)));
  }

  useEffect(() => {
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-bold">Rentang Stok</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={localStockMin} onChange={(e) => setLocalStockMin(e.target.value)} placeholder="Min" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
                <input type="text" value={localStockMax} onChange={(e) => setLocalStockMax(e.target.value)} placeholder="Max" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-bold">Rentang Harga (Rp)</label>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={localPriceMin} onChange={(e) => setLocalPriceMin(e.target.value)} placeholder="Min" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
                <input type="text" value={localPriceMax} onChange={(e) => setLocalPriceMax(e.target.value)} placeholder="Max" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
              </div>
            </div>
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
          <p className="text-sm text-gray-500 mt-1">Kelola semua produk NutriShop secara langsung ke database</p>
        </div>
        <button onClick={() => setModal({ open: true, mode: "add" })} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] transition-colors shadow-sm shrink-0">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Produk" value={stats.total} sub="Terdata di DB" icon={<Package size={18} />} color="#4a7c59" />
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
                placeholder="Cari nama produk..." 
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
                <button onClick={() => setShowFilterModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap font-medium">
                  <Filter size={14} /> Filter
                </button>
                <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap font-medium">
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
              <p className="text-sm text-gray-400 font-medium">Memuat data produk...</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">PRODUK</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">KATEGORI</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">STOK</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">HARGA</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3.5">
                        <ProductImage product={product} />
                      </td>
                      <td className="px-4 py-3.5">
                        <CategoryBadge category={product.category} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-700 font-semibold">{product.stock}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-700 font-semibold whitespace-nowrap">{formatRupiah(product.price)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StockStatus status={product.status} />
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setModal({ open: true, mode: "edit", data: product })} 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-semibold"
                          >
                            <Edit2 size={13} /> Edit
                          </button>

                          <button 
                            onClick={() => setDeleteTarget(product)} 
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
            Menampilkan {products.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} dari {totalCount} produk
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
      {showFilterModal && <FilterModal />}
    </AdminLayout>
  );
}