"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { dashboardMenuItems } from "@/data/menu";

const LOCALES = ["en", "ar"];
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function normalize(path) {
  if (!path) return "/";
  let clean = path.split("#")[0].split("?")[0] || "/";
  
  // Remove base path if present
  if (BASE_PATH && clean.startsWith(BASE_PATH)) {
    clean = clean.slice(BASE_PATH.length) || "/";
  }

  // Remove locale prefix (e.g., /en/ or /ar/)
  const localeRegex = new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`, "i");
  clean = clean.replace(localeRegex, "") || "/";

  // Ensure leading slash and remove trailing slash
  if (!clean.startsWith("/")) clean = "/" + clean;
  if (clean.length > 1 && clean.endsWith("/")) clean = clean.slice(0, -1);
  
  return clean;
}

function isActive(currentPathname, itemHref) {
  if (!currentPathname || !itemHref) return false;
  const p = normalize(currentPathname);
  const h = normalize(itemHref);
  
  return p === h || p.startsWith(h + "/");
}

export function LogoutButton() {
  const router = useRouter();
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("address");
    router.replace("/login_register");
  };

  return (
    <button 
      onClick={handleLogout} 
      className="btn-logout"
      style={{
        background: 'none',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '6px 14px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#6B7280',
        transition: 'all 0.2s',
        fontFamily: 'inherit'
      }}
    >
      Logout
    </button>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const [couponCount, setCouponCount] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const encryptedUser = localStorage.getItem("user");

    if (!encryptedUser) {
      router.replace("/login_register");
      return;
    }

    let user = null;
    try {
      const decodedText = atob(encryptedUser);
      user = JSON.parse(decodedText);
    } catch (error) {
      console.error("Failed to decode user:", error);
      router.replace("/login_register");
      return;
    }

    const fetchCouponCount = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SMARTVIEW_API_URL}Coupon/Count`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              salesType: "EComm",
              company: "BH",
              mobileNo: user.phone,
              email: user.email,
            }),
          }
        );
        const result = await response.json();
        if (result?.data !== undefined) setCouponCount(result.data);
      } catch (err) {
        console.error("Error fetching coupon count:", err);
      }
    };

    fetchCouponCount();
  }, [router]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("address");
    router.replace("/login_register");
  };

  // For mobile nav: remove "Account Overview" and include "Logout"
  const menuItems = dashboardMenuItems.filter(item => item.title !== "Account Overview");

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="col-lg-3 account-nav p-4 desktop-sidebar" role="navigation" aria-label="Dashboard Sidebar">
        <ul className="account-nav list-unstyled mb-0">
          {dashboardMenuItems.map((elm) => {
            const active = elm.title !== "Logout" && isActive(pathname, elm.href);
            const isCouponMenu = elm.title === "My Coupons";

            return (
              <li key={elm.id} className="dashboard-sidebar-item">
                {elm.title === "Logout" ? (
                  <a href="#" onClick={handleLogout} className="menu-link menu-link_us-s">
                    Logout
                  </a>
                ) : (
                  <Link
                    href={elm.href}
                    className={`menu-link menu-link_us-s ${active ? "menu-link_active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {elm.title}
                    {isCouponMenu && couponCount !== null && (
                      <span
                        className="badge rounded-pill bg-danger ms-2 badge-pop"
                        style={{ fontSize: "0.75rem", minWidth: "1.5rem", textAlign: "center" }}
                      >
                        {couponCount}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="dashboard-bottom-nav">
        {menuItems.map((item) => {
          const active = isActive(pathname, item.href);
          const isCouponMenu = item.title === "My Coupons";
          const isLogout = item.title === "Logout";

          if (isLogout) {
            return (
              <div 
                key={item.id} 
                onClick={handleLogout} 
                className="nav-item-mobile"
                style={{ cursor: 'pointer' }}
              >
                <div className="icon-wrapper">
                  <svg width="20" height="20" fill="currentColor">
                    <use href={item.icon} />
                  </svg>
                </div>
                <span>{item.shortTitle}</span>
              </div>
            );
          }

          return (
            <Link key={item.id} href={item.href} className={`nav-item-mobile ${active ? 'active' : ''}`}>
              <div className="icon-wrapper">
                <svg width="20" height="20" fill="currentColor">
                  <use href={item.icon} />
                </svg>
                {isCouponMenu && couponCount !== null && (
                  <div className="badge-mobile">{couponCount}</div>
                )}
              </div>
              <span>{item.shortTitle}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
