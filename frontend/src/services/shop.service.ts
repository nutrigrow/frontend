import { apiClient } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiProduct {
  id: number;
  namaProduk: string;
  deskripsi: string | null;
  harga: number;
  // Perbaikan 1: Tambahkan gambar_url untuk menerima data mentah dari database
  gambarUrl?: string | null; 
  gambar_url?: string | null; 
  stok: number;
  kategori: 'MPASI' | 'SUPLEMEN' | 'ALAT' | 'PAKET';
}

export type OrderStatusBayar = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUND';

export interface CartProduct {
  id: number;
  namaProduk: string;
  harga: number;
  gambarUrl?: string | null;
  stok: number;
}

export interface BackendCartItem {
  id: number;
  produkId: number;
  kuantitas: number;
  produk: CartProduct;
}

export interface ShopOrderItem {
  id: number;
  produkId: number;
  kuantitas: number;
  hargaSatuan: number;
  subtotal: number;
  produk: {
    id: number;
    namaProduk: string;
    gambarUrl?: string | null;
    harga: number;
    kategori?: string;
  } | null;
}

export interface ShopOrderAddress {
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

export interface ShopOrder {
  id: number;
  midtransOrderId: string;
  midtransTransactionId: string | null;
  jenisTransaksi: string;
  statusBayar: OrderStatusBayar;
  totalHarga: number;
  biayaPengiriman: number;
  metodePengiriman: string | null;
  snapToken: string | null;
  snapRedirectUrl?: string | null;
  paymentType: string | null;
  tanggalTransaksi: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  items: ShopOrderItem[];
  alamat: ShopOrderAddress | null;
  paymentGatewayConfigured: boolean;
  midtransClientKey: string | null;
  midtransIsProduction: boolean;
  paymentGatewayError: string | null;
}

export interface MidtransSnapCallbacks {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    snap?: {
      pay: (snapToken: string, callbacks?: MidtransSnapCallbacks) => void;
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const buildImageUrl = (gambarUrl: string | null | undefined): string => {
  if (!gambarUrl) return '';
  if (gambarUrl.startsWith('http')) return gambarUrl;

  // Ambil base URL backend — WAJIB diset di .env
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

  let path = gambarUrl.startsWith('/') ? gambarUrl : '/' + gambarUrl;

  // Jika path belum ada prefix /public, tambahkan
  if (!path.startsWith('/public/') && path.startsWith('/uploads/')) {
    path = '/public' + path;
  }

  // Guard: jika base kosong, kembalikan path absolute ke localhost:3000
  if (!base) {
    return `http://localhost:3000${path}`;
  }

  return `${base}${path}`;
};

export const KATEGORI_TO_FRONTEND: Record<string, string> = {
  MPASI:    'mpasi',
  SUPLEMEN: 'supplements',
  ALAT:     'alat',
  PAKET:    'paket',
};

export const FRONTEND_TO_KATEGORI: Record<string, string> = {
  mpasi: 'MPASI',
  supplements: 'SUPLEMEN',
  alat: 'ALAT',
  paket: 'PAKET',
};

export const mapApiProduct = (p: ApiProduct) => {
  // Coba semua kemungkinan nama field dari backend
  const rawImageUrl = p.gambarUrl ?? p.gambar_url ?? null;
  
  return {
    id:          p.id,
    category:    KATEGORI_TO_FRONTEND[p.kategori] ?? p.kategori.toLowerCase(),
    image:       buildImageUrl(rawImageUrl),
    title:       p.namaProduk,
    description: p.deskripsi ?? '',
    price:       p.harga,
    stock:       p.stok,
  };
};

const MIDTRANS_SNAP_SCRIPT_ID = 'midtrans-snap-js';
const MIDTRANS_SNAP_SANDBOX_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';
const MIDTRANS_SNAP_PRODUCTION_URL = 'https://app.midtrans.com/snap/snap.js';

const waitForScriptToLoad = (script: HTMLScriptElement): Promise<void> => {
  return new Promise((resolve, reject) => {
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load Midtrans Snap script')), { once: true });
  });
};

export const loadMidtransSnapScript = async (
  clientKey: string,
  isProduction: boolean,
): Promise<void> => {
  if (!clientKey) {
    throw new Error('Midtrans client key is missing');
  }

  const src = isProduction ? MIDTRANS_SNAP_PRODUCTION_URL : MIDTRANS_SNAP_SANDBOX_URL;
  const existing = document.getElementById(MIDTRANS_SNAP_SCRIPT_ID) as HTMLScriptElement | null;

  if (existing) {
    const sameSrc = existing.getAttribute('src') === src;
    const sameKey = existing.getAttribute('data-client-key') === clientKey;

    if (!sameSrc || !sameKey) {
      existing.remove();
    } else if (existing.dataset.loaded === 'true') {
      return;
    } else {
      await waitForScriptToLoad(existing);
      existing.dataset.loaded = 'true';
      return;
    }
  }

  const script = document.createElement('script');
  script.id = MIDTRANS_SNAP_SCRIPT_ID;
  script.type = 'text/javascript';
  script.src = src;
  script.setAttribute('data-client-key', clientKey);

  const loaded = waitForScriptToLoad(script).then(() => {
    script.dataset.loaded = 'true';
  });

  document.body.appendChild(script);
  await loaded;
};

// ─── Service ──────────────────────────────────────────────────────────────────
export const shopService = {
  getProducts: async (filters?: {
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    kategori?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.search)   params.set('search',   filters.search);
    if (filters?.minPrice) params.set('minPrice', filters.minPrice);
    if (filters?.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters?.kategori) {
      const mappedKategori = FRONTEND_TO_KATEGORI[filters.kategori] ?? filters.kategori;
      params.set('kategori', mappedKategori);
    }
    const { data } = await apiClient.get(`/api/products?${params.toString()}`);
    return (data.data.products as ApiProduct[]).map(mapApiProduct);
  },

  getProductById: async (id: number | string) => {
    const { data } = await apiClient.get(`/api/products/${id}`);
    return mapApiProduct(data.data.product as ApiProduct);
  },

  getCart: async () => {
    const { data } = await apiClient.get('/api/cart');
    return data.data.cart as BackendCartItem[];
  },

  addToCart: async (produkId: number, kuantitas: number) => {
    const { data } = await apiClient.post('/api/cart', { produkId, kuantitas });
    return data.data.cartItem as BackendCartItem;
  },

  updateCartItemQuantity: async (cartItemId: number, kuantitas: number) => {
    const { data } = await apiClient.patch(`/api/cart/${cartItemId}`, { kuantitas });
    return data.data.cartItem as BackendCartItem;
  },

  deleteCartItem: async (cartItemId: number) => {
    const { data } = await apiClient.delete(`/api/cart/${cartItemId}`);
    return data.data.deleted as { id: number };
  },

  getAddresses: async () => {
    const { data } = await apiClient.get('/api/addresses');
    return data.data.addresses;
  },

  addAddress: async (payload: {
    namaPenerima: string;
    noTelepon: string;
    alamatLengkap: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
    kodePos: string;
    isUtama?: boolean;
  }) => {
    const { data } = await apiClient.post('/api/addresses', payload);
    return data.data.address;
  },

  checkoutCart: async (payload: {
    cartItemIds: number[];
    alamatId: number;
    metodePengiriman: string;
  }) => {
    const { data } = await apiClient.post('/api/checkout/cart', payload);
    return data.data.transaction as ShopOrder;
  },

  checkoutDirect: async (payload: {
    produkId: number;
    kuantitas: number;
    alamatId: number;
    metodePengiriman: string;
  }) => {
    const { data } = await apiClient.post('/api/checkout/direct', payload);
    return data.data.transaction as ShopOrder;
  },

  getOrders: async (filters?: { statusBayar?: OrderStatusBayar }) => {
    const params = new URLSearchParams();
    if (filters?.statusBayar) {
      params.set('statusBayar', filters.statusBayar);
    }

    const query = params.toString();
    const { data } = await apiClient.get(`/api/orders${query ? `?${query}` : ''}`);
    return data.data.orders as ShopOrder[];
  },

  getOrderById: async (orderId: number | string) => {
    const { data } = await apiClient.get(`/api/orders/${orderId}`);
    return data.data.order as ShopOrder;
  },

  syncOrderPayment: async (orderId: number | string) => {
    const { data } = await apiClient.post(`/api/orders/${orderId}/sync-payment`);
    return data.data.order as ShopOrder;
  },

  payOrder: async (orderId: number | string) => {
    const { data } = await apiClient.post(`/api/orders/${orderId}/pay`);
    return data.data.order as ShopOrder;
  },
};