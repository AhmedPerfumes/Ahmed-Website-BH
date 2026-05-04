import Footer14 from "@/components/footers/Footer14";
import Header14 from "@/components/headers/Header14";
import Cart from "@/components/shopCartandCheckout/Cart";
import ChectoutSteps from "@/components/shopCartandCheckout/ChectoutSteps";
import MobileFooter2 from "@/components/footers/MobileFooter2";

import React from "react";

export const metadata = {
  title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
  description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
  icons: {
      icon: "/assets/images/ahmed-favicons.png",
  },
};

export default function () {
  return (
    <>
      <Header14 />
      <main>
        <div className="mb-3 pb-3 mb-lg-4 pb-lg-4"></div>
        <section className="shop-checkout container">
          <h2 className="page-title">Cart</h2>
          <ChectoutSteps />
          <Cart />
        </section>
      </main>
      <section className="d-none d-lg-block" style={{ height: "100%" }}>
        <Footer14 />
        
      </section>
      <section className="d-sm-block d-md-none bg-dark pt-5  ">
      <div className="MobileFooter">
      

      <MobileFooter2/>
      </div>
      </section>
    </>
  );
}
