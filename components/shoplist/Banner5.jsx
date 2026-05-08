import React from "react";
import Image from "next/image";

export default function Banner5({ image, mobile_image, categoryName }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const desktopSrc = `${baseUrl}storage/${image}`;
  const mobileSrc = `${baseUrl}storage/${mobile_image}`;
  
  // Dynamic alt text for SEO - falls back to generic if categoryName is missing
  const altText = categoryName 
    ? `${categoryName.split("-").join(" ")} collection banner` 
    : "Category collection banner";

  return (
    <section className="full-width_padding">
      <div className="container-fluid" style={{ padding: 0 }}>
        <div className="shop-banner position-relative overflow-hidden banner-fade-in">
          {/* 
            Consolidated background container with warm beige placeholder color 
          */}
          <div className="background-img" style={{ backgroundColor: "#F5F0EB" }}>
            {/* Desktop Image: Priority loaded for LCP optimization */}
            <div className="d-none d-lg-block w-100 h-100">
               <Image
                priority={true}
                src={desktopSrc}
                width={1920}
                height={1000}
                alt={altText}
                className="slideshow-bg__img object-fit-cover w-100 h-100"
              />
            </div>
            
            {/* Mobile Image: Priority loaded for LCP optimization */}
            <div className="d-block d-lg-none w-100 h-100">
              <Image
                priority={true}
                src={mobileSrc}
                width={800}
                height={1200}
                alt={altText}
                className="slideshow-bg__img object-fit-cover w-100 h-100"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

