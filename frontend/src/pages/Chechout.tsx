import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";

// ── Types ──────────────────────────────────────────────────────────────────
interface Address {
  id: number;
  nama: string;
  telepon: string;
  alamat: string;
  kecamatan: string;
  kota: string;
  isDefault: boolean;
}

interface CartItem {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  qty: number;
  emoji: string;
}

type ShippingMethod = "standard" | "express";
type PaymentMethod  = "qris" | "va" | "ewallet";

// ── Static data ────────────────────────────────────────────────────────────
const savedAddresses: Address[] = [
  {
    id: 1, nama: "Sarah Kim", telepon: "(+62)85223398078",
    alamat: "Jalan Damai 1 No. 65 RT 03/06, Depan kos kuning",
    kecamatan: "Hegarmanah", kota: "Jatinangor, Sumedang", isDefault: true,
  },
  {
    id: 2, nama: "Sarah Kim", telepon: "(+62)85223398078",
    alamat: "Jalan Sukajadi No. 1 RT 03/06, Hegarmanah",
    kecamatan: "Sukajadi", kota: "Bandung", isDefault: false,
  },
];

const initialCart: CartItem[] = [
  { id: 1, name: "Prenatal Core+ Complex", subtitle: "60 Capsules", price: 50000, qty: 1, emoji: "💊" },
  { id: 2, name: "Stage 1 Veggie Mix",     subtitle: "Pack of 12",  price: 40000, qty: 2, emoji: "🥦" },
];

const shippingOptions = [
  { id: "standard" as ShippingMethod, label: "Standard Delivery", sub: "3-5 days", price: 5000  },
  { id: "express"  as ShippingMethod, label: "Express Shipping",  sub: "1-2 days", price: 15000 },
];

const paymentOptions = [
  { id: "qris"    as PaymentMethod, label: "QRIS",            icon: "▦" },
  { id: "va"      as PaymentMethod, label: "VIRTUAL ACCOUNT", icon: "🏦" },
  { id: "ewallet" as PaymentMethod, label: "E-WALLET",        icon: "📱" },
];

function formatRp(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

// ── Address Picker Modal ───────────────────────────────────────────────────
function AddressPicker({ addresses, selectedId, onSelect, onClose }: {
  addresses: Address[]; selectedId: number;
  onSelect: (id: number) => void; onClose: () => void;
}) {
  const [chosen, setChosen] = useState(selectedId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Alamat</h2>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {addresses.map(addr => (
            <button key={addr.id} onClick={() => setChosen(addr.id)}
              className={`w-full text-left border-2 rounded-xl p-4 transition ${chosen === addr.id ? "border-[#4d7c0f] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{addr.nama}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{addr.telepon}</p>
                  <p className="text-xs text-gray-600 mt-1">{addr.alamat}</p>
                  <p className="text-xs text-gray-600">{addr.kecamatan}, {addr.kota}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${chosen === addr.id ? "border-[#4d7c0f]" : "border-gray-300"}`}>
                  {chosen === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-[#4d7c0f]" />}
                </div>
              </div>
              {addr.isDefault && <span className="inline-block mt-2 text-[10px] border border-gray-300 rounded-full px-2 py-0.5 text-gray-500">Default</span>}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="text-sm text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">Cancel</button>
          <button onClick={() => { onSelect(chosen); onClose(); }} className="text-sm bg-[#4d7c0f] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#3a5a00] transition">Pilih Alamat</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Checkout() {
  const defaultAddr = savedAddresses.find(a => a.isDefault) ?? savedAddresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddr.id);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [cart, setCart]         = useState<CartItem[]>(initialCart);
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [payment, setPayment]   = useState<PaymentMethod>("qris");

  const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId)!;

  function changeQty(id: number, delta: number) {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0));
  }

  const shippingPrice = shippingOptions.find(s => s.id === shipping)!.price;
  const subtotal      = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax           = Math.round(subtotal * 0.1);
  const total         = subtotal + shippingPrice + tax;

  return (
    <div className="min-h-screen bg-[#f7f9f4] font-sans flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="text-sm text-gray-400 mb-1">NutriShop</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Checkout</h1>
        <p className="text-gray-500 mb-8 text-sm">Review your items and complete your purchase securely.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* LEFT */}
          <div className="lg:col-span-3 space-y-5">

            {/* Shipping Address */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-[#4d7c0f]">🚚</span> Shipping Address
              </h2>
              <div className="border-2 border-[#4d7c0f] rounded-xl p-4 bg-green-50">
                <p className="font-bold text-gray-900">{selectedAddress.nama}</p>
                <p className="text-sm text-gray-500 mt-0.5">{selectedAddress.telepon}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedAddress.alamat}</p>
                <p className="text-sm text-gray-600">{selectedAddress.kecamatan}, {selectedAddress.kota}</p>
                <p className="text-sm text-gray-600">West Java, Indonesia</p>
              </div>
              <button onClick={() => setShowAddressPicker(true)} className="mt-3 text-sm text-[#4d7c0f] font-semibold hover:underline">
                Ganti Alamat →
              </button>
            </section>

            {/* Shipping Method */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-[#4d7c0f]">📦</span> Shipping Method
              </h2>
              <div className="space-y-3">
                {shippingOptions.map(opt => (
                  <button key={opt.id} onClick={() => setShipping(opt.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition text-left ${shipping === opt.id ? "border-[#4d7c0f] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${shipping === opt.id ? "border-[#4d7c0f]" : "border-gray-300"}`}>
                        {shipping === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#4d7c0f]" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.sub}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${shipping === opt.id ? "text-[#4d7c0f]" : "text-gray-700"}`}>{formatRp(opt.price)}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-[#4d7c0f]">💳</span> Payment Method
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {paymentOptions.map(opt => (
                  <button key={opt.id} onClick={() => setPayment(opt.id)}
                    className={`flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 transition ${payment === opt.id ? "border-[#4d7c0f] bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-[10px] font-bold tracking-wider text-gray-600">{opt.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-lg sticky top-20">
              <h2 className="text-lg font-bold mb-5">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">{item.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.subtitle}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={() => changeQty(item.id, -1)} className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold flex items-center justify-center transition">−</button>
                        <span className="text-xs font-semibold text-[#a3e635] min-w-[20px] text-center">Qty: {item.qty}</span>
                        <button onClick={() => changeQty(item.id, +1)} className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold flex items-center justify-center transition">+</button>
                      </div>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0">{formatRp(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 mb-4" />
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatRp(subtotal)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Shipping Fee</span><span>{formatRp(shippingPrice)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Tax (10%)</span><span>{formatRp(tax)}</span></div>
              </div>
              <div className="border-t border-gray-700 mb-4" />
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-extrabold text-[#a3e635]">{formatRp(total)}</span>
              </div>
              <p className="text-center text-[10px] text-gray-500 tracking-widest mb-5">🔒 SSL SECURED CHECKOUT</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button className="w-full bg-[#4d7c0f] hover:bg-[#3a5a00] text-white font-extrabold text-lg tracking-widest py-5 rounded-2xl transition flex items-center justify-center gap-3">
            PLACE ORDER →
          </button>
        </div>
      </main>
      <Footer />

      {showAddressPicker && (
        <AddressPicker
          addresses={savedAddresses}
          selectedId={selectedAddressId}
          onSelect={setSelectedAddressId}
          onClose={() => setShowAddressPicker(false)}
        />
      )}
    </div>
  );
}