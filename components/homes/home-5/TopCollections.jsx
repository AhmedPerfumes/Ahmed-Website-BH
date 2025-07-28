"use client";
import { useContextElement } from "@/context/Context";
import { useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from 'he';
import Pagination1 from "../../common/Pagination1";
import { useLocale } from "next-intl";
import { useMenu } from '@/context/MenuContext';
import Link from "next/link";

export default function TopCollections({ categoryId,title,category,sub_category}) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const { toggleWishlist, isAddedtoWishlist, setQuickViewItem, addProductToCart, isAddedToCartProducts } = useContextElement();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const swiperOptions = {
    autoplay: {
      delay: 5000,
    },
    slidesPerView: 5,
    slidesPerGroup: 5,
    modules: [Autoplay, Navigation, Pagination],
    effect: "none",
    loop: false,
    pagination: {
      el: "#collections-tab-1 .products-pagination",
      type: "bullets",
      clickable: true,
    },
    navigation: {
      nextEl: "#collections-tab-1 .products-carousel__next",
      prevEl: "#collections-tab-1 .products-carousel__prev",
    },
    breakpoints: {
      320: {
        slidesPerView: 2,
        slidesPerGroup: 2,
        spaceBetween: 14,
      },
      768: {
        slidesPerView: 3,
        slidesPerGroup: 3,
        spaceBetween: 20,
      },
      992: {
        slidesPerView: 4,
        slidesPerGroup: 1,
        spaceBetween: 24,
        pagination: false,
      },
      1200: {
        slidesPerView: 5,
        slidesPerGroup: 1,
        spaceBetween: 28,
        pagination: false,
      },
    },
  };

  useEffect(() => {
    const getExportProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/exportProducts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category_id: categoryId }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    getExportProducts();
  }, [categoryId]);

  const removeSpecialCharactersAndAmp = (str) => {
    let cleanedStr = str?.replace(/&amp;/g, '');
    cleanedStr = cleanedStr?.replace(/[^\w\s-]/g, '');
    return cleanedStr?.replace(/\s+/g, ' ').trim();
  };

  const price = (elm) => {
    const currentUTC = new Date();
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000));
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");

    if (elm?.discount) {
      const start = new Date(elm.discount.start_date);
      const end = new Date(elm.discount.end_date);
      if (currentGST >= start && currentGST <= end) {
        const discountedPrice = (elm.price - (elm.price * elm.discount.value / 100)).toFixed(2);
        return (
          <>
            <span className="money price price-old">{elm.price}{currency.symbol}</span>
            <span className="money price price-sale">{discountedPrice}{currency.symbol}</span>
          </>
        );
      }
    } else if (elm?.sale_price) {
      const discountedPrice = (elm.price - (elm.price * elm.sale_price / 100)).toFixed(2);
      return (
        <>
          <span className="money price price-old">{elm.price}{currency.symbol}</span>
          <span className="money price price-sale">{discountedPrice}{currency.symbol}</span>
        </>
      );
    }

    return <span className="money price">{elm?.price}{currency.symbol}</span>;
  };

  if (isMenuLoading) return <Pagination1 />;
  if (isMenuError) return <div>{isMenuError}</div>;

  return loading ? <Pagination1 /> : (
    <div>
      <div className="mb-4 mb-xl-5 pt-1 pb-5" />
      <section className="products-carousel container">
        <h2 className="section-title fw-normal text-center mb-3 pb-xl-3 mb-xl-3">
          {title}
        </h2>

        <div className="tab-content" id="collections-tab-content">
          <div className="tab-pane fade show active" id="collections-tab-1">
            <div className="position-relative">
              <Swiper className="swiper-container js-swiper-slider" {...swiperOptions}>
                {products.filter(elm => elm.product_qty > 0).map((elm, i) => (
                  <SwiperSlide key={i} className="swiper-slide product-card">
                    <div className="pc__img-wrapper">
                      <Link href={`/${locale}/shop/${category}/${sub_category}/${removeSpecialCharactersAndAmp(elm?.product_name)?.split(' ').join('-').toLowerCase()}`}>
                        {JSON.parse(elm.images)[0] && (
                          <Image
                            loading="lazy"
                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                            width="260"
                            height="315"
                            alt={elm?.product_name}
                            className="pc__img"
                          />
                        )}
                        {JSON.parse(elm.images)[1] && (
                          <Image
                            loading="lazy"
                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[1]}`}
                            width="260"
                            height="315"
                            alt={elm?.product_name}
                            className="pc__img pc__img-second"
                          />
                        )}
                      </Link>

                      {elm?.label_name && (
                        <div style={{ backgroundColor: elm.label_color }} className="product-label text-white right-0 top-0 left-auto mt-2 mx-2">
                          {elm.label_name}
                        </div>
                      )}

                      {elm.product_qty <= 0 ? (
                        <div style={{ backgroundColor: '#dc3545' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                          Out Of Stock
                        </div>
                      ) : (
                        elm.discount && (
                          <div style={{ backgroundColor: '#198754' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                            Sale {elm.discount.value}%
                          </div>
                        )
                      )}

                      {elm.product_qty > 0 && (
                        <button
                          className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                          onClick={() => !isAddedToCartProducts(elm.product_id) && addProductToCart({
                            ...elm,
                            category_name: 'Collections',
                            subcategory_name: 'Online Exclusive'
                          })}
                          title={isAddedToCartProducts(elm.product_id) ? "Already Added" : "Add to Cart"}
                        >
                          {isAddedToCartProducts(elm.product_id) ? "Already Added" : "Add To Cart"}
                        </button>
                      )}
                    </div>

                    <div className="pc__info position-relative">
                      <h6 className="pc__title">
                        <Link href={`/${locale}/shop/online-exclusive/online-exclusive/${removeSpecialCharactersAndAmp(elm?.product_name)?.split(' ').join('-').toLowerCase()}`}>
                          {elm?.product_name && he.decode(elm.product_name)}
                        </Link>
                      </h6>
                      <div className="product-card__price d-flex">
                        {price(elm)}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="cursor-pointer products-carousel__prev type2 position-absolute top-50 d-flex align-items-center justify-content-center">
                <svg width="25" height="25" viewBox="0 0 25 25"><use href="#icon_prev_md" /></svg>
              </div>
              <div className="cursor-pointer products-carousel__next type2 position-absolute top-50 d-flex align-items-center justify-content-center">
                <svg width="25" height="25" viewBox="0 0 25 25"><use href="#icon_next_md" /></svg>
              </div>

              <div className="products-pagination mt-4 mb-5 d-flex align-items-center justify-content-center"></div>
            </div>
          </div>
        </div>
      </section>
      <div className="pt-1 pb-5"></div>
    </div>
  );
}
