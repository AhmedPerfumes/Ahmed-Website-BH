"use client";
import { products51 } from "@/data/products/fashion";
import { Swiper, SwiperSlide } from "swiper/react";
import Star from "../common/Star";
import ColorSelection from "../common/ColorSelection";
import { Navigation } from "swiper/modules";
import Pagination1 from "../common/Pagination1";
import { useEffect, useState, useRef, useMemo } from "react";
import BreadCumb from "./BreadCumb";
import Link from "next/link";
import { useContextElement } from "@/context/Context";
const itemPerRow = [2, 3, 4];
import Image from "next/image";
import { openModalShopFilter } from "@/utlis/aside";
import {
  menuCategories,
  sortingOptions,
} from "@/data/products/productCategories";
import he from 'he';
import Slider from "rc-slider";

import {useLocale,useTranslations} from 'next-intl';
import { useMenu } from '@/context/MenuContext';
import { 
  removeSpecialCharactersAndAmp, 
  sanitizeUrlParam, 
  capitalizeEachWord, 
  formatPrice 
} from "@/utils/shop";

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

export default function Shop1({ search }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const { 
    toggleWishlist, 
    isAddedtoWishlist, 
    addProductToCart, 
    isAddedToCartProducts,
    cartProducts,
    setCartProducts 
  } = useContextElement();
  const allViews = [2, 3, 4];
  const smallViews = [1, 2];
  const [availableViews, setAvailableViews] = useState(allViews);
  const [selectedColView, setSelectedColView] = useState(3);
  const t = useTranslations();
  // Sorting function
   const sortItems = (items, option) => {
    // console.log(items, option);
    switch (option) {
      case 'popularity':
        return [...items].sort((a, b) => b.sales - a.sales);
      case 'date':
        return [...items].sort((a, b) => b.product_id - a.product_id);
      case 'price':
        return [...items].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...items].sort((a, b) => b.price - a.price);
      default:
        return items;
    }
  };

  // 🔧 Only coerce when crossing breakpoints; preserve user's valid choice
  useEffect(() => {
    const updateViews = () => {
      const isSmall = window.innerWidth < 992;

      if (isSmall) {
        setAvailableViews(smallViews);
        setSelectedColView((prev) => (smallViews.includes(prev) ? prev : 2));
      } else {
        setAvailableViews(allViews);
        setSelectedColView((prev) => (allViews.includes(prev) ? prev : 3));
      }
    };
    updateViews();
    window.addEventListener("resize", updateViews);
    return () => window.removeEventListener("resize", updateViews);
  }, []);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [sortOption, setSortOption] = useState('popularity');
  const [maxPrice, setMaxPrice] = useState(500);
  const [price, setPrice] = useState([0, 500]);
  const [isDDActive, setIsDDActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef(null);
  const gridRef = useRef(null);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesPrice = product.price >= price[0] && product.price <= price[1];
      const translatedName = t(he.decode(product.product_name)).toLowerCase();
      const matchesSearch = translatedName.includes(searchTerm.toLowerCase());
      return matchesPrice && matchesSearch;
    });
    return sortItems(filtered, sortOption);
  }, [products, price, sortOption, searchTerm, t]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const head = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              page: 1,
              limit: 1,
              search: search?.replace(/-/g, " ") || "",
            }),
          }
        );
        const { total } = await head.json();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              page: 1,
              limit: total,
              search: search?.replace(/-/g, " ") || "",
            }),
          }
        );
        const { data = [] } = await res.json();
        const norm = data.map((p) => ({ ...p, price: Number(p.price) }));
        const calculatedMax = norm.length > 0 ? Math.ceil(Math.max(...norm.map(p => p.price))) : 500;
        setMaxPrice(calculatedMax);
        setPrice([0, calculatedMax]);
        setProducts(sortItems(norm, sortOption));
        setTotalItems(total);
      } catch (e) {
        console.error("Error fetching products:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [search, sortOption]);





useEffect(() => {
  const handleClickOutside = (event) => {
    // Check if the click is outside the referenced element
    if (ref.current && !ref.current.contains(event.target)) {
      setIsDDActive(false);
    }
  };

  // Add event listener to document
  document.addEventListener("click", handleClickOutside);

  // Clean up the event listener on component unmount
  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);

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

  const isSubcategory = (category, subcategory) => {
    if (subcategory) return sanitizeUrlParam(subcategory.subcategory_name);
    
    const categorySlug = removeSpecialCharactersAndAmp(category);
    const categoryMap = {
      "gift-sets": "gift-sets",
      "hair-mist": "hair-mist",
      "extrait-de-parfum": "extrait-de-parfum",
      "xtrait-de-parfum": "extrait-de-parfum"
    };

    return categoryMap[categorySlug] || "online-exclusive";
  }

   

  const handleSortChange = (event) => {
    // setLoading(true);
    setSortOption(event.target.value);
    setProducts(sortItems(products, event.target.value));
    // setFilteredProducts(sortItems(filteredProducts, event.target.value));
    // setLoading(false);
  };

  const handleFilterChange = (value) => {
    // console.log(value);
    setPrice(value);

    const filtered = products.filter(product => 
      product.price >= value[0] && product.price <= value[1]
    );
    // setFilteredProducts(filtered);
  };

  // const discPrice = (elm) => {
  //   const currentUTC = new Date(); // Current UTC time
  //   const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
  //   const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
  //   if(elm?.discount) {
  //     if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
  //       return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {(elm.price - (elm.price / 100 * elm.discount.value)).toFixed(currency.decimals)}{ currency.symbol }</span></>;
  //     } else {
  //       return <span className="money price">{elm?.price}{ currency.symbol }</span>;
  //     }
  //   } else if(elm?.sale_price) {
  //     return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {(elm.price - (elm.price / 100 * elm.sale_price)).toFixed(currency.decimals)}{ currency.symbol }</span></>;
  //   } else {
  //     return <span className="money price">{elm?.price}{ currency.symbol }</span>;
  //   }
  // };





  return (
    <>
      <section className="full-width_padding">
        <div
          className="full-width_border border-2"
          style={{ borderColor: "#eeeeee" }}
        >
          <div className="shop-banner position-relative">
            <div
              className="background-img"
              style={{ backgroundColor: "#eeeeee" }}
            >
              <Image
                loading="lazy"
                src="/assets/images/shop/multiple-products-banner.jpg"
                width="1759"
                height="420"
                alt="Pattern"
                className="slideshow-bg__img object-fit-cover"
              />
            </div>

            {/* <div className="shop-banner__content container position-absolute start-50 top-50 translate-middle">
              <h2 className="stroke-text h1 smooth-16 text-uppercase fw-bold mb-3 mb-xl-4 mb-xl-5">
                Shop
              </h2>
              <ul className="d-flex flex-wrap list-unstyled text-uppercase h6">
                {menuCategories.map((elm, i) => (
                  <li key={i} className="me-3 me-xl-4 pe-1">
                    <a
                      onClick={() => setCurrentCategory(elm)}
                      className={`menu-link menu-link_us-s ${
                        currentCategory == elm ? "menu-link_active" : ""
                      }`}
                    >
                      {elm}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}
            {/* <!-- /.shop-banner__content --> */}
          </div>
          {/* <!-- /.shop-banner position-relative --> */}
        </div>
        {/* <!-- /.full-width_border --> */}
      </section>
      <div className="mb-4 pb-lg-3"></div>
      <section className="gift-shop shop-main container" ref={gridRef}>
        <div className="shop-toolbar">
          <div className="breadcrumb mb-0">
            <BreadCumb category={null} subcategory={null}/>
          </div>          <div className="shop-acs d-flex align-items-center gap-3 position-relative" ref={ref}>
            <div className="search-field position-relative d-none d-md-block">
              <input 
                type="text" 
                className="form-control border px-3 py-1" 
                placeholder={t("Search Products")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  fontSize: '13px', 
                  width: '200px', 
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #eee',
                  borderRadius: 0
                }}
              />
              <svg 
                className="position-absolute top-50 translate-middle-y" 
                style={{ [locale === 'ar' ? 'left' : 'right']: '12px', opacity: 0.4 }} 
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>

            <button 
              className={`btn d-flex align-items-center text-uppercase fw-bold p-0 border-0 ${isDDActive ? 'text-dark' : 'text-secondary'}`}
              onClick={() => setIsDDActive(!isDDActive)}
              style={{ letterSpacing: '1px', fontSize: '14px' }}
              dir="ltr"
            >
              <svg className="me-2" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 5h16M4 10h12M7 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {t("Filter")}
            </button>

            {isDDActive && (
              <div 
                className="filter-popup position-absolute top-100 mt-3 p-4 bg-white shadow-xl rounded-4 animate__animated animate__fadeInUp animate__faster" 
                style={{ 
                  zIndex: 1000, 
                  width: '320px', 
                  [locale === 'ar' ? 'left' : 'right']: 0,
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                }}
              >
                {/* Sorting */}
                <div className="mb-4">
                  <label className="text-uppercase fw-bold text-secondary mb-3 d-block" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>{t("Sort By")}</label>
                  <select
                    className="form-select border rounded-3 fs-sm py-2 px-3"
                    value={sortOption}
                    onChange={handleSortChange}
                    style={{ fontSize: '14px', cursor: 'pointer' }}
                  >
                    {sortingOptions.map((option, index) => (
                      <option key={index} value={option.value}>
                        {t(option.label)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Selection */}
                <div className="mb-4">
                  <label className="text-uppercase fw-bold text-secondary mb-3 d-block" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>{t("View")}</label>
                  <div className="d-flex align-items-center gap-2">
                    {availableViews.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColView(c)}
                        className={`flex-grow-1 py-2 rounded-3 border transition-all d-flex align-items-center justify-content-center ${selectedColView === c ? "bg-dark border-dark" : "bg-light border-light"}`}
                        aria-label={`View ${c} columns`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={selectedColView === c ? "#fff" : "#666"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {Array.from({ length: c }).map((_, idx) => {
                            const spacing = 16 / (c + 1);
                            const x = 4 + spacing * (idx + 1);
                            return <line key={idx} x1={x} y1="5" x2={x} y2="19" />;
                          })}
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-0">
                  <label className="text-uppercase fw-bold text-secondary mb-4 d-block" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>{t("Price Range")}</label>
                  <div className="px-2">
                    <Slider
                      range
                      max={maxPrice}
                      min={0}
                      defaultValue={price}
                      value={price}
                      onChange={(value) => handleFilterChange(value)}
                    />
                  </div>
                  <div className="d-flex justify-content-between mt-3 pt-1 fw-medium" style={{ fontSize: '12px' }}>
                    <div>
                      <span className="text-secondary me-1">Min:</span>
                      <span>{price[0]}{currency.symbol}</span>
                    </div>
                    <div>
                      <span className="text-secondary me-1">Max:</span>
                      <span>{price[1]}{currency.symbol}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* <!-- /.d-flex justify-content-between --> */}

        {/* Mobile Search Bar (Below toolbar) */}
        <div className="d-md-none mb-4">
          <div className="position-relative">
            <input 
              type="text" 
              className="form-control border px-3 py-2 w-100" 
              placeholder={t("Search Products")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                fontSize: '14px', 
                backgroundColor: '#f8f9fa',
                border: '1px solid #eee',
                borderRadius: 0
              }}
            />
            <svg 
              className="position-absolute top-50 translate-middle-y" 
              style={{ [locale === 'ar' ? 'left' : 'right']: '12px', opacity: 0.4 }} 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
        </div>

        <div
          className={`products-grid row row-cols-${Math.min(selectedColView, 2)} row-cols-md-${selectedColView}`}
          id="products-grid"
        >
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : (
            filteredProducts?.map((elm, i) => (
            <div key={i} className="product-card-wrapper">
              <div className="product-card mb-3 mb-md-4 mb-xxl-5">
                <div className="pc__img-wrapper">
                  <Swiper
                    className="swiper swiper-container swiper-initialized swiper-horizontal swiper-backface-hidden background-img js-swiper-slider"
                    slidesPerView={1}
                    modules={[Navigation]}
                    navigation={{
                      prevEl: ".prev" + i,
                      nextEl: ".next" + i,
                    }}
                  >
                    {/* {elm?.images && JSON.parse(elm.images).map((image, ind) => ( */}
                      <SwiperSlide key={i} className="swiper-slide">
                        <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>
                          {elm?.images &&
                          // JSON.parse(elm.images).map((image, ind) => (
                              <>
                                {JSON.parse(elm.images)[0] && <Image
                                  loading="lazy"
                                  src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                                  width={480}
                                  height={600}
                                  alt={elm.product_name || "img"}
                                  className="pc__img"
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                />
                                }

                                {JSON.parse(elm.images)[1] && <Image
                                  loading="lazy"
                                  src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[1]}`}
                                  width={480}
                                  height={600}
                                  alt={elm.product_name || "img"}
                                  className="pc__img pc__img-second"
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                />
                                }
                              </>
                          // ))
                          }
                        </Link>
                        {elm?.label_name && (
                          <div style={{ backgroundColor: elm.label_color }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                            { elm?.label_name }
                          </div>
                        )}
                        {elm.product_qty <= 0 ? (
                          <div className="product-label label--out-of-stock">
                            {t("Out Of Stock")}
                          </div>
                        ) : (
                         elm.discount && (
                          <div style={{ backgroundColor: '#198754' }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                            {elm.discount.discount_type === "percent" ? `Sale ${elm.discount.value}%` : "Sale"}
                          </div>
                          )
                        )}
                      </SwiperSlide>
                    {/* ))} */}

                    <span
                      className={`cursor-pointer pc__img-prev ${"prev" + i} `}
                    >
                      <svg
                        width="7"
                        height="11"
                        viewBox="0 0 7 11"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <use href="#icon_prev_sm" />
                      </svg>
                    </span>
                    <span
                      className={`cursor-pointer pc__img-next ${"next" + i} `}
                    >
                      <svg
                        width="7"
                        height="11"
                        viewBox="0 0 7 11"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <use href="#icon_next_sm" />
                      </svg>
                    </span>
                  </Swiper>
                  <div className="product-card__actions">
                    {getProductQuantity(elm.product_id) > 0 ? (
                      <div className="pc__qty-selector--desktop">
                        <button className="qty-btn" onClick={() => updateQuantity(elm.product_id, -1)} aria-label={t("Decrease quantity")}>−</button>
                        <span className="qty-value">{getProductQuantity(elm.product_id)}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(elm.product_id, 1)} aria-label={t("Increase quantity")}>+</button>
                      </div>
                    ) : elm.product_qty > 0 ? (
                      <button
                        className="btn btn-primary js-add-cart"
                        onClick={() => addProductToCart({...elm, category_name: elm.category_name, subcategory_name: elm.subcategory?.subcategory_name})}
                        title={t("Add To Cart")}
                      >
                        {t("Add To Cart")}
                      </button>
                    ) : (
                      <button className="btn btn-out-of-stock" disabled>
                        {t("Out Of Stock")}
                      </button>
                    )}
                  </div>
                  {/* {elm.product_qty > 0 && <button
                    className="pc__atc btn anim_appear-bottom btn position-absolute border-0 text-uppercase fw-medium js-add-cart js-open-aside"
                    onClick={() => addProductToCart(elm)}
                    title={
                      isAddedToCartProducts(elm.product_id)
                        ? "Already Added"
                        : "Add to Cart"
                    }
                  >
                    {isAddedToCartProducts(elm.product_id)
                      ? "Already Added"
                      : "Add To Cart"}
                  </button>} */}
                </div>

                <div className="pc__info position-relative">
                  <p className="pc__category">{t(elm.category_name)}</p>
                  <h6 className="pc__title">
                   <Link
                      href={`/${locale}/shop/${clean(
                        elm.category_name
                      )}/${isSubcat(
                        elm.category_name,
                        elm.subcategory
                      )}/${clean(elm.product_name)}`}
                    >
                      {locale === 'ar' ? he.decode(elm?.product_name_ar || t(he.decode(elm?.product_name))) : he.decode(elm?.product_name || "")}
                    </Link>
                  </h6>
                  <div className="product-card__price d-flex">
                    <ProductPrice elm={elm} currency={currency} />
                  </div>
                  
                  {getProductQuantity(elm.product_id) > 0 ? (
                    <div className="pc__qty-selector">
                      <button 
                        className="qty-btn" 
                        onClick={() => updateQuantity(elm.product_id, -1)}
                        aria-label={t("Decrease quantity")}
                      >
                        −
                      </button>
                      <span className="qty-value">{getProductQuantity(elm.product_id)}</span>
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
                      onClick={() => addProductToCart({...elm, category_name: elm.category_name, subcategory_name: elm.subcategory?.subcategory_name})}
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
              </div>
            </div>
            ))
          )}
        </div>
        {/* <!-- /.products-grid row --> */}
        {/* {loading && <p>Loading...</p>} */}
        {!loading && <p className="mb-5 text-center fw-medium">{t("Showing")} {filteredProducts.length} {t("items")}</p>}
        
        {loading && <Pagination1 />}

        {/* <div className="text-center">
          <Link className="btn-link btn-link_lg text-uppercase fw-medium" href="#">
            Show More
          </Link>
        </div> */}
      </section>
    </>
  );
}
