import { useState } from "react";

import img1 from "../assets/images/img-article-1.png";
import img2 from "../assets/images/img-article-2.png";
import img3 from "../assets/images/img-article-3.png";

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

import iconHealthyRange  from "../assets/icons/icon-healthyrange.png";
import iconTeleNutri     from "../assets/icons/icon-tele-nutritionist.png";
import iconNutriShop     from "../assets/icons/icon-nutrishop.png";
import iconWHO           from "../assets/icons/icon-who.png";

// ── Types ──────────────────────────────────────────────────────────────────
interface HealthItem {
  icon: string;
  label: string;
  value: string;
  percent: number;
  color: string;
}

interface Article {
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  readTime: string;
  image: string;
}

// ── Static data ────────────────────────────────────────────────────────────
const healthItems: HealthItem[] = [
  { icon: iconHydration,  label: "Hydration",         value: "75%",     percent: 75, color: "#f97316" },
  { icon: iconSleep,      label: "Sleep Quality",     value: "6.5 hrs", percent: 68, color: "#3b82f6" },
  { icon: iconSupplement, label: "Supplement Intake", value: "Optimal", percent: 90, color: "#22c55e" },
];

const articles: Article[] = [
  { tag: "TODDLER NUTRITION", tagColor: "#22c55e", title: "Hidden Veggies: 10 Recipes for Picky Eaters", excerpt: "Struggling with mealtime? These creative recipes ensure your toddler gets the nutrients they need.", readTime: "5 min read", image: img1 },
  { tag: "POSTNATAL CARE",    tagColor: "#f97316", title: "Superfoods for Energy and Recovery",           excerpt: "Reclaim your vitality with these powerhouse ingredients packed with essential vitamins.",       readTime: "8 min read", image: img2 },
  { tag: "MILESTONES",        tagColor: "#3b82f6", title: "Starting Solids: A Month-by-Month Guide",      excerpt: "When and how to introduce new textures and flavors safely to your growing baby.",              readTime: "12 min read", image: img3 },
];

const growthData = [
  { label: "6 MONTHS", val: 30 }, { label: "8 MONTHS", val: 38 },
  { label: "10 MONTHS", val: 52 }, { label: "12 MONTHS", val: 61 }, { label: "CURRENT", val: 82 },
];

// Produk NutriShop — label ditampilkan di atas gambar (overlay)
const shopItems = [
  { label: "Suplemen Vit A",    image: shopImg1 },
  { label: "Camilan Organik",   image: shopImg2 },
  { label: "Kids Multivitamin", image: shopImg3 },
  { label: "Vegetable Puree",   image: shopImg4 },
];

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline() {
  const W = 520, H = 160, PAD = 20;
  const xs = growthData.map((_, i) => PAD + (i / (growthData.length - 1)) * (W - PAD * 2));
  const ys = growthData.map(d => H - PAD - ((d.val - 25) / 62) * (H - PAD * 2));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${line} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4d7c0f" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4d7c0f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#gfill)" />
      <path d={line} fill="none" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="4" fill="#4d7c0f" />)}
    </svg>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [selectedChild] = useState("Leo");

  return (
    <div className="min-h-screen bg-[#f7f9f4] font-sans flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900">Good morning, Sarah!</h1>
            <p className="text-gray-500 mt-1 text-sm">Mari lanjutkan perjalanan nutrisi optimal untuk si kecil bersama NutriGrow.</p>
        </div>

        {/* Growth + Health Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Growth card */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3 gap-4">
              <div className="flex-1">
                <p className="text-xs font-bold tracking-widest text-[#4d7c0f] uppercase">Smart Growth Tracker</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4d7c0f]">
                    <option>Child: {selectedChild}</option>
                  </select>
                  <h2 className="text-xl font-bold text-gray-900">{selectedChild}'s Height & Weight</h2>
                </div>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">Pantau perkembangan bayi Anda melalui grafik pertumbuhan kami yang komprehensif. Lacak tinggi, berat badan, dan risiko stunting untuk memastikan ia mencapai target perkembangan dengan akurat.</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-[#4d7c0f] bg-green-50 border border-green-200 rounded-full px-3 py-1 flex-shrink-0"><img src={iconHealthyRange} className="w-4 h-4 object-contain" alt="" /> Within Healthy Range</span>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: "Height", value: "78.5 cm", sub: "+2.1% ↑" },
                { label: "Weight", value: "10.4 kg",  sub: "+1.5% ↑" },
                { label: "Stunting Risk", value: "Low", sub: "Safe" },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{s.value}</p>
                  <p className="text-xs text-[#4d7c0f] mt-0.5">{s.sub}</p>
                </div>
              ))}
              <div className="bg-[#4d7c0f] rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:bg-[#3a5a00] transition">
                <p className="text-xs text-green-200">Explore more!</p>
                <p className="text-sm font-bold text-white leading-tight">See full tracker here</p>
                <span className="text-white text-lg">›</span>
              </div>
            </div>
            <div className="mt-4">
              <Sparkline />
              <div className="flex justify-between text-[10px] text-gray-400 px-1 mt-1">
                {growthData.map(d => <span key={d.label}>{d.label}</span>)}
              </div>
            </div>
          </div>

          {/* Health Log card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Health Log</h2>
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
              <button className="bg-[#4d7c0f] text-white font-semibold rounded-xl py-3 px-8 text-sm hover:bg-[#3a5a00] transition">
                More log data
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
              {[doctor1, doctor2, doctor3].map((doc, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden flex-shrink-0">
                  <img src={doc} className="w-full h-full object-cover" alt={`doctor ${i+1}`} />
                </div>
              ))}
            </div>

            <button className="text-sm font-semibold text-[#4d7c0f] flex items-center gap-1 hover:underline mt-1">
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
              <button className="text-sm font-semibold text-[#4d7c0f] flex items-center gap-1 hover:underline">
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
            <a href="#" className="text-sm font-medium text-[#4d7c0f] hover:underline">View All Articles ›</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map(a => (
              <div key={a.title} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer">
                <div className="h-48 overflow-hidden">
                  <img src={a.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={a.title} />
                </div>
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full" style={{ color: a.tagColor, backgroundColor: a.tagColor + "1a" }}>{a.tag}</span>
                  <h3 className="font-bold text-gray-900 leading-snug">{a.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{a.excerpt}</p>
                  <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
                    <img src={iconWHO} className="w-4 h-4 object-contain inline mr-1" alt="" />World Health Organization
                    <span>{a.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}