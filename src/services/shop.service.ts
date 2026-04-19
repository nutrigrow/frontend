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
    return data.data.cart;
  },

  addToCart: async (produkId: number, kuantitas: number) => {
    const { data } = await apiClient.post('/api/cart', { produkId, kuantitas });
    return data.data.cartItem;
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
    return data.data.transaction;
  },

  checkoutDirect: async (payload: {
    produkId: number;
    kuantitas: number;
    alamatId: number;
    metodePengiriman: string;
  }) => {
    const { data } = await apiClient.post('/api/checkout/direct', payload);
    return data.data.transaction;
  },
};