"use client";
import Header14 from "@/components/headers/Header14";
import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import DashboardSidebar from "@/components/otherPages/DashboardSidebar";
import { usePathname } from "next/navigation";
import React from "react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  
  // Map pathnames to titles
  const getTitle = (path) => {
    if (path.includes("account_dashboard")) return "My Account";
    if (path.includes("account_orders_history")) return "Order History";
    if (path.includes("account_orders")) return "Orders";
    if (path.includes("account_edit_address")) return "Addresses";
    if (path.includes("account_edit")) return "Account Details";
    if (path.includes("account_coupons")) return "Your Coupons";
    if (path.includes("account_loyalty")) return "Loyalty Points";
    return "Dashboard";
  };

  return (
    <>
      <Header14 />
      <main>
        <div className="mb-4 pb-4"></div>
        <section className="my-account container">
          <div className="d-flex justify-content-between align-items-center mb-4 mb-lg-5">
            <h2 className="page-title mb-0">{getTitle(pathname)}</h2>
          </div>
          <div className="row">
            <DashboardSidebar />
            <div className="col-lg-9">
               {children}
            </div>
          </div>
        </section>
      </main>

      <div className="mb-5 pb-xl-5"></div>
      <section className="d-none d-lg-block" style={{ height: "100%" }}>
        <Footer14 />        
      </section>
      <section className="d-sm-block d-md-none bg-dark pt-5">
        <div className="MobileFooter">
          <MobileFooter2/>
        </div>
      </section>
    </>
  );
}
