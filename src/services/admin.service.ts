import { apiClient } from "./api";

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
}

export interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  isActive: boolean;
  status: "AKTIF" | "NONAKTIF";
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tinggiBadanIbu?: number | null;
}

export interface UsersResponse {
  users: User[];
  stats: UserStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductStats {
  total: number;
  available: number;
  lowStock: number;
  outOfStock: number;
  inactive: number;
}

export interface Product {
  id: number;
  namaProduk: string;
  deskripsi: string | null;
  kategori: string;
  gambarUrl: string | null;
  harga: number;
  stok: number;
  isActive: boolean;
  status: "TERSEDIA" | "STOK_RENDAH" | "HABIS";
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  stats: ProductStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NutritionistStats {
  total: number;
  available: number;
  unavailable: number;
  avgExperience: number;
  specializations: number;
}

export interface Nutritionist {
  id: number;
  userId: number;
  nama: string;
  email: string;
  avatarUrl: string | null;
  userIsActive: boolean;
  gelar: string | null;
  sertifikasi: string;
  spesialisasi: string | null;
  pengalamanTahun: number;
  pendidikan: string | null;
  registrasiMedis: string | null;
  noTelepon: string | null;
  bidangKeahlian: string | null;
  jadwal: any;
  biayaVideoCall: number;
  biayaChat: number;
  fotoUrl: string | null;
  bio: string | null;
  isAvailable: boolean;
  status: "TERSEDIA" | "TIDAK_TERSEDIA";
  createdAt: string;
  updatedAt: string;
}

export interface NutritionistsResponse {
  nutritionists: Nutritionist[];
  stats: NutritionistStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
}

export interface Article {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  kategori: string;
  gambarUrl: string | null;
  penulis: string | null;
  isPublished: boolean;
  status: "PUBLISHED" | "DRAFT";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse {
  articles: Article[];
  stats: ArticleStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ShopOrderStats {
  total: number;
  pending: number;
  success: number;
  failed: number;
  revenue: number;
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
    gambarUrl: string | null;
    harga: number;
    kategori: string;
  };
}

export interface ShopOrder {
  id: number;
  midtransOrderId: string;
  midtransTransactionId: string | null;
  jenisTransaksi: "SHOP";
  statusBayar: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUND";
  totalHarga: number;
  biayaPengiriman: number;
  metodePengiriman: string;
  snapToken: string | null;
  paymentType: string | null;
  tanggalTransaksi: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    nama: string;
    email: string;
    avatarUrl: string | null;
  };
  alamat: {
    id: number;
    penerima: string;
    telepon: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    detail: string;
    label: string;
  } | null;
  items: ShopOrderItem[];
}

export interface ShopOrdersResponse {
  orders: ShopOrder[];
  stats: ShopOrderStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ConsultationStats {
  total: number;
  booked: number;
  confirmed: number;
  inProgress: number;
  done: number;
  cancelled: number;
  revenue: number;
}

export interface Consultation {
  id: number;
  userId: number;
  ahliGiziId: number;
  transaksiId: number;
  jadwalSesi: string;
  durasiMenit: number;
  metode: "VIDEO_CALL" | "CHAT";
  status: "BOOKED" | "CONFIRMED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  catatanKonsultasi: string | null;
  linkMeeting: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    nama: string;
    email: string;
    avatarUrl: string | null;
  };
  ahliGizi: {
    id: number;
    userId: number;
    nama: string;
    email: string;
    avatarUrl: string | null;
    spesialisasi: string | null;
    gelar: string | null;
    fotoUrl: string | null;
  } | null;
  transaksi: {
    id: number;
    midtransOrderId: string;
    statusBayar: string;
    totalHarga: number;
  };
}

export interface ConsultationsResponse {
  consultations: Consultation[];
  stats: ConsultationStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardResponse {
  stats: {
    users: UserStats;
    products: ProductStats;
    nutritionists: NutritionistStats;
    articles: ArticleStats;
    shopOrders: ShopOrderStats;
    consultations: ConsultationStats;
    revenue: {
      shop: number;
      teleNutritionist: number;
      total: number;
    };
  };
  activities: Array<{
    type: "user" | "product" | "order" | "session" | "article";
    message: string;
    sub: string;
    at: string;
    refId: number;
  }>;
}

export const adminService = {
  // ─── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard: async (): Promise<DashboardResponse> => {
    const { data } = await apiClient.get("/api/admin/dashboard");
    return data.data;
  },

  // ─── Users ──────────────────────────────────────────────────────────────────
  getUsers: async (params?: any): Promise<UsersResponse> => {
    const { data } = await apiClient.get("/api/admin/users", { params });
    return data.data;
  },

  setUserActive: async (id: number | string, isActive: boolean): Promise<User> => {
    const { data } = await apiClient.patch(`/api/admin/users/${id}/active`, { isActive });
    return data.data.user;
  },

  deleteUser: async (id: number | string): Promise<User> => {
    const { data } = await apiClient.delete(`/api/admin/users/${id}`);
    return data.data.user;
  },

  // ─── Products ───────────────────────────────────────────────────────────────
  getProducts: async (params?: any): Promise<ProductsResponse> => {
    const { data } = await apiClient.get("/api/admin/products", { params });
    return data.data;
  },

  createProduct: async (formData: FormData): Promise<Product> => {
    const { data } = await apiClient.post("/api/admin/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data.product;
  },

  updateProduct: async (id: number | string, formData: FormData): Promise<Product> => {
    const { data } = await apiClient.patch(`/api/admin/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data.product;
  },

  deleteProduct: async (id: number | string): Promise<Product> => {
    const { data } = await apiClient.delete(`/api/admin/products/${id}`);
    return data.data.product;
  },

  // ─── Nutritionists ──────────────────────────────────────────────────────────
  getNutritionists: async (params?: any): Promise<NutritionistsResponse> => {
    const { data } = await apiClient.get("/api/admin/nutritionists", { params });
    return data.data;
  },

  createNutritionist: async (body: any): Promise<Nutritionist> => {
    const { data } = await apiClient.post("/api/admin/nutritionists", body);
    return data.data.nutritionist;
  },

  updateNutritionist: async (id: number | string, body: any): Promise<Nutritionist> => {
    const { data } = await apiClient.patch(`/api/admin/nutritionists/${id}`, body);
    return data.data.nutritionist;
  },

  deleteNutritionist: async (id: number | string): Promise<Nutritionist> => {
    const { data } = await apiClient.delete(`/api/admin/nutritionists/${id}`);
    return data.data.nutritionist;
  },

  // ─── Articles ───────────────────────────────────────────────────────────────
  getArticles: async (params?: any): Promise<ArticlesResponse> => {
    const { data } = await apiClient.get("/api/admin/articles", { params });
    return data.data;
  },

  createArticle: async (formData: FormData): Promise<Article> => {
    const { data } = await apiClient.post("/api/admin/articles", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data.article;
  },

  updateArticle: async (id: number | string, formData: FormData): Promise<Article> => {
    const { data } = await apiClient.patch(`/api/admin/articles/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data.article;
  },

  deleteArticle: async (id: number | string): Promise<Article> => {
    const { data } = await apiClient.delete(`/api/admin/articles/${id}`);
    return data.data.article;
  },

  // ─── Shop Orders ────────────────────────────────────────────────────────────
  getShopOrders: async (params?: any): Promise<ShopOrdersResponse> => {
    const { data } = await apiClient.get("/api/admin/orders/shop", { params });
    return data.data;
  },

  updateShopOrderStatus: async (id: number | string, statusBayar: string): Promise<ShopOrder> => {
    const { data } = await apiClient.patch(`/api/admin/orders/shop/${id}/status`, { statusBayar });
    return data.data.order;
  },

  // ─── Consultations ──────────────────────────────────────────────────────────
  getConsultations: async (params?: any): Promise<ConsultationsResponse> => {
    const { data } = await apiClient.get("/api/admin/consultations", { params });
    return data.data;
  },

  updateConsultation: async (id: number | string, body: any): Promise<Consultation> => {
    const { data } = await apiClient.patch(`/api/admin/consultations/${id}`, body);
    return data.data.consultation;
  },
};
