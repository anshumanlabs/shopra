import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  LogOut,
  ShoppingBag,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
} from "lucide-react";
import { Button } from "@mui/material";

import { useAuth } from "../context/AuthContext";
import type { ShippingAddress } from "../types/orders";
import "./Profile.css";

type SavedAddress = ShippingAddress & {
  id: string;
  isDefault: boolean;
};

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const storageKey = user ? `shopra_addresses_${user.email}` : "shopra_addresses_guest";

  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    if (!user) return [];

    try {
      const saved = localStorage.getItem(`shopra_addresses_${user.email}`);

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialAddress: ShippingAddress = {
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  };

  const [form, setForm] = useState<ShippingAddress>(initialAddress);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(addresses));
  }, [addresses, storageKey]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const resetForm = () => {
    setForm(initialAddress);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSaveAddress = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanedAddress: ShippingAddress = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim()
    };

    if (!/^[6-9]\d{9}$/.test(cleanedAddress.phone)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(cleanedAddress.pincode)) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }

    if (editingId) {
      setAddresses((previous) =>
        previous.map((item) => (item.id === editingId ? { ...item, ...cleanedAddress } : item))
      );
    } else {
      const newAddress: SavedAddress = {
        ...cleanedAddress,
        id: crypto.randomUUID(),
        isDefault: addresses.length === 0,
      };

      setAddresses((previous) => [...previous, newAddress]);
    }

    resetForm();
  };

  const handleEdit = (address: SavedAddress) => {
    const { id, ...addressDetails } = address;

    setForm(addressDetails);
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setAddresses((previous) => {
      const updated = previous.filter((item) => item.id !== id);

      if (updated.length > 0 && !updated.some((item) => item.isDefault)) {
        updated[0] = { ...updated[0], isDefault: true };
      }

      return updated;
    });
  };

  const handleSetDefault = (id: string) => {
    setAddresses((previous) =>
      previous.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }))
    );
  };

  if (!user) return null;

  return (
    <main className="profile-page">
      <div className="profile-header">
        <span className="auth-tag">MY ACCOUNT</span>
        <h1>
          Welcome, <span>{user.name}</span>
        </h1>
        <p>Manage your SHOPRA account and shopping activity.</p>
      </div>

      <div className="profile-grid">
        {/* ACCOUNT INFORMATION */}
        <section className="profile-card">
          <div className="profile-avatar">
            <UserRound size={35} />
          </div>

          <h2>{user.name}</h2>
          <span className="profile-role">{user.role}</span>

          <div className="profile-detail">
            <Mail size={18} />
            <span>{user.email}</span>
          </div>

          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            startIcon={<LogOut size={18} />}
          >
            Logout
          </Button>
        </section>

        {/* QUICK LINKS */}
        <section className="profile-card profile-actions">
          <h2>Quick links</h2>

          <Link to="/orders" className="profile-link">
            <ShoppingBag size={20} />
            <span>My Orders</span>
          </Link>
        </section>
      </div>

      {/* ADDRESS BOOK */}
      <section className="address-book">
        <div className="address-book-header">
          <div>
            <span className="auth-tag">DELIVERY DETAILS</span>
            <h2>My Addresses</h2>
            <p>Save and manage your delivery addresses.</p>
          </div>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => {
              setForm(initialAddress);
              setEditingId(null);
              setShowForm(true);
            }}
          >
            Add Address
          </Button>
        </div>

        {/* ADDRESS FORM */}
        {showForm && (
          <form className="address-form" onSubmit={handleSaveAddress}>
            <div className="address-form-header">
              <h3>{editingId ? "Edit Address" : "Add New Address"}</h3>

              <button
                type="button"
                className="address-close"
                onClick={resetForm}
                aria-label="Close address form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="address-form-grid">
              {(
                [
                  ["fullName", "Full Name"],
                  ["email", "Email Address"],
                  ["phone", "Mobile Number"],
                  ["address", "Street Address"],
                  ["city", "City"],
                  ["state", "State"],
                  ["pincode", "PIN Code"],
                ] as [keyof ShippingAddress, string][]
              ).map(([field, label]) => (
                <label
                  className={`address-field ${field === "address" ? "address-field-full" : ""}`}
                  key={field}
                >
                  {label}

                  <input
                    type={field === "email" ? "email" : "text"}
                    value={form[field]}
                    onChange={(event) => handleChange(field, event.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    required
                    maxLength={field === "phone" ? 10 : field === "pincode" ? 6 : 150}
                    inputMode={field === "phone" || field === "pincode" ? "numeric" : "text"}
                  />
                </label>
              ))}
            </div>

            <div className="address-form-actions">
              <Button variant="outlined" color="inherit" onClick={resetForm}>
                Cancel
              </Button>

              <Button type="submit" variant="contained">
                {editingId ? "Update Address" : "Save Address"}
              </Button>
            </div>
          </form>
        )}

        {/* SAVED ADDRESSES */}
        {addresses.length === 0 ? (
          <div className="address-empty">
            <MapPin size={42} />
            <h3>No saved addresses</h3>
            <p>Add your first delivery address to make checkout faster.</p>

            <Button
              variant="outlined"
              startIcon={<Plus size={18} />}
              onClick={() => setShowForm(true)}
            >
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="address-grid">
            {addresses.map((address) => (
              <article className="address-card" key={address.id}>
                <div className="address-card-header">
                  <div className="address-card-title">
                    <MapPin size={19} />
                    <h3>{address.fullName}</h3>
                  </div>

                  {address.isDefault && (
                    <span className="default-address">
                      <Star size={13} /> Default
                    </span>
                  )}
                </div>

                <div className="address-card-details">
                  <p>{address.address}</p>
                  <p>
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p>{address.phone}</p>
                  <p>{address.email}</p>
                </div>

                <div className="address-card-actions">
                  <button className="address-action" onClick={() => handleEdit(address)}>
                    <Pencil size={15} /> Edit
                  </button>

                  <button
                    className="address-action delete"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 size={15} /> Delete
                  </button>

                  {!address.isDefault && (
                    <button
                      className="address-action set-default"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      <Star size={15} /> Set Default
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Profile;
