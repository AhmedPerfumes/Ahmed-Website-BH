"use client";
import { categories2 } from "@/data/categories";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function Categories({ params, subCategories }) {
  const locale = useLocale();
  const pathname = usePathname();
  const categoryName = pathname.split("/")[3];
  const t = useTranslations();

  const [tooltip, setTooltip] = useState({ show: false, src: "", x: 0, y: 0 });

  const swiperOptions = {
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    slidesPerView: 2.5,
    spaceBetween: 20,
    slidesPerGroup: 1,
    loop: !!(subCategories && subCategories.length > 6),
    modules: [Autoplay, Navigation],
    breakpoints: {
      576: {
        slidesPerView: 3.5,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 4,
        spaceBetween: 30,
      },
      1200: {
        slidesPerView: 6,
        spaceBetween: 40,
      },
    },
  };

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  function removeSpecialCharactersAndAmp(str) {
    if (!str) return "";
    return str.replace(/&amp;/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim();
  }

  return (
    <section className="category-carousel container">
      {categoryName !== "collections" && (
        <div className="position-relative">
          <Swiper {...swiperOptions} className="swiper-container js-swiper-slider sub-cat-video pb-4">
            {subCategories?.map((elm, i) => {
              const subcatSlug = removeSpecialCharactersAndAmp(elm.name).split(' ').join('-').toLowerCase();
              const isActive = pathname.includes(`/${subcatSlug}`);

              return (
                <SwiperSlide 
                  key={i} 
                  className={`swiper-slide text-center ${hoveredIndex === i ? 'is-hovered' : ''} ${isActive ? 'is-active' : ''}`}
                  style={{ 
                    animation: `cat-fade-in-up 0.6s ease-out both ${i * 0.1}s`,
                    zIndex: hoveredIndex === i ? 100 : 1
                  }}
                >
                  <Link
                    href={`/${locale}/product-category/${removeSpecialCharactersAndAmp(categoryName)}/${subcatSlug}`}
                    className={`shop-categories__item d-block mb-3 ${isActive ? 'active-subcategory' : ''}`}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="video-container rounded-circle overflow-hidden mx-auto">
                      <video
                        loading="lazy"
                        className="w-100 h-100 object-fit-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      >
                        <source src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm.video}`} type="video/mp4" />
                      </video>
                    </div>
                  </Link>
                  <div className="text-center">
                    <Link
                      href={`/${locale}/product-category/${categoryName}/${subcatSlug}`}
                      className={`menu-link fw-medium text-uppercase small ${isActive ? 'text-primary-gold' : ''}`}
                      style={{ letterSpacing: '0.05em' }}
                    >
                      {t(elm.name)}
                    </Link>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      )}
    </section>
  );
}
