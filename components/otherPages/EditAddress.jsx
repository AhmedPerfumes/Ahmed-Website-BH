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
      road: "",
      state: "",
      city: "",
      isDefault: false,
    },
    {
      id: -1,
      name: "",
      email: "",
      mobile: "",
      area: "",
      building: "",
      road: "",
      state: "",
      city: "",
      isDefault: false,
    },
  ]);
  const [show, setShow] = useState(false);
  const [editingIndex, setEditingIndex] = useState(0);
  const [form, setForm] = useState(addresses[0]);
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [shippingBlock, setShippingBlock] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
          area: addr.area || "",
          building: addr.building || "",
          road: addr.road || "",
          state: addr.state || "",
          city: addr.city || "",
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
            road: "",
            state: "",
            city: "",
            isDefault: false,
          },
          parsed[1] || {
            id: -1,
            ...userInfo,
            area: "",
            building: "",
            road: "",
            state: "",
            city: "",
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
            road: "",
            state: "",
            city: "",
            isDefault: false,
          },
          {
            id: -1,
            ...userInfo,
            area: "",
            building: "",
            road: "",
            state: "",
            city: "",
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

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await fetch("https://dev.api.delybelllogistics.com/v1/customer/external/master/blocks", {
          method: "GET",
          headers: {
            "x-access-key": process.env.NEXT_PUBLIC_DELYBELL_ACCESS_KEY,
            "x-secret-key": process.env.NEXT_PUBLIC_DELYBELL_SECRET_KEY,
          },
        });
        const resData = await response.json();
        if (resData?.status && Array.isArray(resData?.data)) {
          setBlocks(resData.data);
        }
      } catch (err) {
        console.error("Error fetching blocks:", err);
      }
    };
    fetchBlocks();
  }, []);

  const handleBlockChange = (event, area) => {
    const { id } = event.target;
    // console.log(id, area);
    // if (id.startsWith('shipping') || id.startsWith('billing')) {
      // const addressField = id.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
      // const fieldName = id.split('.')[1]; // Get the specific field (e.g., street, city)
      setForm((prevData) => {
        return { ...prevData, [id]:  area };
      });
    // }
  };

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
    if (!form.area?.trim()) newErrors.area = "Block is required";
    if (!form.building?.trim()) newErrors.building = "Building / Villa is required";
    if (!form.road?.trim()) newErrors.road = "Road is required";
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
          // address: form.address,
          city: form.city,
          state: form.state,
          area: form.area,
          building: form.building,
          road: form.road,
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
                    {`Block ${addresses[idx].area}`}, {`Road ${addresses[idx].road}`}, {`Building ${addresses[idx].building}`}
                    {<>, Region {addresses[idx].state}</>}
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
              <div className="col-md-6 col-6">
                <div className="search-field my-3">
                  <div
                    className={`form-label-fixed hover-container ${shippingBlock ? "js-content_visible" : ""
                      }`}
                  >
                    <label htmlFor="search-dropdown" className="form-label">
                      Block *
                    </label>
                    <div className="js-hover__open">
                      <input
                        type="text"
                        className="form-control form-control-lg search-field__actor search-field__arrow-down"
                        id="search-dropdown"
                        name="area"
                        value={form.area}
                        placeholder="Select Block..."
                        onClick={() => setShippingBlock((pre) => !pre)}
                        required
                      />
                    </div>
                    <div className="filters-container js-hidden-content mt-2">
                      <div className="search-field__input-wrapper">
                        <input
                          type="text"
                          className="search-field__input form-control form-control-sm bg-lighter border-lighter"
                          placeholder="Search"
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                          }}
                        />
                      </div>
                      <ul className="search-suggestion list-unstyled" style={{ height: "400px", overflowY: "scroll" }}>
                        {blocks
                          .map((item) => (item.code && item.name ? `${item.code} - ${item.name}` : (item.code || item.name || "")))
                          .filter((elm) =>
                            elm
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                          )
                          .map((elm, i) => (
                            <li
                              id="area"
                              onClick={(e) => {
                                handleBlockChange(e, elm);
                                setShippingBlock(false);
                              }}
                              key={i}
                              className="search-suggestion__item js-search-select"
                            >
                              {elm}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <Form.Control.Feedback type="invalid">{errors.area}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
                Building / Villa *
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
                Road *
              </Form.Label>
              <Form.Control
                name="road"
                value={form.road}
                onChange={handleChange}
                className="rounded-2 px-2 py-1"
                isInvalid={!!errors.road}   // <-- added
              />
              <Form.Control.Feedback type="invalid">{errors.building}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-uppercase text-xs fw-medium text-secondary">
                Region *
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
