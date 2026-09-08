"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Modal, Button, Form } from "react-bootstrap";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function EditAddress() {
  const [addresses, setAddresses] = useState([
    {
      id: -1,
      name: "",
      email: "",
      mobile: "",
      area: "",
      building: "",
      state: "",
      isDefault: false,
    },
    {
      id: -1,
      name: "",
      email: "",
      mobile: "",
      area: "",
      building: "",
      state: "",
      isDefault: false,
    },
  ]);
  const [show, setShow] = useState(false);
  const [editingIndex, setEditingIndex] = useState(0);
  const [form, setForm] = useState(addresses[0]);
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const defaultUserInfoRef = React.useRef({ name: "", email: "", mobile: "" });

  const loadAddresses = async (cid, userInfo) => {
    if (!cid) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}api/customerAddressDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: cid }),
      });
      const data = await res.json();
      if (data?.addresses && data.addresses.length) {
        // 🔹 Step 1: parse API response
        const parsed = data.addresses.map((addr) => ({
          id: addr.id,
          name: addr.name || userInfo.name || "",
          email: addr.email || userInfo.email || "",
          mobile: addr.phone || addr.mobile || userInfo.mobile || "",
          area: addr.city || "",
          building: addr.address || "",
          state: addr.state || "",
          isDefault: addr.is_default === 1 || addr.is_default === true,
        }));

        const hasDefault = parsed.some((a) => a.isDefault);
        if (!hasDefault && parsed.length > 0) {
          parsed[0].isDefault = true;
        }

        // 🔹 Step 2: keep array of exactly 2, using userInfo for un-filled spots
        setAddresses([
          parsed[0] || {
            id: -1,
            ...userInfo,
            area: "",
            building: "",
            state: "",
            isDefault: false,
          },
          parsed[1] || {
            id: -1,
            ...userInfo,
            area: "",
            building: "",
            state: "",
            isDefault: false,
          },
        ]);
      } else {
        // no API addresses → fallback with user info
        setAddresses([
          {
            id: -1,
            ...userInfo,
            area: "",
            building: "",
            state: "",
            isDefault: false,
          },
          {
            id: -1,
            ...userInfo,
            area: "",
            building: "",
            state: "",
            isDefault: false,
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer_id and addresses fresh from API
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clean up legacy localStorage address
    localStorage.removeItem("address");

    const raw = localStorage.getItem("user");
    let customer_id = null;
    let defaultUserInfo = { name: "", email: "", mobile: "" };

    if (raw) {
      try {
        const userData = JSON.parse(atob(raw)); // 🔹 parse user object
        customer_id = userData.id;
        defaultUserInfo = {
          name: userData.name || "",
          email: userData.email || "",
          mobile: userData.phone || userData.mobile || "",
        };
      } catch {}
    }

    defaultUserInfoRef.current = defaultUserInfo;
    setCustomerId(customer_id);

    if (customer_id) {
      loadAddresses(customer_id, defaultUserInfo);
    } else {
      setLoading(false);
    }
  }, []);


  const openModal = (idx) => {
    setEditingIndex(idx);
    setForm(addresses[idx]);
    setShow(true);
  };

  const [errors, setErrors] = useState({}); // <-- added for inline validation

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === "isDefault") {
      setForm((f) => ({ ...f, isDefault: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // inside save function where we update customer address
  const save = async () => {
    if (!customerId) return;

    // ✅ Validation inside save
    const newErrors = {};
    if (!form.area?.trim()) newErrors.area = "Area / Mantaqa is required";
    if (!form.building?.trim()) newErrors.building = "Building / Villa / Apartment is required";
    if (!form.state?.trim()) newErrors.state = "State is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // show inline errors
      return; // stop save
    }
    setErrors({}); // clear previous errors if valid

    const otherIndex = editingIndex === 0 ? 1 : 0;

    setAddresses((prev) => {
      const updated = [...prev];
      updated[editingIndex] = { ...form };

      if (form.isDefault) {
        updated[otherIndex] = { ...updated[otherIndex], isDefault: false };
      }

      return updated;
    });

    // Ensure no stale address remains in localStorage
    localStorage.removeItem("address");

    setShow(false);

    const token = localStorage.getItem('token');

    try {
      const resp = await fetch(`${API_BASE}api/customerAddressUpdate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          address_id: form.id,
          customer_id: customerId,
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          address: form.building,
          city: form.area,
          state: form.state,
          is_default: form.isDefault ? 1 : 0,
        }),
      });

      const res = await resp.json();
      if (res?.message || res?.error) {
        if (res.error == 'Unauthorized' || res.message == 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('address');
          window.location.href = '/login_register';
          return;
        }
      }
      // Re-fetch fresh address details from API after update
      await loadAddresses(customerId, defaultUserInfoRef.current);
    } catch (e) {
      // console.error("API update failed", e);
    }
  };

  return (
    <>
      <div className="col-lg-9">
        <p className="sub-menu__title border-bottom mb-4">
          Your Default address will be used at checkout
        </p>
        <div className="d-flex gap-4 flex-column" style={{ fontFamily: "'Kanit-Regular', sans-serif" }}>
          {loading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="dashboard-skeleton" style={{ height: 140, borderRadius: 12, width: '100%' }}></div>
            ))
          ) : (
            ["Home Address", "Other Address"].map((label, idx) => (
              <div
                key={label}
                className={`p-4 d-flex justify-content-between align-items-start rounded border stagger-item ${mounted ? 'is-visible' : ''} ${
                  addresses[idx].isDefault ? "border-primary shadow-sm" : "border-light"
                }`}
                style={{ '--index': idx, transition: 'all 0.3s var(--ease-out-premium)' }}
              >
                <div>
                  <h6 className="mb-2 fw-medium text-secondary small text-uppercase letter-spacing-1">{label}</h6>
                  <p className="mb-1 text-dark fw-bold fs-17">{addresses[idx].name || <span className="text-muted fw-normal">Name not set</span>}</p>
                  <p className="mb-1 text-dark small">
                    {addresses[idx].email} {addresses[idx].email && addresses[idx].mobile && '|'} {addresses[idx].mobile}
                  </p>
                  <p className="mb-0 text-dark small">
                    {addresses[idx].area} {addresses[idx].area && addresses[idx].building && ','} {addresses[idx].building}
                    {addresses[idx].state && <>, {addresses[idx].state}</>}
                  </p>
                </div>
                <div className="text-end">
                  {addresses[idx].isDefault && (
                    <span className="badge-pop mb-2 d-inline-block">
                      <span className="badge bg-dark fw-normal px-2 py-1" style={{ borderRadius: '4px', fontSize: '11px' }}>DEFAULT</span>
                    </span>
                  )}
                  <br />
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openModal(idx);
                    }}
                    className="fs-sm border-bottom border-dark text-dark fw-medium"
                    style={{ textDecoration: 'none' }}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal style={{ fontFamily: "'Kanit-Regular', sans-serif" }} show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h6 fw-semibold">
            Edit {editingIndex === 0 ? "Home" : "Other"} Address
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="pt-1">
          <Form>
            <Form.Group className="mb-3">
  <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
    Area / Mantaqa
  </Form.Label>
  <Form.Control
    name="area"
    value={form.area}
    onChange={handleChange}
    className="rounded-2 px-2 py-1"
    isInvalid={!!errors.area}   // <-- added
  />
  <Form.Control.Feedback type="invalid">{errors.area}</Form.Control.Feedback>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
    Building / Villa 
  </Form.Label>
  <Form.Control
    name="building"
    value={form.building}
    onChange={handleChange}
    className="rounded-2 px-2 py-1"
    isInvalid={!!errors.building}   // <-- added
  />
  <Form.Control.Feedback type="invalid">{errors.building}</Form.Control.Feedback>
</Form.Group>
            <Form.Group className="mb-3">
            <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
              Region
            </Form.Label>
            <Form.Control
              name="state"
              value={form.state}
              onChange={handleChange}
              className="rounded-2 px-2 py-1"
              isInvalid={!!errors.state}
              placeholder="Enter state"
            />
            <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
          </Form.Group>
            <Form.Group className="mb-4">
              <Form.Check
                type="checkbox"
                name="isDefault"
                label="Set as default"
                checked={form.isDefault}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShow(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={save}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
