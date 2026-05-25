import { useEffect, useMemo, useState } from "react";

import img1 from "../assets/images/img-article-1.png";

import iconHydration from "../assets/icons/icon-hydration.png";
import iconSleep from "../assets/icons/icon-sleep.png";
import iconSupplement from "../assets/icons/icon-supplement.png";

import shopImg1 from "../assets/images/images-shop-1.png";
import shopImg2 from "../assets/images/images-shop-2.png";
import shopImg3 from "../assets/images/images-shop-3.png";
import shopImg4 from "../assets/images/images-shop-4.png";

import doctor1 from "../assets/images/images-doctor-1.png";
import doctor2 from "../assets/images/images-doctor-2.png";
import doctor3 from "../assets/images/images-doctor-3.png";

import iconTeleNutri from "../assets/icons/icon-tele-nutritionist.png";
import iconNutriShop from "../assets/icons/icon-nutrishop.png";
import iconWHO from "../assets/icons/icon-who.png";
import { childrenService } from "../services/children.service";
import { healthLogService } from "../services/healthLog.service";
import { shopService } from "../services/shop.service";
import { teleNutritionistService, type Spesialis } from "../services/teleNutritionist.service";
import { articleService, type ArticleCard } from "../services/article.service";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

// ── Types ──────────────────────────────────────────────────────────────────
interface HealthItem {
  icon: string;
  label: string;
  value: string;
  percent: number;
  color: string;
}

interface GrowthPoint {
  label: string;
  val: number;
  height: number;
  weight: number;
}

interface ChildOption {
  id: number;
  namaDepan: string;
  namaAkhir: string | null;
}

interface ShopItem {
  label: string;
  image: string;
}

// ── Static data ────────────────────────────────────────────────────────────
const defaultHealthItems: HealthItem[] = [
  { icon: iconHydration, label: "Hidrasi", value: "0%", percent: 0, color: "#f97316" },
  { icon: iconSleep, label: "Kualitas Tidur", value: "0 hrs", percent: 0, color: "#3b82f6" },
  { icon: iconSupplement, label: "Asupan Suplemen", value: "Memuat", percent: 0, color: "#22c55e" },
];

const getTagColor = (category: string) => {
  const cat = category.toUpperCase();
  if (cat.includes("NUTRISI")) return "#22c55e";
  if (cat.includes("PERAWATAN")) return "#f97316";
  if (cat.includes("PERKEMBANGAN")) return "#3b82f6";
  return "#6366f1";
};

const defaultGrowthData: GrowthPoint[] = [
  { label: "6 BULAN", val: 30, height: 30, weight: 5.2 },
  { label: "8 BULAN", val: 38, height: 38, weight: 6.1 },
  { label: "10 BULAN", val: 52, height: 52, weight: 7.3 },
  { label: "12 BULAN", val: 61, height: 61, weight: 8.2 },
  { label: "SEKARANG", val: 82, height: 82, weight: 9.4 },
];

// Produk NutriShop — label ditampilkan di atas gambar (overlay)
const defaultShopItems: ShopItem[] = [
  { label: "Suplemen Vit A", image: shopImg1 },
  { label: "Camilan Organik", image: shopImg2 },
  { label: "Multivitamin Anak", image: shopImg3 },
  { label: "Puree Sayuran", image: shopImg4 },
];


// ── Helpers ───────────────────────────────────────────────────────────────
const extractPercentileNumber = (raw: string | null | undefined): number | null => {
  if (!raw) return null;
  const m = raw.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const num = Number(m[0]);
  return Number.isNaN(num) ? null : num;
};

const formatAgeLabel = (days: number): string => {
  const totalMonths = Math.max(0, Math.round(days / 30.44));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y${months}m`;
};

const getStuntingStyle = (value: string) => {
  const low = value.toLowerCase();
  if (low.includes("tinggi") || low.includes("stunting")) {
    return { bg: "#FFEBEE", border: "#FFCDD2", text: "#B91C1C", label: "#E57373" };
  }
  if (low.includes("moderate") || low.includes("attention")) {
    return { bg: "#FFF3E0", border: "#FFE0B2", text: "#E65100", label: "#FB8C00" };
  }
  return { bg: "#F1F8E9", border: "#C5E1A5", text: "#2E7D32", label: "#7CB342" };
};

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data }: { data: GrowthPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const W = 520, H = 160, PAD = 20;

  const safeData = data.length > 0 ? data : defaultGrowthData;
  const values = safeData.map((d) => d.val);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = Math.max(1, maxVal - minVal);

  const xs = safeData.map((_, i) => PAD + (i / Math.max(1, safeData.length - 1)) * (W - PAD * 2));
  const ys = safeData.map((d) => H - PAD - ((d.val - minVal) / range) * (H - PAD * 2));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${line} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;

  return (
    <div className="relative group/sparkline">
      {/* Custom Tooltip */}
      {activeIndex !== null && (
        <div
          className="absolute z-50 pointer-events-none bg-slate-900 text-white rounded-lg px-3 py-2 shadow-xl border border-slate-700 text-xs font-[Montserrat,sans-serif] -translate-x-1/2 -translate-y-full mb-2"
          style={{
            left: `${(xs[activeIndex] / W) * 100}%`,
            top: `${(ys[activeIndex] / H) * 100}%`,
            marginTop: '-10px'
          }}
        >
          <p className="font-bold text-slate-300 mb-0.5 text-[11px] uppercase tracking-wider">{safeData[activeIndex].label}</p>
          <div className="space-y-0.5">
            <p className="font-bold text-[#86efac] text-[11px]">Height: <span className="text-white">{safeData[activeIndex].height.toFixed(1)} cm</span></p>
            <p className="font-bold text-[#86efac] text-[11px]">Weight: <span className="text-white">{safeData[activeIndex].weight.toFixed(1)} kg</span></p>
          </div>
          {/* Arrow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900" />
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4d7c0f" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4d7c0f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#gfill)" />
        <path d={line} fill="none" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {activeIndex !== null && (
          <line x1={xs[activeIndex]} y1={PAD - 4} x2={xs[activeIndex]} y2={H - PAD + 4} stroke="#4d7c0f" strokeOpacity="0.22" strokeDasharray="3 3" />
        )}
        {xs.map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={ys[i]}
            r={activeIndex === i ? 5.5 : 4}
            fill="#4d7c0f"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          />
        ))}
      </svg>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.nama?.split(' ')[0] ?? 'Kamu';
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [selectedChild, setSelectedChild] = useState("Leo");

  const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);
  const [heightValue, setHeightValue] = useState("—");
  const [weightValue, setWeightValue] = useState("—");
  const [heightSub, setHeightSub] = useState("Memuat...");
  const [weightSub, setWeightSub] = useState("Memuat...");
  const [stuntingValue, setStuntingValue] = useState("—");
  const [stuntingSub, setStuntingSub] = useState("Memuat...");

  const [healthItems, setHealthItems] = useState<HealthItem[]>(defaultHealthItems);
  const [shopItems, setShopItems] = useState<ShopItem[]>(defaultShopItems);
  const [specialists, setSpecialists] = useState<Spesialis[]>([]);
  const [articleList, setArticleList] = useState<ArticleCard[]>([]);

  const selectedChildName = useMemo(() => {
    const child = children.find((c) => c.id === selectedChildId);
    if (!child) return selectedChild;
    return `${child.namaDepan}${child.namaAkhir ? ` ${child.namaAkhir}` : ""}`;
  }, [children, selectedChild, selectedChildId]);

  useEffect(() => {
    let cancelled = false;
    childrenService.getAll()
      .then((rows) => {
        if (cancelled) return;
        setChildren(rows);
        if (rows.length > 0) {
          setSelectedChildId(rows[0].id);
          setSelectedChild(`${rows[0].namaDepan}${rows[0].namaAkhir ? ` ${rows[0].namaAkhir}` : ""}`);
        } else {
          setSelectedChildId(null);
          setSelectedChild("Belum ada data anak");
          setGrowthData([]);
          setHeightValue("—");
          setWeightValue("—");
          setHeightSub("Tambahkan data anak terlebih dahulu");
          setWeightSub("Tambahkan data anak terlebih dahulu");
          setStuntingValue("—");
          setStuntingSub("Tidak ada data");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setSelectedChildId(null);
        setSelectedChild("Belum ada data anak");
        setGrowthData([]);
        setHeightValue("—");
        setWeightValue("—");
        setHeightSub("Gagal memuat data");
        setWeightSub("Gagal memuat data");
        setStuntingValue("—");
        setStuntingSub("Terjadi kesalahan");
      });

    healthLogService.getTodayLog()
      .then((log) => {
        if (cancelled || !log) return;

        const hydrationPct = Math.max(0, Math.min(100, Math.round((log.water_glasses / 8) * 100)));
        const sleepPct = Math.max(0, Math.min(100, Math.round((log.sleep_hours / 8) * 100)));
        const supplementPct = log.took_supplement ? 100 : 0;

        setHealthItems([
          {
            icon: iconHydration,
            label: "Hidrasi",
            value: `${hydrationPct}%`,
            percent: hydrationPct,
            color: "#f97316",
          },
          {
            icon: iconSleep,
            label: "Kualitas Tidur",
            value: `${log.sleep_hours} jam`,
            percent: sleepPct,
            color: "#3b82f6",
          },
          {
            icon: iconSupplement,
            label: "Asupan Suplemen",
            value: log.took_supplement ? "Sudah dikonsumsi" : "Menunggu",
            percent: supplementPct,
            color: "#22c55e",
          },
        ]);
      })
      .catch(() => { });

    shopService.getProducts()
      .then((products) => {
        if (cancelled || products.length === 0) return;
        const mapped = products.slice(0, 4).map((product, idx) => ({
          label: product.title,
          image: product.image && product.image.trim() !== "" ? product.image : defaultShopItems[idx % defaultShopItems.length].image,
        }));
        setShopItems(mapped);
      })
      .catch(() => { });

    teleNutritionistService.getSpecialists({ page: 1 })
      .then((res) => {
        if (cancelled) return;
        setSpecialists(res.specialists.slice(0, 3));
      })
      .catch(() => { });

    articleService.getArticles({ limit: 3 })
      .then((res) => {
        if (cancelled) return;
        setArticleList(res.articles);
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;
    let cancelled = false;

    Promise.all([
      childrenService.getLatestGrowth(selectedChildId).catch(() => null),
      childrenService.getPercentile(selectedChildId).catch(() => []),
    ])
      .then(([latest, percentile]) => {
        if (cancelled) return;

        const sorted = [...percentile].sort((a, b) => a.usiaHari - b.usiaHari);
        const recent = sorted.slice(-5);
        if (recent.length > 0) {
          const mapped = recent.map((item) => ({
            label: formatAgeLabel(item.usiaHari),
            val: item.tinggiBadan,
            height: item.tinggiBadan,
            weight: item.beratBadan,
          }));
          setGrowthData(mapped);

          const current = mapped[mapped.length - 1];
          const prev = mapped.length > 1 ? mapped[mapped.length - 2] : null;

          const currentWeight = current.weight;
          const prevWeight = prev ? prev.weight : null;

          const hDelta = prev ? current.height - prev.height : null;
          const wDelta = prevWeight !== null ? currentWeight - prevWeight : null;

          setHeightValue(`${(Number(current.height) || 0).toFixed(1)} cm`);
          setWeightValue(`${(Number(current.weight) || 0).toFixed(1)} kg`);

          setHeightSub(hDelta === null ? "Belum ada data sebelumnya" : `${hDelta >= 0 ? "+" : ""}${hDelta.toFixed(1)} cm ${hDelta >= 0 ? "↑" : "↓"}`);
          setWeightSub(wDelta === null ? "Belum ada data sebelumnya" : `${wDelta >= 0 ? "+" : ""}${wDelta.toFixed(1)} kg ${wDelta >= 0 ? "↑" : "↓"}`);

          const lastRec = recent[recent.length - 1];
          const hasAiPrediction = lastRec.risikoStuntingMl !== null;

          if (hasAiPrediction) {
            const rawLabel = lastRec.risikoStuntingMl ?? "Tidak diketahui"
            const lowAlpha = rawLabel.toLowerCase()
            const conf = lastRec.mlConfidence ?? null
            const isStunting = lowAlpha.includes('stunting')
            const category = !isStunting ? 'low' : (conf != null && conf >= 65 ? 'high' : 'moderate')
            setStuntingValue(category === 'high' ? 'Tinggi' : category === 'moderate' ? 'Sedang' : 'Rendah')
            if (isStunting) {
              setStuntingSub(conf != null ? `Stunting · ${conf.toFixed(1)}% tingkat kepercayaan` : 'Stunting terdeteksi')
            } else {
              setStuntingSub(conf != null ? `Normal · ${conf.toFixed(1)}% tingkat kepercayaan` : 'Pertumbuhan normal')
            }
          } else {
            const pNum = extractPercentileNumber(lastRec.persentilTinggi);
            if (pNum !== null && pNum <= 3) {
              setStuntingValue("Tinggi");
              setStuntingSub("Pantau secara rutin");
            } else if (pNum !== null && pNum <= 15) {
              setStuntingValue("Sedang");
              setStuntingSub("Butuh perhatian");
            } else {
              setStuntingValue("Rendah");
              setStuntingSub("Pertumbuhan normal");
            }
          }

        } else {
          // If no records, reset to "no data" state
          setGrowthData([]);
          setHeightValue("—");
          setWeightValue("—");
          setHeightSub("Data belum tersedia");
          setWeightSub("Data belum tersedia");
          setStuntingValue("—");
          setStuntingSub("Catat pengukuran terlebih dahulu");
        }

        if (latest) {
          setHeightValue(`${(Number(latest.tinggiBadan) || 0).toFixed(1)} cm`);
          setWeightValue(`${(Number(latest.beratBadan) || 0).toFixed(1)} kg`);
        } else if (recent.length > 0) {
          const fallback = recent[recent.length - 1];
          setHeightValue(`${(Number(fallback.tinggiBadan) || 0).toFixed(1)} cm`);
          setWeightValue(`${(Number(fallback.beratBadan) || 0).toFixed(1)} kg`);
        }
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, [selectedChildId]);

  return (
    <div className="min-h-screen bg-[#f7f9f4] font-sans flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900">Selamat Pagi, {userName}!</h1>
          <p className="text-gray-500 mt-1 text-sm">Mari lanjutkan perjalanan nutrisi optimal untuk si kecil bersama NutriGrow.</p>
        </div>

        {/* Growth + Health Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Growth card */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3 gap-4">
              <div className="flex-1">
                <p className="text-xs font-bold tracking-widest text-[#4d7c0f] uppercase">Pemantau Pertumbuhan Cerdas</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <select
                    value={selectedChildId ?? ""}
                    onChange={(e) => {
                      if (e.target.value) setSelectedChildId(Number(e.target.value));
                    }}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]"
                  >
                    {!selectedChildId && <option value="" disabled>Pilih Anak</option>}
                    {children.length === 0 && <option value="" disabled>Child: {selectedChild}</option>}
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {`${child.namaDepan}${child.namaAkhir ? ` ${child.namaAkhir}` : ""}`}
                      </option>
                    ))}
                  </select>
                  <h2 className="text-xl font-bold text-gray-900">Tinggi & Berat Badan {selectedChildName}</h2>
                </div>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">Pantau perkembangan bayi Anda melalui grafik pertumbuhan kami yang komprehensif. Lacak tinggi, berat badan, dan risiko stunting untuk memastikan ia mencapai target perkembangan dengan akurat.</p>
              </div>
              {/* <span className="flex items-center gap-1 text-xs font-medium text-[#4d7c0f] bg-green-50 border border-green-200 rounded-full px-3 py-1 flex-shrink-0"><img src={iconHealthyRange} className="w-4 h-4 object-contain" alt="" /> Within Healthy Range</span> */}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: "Tinggi Badan", value: heightValue, sub: heightSub },
                { label: "Berat Badan", value: weightValue, sub: weightSub },
                { label: "Risiko Stunting", value: stuntingValue, sub: stuntingSub, isRisk: true },
              ].map(s => {
                const style = s.isRisk ? getStuntingStyle(s.value) : null;
                return (
                  <div 
                    key={s.label} 
                    className="rounded-xl p-3 flex flex-col justify-between transition-colors border border-transparent"
                    style={style ? { backgroundColor: style.bg, borderColor: style.border } : { backgroundColor: '#f8fafc' }}
                  >
                    <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: style ? style.label : '#64748b' }}>{s.label}</p>
                    <p className="text-xl font-bold mt-1" style={{ color: style ? style.text : '#0f172a' }}>{s.value}</p>
                    <p className="text-[11px] font-medium mt-1 leading-tight" style={{ color: style ? style.text : '#94a3b8', opacity: style ? 0.7 : 1 }}>{s.sub}</p>
                  </div>
                );
              })}
              <button
                type="button"
                  onClick={() => {
                  navigate("/growth-tracker")
                }
                }
                className="bg-[#4d7c0f] rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:bg-[#3a5a00] transition text-left border-none w-full"
              >
                <p className="text-xs text-green-200">Jelajahi lebih lanjut!</p>
                <p className="text-sm font-bold text-white leading-tight">Lihat selengkapnya di sini</p>
                <span className="text-white text-lg">›</span>
              </button>
            </div>
            <div className="mt-4">
              {children.length > 0 && growthData.length > 0 ? (
                <>
                  <Sparkline data={growthData} />
                  <div className="flex justify-between text-[10px] font-bold text-[#94a3b8] px-1 mt-1 font-[Montserrat,sans-serif]">
                    {growthData.map(d => <span key={d.label}>{d.label}</span>)}
                  </div>
                </>
              ) : children.length > 0 ? (
                <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400 font-medium text-sm">
                  Belum ada catatan pertumbuhan untuk {selectedChildName}. Yuk, catat pertumbuhan pertamanya!
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400 font-medium text-sm">
                  Belum ada data anak. Tambahkan profil anak untuk melihat grafik pertumbuhan.
                </div>
              )}
            </div>
          </div>

          {/* Health Log card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Catatan Kesehatan</h2>
              <p className="text-xs text-gray-400 mt-1">Catat metrik kesehatan vital Anda termasuk pola tidur, tingkat hidrasi, dan asupan nutrisi untuk memastikan Anda tetap sehat mendampingi si kecil.</p>
            </div>

            {healthItems.map(h => (
              <div key={h.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    {/* Icon langsung tanpa circle tambahan */}
                    <img src={h.icon} className="w-8 h-8 object-contain" alt={h.label} />
                    {h.label}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{h.value}</span>
                </div>
                {/* Progress bar mulai dari setelah icon, sejajar tulisan */}
                <div className="ml-10 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${h.percent}%`, backgroundColor: h.color }} />
                </div>
              </div>
            ))}

            {/* Button tidak full width */}
            <div className="mt-auto flex justify-center">
              <button
                type="button"
                onClick={() => {
                  navigate("/health-log")
                }
                }
                className="bg-[#4d7c0f] text-white font-semibold rounded-xl py-3 px-8 text-sm hover:bg-[#3a5a00] transition"
              >
                Data catatan lainnya
              </button>
            </div>
          </div>
        </div>

        {/* Tele-Nutritionist + NutriShop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Tele-Nutritionist — sesuai desain */}
          <div className="bg-[#e8f5d0] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-3">
            {/* Icon lingkaran hijau */}
            <div className="w-16 h-16 rounded-full bg-[#d4edaa] flex items-center justify-center">
              <img src={iconTeleNutri} className="w-8 h-8 object-contain" alt="" />
            </div>

            <h3 className="text-xl font-bold text-gray-900">Tele-Nutritionist</h3>
            <p className="text-sm text-gray-500">
              Konsultasi langsung dengan ahli gizi bersertifikat untuk program nutrisi personal.
            </p>

            {/* Foto dokter */}
            <div className="flex -space-x-3 mt-1">
              {specialists.length > 0 ? (
                specialists.map((s, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={s.foto || doctor1} className="w-full h-full object-cover" alt={s.nama} />
                  </div>
                ))
              ) : (
                [doctor1, doctor2, doctor3].map((doc, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden flex-shrink-0">
                    <img src={doc} className="w-full h-full object-cover" alt={`doctor ${i + 1}`} />
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => navigate("/tele-nutritionist")}
              className="text-sm font-semibold text-[#4d7c0f] flex items-center gap-1 hover:underline mt-1 bg-transparent border-none cursor-pointer"
            >
              Jadwalkan Sesi ›
            </button>
          </div>

          {/* NutriShop */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">NutriShop</h3>
              <img src={iconNutriShop} className="w-6 h-6 object-contain" alt="" />
            </div>
            <p className="text-sm text-gray-500 mb-4">Kurasi suplemen dan camilan sehat yang telah terverifikasi oleh tim NutriGrow.</p>

            {/* Grid produk — label overlay di dalam gambar */}
            <div className="grid grid-cols-4 gap-3">
              {shopItems.map(item => (
                <div key={item.label} className="relative rounded-xl overflow-hidden cursor-pointer group h-24">
                  <img
                    src={item.image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={item.label}
                  />
                  {/* Label overlay di bawah gambar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                    <p className="text-[10px] font-semibold text-white text-center leading-tight">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Button di tengah */}
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/nutrishop")}
                className="text-sm font-semibold text-[#4d7c0f] flex items-center gap-1 hover:underline"
              >
                Kunjungi NutriShop ›
              </button>
            </div>
          </div>
        </div>

        {/* Articles */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rekomendasi Artikel</h2>
              <p className="text-sm text-gray-500">Panduan nutrisi dan kesehatan yang dipersonalisasi untuk Anda.</p>
            </div>
            <button 
              onClick={() => navigate("/artikel")}
              className="text-sm font-medium text-[#4d7c0f] hover:underline bg-transparent border-none cursor-pointer"
            >
              Lihat Semua Artikel ›
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articleList.length > 0 ? (
              articleList.map(a => (
                <Link 
                  to={`/baca-artikel/${a.id}`} 
                  key={a.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer no-underline text-inherit block"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={a.image || img1} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      alt={a.title} 
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <span 
                      className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full" 
                      style={{ color: getTagColor(a.category), backgroundColor: getTagColor(a.category) + "1a" }}
                    >
                      {a.category.toUpperCase()}
                    </span>
                    <h3 className="font-bold text-gray-900 leading-snug">{a.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{a.description}</p>
                    <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
                      <div className="flex items-center">
                        <img src={iconWHO} className="w-4 h-4 object-contain inline mr-1" alt="" />
                        World Health Organization
                      </div>
                      <span>{a.readTime} menit baca</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center col-span-full py-8 text-gray-500 text-sm">Memuat artikel...</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}