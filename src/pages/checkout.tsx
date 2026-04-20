import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  loadMidtransSnapScript,
  shopService,
  type BackendCartItem,
  type ShopOrder,
} from '../services/shop.service';

// ── Types ──────────────────────────────────────────────────────────────────
interface Address {
  id: number;
  nama: string;
  telepon: string;
  alamat: string;
  kelurahan: string;
  kodePos: string;
  kecamatan: string;
  kota: string;
  isDefault: boolean;
}

interface CartItem {
  id: number;
  productId: number;
  name: string;
  subtitle: string;
  price: number;
  qty: number;
  emoji: string;
}

interface BackendAddress {
  id: number;
  namaPenerima: string;
  noTelepon: string;
  alamatLengkap: string;
  kelurahan: string;
  kodePos: string;
  kecamatan: string;
  kota: string;
  isUtama: boolean;
}

interface CheckoutLocationState {
  mode?: "cart" | "direct";
  cartItemIds?: number[];
  produkId?: number;
  kuantitas?: number;
}

type ShippingMethod = "standard" | "express";
type PaymentMethod  = "qris" | "va" | "ewallet";

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

function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    const message = response?.data?.message;
    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }
  }
  return fallback;
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
  const location = useLocation();
  const navigate = useNavigate();
  const checkoutState = (location.state ?? {}) as CheckoutLocationState;
  const checkoutMode = checkoutState.mode === "direct" ? "direct" : "cart";

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [cart, setCart]         = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [payment, setPayment]   = useState<PaymentMethod>("qris");
  const [loading, setLoading]   = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMidtransPayment = async (order: ShopOrder) => {
    if (!order.snapToken) {
      navigate(`/order/${order.id}?payment=manual`);
      return;
    }

    const fallbackClientKey = (import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '').trim();
    const clientKey = (order.midtransClientKey || fallbackClientKey || '').trim();

    if (!clientKey) {
      navigate(`/order/${order.id}?payment=missing-client-key`);
      return;
    }

    await loadMidtransSnapScript(clientKey, order.midtransIsProduction);

    if (!window.snap || typeof window.snap.pay !== 'function') {
      throw new Error('Midtrans Snap belum siap dipakai di browser');
    }

    await new Promise<void>((resolve) => {
      window.snap?.pay(order.snapToken!, {
        onSuccess: async () => {
          await shopService.syncOrderPayment(order.id).catch(() => undefined);
          navigate(`/order/${order.id}?payment=success`);
          resolve();
        },
        onPending: async () => {
          await shopService.syncOrderPayment(order.id).catch(() => undefined);
          navigate(`/order/${order.id}?payment=pending`);
          resolve();
        },
        onError: async () => {
          await shopService.syncOrderPayment(order.id).catch(() => undefined);
          navigate(`/order/${order.id}?payment=error`);
          resolve();
        },
        onClose: () => {
          navigate(`/order/${order.id}?payment=close`);
          resolve();
        },
      });
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadCheckoutData = async () => {
      setLoading(true);
      try {
        const rawAddresses = (await shopService.getAddresses()) as BackendAddress[];
        if (cancelled) return;

        const mappedAddresses: Address[] = rawAddresses.map((addr) => ({
          id: addr.id,
          nama: addr.namaPenerima,
          telepon: addr.noTelepon,
          alamat: addr.alamatLengkap,
          kelurahan: addr.kelurahan,
          kodePos: addr.kodePos,
          kecamatan: addr.kecamatan,
          kota: addr.kota,
          isDefault: !!addr.isUtama,
        }));

        setAddresses(mappedAddresses);

        const defaultAddress = mappedAddresses.find((a) => a.isDefault) ?? mappedAddresses[0] ?? null;
        setSelectedAddressId((prev) => prev ?? defaultAddress?.id ?? null);

        if (checkoutMode === "direct" && checkoutState.produkId) {
          const product = await shopService.getProductById(checkoutState.produkId);
          if (cancelled) return;

          const qty = checkoutState.kuantitas && checkoutState.kuantitas > 0 ? checkoutState.kuantitas : 1;
          setCart([
            {
              id: product.id,
              productId: product.id,
              name: product.title,
              subtitle: "Direct Purchase",
              price: product.price,
              qty,
              emoji: "🛍️",
            },
          ]);
        } else {
          const rawCart = (await shopService.getCart()) as BackendCartItem[];
          if (cancelled) return;

          const selectedIds = new Set(checkoutState.cartItemIds ?? []);

          const mappedCart: CartItem[] = rawCart.map((row) => ({
            id: row.id,
            productId: row.produk?.id ?? row.produkId,
            name: row.produk?.namaProduk ?? "Produk",
            subtitle: "Cart Item",
            price: row.produk?.harga ?? 0,
            qty: row.kuantitas,
            emoji: "🛒",
          }));

          setCart(selectedIds.size > 0 ? mappedCart.filter((item) => selectedIds.has(item.id)) : mappedCart);
        }
      } catch {
        if (!cancelled) {
          setAddresses([]);
          setCart([]);
          setErrorMessage('Gagal memuat data checkout. Pastikan Anda sudah login.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCheckoutData();
    return () => {
      cancelled = true;
    };
  }, [checkoutMode, checkoutState.cartItemIds, checkoutState.produkId, checkoutState.kuantitas]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) ?? addresses[0] ?? null,
    [addresses, selectedAddressId]
  );

  async function changeQty(id: number, delta: number) {
    const current = cart.find((item) => item.id === id);
    if (!current) return;

    const nextQty = current.qty + delta;
    if (nextQty <= 0) return;

    const previousQty = current.qty;
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: nextQty } : item));

    if (checkoutMode === 'cart') {
      try {
        await shopService.updateCartItemQuantity(current.id, nextQty);
      } catch (error) {
        setCart(prev => prev.map(item => item.id === id ? { ...item, qty: previousQty } : item));
        setErrorMessage(extractErrorMessage(error, 'Gagal memperbarui kuantitas keranjang.'));
      }
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || cart.length === 0 || placingOrder) return;

    const metodePengiriman = shipping === "express" ? "EXPRESS" : "STANDARD";

    setPlacingOrder(true);
    setErrorMessage(null);
    try {
      let transaction: ShopOrder;

      if (checkoutMode === "direct") {
        const item = cart[0];
        transaction = await shopService.checkoutDirect({
          produkId: item.productId,
          kuantitas: item.qty,
          alamatId: selectedAddressId,
          metodePengiriman,
        });
      } else {
        transaction = await shopService.checkoutCart({
          cartItemIds: cart.map((item) => item.id),
          alamatId: selectedAddressId,
          metodePengiriman,
        });
      }

      await handleMidtransPayment(transaction);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Checkout gagal. Periksa data alamat dan item belanja Anda.'));
    } finally {
      setPlacingOrder(false);
    }
  };

  const shippingPrice = shippingOptions.find(s => s.id === shipping)!.price;
  const subtotal      = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total         = subtotal + shippingPrice;

  return (
    <div className="min-h-screen bg-[#f7f9f4] font-sans flex flex-col">
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
                <p className="font-bold text-gray-900">{selectedAddress?.nama ?? "Alamat belum tersedia"}</p>
                <p className="text-sm text-gray-500 mt-0.5">{selectedAddress?.telepon ?? "-"}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedAddress?.alamat ?? "-"}</p>
                <p className="text-sm text-gray-600">
                  {selectedAddress
                    ? `${selectedAddress.kelurahan}, ${selectedAddress.kecamatan}, ${selectedAddress.kota} ${selectedAddress.kodePos}`
                    : '-'}
                </p>
              </div>
              <button onClick={() => setShowAddressPicker(true)} disabled={addresses.length === 0} className="mt-3 text-sm text-[#4d7c0f] font-semibold hover:underline disabled:text-gray-400 disabled:no-underline">
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
              {loading && <p className="text-xs text-gray-400 mb-4">Memuat data checkout...</p>}
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
          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder || loading || cart.length === 0 || !selectedAddressId}
            className="w-full bg-[#4d7c0f] hover:bg-[#3a5a00] disabled:bg-gray-400 text-white font-extrabold text-lg tracking-widest py-5 rounded-2xl transition flex items-center justify-center gap-3"
          >
            {placingOrder ? "PROCESSING..." : "PLACE ORDER →"}
          </button>
          {errorMessage && (
            <p className="mt-3 text-sm text-red-600 font-semibold">{errorMessage}</p>
          )}
        </div>
      </main>

      {showAddressPicker && addresses.length > 0 && (
        <AddressPicker
          addresses={addresses}
          selectedId={selectedAddressId ?? addresses[0].id}
          onSelect={setSelectedAddressId}
          onClose={() => setShowAddressPicker(false)}
        />
      )}
    </div>
  );
}