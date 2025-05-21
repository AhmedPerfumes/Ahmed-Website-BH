import Footer14 from "@/components/footers/Footer14";
import MobileFooter2 from "@/components/footers/MobileFooter2";

import Header14 from "@/components/headers/Header14";
// import Loader from "@/components/loader/Loader";
import WeddingPromotion from "@/components/otherPages/WeddingPromotion";
import React from "react";

export const metadata = {
  title: "Ahmed Al Maghribi Wedding Promotion - Ahmed Al Maghribi Perfumes",
  description: "Elevate your wedding experience with our enchanting perfume setup",
  icons: {
      icon: "/assets/images/ahmed-favicons.png",
  },
};

export default function WeddingPage() {
  return (
    <>
    {/* <Loader/> */}
      <Header14 />
      <main className="">
        {/* <div className="mb-4 pb-4"></div> */}
        <WeddingPromotion />
        {/* <Services /> */}
        {/* <Clients /> */}
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
