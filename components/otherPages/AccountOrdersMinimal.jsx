"use client";
import React, { useState, useEffect } from "react";
import {
  Spinner,
  Button,
  Modal,
  Badge,
} from "react-bootstrap";
import { useMenu } from "@/context/MenuContext";

const IMG_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AccountOrdersMinimal() {
  const { currency } = useMenu();
  const [data, setData] = useState([]);
  const [orderSummaries, setOrderSummaries] = useState({});
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageCount, setPageCount] = useState(0);
  const [activeStatus, setActiveStatus] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalDetails, setModalDetails] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Auth state
  const [CUSTOMER_ID, setCustomerId] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const u = JSON.parse(atob(raw));
        setCustomerId(u.id);
      } catch (e) {
        console.error("Auth error", e);
      }
    }
  }, []);

  const fetchOrders = async () => {
    if (!CUSTOMER_ID) return;
    setLoading(true);
    const BASE = process.env.NEXT_PUBLIC_API_URL;
    const params = new URLSearchParams({
      page: String(pagination.pageIndex + 1),
      pageSize: String(pagination.pageSize),
      orderBy: "created_at",
      orderDir: "desc",
      customer_id: String(CUSTOMER_ID),
    });

    try {
      const res = await fetch(`${BASE}api/customerOrders?${params}`);
      const json = await res.json();
      setData(json.data);
      setPageCount(Math.ceil(json.total / pagination.pageSize));

      // Fetch brief summaries (products) for each order
      const summaryResults = {};
      await Promise.all(
        json.data.map(async (order) => {
          try {
            const detailRes = await fetch(`${BASE}api/customerOrderDetails`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order_id: order.id }),
            });
            const detailJson = await detailRes.json();
            summaryResults[order.id] = detailJson.order_products || [];
          } catch (e) {}
        })
      );
      setOrderSummaries(summaryResults);
    } catch (e) {
      console.error("Fetch error", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [CUSTOMER_ID, pagination.pageIndex, pagination.pageSize]);

  const openDetails = async (order) => {
    setSelectedOrder(order);
    console.log(selectedOrder, "selectedOrder");
    setShowModal(true);
    setModalLoading(true);
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL;
      const resp = await fetch(`${BASE}api/customerOrderDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      });
      const json = await resp.json();
      setModalDetails(json);
    } catch (e) {
      setModalDetails(null);
    }
    setModalLoading(false);
  };

  const filteredData = activeStatus === "all" 
    ? data 
    : data.filter(order => order.status.value === activeStatus);

  const StatusBadge = ({ status }) => {
    const val = status?.value;
    const label = status?.label || "";
    let color = "#6B7280";
    let bg = "#F3F4F6";

    if (val === "processing") { color = "#0284C7"; bg = "#F0F9FF"; }
    else if (val === "shipped") { color = "#4F46E5"; bg = "#EEF2FF"; }
    else if (val === "completed") { color = "#059669"; bg = "#ECFDF5"; }
    else if (val === "returned") { color = "#D97706"; bg = "#FFFBEB"; }
    else if (val === "cancelled") { color = "#DC2626"; bg = "#FEF2F2"; }

    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: "500",
        color: color,
        backgroundColor: bg,
        textTransform: "capitalize"
      }}>
        {label}
      </span>
    );
  };

  return (
    <div className="account-orders-minimalist">

      <div className="section-header">
        <div className="filter-tabs">
          {[
            { key: "all", label: "All Orders" },
            { key: "processing", label: "Processing" },
            { key: "shipped", label: "Shipped" },
            { key: "completed", label: "Completed" },
            { key: "cancelled", label: "Cancelled" },
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${activeStatus === tab.key ? 'active' : ''}`}
              onClick={() => setActiveStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="order-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-header">
                <div className="skeleton skeleton-id"></div>
                <div className="skeleton skeleton-date"></div>
              </div>
              <div className="skeleton-content">
                <div className="skeleton skeleton-thumb"></div>
                <div className="skeleton skeleton-thumb"></div>
              </div>
              <div className="skeleton-footer">
                <div className="skeleton skeleton-amount"></div>
                <div className="skeleton skeleton-btn"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="order-list">
          {filteredData.length > 0 ? filteredData.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-meta">
                  <span className="order-id">Order {order.code}</span>
                  <span className="order-date">{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="order-card-content">
                <div className="product-previews">
                  {(orderSummaries[order.id] || []).slice(0, 4).map((prod, i) => (
                    <img 
                      key={i} 
                      className="product-thumb" 
                      src={prod.product_image ? `${IMG_BASE}storage/${prod.product_image}` : "/no-img.png"} 
                      alt="" 
                    />
                  ))}
                </div>
                {orderSummaries[order.id]?.length > 4 && (
                  <span className="product-count">+{orderSummaries[order.id].length - 4} more</span>
                )}
              </div>

              <div className="order-card-footer">
                <div className="order-total">
                  <span className="total-label">Total Amount: </span>
                  <span className="total-amount">{Number(order.amount).toFixed(currency.decimals)} {currency.symbol}</span>
                </div>
                <div className="order-actions">
                  <button className="btn-minimal" onClick={() => openDetails(order)}>Order Details</button>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-5 text-center text-muted">
              No orders found for this selection.
            </div>
          )}
        </div>
      )}

      {pageCount > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Page {pagination.pageIndex + 1} of {pageCount}
          </div>
          <div className="pagination-actions">
            <button 
              className="pagination-btn" 
              disabled={pagination.pageIndex === 0}
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
            >
              <span>←</span> Previous
            </button>
            <button 
              className="pagination-btn" 
              disabled={pagination.pageIndex === pageCount - 1}
              onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
            >
              Next <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Details */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered 
        className="order-modal"
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ fontSize: '20px', fontWeight: '600' }}>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {modalLoading ? (
            <div className="modal-body-content">
              <div className="row mt-4">
                <div className="col-md-7">
                  <div className="skeleton mb-2" style={{ width: '150px', height: '24px' }}></div>
                  <div className="skeleton mb-4" style={{ width: '100px', height: '14px' }}></div>
                  <div className="item-list">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="d-flex align-items-center gap-3 mb-3">
                        <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '6px' }}></div>
                        <div className="flex-grow-1">
                          <div className="skeleton mb-2" style={{ width: '60%', height: '14px' }}></div>
                          <div className="skeleton" style={{ width: '30%', height: '12px' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '12px' }}></div>
                </div>
              </div>
            </div>
          ) : modalDetails ? (
            <div className="modal-body-content">
              <div className="row mt-4">
                <div className="col-md-7">
                  <div className="order-meta">
                    <div className="d-flex align-items-center gap-3 justify-content-between">
                      <span className="order-date" style={{ marginTop: 0 }}>Placed on {new Date(selectedOrder?.created_at).toLocaleDateString()}</span>
                      <StatusBadge status={selectedOrder?.status} />
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                      Order {selectedOrder?.code}
                    </div>
                  </div>

                  <div className="item-list">
                    {modalDetails.order_products.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <img className="item-img" src={item.product_image ? `${IMG_BASE}storage/${item.product_image}` : "/no-img.png"} alt="" />
                        <div className="item-info">
                          <div className="item-name">{item.product_name}</div>
                          <div className="item-price">{item.qty} × {Number(item.gross_amount).toFixed(currency.decimals)} {currency.symbol}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-md-5">
                   <div className="summary-card">
                      <h6 className="mb-4" style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>Order Summary</h6>
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{Number(selectedOrder?.sub_total).toFixed(currency.decimals)} {currency.symbol}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping</span>
                        <span>{Number(selectedOrder?.shipping_cost || 0).toFixed(currency.decimals)} {currency.symbol}</span>
                      </div>
                      {selectedOrder?.tax_amount > 0 && (
                        <div className="summary-row">
                          <span>VAT</span>
                          <span>{Number(selectedOrder?.tax_amount).toFixed(currency.decimals)} {currency.symbol}</span>
                        </div>
                      )}
                      <div className="summary-total">
                        <span>Total </span>
                        <span>{Number(selectedOrder?.amount).toFixed(currency.decimals)} {currency.symbol}</span>
                      </div>

                      <div className="address-section">
                        <div className="address-title">Delivery Address</div>
                        <p className="address-text">
                          {modalDetails.order_address[0]?.address}<br />
                          {modalDetails.order_address[0]?.city}, {modalDetails.order_address[0]?.state}
                        </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">Failed to load details.</div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
           <button className="btn-minimal w-100" onClick={() => setShowModal(false)}>Close</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
