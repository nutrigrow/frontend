import { useEffect, useState } from "react";
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

type ActiveMenu = "alamat" | "profil-anak" | "reset-password";

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
function MenuItem({ icon, label, active, onClick }: {
  icon: string; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition text-left ${
        active ? "bg-[#f0fde4] text-[#4d7c0f]" : "text-gray-600 hover:bg-gray-100"
      }`}>
      <img src={icon} className="w-5 h-5 object-contain" alt="" />
      {label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function EditProfile() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("alamat");

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

  // Password state
  const [passwords, setPasswords]   = useState({ current: "", newPass: "", confirm: "" });
  const [pwStrength, setPwStrength] = useState(0);
  const [pwSaving, setPwSaving]     = useState(false);
  const [pwError, setPwError]       = useState("");
  const [pwSuccess, setPwSuccess]   = useState("");

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

  const deleteChild = (id: number) => {
    setChildren(prev => prev.filter(c => c.id !== id));
    setChildModal({ open: false, editId: null });
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

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
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
          <div className="mt-2 text-left w-full max-w-sm">
            <p className="font-bold text-gray-900">Personal Information</p>
            <p className="text-xs text-gray-500 mt-0.5">Update your personal details and how we can reach you.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

          {/* Sidebar */}
          <div className="md:col-span-1 bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Main Menu</p>
            <div className="space-y-1">
              <MenuItem icon={iconAlamat}   label="Alamat"         active={activeMenu === "alamat"}         onClick={() => setActiveMenu("alamat")} />
              <MenuItem icon={iconAnak}     label="Profil Anak"    active={activeMenu === "profil-anak"}    onClick={() => setActiveMenu("profil-anak")} />
              <MenuItem icon={iconPassword} label="Reset Password" active={activeMenu === "reset-password"} onClick={() => setActiveMenu("reset-password")} />
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3 space-y-4">

            {/* ── ALAMAT ── */}
            {activeMenu === "alamat" && (
              <>
                {addrLoading ? (
                  <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-sm text-gray-400">Memuat alamat...</div>
                ) : addresses.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-sm text-gray-400">Belum ada alamat tersimpan.</div>
                ) : addresses.map(addr => (
                  <div key={addr.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 text-sm">{addr.namaPenerima}</p>
                        {addr.isDefault && (
                          <span className="text-[10px] border border-gray-300 rounded-full px-2 py-0.5 text-gray-500">Utama</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{addr.noTelepon}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{addr.alamatLengkap}</p>
                      <p className="text-xs text-gray-600">
                        {addr.kelurahan && `${addr.kelurahan}, `}
                        {addr.kecamatan && `${addr.kecamatan}, `}
                        {addr.kota}
                        {addr.kodePos && ` ${addr.kodePos}`}
                      </p>
                    </div>
                    <button onClick={() => setAddressModal({ open: true, editId: addr.id })}>
                      <img src={editsign} alt="edit" className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <div className="flex justify-center">
                  <button onClick={() => setAddressModal({ open: true, editId: null })}
                    className="bg-[#4d7c0f] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a5a00] transition text-sm">
                    + Tambah Alamat
                  </button>
                </div>
              </>
            )}

            {/* ── PROFIL ANAK ── */}
            {activeMenu === "profil-anak" && (
              <>
                {childLoading ? (
                  <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-sm text-gray-400">Memuat data anak...</div>
                ) : children.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-sm text-gray-400">Belum ada profil anak.</div>
                ) : children.map(child => (
                  <div key={child.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={child.jenisKelamin === "PEREMPUAN" ? girlsymbol : boysymbol}
                        alt={child.jenisKelamin}
                        className="w-10 h-10 object-contain"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {child.namaDepan}{child.namaAkhir ? ` ${child.namaAkhir}` : ""}
                        </p>
                        <p className="text-xs text-gray-500">
                          {child.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "Laki-laki"}
                        </p>
                        <p className="text-xs text-gray-400">{child.tanggalLahir}</p>
                      </div>
                    </div>
                    <button onClick={() => setChildModal({ open: true, editId: child.id })}>
                      <img src={editsign} alt="edit" className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <div className="flex justify-center">
                  <button onClick={() => setChildModal({ open: true, editId: null })}
                    className="bg-[#4d7c0f] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a5a00] transition text-sm">
                    Tambah Profil Anak
                  </button>
                </div>
              </>
            )}

            {/* ── RESET PASSWORD ── */}
            {activeMenu === "reset-password" && (
              <div className="bg-[#fff7ed] rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Security &amp; Password</h2>
                <p className="text-sm text-gray-500 mb-6">Keep your account secure by using a strong password.</p>
                {pwError   && <p className="text-xs text-red-500 mb-4 bg-red-50 rounded-lg px-3 py-2">{pwError}</p>}
                {pwSuccess && <p className="text-xs text-green-600 mb-4 bg-green-50 rounded-lg px-3 py-2">{pwSuccess}</p>}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                    <input type="password" placeholder="Enter Current Password"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                      value={passwords.current}
                      onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <input type="password" placeholder="Enter new password"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                      value={passwords.newPass}
                      onChange={e => handleNewPassword(e.target.value)} />
                    {passwords.newPass && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                              style={{ backgroundColor: i <= pwStrength ? strengthColor : "#e5e7eb" }} />
                          ))}
                        </div>
                        <p className="text-xs" style={{ color: strengthColor }}>
                          Password strength: {strengthLabel}. Use 8+ characters with symbols.
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" placeholder="Repeat new password"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                      value={passwords.confirm}
                      onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
                    {passwords.confirm && passwords.newPass !== passwords.confirm && (
                      <p className="text-xs text-red-500 mt-1">Password tidak cocok.</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button onClick={handleChangePassword} disabled={pwSaving}
                    className="bg-[#4d7c0f] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a5a00] transition text-sm disabled:opacity-60">
                    {pwSaving ? "Menyimpan..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

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
