"use client";

import { 
  removeSpecialCharactersAndAmp, 
  sanitizeUrlParam, 
  capitalizeEachWord, 
  formatPrice 
} from "@/utils/shop";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from "he";
import { useLocale, useTranslations} from "next-intl";
import { useMenu } from '@/context/MenuContext';

const ProductPrice = ({ elm, currency }) => {
  const currentUTC = new Date();
  const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000));
  const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
  
  const isDiscountActive = elm?.discount && 
    new Date(current_date_time) >= new Date(elm.discount.start_date) && 
    new Date(current_date_time) <= new Date(elm.discount.end_date);

  if (isDiscountActive) {
    let discountedPrice = elm.price;
    if (elm.discount.discount_type === "percent") {
      discountedPrice = elm.price - (elm.price / 100 * elm.discount.value);
    } else if (elm.discount.discount_type === "amount") {
      discountedPrice = elm.price - elm.discount.value;
    }
    return (
      <>
        <span className="money price price-old">{formatPrice(elm.price, currency)}</span> 
        <span className="money price price-sale"> {formatPrice(discountedPrice, currency)}</span>
      </>
    );
  } else if (elm?.sale_price) {
    const salePrice = elm.price - (elm.price / 100 * elm.sale_price);
    return (
      <>
        <span className="money price price-old">{formatPrice(elm.price, currency)}</span> 
        <span className="money price price-sale"> {formatPrice(salePrice, currency)}</span>
      </>
    );
  }
  return <span className="money price">{formatPrice(elm.price, currency)}</span>;
};

const ProductCardSkeleton = () => (
  <div className="product-card-wrapper">
    <div className="product-card">
      <div className="pc__img-wrapper" style={{ background: '#f0f0f0' }}></div>
      <div className="pc__info" style={{ padding: '15px 10px' }}>
        <div className="skeleton-bar" style={{ height: '14px', width: '70%', background: '#eee', margin: '0 auto 8px', borderRadius: '4px' }}></div>
        <div className="skeleton-bar" style={{ height: '12px', width: '40%', background: '#f5f5f5', margin: '0 auto', borderRadius: '4px' }}></div>
      </div>
    </div>
  </div>
);

export default function Style2({ category, subcategory, products: initialProducts }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const t=useTranslations();
    const [products, setProducts] = useState(() => {
    const list = [...initialProducts];
    const indexToPin = 1;
    const newLaunchIndex = list.findIndex(p => p.collection_name === 'New Launch');
    if (newLaunchIndex > -1) {
      const [pinned] = list.splice(newLaunchIndex, 1);
      list.splice(indexToPin, 0, pinned);
    }
    return list;
  })

  useEffect(() => {
    const list = [...initialProducts];
    const indexToPin = 1;
    const newLaunchIndex = list.findIndex(p => p.collection_name === 'New Launch');
    if (newLaunchIndex > -1) {
      const [pinned] = list.splice(newLaunchIndex, 1);
      list.splice(indexToPin, 0, pinned);
    }
    setProducts(list);

    const fetchLiveStatus = async () => {
      try {
        const productIds = list.map((p) => p.product_id);
        if (productIds.length === 0) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/products/live-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_ids: productIds})
        });

        if(!response.ok) return;

        const liveData = await response.json();

        setProducts((prevProducts) => {
          return prevProducts.map((prevProd) => {
            const liveMatch = liveData.find((l) => l.product_id === prevProd.product_id)

            if(liveMatch) {
              return {
                ...prevProd,
                product_qty: liveMatch.product_qty,
                price: liveMatch.price,
                sale_price: liveMatch.sale_price,
                discount: liveMatch.discount,
                maximum_order_quantity: liveMatch.maximum_order_quantity
              };
            }
            return prevProd;
          });
        });
      } catch (error) {
        console.error("Failed to hydrate live product data", error);
      }
    };

    fetchLiveStatus();
  }, [initialProducts]);

  const subcat = (() => {
    if (subcategory) return sanitizeUrlParam(subcategory);
    
    const categorySlug = removeSpecialCharactersAndAmp(category);
    const categoryMap = {
      "gift-sets": "gift-sets",
      "hair-mist": "hair-mist",
      "extrait-de-parfum": "extrait-de-parfum",
      "xtrait-de-parfum": "extrait-de-parfum"
    };

    return categoryMap[categorySlug] || "online-exclusive";
  })();

  const { 
    toggleWishlist, 
    isAddedtoWishlist, 
    addProductToCart, 
    isAddedToCartProducts,
    cartProducts,
    setCartProducts 
  } = useContextElement();

  const getProductQuantity = (id) => {
    const item = cartProducts.find(p => p.product_id === id);
    return item ? item.quantity : 0;
  };

  const updateQuantity = (id, delta) => {
    setCartProducts(prev => {
      return prev.map(p => {
        if (p.product_id === id) {
          const newQty = (p.quantity || 1) + delta;
          return newQty > 0 ? { ...p, quantity: newQty } : null;
        }
        return p;
      }).filter(Boolean);
    });
  };

  if (isMenuLoading || products.length === 0) {
    return (
      <div className="products-grid row row-cols-2 row-cols-md-3 row-cols-lg-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="products-grid row row-cols-2 row-cols-md-3 row-cols-lg-3"
      id="products-grid-2"
    >
      {products.map((elm, i) => {
        const qty = getProductQuantity(elm.product_id);
        const inCart = qty > 0;

        return (
        <div key={elm.product_id} className="product-card-wrapper">
          <div className={`product-card mb-0 mb-md-4 mb-xxl-5 ${i === 1 ? "h-100 featured-card" : ""}`}>
            <div className={`pc__img-wrapper ${i === 1 ? "h-100" : ""}`}>
              {i != 1 ? (
                <Swiper
                  slidesPerView={1}
                  className="swiper-container background-img js-swiper-slider"
                  modules={[Navigation]}
                  id={`style-2${elm?.product_id.toString()}`}
                  navigation={{
                    prevEl: `#style-2${elm?.product_id.toString()} .pc__img-prev`,
                    nextEl: `#style-2${elm?.product_id.toString()} .pc__img-next`,
                  }}
                >
                  <SwiperSlide key={i} className="swiper-slide">
                    <Link
                      href={`/${locale}/shop/${removeSpecialCharactersAndAmp(
                        category
                      )}/${subcat}/${removeSpecialCharactersAndAmp(
                        elm.product_name
                      )
                        .split(" ")
                        .join("-")
                        .toLowerCase()}`}
                    >
                      {elm?.images &&
                            <>
                              {JSON.parse(elm.images)[0] && (
                                <Image
                                  loading={i < 4 ? "eager" : "lazy"}
                                  priority={i < 2}
                                  src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                                  width={480}
                                  height={600}
                                  alt={elm.product_name || "product image"}
                                  className="pc__img"
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                />
                              )}
                              {JSON.parse(elm.images)[1] && (
                                <Image
                                  loading="lazy"
                                  src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[1]}`}
                                  width={480}
                                  height={600}
                                  alt={`${elm.product_name || "product"} alternate view`}
                                  className="pc__img pc__img-second"
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                />
                              )}
                            </>
                        }
                      </Link>
                      {elm?.label_name && (
                        <div 
                          style={{ backgroundColor: elm.label_color }} 
                          className="product-label text-uppercase text-white"
                        >
                          {elm?.label_name}
                        </div>
                      )}
                      {elm.product_qty <= 0 ? (
                        <div className="product-label label--out-of-stock">{t("Out Of Stock")}</div>
                      ) : (
                        elm.discount && (
                          <div style={{ backgroundColor: '#198754' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                            {elm.discount.discount_type === "percent" ? `Sale ${elm.discount.value}%` : "Sale"}
                          </div>
                        )
                      )}
                      </SwiperSlide>

                  {i != 1 ? (
                    <>
                      <span className="cursor-pointer pc__img-prev" aria-label={t("Previous Image")} role="button">
                        <svg width="7" height="11" viewBox="0 0 7 11" xmlns="http://www.w3.org/2000/svg"><use href="#icon_prev_sm" /></svg>
                      </span>
                      <span className="cursor-pointer pc__img-next" aria-label={t("Next Image")} role="button">
                        <svg width="7" height="11" viewBox="0 0 7 11" xmlns="http://www.w3.org/2000/svg"><use href="#icon_next_sm" /></svg>
                      </span>
                    </>
                  ) : null}
                </Swiper>
              ) : (
                <>
                  <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(category)}/${subcat}/${removeSpecialCharactersAndAmp(elm.permalink?.key)?.toLowerCase()}`}>
                    <Image loading="lazy" src={`${process.env.NEXT_PUBLIC_API_URL}storage/${elm.image}`} width={800} height={1000} style={{ objectFit: 'cover', width: '100%', height: '100%' }} alt="featured product" />
                  </Link>
                  <div className="content_abs content_bottom content_left content_bottom-lg content_left-lg">
                    <h2 className="fs-30 fw-normal text-uppercase mb-0 text-white cat-title">{elm?.product_name && he.decode(elm?.product_name)}</h2>
                    <p className="mb-4 text-white">{t("Exclusive Launch")}</p>
                    <Link className="featured-explore-link" href={`/${locale}/shop/${removeSpecialCharactersAndAmp(category)}/${subcat}/${removeSpecialCharactersAndAmp(elm.permalink?.key)?.toLowerCase()}`}>
                      <span>{t("Explore")}</span>
                    </Link>
                  </div>
                </>
              )}
              {i != 1 && (
                <div className="product-card__actions">
                  {inCart ? (
                    <div className="pc__qty-selector--desktop">
                      <button className="qty-btn" onClick={() => updateQuantity(elm.product_id, -1)} aria-label={t("Decrease quantity")}>−</button>
                      <span className="qty-value">{qty}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(elm.product_id, 1)} aria-label={t("Increase quantity")}>+</button>
                    </div>
                  ) : elm?.product_qty > 0 ? (
                    <button
                      className="btn btn-primary js-add-cart"
                      onClick={() => addProductToCart({...elm, category_name: capitalizeEachWord(category.split('-').join(' ')), subcategory_name: capitalizeEachWord(subcat.split('-').join(' '))})}
                      aria-label={t("Add {name} to cart", { name: elm.product_name })}
                    >
                      {t("Add To Cart")}
                    </button>
                  ) : (
                    <button className="btn btn-out-of-stock" disabled>
                      {t("Out Of Stock")}
                    </button>
                  )}
                </div>
              )}
              {/* {i != 1 ? (
                <button
                  className={`pc__btn-wl position-absolute bg-body rounded-circle border-0 text-primary js-add-wishlist ${
                    isAddedtoWishlist(elm.product_id) ? "active" : ""
                  }`}
                  onClick={() => toggleWishlist(elm)}
                  title="Add To Wishlist"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <use href="#icon_heart" />
                  </svg>
                </button>
              ) : null} */}
            </div>
            {i != 1 ? (
              <div className="pc__info position-relative">
                {/* <p className="pc__category text-beige">{elm.category}</p> */}
                <h6 className="pc__title">
                  <Link
                    href={`/${locale}/shop/${removeSpecialCharactersAndAmp(
                      category
                    )}/${subcat}/${removeSpecialCharactersAndAmp(
                      elm?.product_name
                    )
                      ?.split(" ")
                      .join("-")
                      .toLowerCase()}`}
                  >
                    {elm?.product_name && t(he.decode(elm?.product_name))}
                  </Link>
                </h6>
                <div className="product-card__price d-flex">
                  <ProductPrice elm={elm} currency={currency} />
                </div>
                
                {inCart ? (
                  <div className="pc__qty-selector">
                    <button 
                      className="qty-btn" 
                      onClick={() => updateQuantity(elm.product_id, -1)}
                      aria-label={t("Decrease quantity")}
                    >
                      −
                    </button>
                    <span className="qty-value">{qty}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => updateQuantity(elm.product_id, 1)}
                      aria-label={t("Increase quantity")}
                    >
                      +
                    </button>
                  </div>
                ) : elm?.product_qty > 0 ? (
                  <button
                    className="pc__atc-mobile"
                    onClick={() => addProductToCart({...elm, category_name: capitalizeEachWord(category.split('-').join(' ')), subcategory_name: capitalizeEachWord(subcat.split('-').join(' '))})}
                    aria-label={t("Add {name} to cart", { name: elm.product_name })}
                  >
                    {t("Add To Cart")}
                  </button>
                ) : (
                  <button className="pc__atc-mobile pc__atc-mobile--oos" disabled>
                    {t("Out Of Stock")}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
        );
      })}
    </div>
  );
}
