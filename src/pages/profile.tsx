import { useEffect, useState, type ReactNode } from "react";
import iconAlamat   from "../assets/images/images-location.png";
import iconAnak     from "../assets/images/images-baby.png";
import iconPassword from "../assets/images/images-lock.png";
import iconCamera   from "../assets/images/images-camera.png";
import fotoProfile  from "../assets/images/images-avatar.png";
import girlsymbol   from "../assets/images/images-girlsymbol.png";
import boysymbol    from "../assets/images/images-malesymbol.png";
import editsign     from "../assets/images/images-editsign.png";

import { useAuth }         from "../context/AuthContext";
import { shopService }     from "../services/shop.service";
import { childrenService } from "../services/children.service";
import { apiClient }       from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

// ── Backend Types ──────────────────────────────────────────────────────────
interface BackendAddress {
  id: number;
  namaPenerima: string;
  noTelepon: string;
  alamatLengkap: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  kodePos: string;
  isUtama: boolean;
}

// ── UI Types ───────────────────────────────────────────────────────────────
interface Address {
  id: number;
  namaPenerima: string;
  noTelepon: string;
  alamatLengkap: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  kodePos: string;
  isDefault: boolean;
}

interface ChildProfile {
  id: number;
  namaDepan: string;
  namaAkhir: string;
  tanggalLahir: string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
}

type ActiveMenu = "data-diri" | "alamat" | "profil-anak" | "hadiah" | "reset-password";

// ── Reward Types ───────────────────────────────────────────────────────────
type Tone = "green" | "orange" | "blue" | "purple";

interface RewardSummary {
  points: number;
  levelName: string;
  nextLevelName: string;
  nextLevelTarget: number;
  streakDays: number;
  streakBonus: number;
}

interface Mission {
  id: string;
  title: string;
  subtitle: string;
  tone: Tone;
  icon: ReactNode;
  status: "done" | "action";
  actionLabel?: string;
  to?: string; // rute tujuan saat tombol aksi ditekan
}

interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: ReactNode;
}

interface PointTransaction {
  id: string;
  title: string;
  time: string;
  amount: number;
  icon: ReactNode;
  tone: "yellow" | "green" | "red";
}

// ── Inline SVG Icons ───────────────────────────────────────────────────────
function Svg({ children, className = "w-5 h-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const IconGift = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </Svg>
);

const IconCoins = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </Svg>
);

const IconFlame = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </Svg>
);

const IconScale = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </Svg>
);

const IconUtensils = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </Svg>
);

const IconBookOpen = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </Svg>
);

const IconVideo = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </Svg>
);

const IconTag = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </Svg>
);

const IconShoppingBag = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

const IconStethoscope = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="M11 2v2" />
    <path d="M5 2v2" />
    <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" />
    <path d="M8 15a6 6 0 0 0 12 0v-3" />
    <circle cx="20" cy="10" r="2" />
  </Svg>
);

const IconPackage = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
    <path d="M12 22V12" />
    <path d="m3.3 7 8.7 5 8.7-5" />
  </Svg>
);

const IconCheck = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

const IconCheckCircle = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

const IconPlusCircle = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </Svg>
);

const IconChevronRight = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

const IconAward = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </Svg>
);

const IconSparkles = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </Svg>
);

// ── Rute tujuan tombol misi ────────────────────────────────────────────────
// Sesuaikan dengan path di router aplikasi Anda.
const MISSION_ROUTES = {
  healthLog: "/health-log",
  artikel:   "/artikel",
  tele:      "/tele-nutritionist",
} as const;

// ── Reward Data ────────────────────────────────────────────────────────────
// TODO: ganti dengan data dari backend (mis. rewardService.getSummary(), getMissions(), dst).
// Seluruh angka turunan (persentase, "kurang X poin", status tombol) dihitung dari data ini.
const REWARD_SUMMARY: RewardSummary = {
  points: 750,
  levelName: "Konsisten",
  nextLevelName: "Berdedikasi",
  nextLevelTarget: 1000,
  streakDays: 7,
  streakBonus: 50,
};

const MISSIONS: Mission[] = [
  { id: "log-tb-bb",  title: "Log Tinggi & Berat Badan", subtitle: "+20 Poin per log",        tone: "green",  icon: <IconScale    className="w-5 h-5" />, status: "done" },
  { id: "log-gizi",   title: "Health Log Asupan Gizi",   subtitle: "+10 Poin (Progres 2/3)",  tone: "orange", icon: <IconUtensils className="w-5 h-5" />, status: "action", actionLabel: "Lanjut", to: MISSION_ROUTES.healthLog },
  { id: "edu-mpasi",  title: "Baca Edukasi MPASI",       subtitle: "+5 Poin (1/3 Artikel)",   tone: "blue",   icon: <IconBookOpen className="w-5 h-5" />, status: "action", actionLabel: "Baca", to: MISSION_ROUTES.artikel },
  { id: "tele-nutri", title: "Konsultasi Tele-Nutrition", subtitle: "+50 Poin / Sesi",        tone: "purple", icon: <IconVideo    className="w-5 h-5" />, status: "action", actionLabel: "Jadwal", to: MISSION_ROUTES.tele },
];

const REWARD_CATALOG: RewardItem[] = [
  { id: "v-20k",   title: "Voucher NutriShop Rp20.000", description: "Diskon belanja produk bahan pangan bernutrisi di NutriShop.",  cost: 200,  icon: <IconTag         className="w-5 h-5" /> },
  { id: "v-50k",   title: "Voucher NutriShop Rp50.000", description: "Potongan belanja susu fortified & sereal kaya mikronutrien.",  cost: 500,  icon: <IconShoppingBag className="w-5 h-5" /> },
  { id: "tele-1",  title: "1 Sesi Tele-Nutrition Gratis", description: "Konsultasi 30 menit bersama dokter spesialis gizi anak NutriGrow.", cost: 800,  icon: <IconStethoscope className="w-5 h-5" /> },
  { id: "starter", title: "NutriGrow Starter Package",   description: "Box set suplemen zinc, zat besi, dan vitamin D untuk 30 hari.", cost: 1200, icon: <IconPackage     className="w-5 h-5" /> },
];

const POINT_TRANSACTIONS: PointTransaction[] = [
  { id: "t1", title: "Bonus Streak 7 Hari Tercapai",     time: "Hari ini • 09:12 WIB",    amount: 50,   tone: "yellow", icon: <IconFlame       className="w-5 h-5" /> },
  { id: "t2", title: "Log Tinggi & Berat Badan Johan",   time: "Hari ini • 08:00 WIB",    amount: 20,   tone: "green",  icon: <IconPlusCircle  className="w-5 h-5" /> },
  { id: "t3", title: "Health Log Asupan Gizi",           time: "Kemarin • 19:40 WIB",     amount: 10,   tone: "green",  icon: <IconCheckCircle className="w-5 h-5" /> },
  { id: "t4", title: "Tukar Voucher NutriShop Rp20.000", time: "4 hari yang lalu • 14:15 WIB", amount: -200, tone: "red",    icon: <IconGift        className="w-5 h-5" /> },
  { id: "t5", title: "Baca Edukasi MPASI",               time: "6 hari yang lalu • 20:05 WIB",  amount: 5,    tone: "green",  icon: <IconCheckCircle className="w-5 h-5" /> },
  { id: "t6", title: "Konsultasi Tele-Nutrition",        time: "8 hari yang lalu • 10:30 WIB",  amount: 50,   tone: "green",  icon: <IconCheckCircle className="w-5 h-5" /> },
  { id: "t7", title: "Log Tinggi & Berat Badan Johan",   time: "9 hari yang lalu • 08:10 WIB",  amount: 20,   tone: "green",  icon: <IconPlusCircle  className="w-5 h-5" /> },
  { id: "t8", title: "Health Log Asupan Gizi",           time: "10 hari yang lalu • 19:20 WIB", amount: 10,   tone: "green",  icon: <IconCheckCircle className="w-5 h-5" /> },
];

const RECENT_TX_LIMIT = 4;

// ── Reward Style Maps ──────────────────────────────────────────────────────
const MISSION_ICON_TONE: Record<Tone, string> = {
  green:  "bg-[#dcfce7] text-[#15803d]",
  orange: "bg-[#fff1e6] text-[#ea580c]",
  blue:   "bg-[#e8f0fe] text-[#2563eb]",
  purple: "bg-[#f3e8ff] text-[#9333ea]",
};

const MISSION_SUBTITLE_TONE: Record<Tone, string> = {
  green:  "text-[#15803d]",
  orange: "text-gray-500",
  blue:   "text-gray-500",
  purple: "text-[#9333ea]",
};

const TX_ICON_TONE: Record<PointTransaction["tone"], string> = {
  yellow: "bg-[#fef3c7] text-[#d97706]",
  green:  "bg-[#dcfce7] text-[#16a34a]",
  red:    "bg-[#fee2e2] text-[#ef4444]",
};

const formatPoin = (n: number) => n.toLocaleString("id-ID");

// ── Helpers ────────────────────────────────────────────────────────────────
const mapAddr = (a: BackendAddress): Address => ({
  id: a.id,
  namaPenerima: a.namaPenerima,
  noTelepon: a.noTelepon,
  alamatLengkap: a.alamatLengkap,
  kelurahan: a.kelurahan,
  kecamatan: a.kecamatan,
  kota: a.kota,
  kodePos: a.kodePos,
  isDefault: a.isUtama,
});

const emptyAddress = (): Omit<Address, "id" | "isDefault"> => ({
  namaPenerima: "", noTelepon: "", alamatLengkap: "",
  kelurahan: "", kecamatan: "", kota: "", kodePos: "",
});

const emptyChild = (): Omit<ChildProfile, "id"> => ({
  namaDepan: "", namaAkhir: "", tanggalLahir: "", jenisKelamin: "LAKI_LAKI",
});

// ── Address Modal ──────────────────────────────────────────────────────────
function AddressModal({ initial, onSave, onDelete, onClose, isNew, saving }: {
  initial: Omit<Address, "id" | "isDefault">;
  onSave: (data: Omit<Address, "id" | "isDefault">, isDefault: boolean) => Promise<void>;
  onDelete?: () => void;
  onClose: () => void;
  isNew: boolean;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [isDefault, setIsDefault] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = async () => {
    if (!form.namaPenerima.trim() || !form.noTelepon.trim() || !form.alamatLengkap.trim() || !form.kota.trim()) {
      setErr("Nama, telepon, alamat, dan kota wajib diisi."); return;
    }
    setErr("");
    await onSave(form, isDefault);
  };

  const fields: { label: string; key: keyof Omit<Address, "id" | "isDefault"> }[] = [
    { label: "Nama Penerima *",  key: "namaPenerima"  },
    { label: "No Telepon *",     key: "noTelepon"     },
    { label: "Alamat Lengkap *", key: "alamatLengkap" },
    { label: "Kelurahan",        key: "kelurahan"     },
    { label: "Kecamatan",        key: "kecamatan"     },
    { label: "Kota *",           key: "kota"          },
    { label: "Kode Pos",         key: "kodePos"       },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{isNew ? "Tambah Alamat" : "Edit Alamat"}</h2>
        {err && <p className="text-xs text-red-500 mb-3 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
        <div className="grid grid-cols-2 gap-3">
          {fields.map(f => (
            <div key={f.key} className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
              <input value={form[f.key]} onChange={set(f.key)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition" />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
          <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)}
            className="w-4 h-4 accent-[#4d7c0f]" />
          <span className="text-sm text-gray-700">Jadikan alamat utama</span>
        </label>
        <div className="flex justify-between items-center mt-5">
          {onDelete ? (
            <button onClick={onDelete}
              className="text-red-500 text-sm font-semibold border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition">
              Hapus
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <button onClick={onClose} className="text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-100 transition text-sm">Batal</button>
            <button onClick={submit} disabled={saving}
              className="bg-[#4d7c0f] text-white font-semibold px-5 py-2 rounded-xl hover:bg-[#3a5a00] transition text-sm disabled:opacity-60">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Child Modal ────────────────────────────────────────────────────────────
function ChildModal({ initial, onSave, onDelete, onClose, isNew, saving }: {
  initial: Omit<ChildProfile, "id">;
  onSave: (data: Omit<ChildProfile, "id">) => Promise<void>;
  onDelete?: () => void;
  onClose: () => void;
  isNew: boolean;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!form.namaDepan.trim() || !form.tanggalLahir) {
      setErr("Nama dan tanggal lahir wajib diisi."); return;
    }
    setErr("");
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{isNew ? "Tambah Profil Anak" : "Edit Profil Anak"}</h2>
        {err && <p className="text-xs text-red-500 mb-3 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
        <div className="space-y-4">
          {[
            { label: "Nama Depan *",    key: "namaDepan",    type: "text" },
            { label: "Nama Belakang",   key: "namaAkhir",    type: "text" },
            { label: "Tanggal Lahir *", key: "tanggalLahir", type: "date" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
              <input type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                max={f.type === "date" ? new Date().toISOString().split("T")[0] : undefined}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis Kelamin *</label>
            <select value={form.jenisKelamin}
              onChange={e => setForm(prev => ({ ...prev, jenisKelamin: e.target.value as "LAKI_LAKI" | "PEREMPUAN" }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] bg-white transition">
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </div>
        </div>
        <div className="flex justify-between items-center mt-5">
          {onDelete ? (
            <button onClick={onDelete}
              className="text-red-500 text-sm font-semibold border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition">
              Hapus
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <button onClick={onClose} className="text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-100 transition text-sm">Batal</button>
            <button onClick={submit} disabled={saving}
              className="bg-[#4d7c0f] text-white font-semibold px-5 py-2 rounded-xl hover:bg-[#3a5a00] transition text-sm disabled:opacity-60">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar Item ───────────────────────────────────────────────────────────
// `icon` bisa berupa URL gambar (string) atau elemen SVG inline (ReactNode).
function MenuItem({ icon, label, active, onClick }: {
  icon: string | ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left relative z-10 transition-colors duration-250"
      style={{
        background: 'transparent',
        color: active ? '#4d7c0f' : '#4b5563',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {typeof icon === "string" ? (
        <img src={icon} className="w-5 h-5 object-contain relative z-20" alt="" style={{ filter: active ? 'none' : 'grayscale(100%)' }} />
      ) : (
        <span className="w-5 h-5 flex items-center justify-center relative z-20">{icon}</span>
      )}
      <span className="relative z-20">{label}</span>
      {active && (
        <motion.span
          layoutId="activeMenuItem"
          className="absolute inset-0 bg-[#f0fde4] rounded-xl"
          style={{ zIndex: -1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
}

// ── Redeem Modal ───────────────────────────────────────────────────────────
function RedeemModal({ reward, balance, saving, onConfirm, onClose }: {
  reward: RewardItem;
  balance: number;
  saving: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !saving) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => { if (!saving) onClose(); }}
    >
      <div
        role="dialog" aria-modal="true" aria-labelledby="redeem-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-xl bg-[#dcfce7] text-[#15803d] flex items-center justify-center mb-4">
          {reward.icon}
        </div>
        <h2 id="redeem-title" className="text-lg font-bold text-gray-900">Tukar Hadiah?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Anda akan menukar poin dengan <span className="font-semibold text-gray-800">{reward.title}</span>.
        </p>

        <dl className="mt-5 rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-100 text-sm">
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-gray-500">Saldo saat ini</dt>
            <dd className="font-semibold text-gray-900">{formatPoin(balance)} Poin</dd>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-gray-500">Harga hadiah</dt>
            <dd className="font-semibold text-[#ef4444]">−{formatPoin(reward.cost)} Poin</dd>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <dt className="text-gray-500">Sisa saldo</dt>
            <dd className="font-bold text-[#15803d]">{formatPoin(balance - reward.cost)} Poin</dd>
          </div>
        </dl>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} disabled={saving}
            className="text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-100 transition text-sm disabled:opacity-60">
            Batal
          </button>
          <button onClick={onConfirm} disabled={saving}
            className="bg-[#4d7c0f] text-white font-semibold px-5 py-2 rounded-xl hover:bg-[#3a5a00] transition text-sm disabled:opacity-60">
            {saving ? "Memproses..." : "Ya, Tukar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Point History Modal ────────────────────────────────────────────────────
type HistoryFilter = "all" | "in" | "out";

function HistoryModal({ transactions, onClose }: {
  transactions: PointTransaction[];
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<HistoryFilter>("all");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const totalIn  = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const filtered = transactions.filter(t =>
    filter === "all" ? true : filter === "in" ? t.amount > 0 : t.amount < 0
  );

  const tabs: { key: HistoryFilter; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "in",  label: "Poin Masuk" },
    { key: "out", label: "Poin Keluar" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-labelledby="history-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="history-title" className="text-lg font-bold text-gray-900">Riwayat Transaksi Poin</h2>
              <p className="text-sm text-gray-500">Seluruh catatan perolehan dan penukaran poin Anda</p>
            </div>
            <button onClick={onClose} aria-label="Tutup"
              className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center transition shrink-0">
              <Svg className="w-4 h-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-2.5">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Masuk</p>
              <p className="text-base font-bold text-[#15803d]">+{formatPoin(totalIn)} Poin</p>
            </div>
            <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] px-4 py-2.5">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Keluar</p>
              <p className="text-base font-bold text-[#ef4444]">−{formatPoin(totalOut)} Poin</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto" role="tablist">
            {tabs.map(t => (
              <button
                key={t.key} role="tab" aria-selected={filter === t.key}
                onClick={() => setFilter(t.key)}
                className={`text-xs font-semibold rounded-full px-3.5 py-1.5 whitespace-nowrap transition ${
                  filter === t.key ? "bg-[#4d7c0f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 px-5 sm:px-6 pb-4">
          {filtered.length === 0 ? (
            <li className="text-center text-sm text-gray-400 py-8">Belum ada transaksi.</li>
          ) : filtered.map(t => {
            const positive = t.amount > 0;
            return (
              <li key={t.id} className="flex items-center gap-3 py-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TX_ICON_TONE[t.tone]}`}>
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.time}</p>
                </div>
                <span className={`text-xs sm:text-sm font-bold rounded-lg px-2.5 py-1 shrink-0 ${
                  positive ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#ef4444]"
                }`}>
                  {positive ? "+" : "−"}{formatPoin(Math.abs(t.amount))} Poin
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ── Rewards Panel ("Hadiah") ───────────────────────────────────────────────
function RewardsPanel({ summary, missions, catalog, transactions, notice, onRedeem, onNavigate }: {
  summary: RewardSummary;
  missions: Mission[];
  catalog: RewardItem[];
  transactions: PointTransaction[];
  notice: string;
  onRedeem: (reward: RewardItem) => void;
  onNavigate: (path: string) => void;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const { points, levelName, nextLevelName, nextLevelTarget, streakDays, streakBonus } = summary;
  const progressPct   = Math.min(100, Math.round((points / nextLevelTarget) * 100));
  const pointsToLevel = Math.max(0, nextLevelTarget - points);

  return (
    <div className="space-y-5">
      {notice && (
        <div role="status" className="flex items-center gap-2 text-sm text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3">
          <IconCheckCircle className="w-5 h-5 shrink-0" />
          {notice}
        </div>
      )}

      {/* ── NutriGrow Progress ── */}
      <section className="rounded-2xl border border-[#d9f2c4] bg-gradient-to-br from-[#f4fcec] to-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-[#e6f3d8]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">NutriGrow Progress</h2>
              <span className="inline-flex items-center gap-1.5 bg-[#4d7c0f] text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                <IconAward className="w-3.5 h-3.5" />
                Level: {levelName}
              </span>
            </div>
            <p className="text-sm text-gray-500">Lacak pencatatan gizi anak dan dapatkan hadiah menarik setiap milestone.</p>
          </div>
          <div className="flex items-center gap-2.5 self-start rounded-xl border border-[#fde68a] bg-[#fffbeb] px-3.5 py-2 shrink-0">
            <IconFlame className="w-5 h-5 text-[#d97706]" />
            <div className="leading-tight">
              <p className="text-xs font-bold text-[#92400e]">{streakDays} Hari Streak!</p>
              <p className="text-xs text-[#b45309]">+{streakBonus} Poin Bonus Mingguan</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-5 mt-5">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 lg:min-w-[260px]">
            <div className="w-12 h-12 rounded-xl bg-[#f0f4ea] text-[#4d7c0f] flex items-center justify-center shrink-0">
              <IconCoins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Saldo Poin Aktif</p>
              <p className="text-3xl font-extrabold text-gray-900 leading-tight">
                {formatPoin(points)} <span className="text-sm font-semibold text-[#4d7c0f]">Poin</span>
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm mb-2">
              <p className="text-gray-600">
                Level Berikutnya: <span className="font-bold text-gray-900">{nextLevelName}</span>
              </p>
              <p className="font-bold text-[#4d7c0f]">
                {formatPoin(points)} / {formatPoin(nextLevelTarget)} Poin ({progressPct}%)
              </p>
            </div>
            <div
              className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden"
              role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct}
            >
              <div
                className="h-full rounded-full bg-[#6aa221] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {pointsToLevel > 0
                ? `Butuh ${formatPoin(pointsToLevel)} poin lagi untuk membuka badge & voucher eksklusif ${nextLevelName}.`
                : `Selamat! Anda telah mencapai level ${nextLevelName}.`}
            </p>
          </div>
        </div>
      </section>

      {/* ── Aktivitas & Misi Harian ── */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Aktivitas & Misi Harian</h3>
            <p className="text-sm text-gray-500">Selesaikan misi untuk mengumpulkan poin nutrisi setiap hari</p>
          </div>
          <span className="self-start text-xs font-medium text-gray-500 bg-gray-100 rounded-lg px-3 py-1.5 shrink-0">
            Reset 24 Jam
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {missions.map(m => {
            const done = m.status === "done";
            return (
              <div
                key={m.id}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition ${
                  done ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${MISSION_ICON_TONE[m.tone]}`}>
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{m.title}</p>
                  <p className={`text-xs ${MISSION_SUBTITLE_TONE[m.tone]}`}>{m.subtitle}</p>
                </div>
                {done ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#15803d] bg-white border border-[#86efac] rounded-lg px-2.5 py-1.5 shrink-0">
                    <IconCheck className="w-3.5 h-3.5" />
                    Selesai
                  </span>
                ) : (
                  <button
                    onClick={() => m.to && onNavigate(m.to)}
                    className="text-xs font-semibold text-[#4d7c0f] bg-[#f0f4ea] hover:bg-[#e3ecd8] rounded-lg px-3 py-1.5 transition shrink-0"
                  >
                    {m.actionLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Katalog Hadiah & Voucher NutriShop ── */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Katalog Hadiah & Voucher NutriShop</h3>
            <p className="text-sm text-gray-500">Tukarkan poin aktif Anda dengan voucher belanja dan layanan konsultasi anak</p>
          </div>
          <span className="self-start text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 shrink-0">
            Saldo: <span className="font-bold text-[#4d7c0f]">{formatPoin(points)} Poin</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {catalog.map(r => {
            const affordable = points >= r.cost;
            const shortfall  = r.cost - points;
            const pct        = Math.min(100, Math.round((points / r.cost) * 100));

            return (
              <div
                key={r.id}
                className={`flex flex-col rounded-2xl border p-4 sm:p-5 transition ${
                  affordable ? "border-gray-200 bg-white hover:border-[#bbf7d0]" : "border-gray-200 bg-[#fafafa]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    affordable ? "bg-[#dcfce7] text-[#15803d]" : "bg-gray-100 text-gray-500"
                  }`}>
                    {r.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide rounded-md px-2 py-1 ${
                    affordable ? "bg-[#dcfce7] text-[#15803d]" : "bg-gray-200 text-gray-500"
                  }`}>
                    {affordable ? "Tersedia" : `Kurang ${formatPoin(shortfall)} Poin`}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-gray-900">{r.title}</h4>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-4">{r.description}</p>

                {!affordable && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
                      <span>{formatPoin(points)} Poin</span>
                      <span>Target {formatPoin(r.cost)} Poin</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full rounded-full bg-[#6aa221]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-400">Harga</p>
                    <p className={`text-base font-bold ${affordable ? "text-[#15803d]" : "text-gray-900"}`}>
                      {formatPoin(r.cost)} Poin
                    </p>
                  </div>
                  {affordable ? (
                    <button
                      onClick={() => onRedeem(r)}
                      className="bg-[#4d7c0f] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#3a5a00] transition"
                    >
                      Tukar Hadiah
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-200 text-gray-400 text-sm font-semibold px-4 py-2 rounded-xl cursor-not-allowed"
                    >
                      Poin Belum Cukup
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Riwayat Transaksi Poin Terakhir ── */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Riwayat Transaksi Poin Terakhir</h3>
            <p className="text-sm text-gray-500">Catatan perolehan dan penukaran poin Anda 7 hari terakhir</p>
          </div>
          <button
            onClick={() => setHistoryOpen(true)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#4d7c0f] hover:text-[#3a5a00] transition shrink-0"
          >
            Lihat Semua
            <IconChevronRight className="w-4 h-4" />
          </button>
        </div>

        <ul className="divide-y divide-gray-100">
          {transactions.slice(0, RECENT_TX_LIMIT).map(t => {
            const positive = t.amount > 0;
            return (
              <li key={t.id} className="flex items-center gap-3 sm:gap-4 py-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TX_ICON_TONE[t.tone]}`}>
                  {t.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.time}</p>
                </div>
                <span className={`text-xs sm:text-sm font-bold rounded-lg px-2.5 py-1 shrink-0 ${
                  positive ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#ef4444]"
                }`}>
                  {positive ? "+" : "−"}{formatPoin(Math.abs(t.amount))} Poin
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {historyOpen && (
        <HistoryModal transactions={transactions} onClose={() => setHistoryOpen(false)} />
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function EditProfile() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(() => {
    if (location.state && (location.state as any).activeMenu) {
      return (location.state as any).activeMenu;
    }
    return "data-diri";
  });

  // Address state
  const [addresses, setAddresses]           = useState<Address[]>([]);
  const [addrLoading, setAddrLoading]       = useState(true);
  const [addrSaving, setAddrSaving]         = useState(false);
  const [addressModal, setAddressModal]     = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null });

  // Child state
  const [children, setChildren]             = useState<ChildProfile[]>([]);
  const [childLoading, setChildLoading]     = useState(true);
  const [childSaving, setChildSaving]       = useState(false);
  const [childModal, setChildModal]         = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null });

  // Reward state
  const [rewardSummary, setRewardSummary] = useState<RewardSummary>(REWARD_SUMMARY);
  const [transactions, setTransactions]   = useState<PointTransaction[]>(POINT_TRANSACTIONS);
  const [redeemTarget, setRedeemTarget]   = useState<RewardItem | null>(null);
  const [redeemSaving, setRedeemSaving]   = useState(false);
  const [rewardNotice, setRewardNotice]   = useState("");

  // Password state
  const [passwords, setPasswords]   = useState({ current: "", newPass: "", confirm: "" });
  const [pwStrength, setPwStrength] = useState(0);
  const [pwSaving, setPwSaving]     = useState(false);
  const [pwError, setPwError]       = useState("");
  const [pwSuccess, setPwSuccess]   = useState("");

  // Data Diri state
  const [personalData, setPersonalData] = useState({ 
    nama: user?.nama || "", 
    tinggiBadanIbu: user?.tinggiBadanIbu || "" 
  });
  const [pdSaving, setPdSaving]         = useState(false);
  const [pdError, setPdError]           = useState("");
  const [pdSuccess, setPdSuccess]       = useState("");
  const [isEditingPD, setIsEditingPD]   = useState(false);

  // Sync personal data when user context updates
  useEffect(() => {
    if (user) {
      setPersonalData({
        nama: user.nama,
        tinggiBadanIbu: user.tinggiBadanIbu || ""
      });
    }
  }, [user]);

  // Auto-dismiss notifikasi penukaran hadiah
  useEffect(() => {
    if (!rewardNotice) return;
    const timer = setTimeout(() => setRewardNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [rewardNotice]);

  // Load addresses
  useEffect(() => {
    setAddrLoading(true);
    shopService.getAddresses()
      .then(raw => setAddresses((raw as BackendAddress[]).map(mapAddr)))
      .catch(() => setAddresses([]))
      .finally(() => setAddrLoading(false));
  }, []);

  // Load children
  useEffect(() => {
    setChildLoading(true);
    childrenService.getAll()
      .then(raw => setChildren(raw.map(c => ({
        id: c.id,
        namaDepan: c.namaDepan,
        namaAkhir: c.namaAkhir ?? "",
        tanggalLahir: c.tanggalLahir.split("T")[0],
        jenisKelamin: c.jenisKelamin,
      }))))
      .catch(() => setChildren([]))
      .finally(() => setChildLoading(false));
  }, []);

  // ── Address handlers ──
  const saveAddress = async (data: Omit<Address, "id" | "isDefault">, isDefault: boolean) => {
    setAddrSaving(true);
    try {
      const saved = await shopService.addAddress({
        namaPenerima:  data.namaPenerima,
        noTelepon:     data.noTelepon,
        alamatLengkap: data.alamatLengkap,
        kelurahan:     data.kelurahan,
        kecamatan:     data.kecamatan,
        kota:          data.kota,
        kodePos:       data.kodePos,
        isUtama:       isDefault,
      }) as BackendAddress;
      const mapped = mapAddr(saved);
      setAddresses(prev => [
        ...prev.map(a => isDefault ? { ...a, isDefault: false } : a),
        mapped,
      ]);
      setAddressModal({ open: false, editId: null });
    } catch {
      // keep modal open so user sees the error state
    } finally {
      setAddrSaving(false);
    }
  };

  const deleteAddress = (id: number) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    setAddressModal({ open: false, editId: null });
  };

  // ── Child handlers ──
  const saveChild = async (data: Omit<ChildProfile, "id">) => {
    setChildSaving(true);
    try {
      if (childModal.editId !== null) {
        const updated = await childrenService.update(childModal.editId, {
          namaDepan: data.namaDepan,
          namaAkhir: data.namaAkhir || undefined,
          tanggalLahir: data.tanggalLahir,
          jenisKelamin: data.jenisKelamin,
        });
        setChildren(prev => prev.map(c =>
          c.id === childModal.editId
            ? { id: updated.id, namaDepan: updated.namaDepan, namaAkhir: updated.namaAkhir ?? "", tanggalLahir: updated.tanggalLahir.split("T")[0], jenisKelamin: updated.jenisKelamin }
            : c
        ));
      } else {
        const created = await childrenService.create({
          namaDepan: data.namaDepan,
          namaAkhir: data.namaAkhir || undefined,
          tanggalLahir: data.tanggalLahir,
          jenisKelamin: data.jenisKelamin,
        });
        setChildren(prev => [...prev, {
          id: created.id,
          namaDepan: created.namaDepan,
          namaAkhir: created.namaAkhir ?? "",
          tanggalLahir: created.tanggalLahir.split("T")[0],
          jenisKelamin: created.jenisKelamin,
        }]);
      }
      setChildModal({ open: false, editId: null });
    } catch {
      // keep modal open
    } finally {
      setChildSaving(false);
    }
  };

  const deleteChild = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus profil anak ini?")) return;
    setChildSaving(true);
    try {
      await childrenService.delete(id);
      setChildren(prev => prev.filter(c => c.id !== id));
      setChildModal({ open: false, editId: null });
    } catch {
      alert("Gagal menghapus profil anak.");
    } finally {
      setChildSaving(false);
    }
  };

  // ── Reward handlers ──
  const handleRedeemReward = (reward: RewardItem) => setRedeemTarget(reward);

  const confirmRedeem = async () => {
    if (!redeemTarget) return;
    if (rewardSummary.points < redeemTarget.cost) { setRedeemTarget(null); return; }

    setRedeemSaving(true);
    try {
      // TODO: await apiClient.post("/api/rewards/redeem", { rewardId: redeemTarget.id });
      // Setelah endpoint tersedia, gunakan saldo & riwayat dari response server.
      const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");

      setRewardSummary(prev => ({ ...prev, points: prev.points - redeemTarget.cost }));
      setTransactions(prev => [{
        id: `redeem-${Date.now()}`,
        title: `Tukar ${redeemTarget.title}`,
        time: `Hari ini • ${now} WIB`,
        amount: -redeemTarget.cost,
        tone: "red",
        icon: <IconGift className="w-5 h-5" />,
      }, ...prev]);
      setRewardNotice(`Berhasil menukar "${redeemTarget.title}". Sisa saldo ${formatPoin(rewardSummary.points - redeemTarget.cost)} poin.`);
      setRedeemTarget(null);
    } catch {
      setRewardNotice("");
      alert("Gagal menukar hadiah. Coba lagi.");
    } finally {
      setRedeemSaving(false);
    }
  };

  // ── Password handlers ──
  const handleNewPassword = (val: string) => {
    setPasswords(p => ({ ...p, newPass: val }));
    let s = 0;
    if (val.length >= 8) s++;
    if (/[A-Z]/.test(val)) s++;
    if (/[0-9]/.test(val)) s++;
    if (/[^A-Za-z0-9]/.test(val)) s++;
    setPwStrength(s);
  };

  const handleChangePassword = async () => {
    setPwError(""); setPwSuccess("");
    if (!passwords.current)           { setPwError("Masukkan password lama."); return; }
    if (passwords.newPass.length < 8) { setPwError("Password baru minimal 8 karakter."); return; }
    if (passwords.newPass !== passwords.confirm) { setPwError("Konfirmasi password tidak cocok."); return; }
    setPwSaving(true);
    try {
      await apiClient.post("/api/auth/change-password", {
        currentPassword: passwords.current,
        newPassword:     passwords.newPass,
      });
      setPwSuccess("Password berhasil diubah!");
      setPasswords({ current: "", newPass: "", confirm: "" });
      setPwStrength(0);
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } };
      setPwError(ax?.response?.data?.message ?? "Gagal mengubah password. Coba lagi.");
    } finally {
      setPwSaving(false);
    }
  };

  const handleSavePersonalData = async () => {
    setPdError(""); setPdSuccess("");
    if (!personalData.nama.trim()) { setPdError("Nama tidak boleh kosong."); return; }
    
    setPdSaving(true);
    try {
      await apiClient.patch("/api/auth/me", {
        nama: personalData.nama,
        tinggiBadanIbu: personalData.tinggiBadanIbu ? parseFloat(personalData.tinggiBadanIbu.toString()) : null
      });
      await refreshUser();
      setPdSuccess("Data diri berhasil diperbarui!");
      setIsEditingPD(false);
    } catch (e: any) {
      setPdError(e.response?.data?.message || "Gagal memperbarui data diri.");
    } finally {
      setPdSaving(false);
    }
  };

  const strengthLabel = ["", "Lemah", "Cukup", "Bagus", "Kuat"][pwStrength];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"][pwStrength];

  const editingAddress = addressModal.editId !== null ? addresses.find(a => a.id === addressModal.editId) : null;
  const editingChild   = childModal.editId   !== null ? children.find(c => c.id === childModal.editId)   : null;

  return (
    <div className="min-h-screen bg-[#f7f9f4] font-sans flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Profile header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="profile" />
                : <img src={fotoProfile}    className="w-full h-full object-cover" alt="profile" />
              }
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#4d7c0f] rounded-full flex items-center justify-center shadow">
              <img src={iconCamera} className="w-4 h-4 object-contain" alt="camera" />
            </button>
          </div>
          <p className="font-bold text-gray-900 text-lg">{user?.nama ?? "—"}</p>
          <p className="text-sm text-gray-400">{user?.email ?? ""}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4d7c0f] bg-[#f0fde4] border border-[#d9f2c4] rounded-full px-3 py-1">
            <IconSparkles className="w-3.5 h-3.5" />
            Level: {rewardSummary.levelName}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

          {/* Sidebar */}
          <div className="md:col-span-1 bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Main Menu</p>
            <div className="space-y-1">
              <MenuItem icon={fotoProfile}  label="Data Diri"      active={activeMenu === "data-diri"}      onClick={() => setActiveMenu("data-diri")} />
              <MenuItem icon={iconAlamat}   label="Alamat"         active={activeMenu === "alamat"}         onClick={() => setActiveMenu("alamat")} />
              <MenuItem icon={iconAnak}     label="Profil Anak"    active={activeMenu === "profil-anak"}    onClick={() => setActiveMenu("profil-anak")} />
              <MenuItem icon={<IconGift className="w-5 h-5" />} label="Hadiah" active={activeMenu === "hadiah"} onClick={() => setActiveMenu("hadiah")} />
              <MenuItem icon={iconPassword} label="Reset Password" active={activeMenu === "reset-password"} onClick={() => setActiveMenu("reset-password")} />
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3 min-w-0">
            <AnimatePresence mode="wait">
              {activeMenu === "data-diri" && (
                <motion.div
                  key="data-diri"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-1">Personal Information</h2>
                      <p className="text-sm text-gray-400">Update your basic profile details here.</p>
                    </div>
                    {!isEditingPD && (
                      <button 
                        onClick={() => setIsEditingPD(true)}
                        className="flex items-center gap-2 text-sm font-semibold text-[#4d7c0f] hover:text-[#3a5a00] transition"
                      >
                        <img src={editsign} alt="" className="w-4 h-4" />
                        Edit Profil
                      </button>
                    )}
                  </div>
                  
                  {pdError && <p className="text-xs text-red-500 mb-4 bg-red-50 rounded-lg px-3 py-2">{pdError}</p>}
                  {pdSuccess && <p className="text-xs text-green-600 mb-4 bg-green-50 rounded-lg px-3 py-2">{pdSuccess}</p>}
                  
                  {isEditingPD ? (
                    /* EDIT MODE */
                    <>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                          <input 
                            type="text" 
                            placeholder="Masukkan nama lengkap"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                            value={personalData.nama}
                            onChange={e => setPersonalData(p => ({ ...p, nama: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Tinggi Badan Ibu (cm)</label>
                          <input 
                            type="number" 
                            placeholder="Contoh: 155"
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                            value={personalData.tinggiBadanIbu}
                            onChange={e => setPersonalData(p => ({ ...p, tinggiBadanIbu: e.target.value }))}
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Data ini digunakan untuk perhitungan akurat pada prediksi stunting.</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button 
                          onClick={() => {
                            setIsEditingPD(false);
                            setPersonalData({ nama: user?.nama || "", tinggiBadanIbu: user?.tinggiBadanIbu || "" });
                          }}
                          className="text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-100 transition text-sm"
                        >
                          Batal
                        </button>
                        <button 
                          onClick={handleSavePersonalData} 
                          disabled={pdSaving}
                          className="bg-[#4d7c0f] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a5a00] transition text-sm disabled:opacity-60"
                        >
                          {pdSaving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                      </div>
                    </>
                  ) : (
                    /* VIEW MODE */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</p>
                          <p className="text-sm text-gray-900 font-medium">{user?.nama || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tinggi Badan Ibu</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {user?.tinggiBadanIbu ? `${user.tinggiBadanIbu} cm` : "Belum diisi"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Email</p>
                        <p className="text-sm text-gray-500 font-medium">{user?.email || "—"}</p>
                        <p className="text-[10px] text-gray-400 mt-1 italic">* Email tidak dapat diubah (terhubung ke akun Google/Login)</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeMenu === "alamat" && (
                <motion.div
                  key="alamat"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-1">Daftar Alamat</h2>
                      <p className="text-sm text-gray-400">Kelola alamat pengiriman belanja Anda di sini.</p>
                    </div>
                    <button 
                      onClick={() => setAddressModal({ open: true, editId: null })}
                      className="flex items-center gap-2 text-sm font-semibold text-[#4d7c0f] hover:text-[#3a5a00] transition"
                    >
                      + Tambah Alamat
                    </button>
                  </div>

                  {addrLoading ? (
                    <div className="text-center text-sm text-gray-400 py-8">Memuat alamat...</div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 py-8">Belum ada alamat tersimpan.</div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map(addr => (
                        <div key={addr.id} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition relative flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-bold text-gray-900 text-sm">{addr.namaPenerima}</p>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-green-50 text-[#4d7c0f] border border-green-200 font-semibold px-2 py-0.5 rounded-full">
                                  Utama
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{addr.noTelepon}</p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {addr.alamatLengkap}, Kel. {addr.kelurahan}, Kec. {addr.kecamatan}, {addr.kota}, {addr.kodePos}
                            </p>
                          </div>
                          <button 
                            onClick={() => setAddressModal({ open: true, editId: addr.id })}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#4d7c0f] hover:text-[#3a5a00] transition"
                          >
                            <img src={editsign} alt="" className="w-3.5 h-3.5" />
                            Ubah
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeMenu === "profil-anak" && (
                <motion.div
                  key="profil-anak"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-1">Profil Anak</h2>
                      <p className="text-sm text-gray-400">Kelola profil balita untuk perhitungan gizi & tumbuh kembang.</p>
                    </div>
                    <button 
                      onClick={() => setChildModal({ open: true, editId: null })}
                      className="flex items-center gap-2 text-sm font-semibold text-[#4d7c0f] hover:text-[#3a5a00] transition"
                    >
                      + Tambah Anak
                    </button>
                  </div>

                  {childLoading ? (
                    <div className="text-center text-sm text-gray-400 py-8">Memuat data anak...</div>
                  ) : children.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 py-8">Belum ada profil anak.</div>
                  ) : (
                    <div className="space-y-4">
                      {children.map(child => (
                        <div key={child.id} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#f4f7f0] flex items-center justify-center">
                              <img 
                                src={child.jenisKelamin === "LAKI_LAKI" ? boysymbol : girlsymbol} 
                                alt={child.jenisKelamin} 
                                className="w-6 h-6 object-contain" 
                              />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {child.namaDepan} {child.namaAkhir}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Lahir: {new Date(child.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setChildModal({ open: true, editId: child.id })}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#4d7c0f] hover:text-[#3a5a00] transition"
                          >
                            <img src={editsign} alt="" className="w-3.5 h-3.5" />
                            Ubah
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeMenu === "hadiah" && (
                <motion.div
                  key="hadiah"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <RewardsPanel
                    summary={rewardSummary}
                    missions={MISSIONS}
                    catalog={REWARD_CATALOG}
                    transactions={transactions}
                    notice={rewardNotice}
                    onRedeem={handleRedeemReward}
                    onNavigate={navigate}
                  />
                </motion.div>
              )}

              {activeMenu === "reset-password" && (
                <motion.div
                  key="reset-password"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h2>
                  <p className="text-sm text-gray-400 mb-6">Ubah kata sandi akun Anda demi keamanan.</p>

                  {pwError && <p className="text-xs text-red-500 mb-4 bg-red-50 rounded-lg px-3 py-2">{pwError}</p>}
                  {pwSuccess && <p className="text-xs text-green-600 mb-4 bg-green-50 rounded-lg px-3 py-2">{pwSuccess}</p>}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password Lama</label>
                      <input 
                        type="password" 
                        placeholder="Masukkan password lama"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                        value={passwords.current}
                        onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
                      <input 
                        type="password" 
                        placeholder="Minimal 8 karakter"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                        value={passwords.newPass}
                        onChange={e => handleNewPassword(e.target.value)}
                      />
                      {passwords.newPass && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-300"
                              style={{ 
                                width: `${(pwStrength / 4) * 100}%`, 
                                backgroundColor: strengthColor 
                              }} 
                            />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: strengthColor }}>
                            {strengthLabel}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Konfirmasi Password Baru</label>
                      <input 
                        type="password" 
                        placeholder="Ulangi password baru"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                        value={passwords.confirm}
                        onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                      />
                      {passwords.confirm && passwords.newPass !== passwords.confirm && (
                        <p className="text-xs text-red-500 mt-1">Password tidak cocok.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button onClick={handleChangePassword} disabled={pwSaving}
                      className="bg-[#4d7c0f] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a5a00] transition text-sm disabled:opacity-60">
                      {pwSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Modals */}
      {addressModal.open && (
        <AddressModal
          isNew={addressModal.editId === null}
          initial={editingAddress ?? emptyAddress()}
          onSave={saveAddress}
          onDelete={editingAddress ? () => deleteAddress(editingAddress.id) : undefined}
          onClose={() => setAddressModal({ open: false, editId: null })}
          saving={addrSaving}
        />
      )}
      {redeemTarget && (
        <RedeemModal
          reward={redeemTarget}
          balance={rewardSummary.points}
          saving={redeemSaving}
          onConfirm={confirmRedeem}
          onClose={() => setRedeemTarget(null)}
        />
      )}
      {childModal.open && (
        <ChildModal
          isNew={childModal.editId === null}
          initial={editingChild ?? emptyChild()}
          onSave={saveChild}
          onDelete={editingChild ? () => deleteChild(editingChild.id) : undefined}
          onClose={() => setChildModal({ open: false, editId: null })}
          saving={childSaving}
        />
      )}
    </div>
  );
}