import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import {
  loadMidtransSnapScript,
  shopService,
  type OrderStatusBayar,
  type ShopOrder,
} from '../services/shop.service';

type StatusFilter = 'all' | OrderStatusBayar;

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'PENDING', label: 'Menunggu' },
  { key: 'SUCCESS', label: 'Berhasil' },
  { key: 'FAILED', label: 'Gagal' },
  { key: 'EXPIRED', label: 'Kedaluwarsa' },
  { key: 'REFUND', label: 'Dikembalikan' },
];

const statusConfig: Record<OrderStatusBayar, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Menunggu', color: '#B45309', bg: '#FFFBEB' },
  SUCCESS: { label: 'Berhasil', color: '#166534', bg: '#F0FDF4' },
  FAILED: { label: 'Gagal', color: '#B91C1C', bg: '#FEF2F2' },
  EXPIRED: { label: 'Kedaluwarsa', color: '#334155', bg: '#F1F5F9' },
  REFUND: { label: 'Dikembalikan', color: '#6D28D9', bg: '#F5F3FF' },
};

const paymentQueryFeedback: Record<string, string> = {
  success: 'Pembayaran berhasil diproses Midtrans.',
  pending: 'Pembayaran masih pending. Silakan cek status lagi nanti.',
  error: 'Pembayaran gagal diproses Midtrans.',
  close: 'Anda menutup popup pembayaran Midtrans.',
  manual: 'Order dibuat, tapi token pembayaran belum tersedia. Coba tombol Bayar Sekarang.',
  'missing-client-key': 'Client key Midtrans belum tersedia di frontend.',
};

function formatRp(n: number) {
  return 'Rp' + n.toLocaleString('id-ID');
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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

interface OrderCardProps {
  order: ShopOrder;
  selected: boolean;
  onSelect: (order: ShopOrder) => void;
}

function OrderCard({ order, selected, onSelect }: OrderCardProps) {
  const cfg = statusConfig[order.statusBayar];

  return (
    <button
      onClick={() => onSelect(order)}
      className={`w-full text-left bg-white rounded-2xl border-2 p-4 transition ${
        selected ? 'border-[#4d7c0f] shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <p className="text-xs text-gray-400">{order.midtransOrderId}</p>
          <p className="text-sm font-bold text-gray-900">Order #{order.id}</p>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ color: cfg.color, backgroundColor: cfg.bg }}
        >
          {cfg.label}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-2">{formatDate(order.tanggalTransaksi)}</p>
      <p className="text-sm text-gray-600 mb-1">{order.itemCount} item</p>
      <p className="text-base font-extrabold text-[#4d7c0f]">{formatRp(order.totalHarga)}</p>
    </button>
  );
}

function OrderDetailPanel({
  order,
  loadingAction,
  onPay,
  onSync,
}: {
  order: ShopOrder | null;
  loadingAction: boolean;
  onPay: () => void;
  onSync: () => void;
}) {
  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 text-gray-500">
        Pilih order untuk melihat detail.
      </div>
    );
  }

  const cfg = statusConfig[order.statusBayar];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400">{order.midtransOrderId}</p>
          <h2 className="text-xl font-extrabold text-gray-900">Order #{order.id}</h2>
          <p className="text-sm text-gray-500 mt-1">Dibuat: {formatDate(order.tanggalTransaksi)}</p>
          <p className="text-sm text-gray-500">Dibayar: {formatDate(order.paidAt)}</p>
        </div>

        <span
          className="text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ color: cfg.color, backgroundColor: cfg.bg }}
        >
          {cfg.label}
        </span>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Item Pesanan</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.produk?.namaProduk ?? `Produk ${item.produkId}`}</p>
                  <p className="text-xs text-gray-500">Qty {item.kuantitas} x {formatRp(item.hargaSatuan)}</p>
                </div>
                <p className="text-sm font-bold text-gray-800">{formatRp(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">Alamat Pengiriman</h3>
          <div className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-xl p-3">
            {order.alamat ? (
              <>
                <p className="font-semibold text-gray-900">{order.alamat.namaPenerima} ({order.alamat.noTelepon})</p>
                <p>{order.alamat.alamatLengkap}</p>
                <p>{order.alamat.kelurahan}, {order.alamat.kecamatan}, {order.alamat.kota} {order.alamat.kodePos}</p>
              </>
            ) : (
              <p>Alamat tidak tersedia</p>
            )}
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Biaya Pengiriman</span>
            <span>{formatRp(order.biayaPengiriman)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-[#4d7c0f]">
            <span>Total</span>
            <span>{formatRp(order.totalHarga)}</span>
          </div>
        </div>

        {order.paymentGatewayError && (
          <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            {order.paymentGatewayError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {order.statusBayar === 'PENDING' && (
            <button
              disabled={loadingAction}
              onClick={onPay}
              className="px-4 py-2 rounded-xl bg-[#4d7c0f] text-white font-semibold disabled:opacity-60"
            >
              {loadingAction ? 'Memproses...' : 'Bayar Sekarang'}
            </button>
          )}

          <button
            disabled={loadingAction}
            onClick={onSync}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold disabled:opacity-60"
          >
            Sinkronkan Status Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PesananSaya() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(id ? Number(id) : null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const fetchOrders = useCallback(async (initialSelection?: number | null) => {
    setLoadingList(true);
    setErrorMessage(null);

    try {
      const fetched = await shopService.getOrders(
        activeTab === 'all' ? undefined : { statusBayar: activeTab }
      );
      setOrders(fetched);

      if (fetched.length === 0) {
        setSelectedOrderId(null);
        return;
      }

      const preferredId = initialSelection ?? null;
      const exists = preferredId !== null ? fetched.some((order) => order.id === preferredId) : false;
      const nextId = exists ? preferredId : fetched[0].id;
      setSelectedOrderId(nextId);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Gagal memuat data pesanan.'));
    } finally {
      setLoadingList(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const paymentState = searchParams.get('payment');
    if (paymentState && paymentQueryFeedback[paymentState]) {
      setInfoMessage(paymentQueryFeedback[paymentState]);
    }
  }, [searchParams]);

  useEffect(() => {
    const initialId = id ? Number(id) : null;
    if (initialId && !Number.isNaN(initialId)) {
      setSelectedOrderId(initialId);
    }
  }, [id]);

  useEffect(() => {
    void fetchOrders(id ? Number(id) : null);
  }, [activeTab, fetchOrders, id]);

  const handleSelectOrder = (order: ShopOrder) => {
    setSelectedOrderId(order.id);
    navigate(`/order/${order.id}`, { replace: true });
  };

  const handlePayNow = async () => {
    if (!selectedOrder) return;

    setLoadingAction(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const order = await shopService.payOrder(selectedOrder.id);

      if (!order.snapToken) {
        setInfoMessage('Token pembayaran belum tersedia. Coba sinkronkan status atau hubungi admin.');
        await fetchOrders(order.id);
        return;
      }

      const fallbackClientKey = (import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '').trim();
      const clientKey = (order.midtransClientKey || fallbackClientKey || '').trim();

      if (!clientKey) {
        setErrorMessage('Midtrans client key belum tersedia di frontend.');
        return;
      }

      await loadMidtransSnapScript(clientKey, order.midtransIsProduction);

      if (!window.snap || typeof window.snap.pay !== 'function') {
        throw new Error('Midtrans Snap belum siap dipakai di browser');
      }

      await new Promise<void>((resolve) => {
        window.snap?.pay(order.snapToken!, {
          onSuccess: async () => {
            setInfoMessage('Pembayaran berhasil diproses Midtrans.');
            await shopService.syncOrderPayment(order.id).catch(() => undefined);
            await fetchOrders(order.id);
            resolve();
          },
          onPending: async () => {
            setInfoMessage('Pembayaran pending. Silakan selesaikan pembayaran Anda.');
            await shopService.syncOrderPayment(order.id).catch(() => undefined);
            await fetchOrders(order.id);
            resolve();
          },
          onError: async () => {
            setErrorMessage('Pembayaran gagal. Coba ulangi lagi.');
            await shopService.syncOrderPayment(order.id).catch(() => undefined);
            await fetchOrders(order.id);
            resolve();
          },
          onClose: () => {
            setInfoMessage('Anda menutup popup pembayaran. Order tetap pending.');
            resolve();
          },
        });
      });
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Gagal memproses pembayaran Midtrans.'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSyncPayment = async () => {
    if (!selectedOrder) return;

    setLoadingAction(true);
    setErrorMessage(null);

    try {
      const updated = await shopService.syncOrderPayment(selectedOrder.id);
      setInfoMessage(`Status pembayaran diperbarui: ${statusConfig[updated.statusBayar].label}`);
      await fetchOrders(updated.id);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Gagal sinkronisasi status pembayaran.'));
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f4] font-sans flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Pesanan Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Semua order checkout Anda terhubung langsung ke backend.</p>
        </div>

        {infoMessage && (
          <div className="mb-4 text-sm font-semibold text-[#3f6212] bg-[#ecfccb] border border-[#bef264] rounded-xl px-4 py-2">
            {infoMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm mb-6 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-fit text-sm font-semibold px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#4d7c0f] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {loadingList ? (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 text-gray-500">Memuat pesanan...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 text-gray-500">Belum ada pesanan untuk filter ini.</div>
            ) : (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  selected={selectedOrderId === order.id}
                  onSelect={handleSelectOrder}
                />
              ))
            )}
          </div>

          <div className="lg:col-span-3">
            <OrderDetailPanel
              order={selectedOrder}
              loadingAction={loadingAction}
              onPay={() => {
                void handlePayNow();
              }}
              onSync={() => {
                void handleSyncPayment();
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
