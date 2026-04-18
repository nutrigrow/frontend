import { useState } from "react";
import img1 from "../assets/images/img-article-1.png";
import img2 from "../assets/images/img-article-2.png";
import img3 from "../assets/images/img-article-3.png";

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
  { icon: "💧", label: "Hydration",       value: "75%",     percent: 75, color: "#f97316" },
  { icon: "🌙", label: "Sleep Quality",   value: "6.5 hrs", percent: 68, color: "#3b82f6" },
  { icon: "🍽️", label: "Nutrient Balance",value: "Optimal", percent: 90, color: "#22c55e" },
];

const articles: Article[] = [
  {
    tag: "TODDLER NUTRITION", tagColor: "#22c55e",
    title: "Hidden Veggies: 10 Recipes for Picky Eaters",
    excerpt: "Struggling with mealtime? These creative recipes ensure your toddler gets the nutrients they need.",
    readTime: "5 min read", image: img1,
  },
  {
    tag: "POSTNATAL CARE", tagColor: "#f97316",
    title: "Superfoods for Energy and Recovery",
    excerpt: "Reclaim your vitality with these powerhouse ingredients packed with essential vitamins.",
    readTime: "8 min read", image: img2,
  },
  {
    tag: "MILESTONES", tagColor: "#3b82f6",
    title: "Starting Solids: A Month-by-Month Guide",
    excerpt: "When and how to introduce new textures and flavors safely to your growing baby.",
    readTime: "12 min read", image: img3,
  },
];

const growthData = [
  { label: "6 MO",  val: 30 },
  { label: "8 MO",  val: 38 },
  { label: "10 MO", val: 52 },
  { label: "12 MO", val: 61 },
  { label: "NOW",   val: 82 },
];

// ── Mini SVG sparkline ─────────────────────────────────────────────────────
function Sparkline() {
  const W = 520, H = 140, PAD = 20;
  const xs = growthData.map((_, i) => PAD + (i / (growthData.length - 1)) * (W - PAD * 2));
  const ys = growthData.map(d => H - PAD - ((d.val - 25) / 62) * (H - PAD * 2));
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const area = `${line} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4d7c0f" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4d7c0f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#gfill)" />
      <path d={line}  fill="none" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="4" fill="#4d7c0f" />
      ))}
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f9f4] font-sans">

      {/* ── PAGE CONTENT ────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Good morning, Sarah! 👋</h1>
            <p className="text-gray-500 mt-1">Leo is 14 months old today. Here's his growth progress.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
              📅 Schedule Visit
            </button>
            <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-[#4d7c0f] hover:bg-[#3a5a00] transition">
              ➕ Log Data
            </button>
          </div>
        </div>

        {/* ── Two-column: Growth + Health Log ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Growth Tracking card */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#4d7c0f] uppercase">Growth Tracking</p>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">Leo's Height & Weight</h2>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-[#4d7c0f] bg-green-50 border border-green-200 rounded-full px-3 py-1">
                ✅ Within Healthy Range
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Height",       value: "78.5 cm", sub: "+2.1% ↑" },
                { label: "Weight",       value: "10.4 kg",  sub: "+1.5% ↑" },
                { label: "Stunting Risk",value: "Low",      sub: "Safe" },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{s.value}</p>
                  <p className="text-xs text-[#4d7c0f] mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="mt-4">
              <Sparkline />
              <div className="flex justify-between text-[10px] text-gray-400 px-1 mt-1">
                {growthData.map(d => <span key={d.label}>{d.label}</span>)}
              </div>
            </div>
          </div>

          {/* Health Log card */}
          <div className="bg-[#fff7ed] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Health Log</h2>
              <a href="#" className="text-xs font-medium text-[#4d7c0f] hover:underline">Full Log →</a>
            </div>

            {healthItems.map(h => (
              <div key={h.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>{h.icon}</span> {h.label}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{h.value}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${h.percent}%`, backgroundColor: h.color }}
                  />
                </div>
              </div>
            ))}

            {/* Pro-tip */}
            <div className="mt-auto bg-white rounded-xl p-3 flex gap-3 items-start text-sm text-gray-600 shadow-sm">
              <span className="text-lg">💡</span>
              <div>
                <p className="font-semibold text-gray-800 text-xs">Pro-tip for Sarah</p>
                <p className="text-xs mt-0.5">Your iron intake was low yesterday. Try adding spinach or eggs to today's meals!</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Articles ── */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Latest for You</h2>
              <p className="text-sm text-gray-500">Personalized nutrition and health guides</p>
            </div>
            <a href="#" className="text-sm font-medium text-[#4d7c0f] hover:underline">View All Articles →</a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map(a => (
              <div key={a.title} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer">
                <div className="h-40 bg-gray-100 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                  <img src={a.image} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-2">
                  <span
                    className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full"
                    style={{ color: a.tagColor, backgroundColor: a.tagColor + "1a" }}
                  >
                    {a.tag}
                  </span>
                  <h3 className="font-bold text-gray-900 leading-snug">{a.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{a.excerpt}</p>
                  <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
                    <span>🌍 World Health Organization</span>
                    <span>{a.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom Banner ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-amber-50 rounded-xl p-4 text-sm text-gray-700 flex-1">
            <p className="font-semibold text-amber-700 text-xs mb-1">🌟 Weekly Tip</p>
            Boost iron absorption by pairing spinach with citrus fruits today!
          </div>
          <div className="flex items-center gap-4 flex-1">
            <span className="text-4xl">🛍️</span>
            <div>
              <p className="font-bold text-gray-900">Refill Leo's Favorites</p>
              <p className="text-sm text-gray-500">Organic purees and vitamin drops are currently 15% off.</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap justify-center sm:justify-end">
            <button className="border border-[#4d7c0f] text-[#4d7c0f] rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-50 transition">
              Go to NutriShop
            </button>
            <button className="bg-[#4d7c0f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#3a5a00] transition">
              Quick Checkout
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
