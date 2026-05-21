import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Search,
  Download,
  Plus,
  Edit,
  Trash,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  CheckCircle,
  Clock,
  Archive,
  AlertTriangle,
  Filter,
  ImagePlus,
  Bold,
  Italic,
  List,
  Eye,
  Calendar,
  ChevronDown,
  Loader2
} from "lucide-react";
import { AdminLayout } from "./admin-layout";
import { adminService, type Article } from "../../services/admin.service";

type ArticleCategory = "Kesehatan" | "Gizi" | "Resep" | "Tips" | "Gaya Hidup";
type ArticleStatus = "Published" | "Draft" | "Diarsipkan";

interface AuthorInfo {
  name: string;
  avatar?: string;
}

interface ArticleData {
  id: string;
  rawId: number;
  title: string;
  slug: string;
  category: ArticleCategory;
  author: AuthorInfo;
  status: ArticleStatus;
  publishedDate?: string;
  thumbnail?: string;
  content?: string;
  views?: number;
}

interface FormDataState {
  title: string;
  slug: string;
  category: ArticleCategory;
  authorName: string;
  status: ArticleStatus;
  content: string;
  publishedDate: string;
}

type ModalMode = "add" | "edit";
type SortOption = "terbaru" | "terlama" | "judul-az";

const AVATAR_COLORS = ["#4a7c59","#3b82f6","#8b5cf6","#f97316","#ec4899","#14b8a6","#f59e0b","#ef4444"];

function getInitials(name: string): string {
  return name.replace(/^Dr\.\s*/i, "").split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function getAvatarColor(name: string): string {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
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

function exportCSV(data: ArticleData[]): void {
  const headers = ["ID", "Judul", "Slug", "Kategori", "Penulis", "Status", "Tanggal Terbit"];
  const rows = data.map((a) => [a.id, a.title, a.slug, a.category, a.author.name, a.status, a.publishedDate ?? "-"]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "manajemen-artikel.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function formatDatetimeID(dtLocal: string | Date): string {
  if (!dtLocal) return "";
  const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const d = new Date(dtLocal);
  if (isNaN(d.getTime())) return String(dtLocal);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hh}:${mm}`;
}

function parseDatetimeToLocal(display: string): string {
  if (!display) return "";
  const MONTHS: Record<string, number> = {
    Jan:0,Feb:1,Mar:2,Apr:3,Mei:4,Jun:5,Jul:6,Agu:7,Sep:8,Okt:9,Nov:10,Des:11
  };
  const m = display.match(/(\d+)\s+(\w+)\s+(\d{4}),?\s*(\d{2}):(\d{2})/);
  if (!m) return "";
  const [,day,mon,year,hh,mm] = m;
  const monthIdx = MONTHS[mon];
  if (monthIdx === undefined) return "";
  const d = new Date(Number(year), monthIdx, Number(day), Number(hh), Number(mm));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderPreviewContent(text: string): React.ReactNode {
  if (!text.trim()) {
    return <p className="text-gray-400 italic">Belum ada konten untuk ditampilkan.</p>;
  }

  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: React.ReactNode[][] = [];

  const flushList = (key: number) => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`ul-${key}`} className="list-disc pl-5 my-1">
        {listItems.map((item, index) => (
          <li key={index} className="my-0.5">{item}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine;
    if (/^•\s/.test(line)) {
      listItems.push(renderInlineContent(line.slice(2)));
    } else {
      flushList(index);
      if (line.trim() === "") {
        blocks.push(<div key={`space-${index}`} className="h-3" />);
      } else {
        blocks.push(<p key={`p-${index}`} className="my-1">{renderInlineContent(line)}</p>);
      }
    }
  });

  flushList(lines.length);
  return blocks;
}

function renderInlineContent(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const inlinePattern = /(\*\*[^*]+?\*\*|\*[^*]+?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`strong-${match.index}`}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={`em-${match.index}`}>{token.slice(1, -1)}</em>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

const selectCls = "appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-7 text-[13px] sm:text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-[#4a7c59]/25 focus:border-[#4a7c59] cursor-pointer w-full";

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

function ArticleRow({ article }: { article: ArticleData }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
        {article.thumbnail ? (
          <img src={article.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4a7c59]/20 to-[#4a7c59]/10">
            <FileText size={14} className="text-[#4a7c59]/60" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[150px] md:max-w-[200px]">
          {article.title}
        </p>
        <p className="text-xs text-[#4a7c59] mt-0.5 truncate max-w-[150px] md:max-w-[200px]">
          /{article.slug}
        </p>
      </div>
    </div>
  );
}

function AuthorCell({ author }: { author: AuthorInfo }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: getAvatarColor(author.name) }}>
        {getInitials(author.name)}
      </div>
      <span className="text-sm text-gray-700 truncate max-w-[100px] md:max-w-[150px]">{author.name.replace(", SpGK", "").replace(", MGizi", "")}</span>
    </div>
  );
}

function CategoryBadge({ category }: { category: ArticleCategory }) {
  const styles: Record<ArticleCategory, string> = {
    Kesehatan: "bg-blue-100 text-blue-700 border border-blue-200",
    Gizi: "bg-green-100 text-green-700 border border-green-200",
    Resep: "bg-orange-100 text-orange-700 border border-orange-200",
    Tips: "bg-purple-100 text-purple-700 border border-purple-200",
    "Gaya Hidup": "bg-pink-100 text-pink-700 border border-pink-200",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${styles[category] || "bg-gray-100 text-gray-700"}`}>{category}</span>;
}

function StatusBadge({ status }: { status: ArticleStatus }) {
  if (status === "Published") return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">Published</span>;
  if (status === "Draft") return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">Draft</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">Diarsipkan</span>;
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

function PreviewModal({ content, onClose }: { content: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2"><Eye size={16} className="text-[#4a7c59]" /> Preview Konten</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none font-sans">{renderPreviewContent(content)}</div>
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end"><button onClick={onClose} className="px-4 py-2 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849]">Tutup</button></div>
      </div>
    </div>
  );
}

function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string, placeholder: string, onChange: (val: string) => void) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end) || placeholder;
  const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
  onChange(newValue);
  requestAnimationFrame(() => {
    textarea.focus();
    const newStart = start + before.length;
    const newEnd = newStart + selected.length;
    textarea.setSelectionRange(newStart, newEnd);
  });
}

function applyBulletList(textarea: HTMLTextAreaElement, onChange: (val: string) => void) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = value.indexOf("\n", end);
  const blockEnd = lineEnd === -1 ? value.length : lineEnd;
  const block = value.slice(lineStart, blockEnd);
  const lines = block.split("\n");
  const allBulleted = lines.every((l) => l.startsWith("• "));
  const newLines = allBulleted ? lines.map((l) => l.slice(2)) : lines.map((l) => (l.startsWith("• ") ? l : "• " + l));
  const newBlock = newLines.join("\n");
  const newValue = value.slice(0, lineStart) + newBlock + value.slice(blockEnd);
  onChange(newValue);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(lineStart, lineStart + newBlock.length);
  });
}

function ArticleModal({ mode, initialData, onSave, onClose }: { mode: ModalMode; initialData?: ArticleData; onSave: (formData: FormData) => void; onClose: () => void }) {
  const [form, setForm] = useState<FormDataState>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    category: initialData?.category ?? "Kesehatan",
    authorName: initialData?.author.name ?? "",
    status: initialData?.status ?? "Draft",
    content: initialData?.content ?? "",
    publishedDate: initialData?.publishedDate ? parseDatetimeToLocal(initialData.publishedDate) : "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormDataState, string>>>({});
  const [coverPreview, setCoverPreview] = useState<string | undefined>(initialData?.thumbnail);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const modalTitle = mode === "add" ? "Tambah Artikel Baru" : mode === "edit" ? "Edit Artikel" : "Duplikasi Artikel";

  function handleTitleChange(val: string) { setForm((f) => ({ ...f, title: val, slug: toSlug(val) })); }
  
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) { 
    const file = e.target.files?.[0]; 
    if (file) { 
      setCoverFile(file);
      const reader = new FileReader(); 
      reader.onload = (ev) => setCoverPreview(ev.target?.result as string); 
      reader.readAsDataURL(file); 
    } 
  }
  
  function validate(): boolean { 
    const e: Partial<Record<keyof FormDataState, string>> = {}; 
    if (!form.title.trim()) e.title = "Judul wajib diisi"; 
    if (!form.authorName.trim()) e.authorName = "Nama penulis wajib diisi"; 
    if (!form.content.trim()) e.content = "Isi artikel wajib diisi"; 
    setErrors(e); 
    return Object.keys(e).length === 0; 
  }
  
  function handleSubmit(e: React.FormEvent) { 
    e.preventDefault(); 
    if (!validate()) return; 

    const formData = new FormData();
    formData.append("judul", form.title);
    formData.append("slug", form.slug || toSlug(form.title));
    formData.append("penulis", form.authorName);
    formData.append("konten", form.content);
    
    const catMap: Record<string, string> = {
      Kesehatan: "KEHAMILAN", // Maps nicely to database constraints
      Gizi: "GIZI",
      Resep: "MPASI",
      Tips: "STUNTING",
      "Gaya Hidup": "GIZI",
    };
    formData.append("kategori", catMap[form.category] || "GIZI");
    
    const statusVal = form.status === "Published" ? "PUBLISHED" : "DRAFT";
    formData.append("status", statusVal);
    formData.append("isPublished", form.status === "Published" ? "true" : "false");
    
    if (form.status === "Published") {
      const pubDate = form.publishedDate ? new Date(form.publishedDate).toISOString() : new Date().toISOString();
      formData.append("publishedAt", pubDate);
    }

    if (coverFile) {
      formData.append("gambar", coverFile);
    }
    
    onSave(formData as any); 
  }

  const handleBold = useCallback(() => { if (!textareaRef.current) return; wrapSelection(textareaRef.current, "**", "**", "teks tebal", (val) => setForm((f) => ({ ...f, content: val }))); }, []);
  const handleItalic = useCallback(() => { if (!textareaRef.current) return; wrapSelection(textareaRef.current, "*", "*", "teks miring", (val) => setForm((f) => ({ ...f, content: val }))); }, []);
  const handleList = useCallback(() => { if (!textareaRef.current) return; applyBulletList(textareaRef.current, (val) => setForm((f) => ({ ...f, content: val }))); }, []);

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59]";
  const toolbarBtnCls = "p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
            <h2 className="text-lg font-bold text-gray-900">{modalTitle}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gambar Sampul</label>
              <div onClick={() => fileRef.current?.click()} className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-[#4a7c59]/50 transition-colors bg-gray-50 flex items-center justify-center">
                {coverPreview ? (
                  <><img src={coverPreview} alt="Cover" className="w-full h-full object-cover absolute inset-0" /><div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><p className="text-white text-sm font-medium">Ganti Gambar</p></div></>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400"><ImagePlus size={28} /><p className="text-sm font-medium">Klik untuk upload gambar sampul</p><p className="text-xs">JPG, PNG, WebP – Maks. 2MB</p></div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Artikel <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className={inputCls} placeholder="Masukkan judul artikel yang menarik..." />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug URL</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50 focus-within:border-[#4a7c59] focus-within:ring-2 focus-within:ring-[#4a7c59]/30">
                <span className="text-xs text-gray-400 shrink-0">/artikel/</span>
                <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="flex-1 bg-transparent text-sm text-gray-700 outline-none" placeholder="judul-artikel-anda" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ArticleCategory }))} className={inputCls + " bg-white"}>
                  <option>Kesehatan</option><option>Gizi</option><option>Resep</option><option>Tips</option><option>Gaya Hidup</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Penulis <span className="text-red-500">*</span></label>
                <input type="text" value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} className={inputCls} placeholder="Dr. Nama Penulis" />
                {errors.authorName && <p className="mt-1 text-xs text-red-500">{errors.authorName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Isi Artikel <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-1 border border-gray-200 rounded-t-lg px-2 py-1.5 bg-gray-50 flex-wrap">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleBold(); }} className={toolbarBtnCls} title="Tebal (Bold)"><Bold size={14} /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleItalic(); }} className={toolbarBtnCls} title="Miring (Italic)"><Italic size={14} /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); handleList(); }} className={toolbarBtnCls} title="Bullet List"><List size={14} /></button>
                <span className="border-l border-gray-300 mx-1 self-stretch" />
                <button type="button" onClick={() => setShowPreview(true)} className={`${toolbarBtnCls} flex items-center gap-1 text-xs font-semibold`}><Eye size={13} /> Preview</button>
                <span className="ml-auto text-[11px] text-gray-400 hidden sm:block">**tebal** | *miring* | • list</span>
              </div>
              <textarea 
                ref={textareaRef} 
                value={form.content} 
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} 
                rows={8} 
                className="w-full border border-gray-300 rounded-b-lg border-t-0 px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] resize-none font-mono" 
                placeholder="Tulis isi artikel di sini...&#10;&#10;Tip: **teks** = tebal, *teks* = miring, • teks = bullet list"
              />
              <div className="flex justify-between mt-1">
                {errors.content ? <p className="text-xs text-red-500">{errors.content}</p> : <span />}
                <p className="text-xs text-gray-400 ml-auto">{form.content.length} karakter</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status Publikasi</label>
              <div className="flex flex-wrap gap-3">
                {(["Draft", "Published"] as ArticleStatus[]).map((s) => (
                  <label key={s} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${form.status === s ? "border-[#4a7c59] bg-[#ebf3ec] text-[#4a7c59]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setForm((f) => ({ ...f, status: s }))} className="hidden" />
                    {s === "Published" ? <CheckCircle size={14} /> : <Clock size={14} />}{s}
                  </label>
                ))}
              </div>
            </div>

            {form.status === "Published" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal & Waktu Terbit</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                  <input 
                    type="datetime-local" 
                    value={form.publishedDate} 
                    onChange={(e) => setForm((f) => ({ ...f, publishedDate: e.target.value }))} 
                    className={inputCls + " pl-9"} 
                  />
                </div>
                {form.publishedDate && (
                  <p className="mt-1 text-xs text-gray-500">Akan ditampilkan sebagai: <strong>{formatDatetimeID(form.publishedDate)}</strong></p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
              <button type="button" onClick={() => { setForm((f) => ({ ...f, status: "Draft" })); setTimeout(() => (document.querySelector("form") as HTMLFormElement)?.requestSubmit(), 0); }} className="px-4 py-2.5 border border-[#4a7c59] text-[#4a7c59] rounded-lg text-sm font-semibold hover:bg-[#ebf3ec]">Simpan Draft</button>
              <button type="submit" className="flex-1 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849]">{mode === "edit" ? "Simpan Perubahan" : "Publikasikan"}</button>
            </div>
          </form>
        </div>
      </div>
      {showPreview && <PreviewModal content={form.content} onClose={() => setShowPreview(false)} />}
    </>
  );
}

function DeleteModal({ title: articleTitle, onConfirm, onClose }: { title: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} className="text-red-500" /></div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Artikel</h3>
        <p className="text-sm text-gray-500 mb-6">Apakah Anda yakin ingin menghapus artikel <strong className="text-gray-800">"{articleTitle}"</strong>? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

export default function ArticleManagement() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Semua Kategori");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [sortBy, setSortBy] = useState<SortOption>("terbaru");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, archived: 0 });
  const [modal, setModal] = useState<{ open: boolean; mode: ModalMode; data?: ArticleData }>({ open: false, mode: "add" });
  const [deleteTarget, setDeleteTarget] = useState<ArticleData | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const ITEMS_PER_PAGE = 10;

  const mapBackendArticle = (a: Article): ArticleData => {
    const categoryMapBack: Record<string, ArticleCategory> = {
      GIZI: "Gizi",
      MPASI: "Resep",
      STUNTING: "Tips",
      KEHAMILAN: "Kesehatan",
      MENYUSUI: "Kesehatan",
    };
    
    return {
      id: `ART-${String(a.id).padStart(3, "0")}`,
      rawId: a.id,
      title: a.judul,
      slug: a.slug,
      category: (categoryMapBack[a.kategori] || "Gizi") as ArticleCategory,
      author: {
        name: a.penulis || "Admin",
      },
      status: a.status === "PUBLISHED" ? "Published" : "Draft",
      publishedDate: a.publishedAt ? formatDatetimeID(a.publishedAt) : undefined,
      thumbnail: a.gambarUrl ? (a.gambarUrl.startsWith("http") ? a.gambarUrl : `http://localhost:5000${a.gambarUrl}`) : undefined,
      content: a.konten,
      views: 0,
    };
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search.trim() || undefined,
      };

      const catMap: Record<string, string> = {
        Kesehatan: "KEHAMILAN",
        Gizi: "GIZI",
        Resep: "MPASI",
        Tips: "STUNTING",
        "Gaya Hidup": "GIZI",
      };

      if (catFilter !== "Semua Kategori") {
        params.kategori = catMap[catFilter];
      }

      if (statusFilter !== "Semua Status") {
        params.status = statusFilter === "Published" ? "PUBLISHED" : "DRAFT";
      }

      const res = await adminService.getArticles(params);
      const mapped = res.articles.map(mapBackendArticle);

      setArticles(mapped);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);

      setStats({
        total: res.stats.total,
        published: res.stats.published,
        draft: res.stats.draft,
        archived: 0,
      });
    } catch (error) {
      console.error("Failed to fetch articles", error);
      toast.error("Gagal memuat daftar artikel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [search, catFilter, statusFilter, sortBy, currentPage, filterDateFrom, filterDateTo]);

  const filteredAndSorted = useMemo(() => {
    const result = [...articles];
    // Apply local client-side sorting based on dropdown choice
    result.sort((a, b) => {
      switch (sortBy) {
        case "judul-az": return a.title.localeCompare(b.title, "id");
        case "terbaru": return (b.publishedDate ?? "").localeCompare(a.publishedDate ?? "");
        case "terlama": return (a.publishedDate ?? "").localeCompare(b.publishedDate ?? "");
        default: return 0;
      }
    });
    return result;
  }, [articles, sortBy]);

  async function handleSave(formData: any) {
    try {
      if (modal.mode === "edit" && modal.data) {
        await adminService.updateArticle(modal.data.rawId, formData);
        toast.success("Artikel berhasil diperbarui");
      } else {
        await adminService.createArticle(formData);
        toast.success("Artikel baru berhasil ditambahkan");
      }
      fetchArticles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menyimpan artikel");
    } finally {
      setModal({ open: false, mode: "add" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await adminService.deleteArticle(deleteTarget.rawId);
      toast.success("Artikel berhasil dihapus");
      fetchArticles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus artikel");
    } finally {
      setDeleteTarget(null);
    }
  }


  function handleExport() { 
    exportCSV(filteredAndSorted); 
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

  useEffect(() => { 
    setCurrentPage(1); 
  }, [search, catFilter, statusFilter, sortBy, filterDateFrom, filterDateTo]);

  const FilterModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowFilterModal(false)}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Filter Lanjutan</h3>
          <button onClick={() => setShowFilterModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Terbit Dari</label>
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#4a7c59]/30 focus:border-[#4a7c59] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Terbit Sampai</label>
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Artikel</h1>
          <p className="text-sm text-gray-500 mt-1">Buat, edit, dan terbitkan artikel edukasi gizi & kesehatan</p>
        </div>
        <button onClick={() => setModal({ open: true, mode: "add" })} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4a7c59] text-white rounded-lg text-sm font-semibold hover:bg-[#3d6849] shadow-sm shrink-0 transition-colors">
          <Plus size={16} /> Tambah Artikel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Artikel" value={stats.total} sub="Terdata di sistem" icon={<FileText size={18} />} color="#4a7c59" />
        <StatCard label="Artikel Published" value={stats.published} sub={`${stats.total > 0 ? ((stats.published / stats.total) * 100).toFixed(1) : 0}% dari total`} icon={<CheckCircle size={18} />} color="#16a34a" />
        <StatCard label="Artikel Draft" value={stats.draft} sub={`${stats.total > 0 ? ((stats.draft / stats.total) * 100).toFixed(1) : 0}% dari total`} icon={<Clock size={18} />} color="#f97316" />
        <StatCard label="Diarsipkan" value={stats.archived} sub="0% dari total" icon={<Archive size={18} />} color="#e74c3c" />
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
                placeholder="Cari judul, penulis..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#4a7c59]/25 focus:border-[#4a7c59]" 
              />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className={selectCls}>
                  <option>Semua Kategori</option>
                  <option>Kesehatan</option>
                  <option>Gizi</option>
                  <option>Resep</option>
                  <option>Tips</option>
                  <option>Gaya Hidup</option>
                </select>
              </SelectWrapper>

              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
                  <option>Semua Status</option>
                  <option>Published</option>
                  <option>Draft</option>
                </select>
              </SelectWrapper>

              <SelectWrapper className="flex-1 w-full sm:w-auto">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className={selectCls}>
                  <option value="terbaru">Terbaru</option>
                  <option value="terlama">Terlama</option>
                  <option value="judul-az">Judul A-Z</option>
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
              <p className="text-sm text-gray-400 font-medium">Memuat daftar artikel...</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ARTIKEL</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">KATEGORI</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">PENULIS</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">TANGGAL TERBIT</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Tidak ada artikel yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3.5">
                        <ArticleRow article={article} />
                      </td>
                      <td className="px-4 py-3.5">
                        <CategoryBadge category={article.category} />
                      </td>
                      <td className="px-4 py-3.5">
                        <AuthorCell author={article.author} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={article.status} />
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-sm text-gray-600 whitespace-nowrap">{article.publishedDate ?? "–"}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setModal({ open: true, mode: "edit", data: article })} 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-semibold"
                          >
                            <Edit size={13} /> Edit
                          </button>

                          <button 
                            onClick={() => setDeleteTarget(article)} 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
                          >
                            <Trash size={13} /> Hapus
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
            Menampilkan {filteredAndSorted.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} dari {totalCount} artikel
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

      {modal.open && (
        <ArticleModal 
          mode={modal.mode} 
          initialData={modal.data} 
          onSave={handleSave} 
          onClose={() => setModal({ open: false, mode: "add" })} 
        />
      )}
      {deleteTarget && (
        <DeleteModal 
          title={deleteTarget.title} 
          onConfirm={handleDelete} 
          onClose={() => setDeleteTarget(null)} 
        />
      )}
      {showFilterModal && <FilterModal />}
    </AdminLayout>
  );
}
