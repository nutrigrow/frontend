import { useState } from "react";
import iconAlamat from "../assets/images/images-location.png";
import iconAnak from "../assets/images/images-baby.png";
import iconPassword from "../assets/images/images-lock.png";
import iconCamera from "../assets/images/images-camera.png";
import fotoProfile from "../assets/images/images-avatar.png";
import girlsymbol from "../assets/images/images-girlsymbol.png";
import boysymbol from "../assets/images/images-malesymbol.png";
import editsign from "../assets/images/images-editsign.png";

// ── Types ──────────────────────────────────────────────────────────────────
interface Address {
  id: number;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  kecamatan: string;
  kelurahan: string;
  kota: string;
  kodepos: string;
  isDefault: boolean;
}

interface ChildProfile {
  id: number;
  nama: string;
  gender: "Laki-laki" | "Perempuan";
  beratLahir: string;
  tinggiLahir: string;
  tinggiIbu: string;
}

type ActiveMenu = "alamat" | "profil-anak" | "reset-password";

// ── Initial Data ───────────────────────────────────────────────────────────
const initialAddresses: Address[] = [];
const initialChildren: ChildProfile[] = [];

const emptyAddress = (): Omit<Address, "id" | "isDefault"> => ({
  nama: "", email: "", telepon: "", alamat: "",
  kecamatan: "", kelurahan: "", kota: "", kodepos: "",
});

const emptyChild = (): Omit<ChildProfile, "id"> => ({
  nama: "", gender: "Laki-laki", beratLahir: "", tinggiLahir: "", tinggiIbu: "",
});

// ── Modal: Update Alamat ───────────────────────────────────────────────────
function AddressModal({
  initial, onSave, onDelete, onClose, isNew,
}: {
  initial: Omit<Address, "id" | "isDefault">;
  onSave: (data: Omit<Address, "id" | "isDefault">, isDefault: boolean) => void;
  onDelete?: () => void;
  onClose: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [isDefault, setIsDefault] = useState(false);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-5">{isNew ? "Tambah Alamat" : "Update Alamat"}</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Nama",          key: "nama",       col: 1 },
            { label: "Alamat Email",  key: "email",      col: 1 },
            { label: "No Telepon",    key: "telepon",    col: 1 },
            { label: "Alamat",        key: "alamat",     col: 1 },
            { label: "Kecamatan",     key: "kecamatan",  col: 1 },
            { label: "Kelurahan",     key: "kelurahan",  col: 1 },
            { label: "Kota",          key: "kota",       col: 1 },
            { label: "Kode Pos",      key: "kodepos",    col: 1 },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                value={(form as any)[field.key]}
                onChange={f(field.key as any)}
              />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 mt-4 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="accent-[#4d7c0f]" />
          Jadikan Alamat Utama
        </label>
        <div className="flex items-center justify-between mt-6">
          {!isNew && onDelete ? (
            <button onClick={onDelete} className="text-sm text-red-500 font-[Montserrat,sans-serif] border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition">
              Delete Address
            </button>
          ) : <div />}
          <div className="flex gap-3">
            <button onClick={onClose} className="text-sm text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">Cancel</button>
            <button
              onClick={() => onSave(form, isDefault)}
              className="text-sm bg-[#4d7c0f] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#3a5a00] transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal: Profil Anak ─────────────────────────────────────────────────────
function ChildModal({
  initial, onSave, onDelete, onClose, isNew,
}: {
  initial: Omit<ChildProfile, "id">;
  onSave: (data: Omit<ChildProfile, "id">) => void;
  onDelete?: () => void;
  onClose: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState(initial);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">{isNew ? "Tambah Profil Anak" : "Edit Profil Anak"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Anak</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition" value={form.nama} onChange={f("nama")} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition" value={form.gender} onChange={f("gender")}>
              <option>Laki-laki</option>
              <option>Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Berat Lahir (kg)</label>
            <input type="number" step="0.1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition" value={form.beratLahir} onChange={f("beratLahir")} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tinggi Saat Lahir (cm)</label>
            <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition" value={form.tinggiLahir} onChange={f("tinggiLahir")} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tinggi Ibu Saat Lahir (cm)</label>
            <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition" value={form.tinggiIbu} onChange={f("tinggiIbu")} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          {!isNew && onDelete ? (
            <button onClick={onDelete} className="text-sm text-red-500 font-semibold border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition">
              Hapus Profil
            </button>
          ) : <div />}
          <div className="flex gap-3">
            <button onClick={onClose} className="text-sm text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">Cancel</button>
            <button onClick={() => onSave(form)} className="text-sm bg-[#4d7c0f] text-white font-semibold px-5 py-2 rounded-lg hover:bg-[#3a5a00] transition">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar Menu Item ──────────────────────────────────────────────────────
function MenuItem({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition text-left ${
        active ? "bg-[#4d7c0f] text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <img src={icon} className="w-5 h-5 object-contain" alt="" />
      {label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function EditProfile() {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("alamat");

  // Address state
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [addressModal, setAddressModal] = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null });

  // Child state
  const [children, setChildren] = useState<ChildProfile[]>(initialChildren);
  const [childModal, setChildModal] = useState<{ open: boolean; editId: number | null }>({ open: false, editId: null });

  // Password state
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [pwStrength, setPwStrength] = useState(0);

  // ── Address handlers ───────────────────────────────────────────────────
  function saveAddress(data: Omit<Address, "id" | "isDefault">, isDefault: boolean) {
    if (addressModal.editId === null) {
      // Add new
      const newId = Math.max(0, ...addresses.map(a => a.id)) + 1;
      setAddresses(prev => [
        ...prev.map(a => isDefault ? { ...a, isDefault: false } : a),
        { ...data, id: newId, isDefault },
      ]);
    } else {
      // Edit existing
      setAddresses(prev => prev.map(a =>
        a.id === addressModal.editId
          ? { ...a, ...data, isDefault: isDefault || a.isDefault }
          : isDefault ? { ...a, isDefault: false } : a
      ));
    }
    setAddressModal({ open: false, editId: null });
  }

  function deleteAddress(id: number) {
    setAddresses(prev => prev.filter(a => a.id !== id));
    setAddressModal({ open: false, editId: null });
  }

  // ── Child handlers ─────────────────────────────────────────────────────
  function saveChild(data: Omit<ChildProfile, "id">) {
    if (childModal.editId === null) {
      const newId = Math.max(0, ...children.map(c => c.id)) + 1;
      setChildren(prev => [...prev, { ...data, id: newId }]);
    } else {
      setChildren(prev => prev.map(c => c.id === childModal.editId ? { ...c, ...data } : c));
    }
    setChildModal({ open: false, editId: null });
  }

  function deleteChild(id: number) {
    setChildren(prev => prev.filter(c => c.id !== id));
    setChildModal({ open: false, editId: null });
  }

  // ── Password strength ──────────────────────────────────────────────────
  function handleNewPassword(val: string) {
    setPasswords(p => ({ ...p, newPass: val }));
    let strength = 0;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;
    setPwStrength(strength);
  }

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"][pwStrength];

  // ── Active address/child for modal ────────────────────────────────────
  const editingAddress = addressModal.editId !== null
    ? addresses.find(a => a.id === addressModal.editId)
    : null;

  const editingChild = childModal.editId !== null
    ? children.find(c => c.id === childModal.editId)
    : null;

  return (
    <div className="min-h-screen bg-[#f7f9f4] font-sans flex flex-col">


      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Profile header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img src={fotoProfile} className="w-full h-full object-cover" alt="profile" />
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#4d7c0f] rounded-full flex items-center justify-center shadow">
              <img src={iconCamera} className="w-4 h-4 object-contain" alt="camera" />
            </button>
          </div>
          <p className="font-bold text-gray-900 text-lg">Sarah Jenkins</p>
          <p className="text-sm text-gray-400">Joined since 2023</p>
          <div className="mt-2 text-left w-full max-w-sm">
            <p className="font-bold text-gray-900">Personal Information</p>
            <p className="text-xs text-gray-500 mt-0.5">Update your personal details and how we can reach you.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

          {/* ── Sidebar ── */}
          <div className="md:col-span-1 bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">Main Menu</p>
            <div className="space-y-1">
              <MenuItem icon={iconAlamat} label="Alamat"        active={activeMenu === "alamat"}        onClick={() => setActiveMenu("alamat")} />
              <MenuItem icon={iconAnak} label="Profil Anak"   active={activeMenu === "profil-anak"}   onClick={() => setActiveMenu("profil-anak")} />
              <MenuItem icon={iconPassword} label="Reset Password" active={activeMenu === "reset-password"} onClick={() => setActiveMenu("reset-password")} />
            </div>
          </div>

          {/* ── Content ── */}
          <div className="md:col-span-3 space-y-4">

            {/* ── ALAMAT ── */}
            {activeMenu === "alamat" && (
              <>
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition ${addr.isDefault ? "border-amber-400" : "border-amber-200"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">{addr.nama}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{addr.telepon}</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{addr.alamat}</p>
                        <p className="text-sm text-gray-600">{addr.kecamatan}, {addr.kota}</p>
                        <p className="text-sm text-gray-600">West Java, Indonesia</p>
                        {addr.isDefault && (
                          <span className="inline-block mt-2 text-xs border border-gray-400 rounded-full px-3 py-0.5 text-gray-600">Default</span>
                        )}
                      </div>
                      <button
                        onClick={() => setAddressModal({ open: true, editId: addr.id })}
                        className="text-gray-400 hover:text-[#4d7c0f] transition text-lg"
                      >
                        <img src={editsign} alt="edit" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center">
                  <button
                    onClick={() => setAddressModal({ open: true, editId: null })}
                    className="bg-[#4d7c0f] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a5a00] transition"
                  >
                    Tambah Alamat
                  </button>
                </div>
              </>
            )}

            {/* ── PROFIL ANAK ── */}
            {activeMenu === "profil-anak" && (
              <>
                {children.map(child => (
                  <div key={child.id} className="bg-white rounded-2xl p-5 shadow-sm border-2 border-green-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            className="w-8 h-8"
                            src={child.gender === "Laki-laki" ? boysymbol : girlsymbol}
                            alt="gender"
                            />
                          <p className="font-bold text-gray-900">{child.nama}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          {[
                            { label: "Gender",        value: child.gender },
                            { label: "Berat Lahir",   value: `${child.beratLahir} kg` },
                            { label: "Tinggi Lahir",  value: `${child.tinggiLahir} cm` },
                            { label: "Tinggi Ibu",    value: `${child.tinggiIbu} cm` },
                          ].map(info => (
                            <div key={info.label} className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{info.label}</p>
                              <p className="font-semibold text-gray-800 text-sm mt-0.5">{info.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setChildModal({ open: true, editId: child.id })}
                        className="text-gray-400 hover:text-[#4d7c0f] transition text-lg"
                      >
                        <img src={editsign} alt="edit" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center">
                  <button
                    onClick={() => setChildModal({ open: true, editId: null })}
                    className="bg-[#4d7c0f] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a5a00] transition"
                  >
                    Tambah Profil Anak
                  </button>
                </div>
              </>
            )}

            {/* ── RESET PASSWORD ── */}
            {activeMenu === "reset-password" && (
              <div className="bg-[#fff7ed] rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                  Security & Password
                </h2>
                <p className="text-sm text-gray-500 mb-6">Keep your account secure by using a strong password.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter Current Password"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                      value={passwords.current}
                      onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                      value={passwords.newPass}
                      onChange={e => handleNewPassword(e.target.value)}
                    />
                    {passwords.newPass && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="h-1.5 flex-1 rounded-full transition-all" style={{ backgroundColor: i <= pwStrength ? strengthColor : "#e5e7eb" }} />
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
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4d7c0f] transition"
                      value={passwords.confirm}
                      onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                    />
                    {passwords.confirm && passwords.newPass !== passwords.confirm && (
                      <p className="text-xs text-red-500 mt-1">Password tidak cocok.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button className="bg-[#4d7c0f] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a5a00] transition">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex justify-between items-center mt-8">
          <button className="text-red-500 font-semibold border border-red-200 rounded-xl px-5 py-2.5 hover:bg-red-50 transition text-sm">
            Delete Account
          </button>
          <div className="flex gap-3">
            <button className="text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition text-sm font-medium">Cancel</button>
            <button className="bg-[#4d7c0f] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a5a00] transition text-sm">
              Save Changes
            </button>
          </div>
        </div>
      </main>

      {/* ── Modals ── */}
      {addressModal.open && (
        <AddressModal
          isNew={addressModal.editId === null}
          initial={editingAddress ? { ...editingAddress } : emptyAddress()}
          onSave={saveAddress}
          onDelete={editingAddress ? () => deleteAddress(editingAddress.id) : undefined}
          onClose={() => setAddressModal({ open: false, editId: null })}
        />
      )}

      {childModal.open && (
        <ChildModal
          isNew={childModal.editId === null}
          initial={editingChild ? { ...editingChild } : emptyChild()}
          onSave={saveChild}
          onDelete={editingChild ? () => deleteChild(editingChild.id) : undefined}
          onClose={() => setChildModal({ open: false, editId: null })}
        />
      )}
    </div>
  );
}