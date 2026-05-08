import { useContextElement } from "@/context/Context";
import { useEffect, useState, useMemo } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from "he";
import Slider from "rc-slider";
import Pagination2 from "@/components/common/Pagination2";
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from "@/context/MenuContext";
import Link from "next/link";
import { 
  removeSpecialCharactersAndAmp, 
  isSubcategory,
  sanitizeUrlParam,
  formatPrice 
} from "@/utils/shop";
import { useRef } from "react";
import { sortingOptions } from "@/data/products/productCategories";



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


function DiscountGrid({ title, onlyDiscounted = false }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const { 
    addProductToCart, 
    isAddedToCartProducts,
    cartProducts,
    setCartProducts 
  } = useContextElement();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedColView, setSelectedColView] = useState(3);
  const [page, setPage] = useState(1);
  const perPage = 12; // ✅ Updated to match grid expectations
  const t = useTranslations();

  const [isDDActive, setIsDDActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('popularity');
  const [maxPrice, setMaxPrice] = useState(500);
  const [price, setPrice] = useState([0, 500]);
  const ref = useRef(null);
  const gridRef = useRef(null);

  const availableViews = [2, 3, 4];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsDDActive(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const sortItems = (items, option) => {
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

  useEffect(() => {
    const getAllProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page: 1, limit: 1000 }), // ✅ Fetch all once
          }
        );
        const result = await response.json();
        const data = result.data || [];
        const norm = data.map((p) => ({ ...p, price: Number(p.price) }));
        const calculatedMax = norm.length > 0 ? Math.ceil(Math.max(...norm.map(p => p.price))) : 500;
        
        setMaxPrice(calculatedMax);
        setPrice([0, calculatedMax]);
        setProducts(norm);
      } catch (error) {
        console.error("Failed to fetch all products", error);
      } finally {
        setLoading(false);
      }
    };

    getAllProducts();
  }, []);


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
  };

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


  // ✅ Filter discounted/in-stock products
  const filteredProducts = useMemo(() => {
    const filtered = products
      .filter((p) => p.product_qty > 0)
      .filter((p) => p.price >= price[0] && p.price <= price[1])
      .filter((p) => p.sale_price !== null || (onlyDiscounted && p.discount && p.discount.value > 0))
      .filter((p) => {
        const translatedName = t(he.decode(p.product_name)).toLowerCase();
        return translatedName.includes(searchTerm.toLowerCase());
      });
    
    return sortItems(filtered, sortOption);
  }, [products, price, sortOption, onlyDiscounted, searchTerm, t]);


  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const currentProducts = filteredProducts.slice((page - 1) * perPage, page * perPage);

  if (isMenuError) return <div>Error loading menu</div>;


  return (
    <section className="container py-4" ref={gridRef}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="section-title fw-normal mb-0">{title}</h2>
        
        <div className="shop-acs d-flex align-items-center gap-3 position-relative" ref={ref}>
          <div className="search-field position-relative d-none d-md-block">
            <input 
              type="text" 
              className="form-control border px-3 py-1" 
              placeholder={t("Search Products")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                fontSize: '13px', 
                width: '180px', 
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
                  onChange={(e) => setSortOption(e.target.value)}
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
                    onChange={(value) => setPrice(value)}
                    reverse={locale === 'ar'}
                  />
                </div>
                <div className="d-flex justify-content-between mt-3 pt-1 fw-medium" style={{ fontSize: '12px' }}>
                  <div>
                    <span className={`${locale === 'ar' ? 'ms-1' : 'me-1'} text-secondary`}>{t("Min")}:</span>
                    <span>{price[0]}{currency.symbol}</span>
                  </div>
                  <div>
                    <span className={`${locale === 'ar' ? 'ms-1' : 'me-1'} text-secondary`}>{t("Max")}:</span>
                    <span>{price[1]}{currency.symbol}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`products-grid row row-cols-2 row-cols-md-3 row-cols-lg-${selectedColView}`}>

        {loading || isMenuLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : (
            currentProducts.map((elm, i) => (
          <div key={i} className="product-card-wrapper">
            <div className="product-card mb-3 mb-md-4 mb-xxl-5">
              <div className="pc__img-wrapper">
                <Swiper 
                  className="swiper swiper-container swiper-initialized swiper-horizontal swiper-backface-hidden background-img js-swiper-slider" 
                  slidesPerView={1} 
                >
                  <SwiperSlide className="swiper-slide">
                    <Link
                      href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(" ").join("-").toLowerCase()}/${isSubcategory(elm.category_name.split(" ").join("-").toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(" ").join("-").toLowerCase()}`}
                    >
                      {elm?.images && (
                        <>
                          {JSON.parse(elm.images)[0] && (
                            <Image
                              loading="lazy"
                              src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                              width={480}
                              height={600}
                              alt={elm.product_name}
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
                              alt={elm.product_name}
                              className="pc__img pc__img-second"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          )}
                        </>
                      )}
                    </Link>
                    {elm.label_name && (
                      <div style={{ backgroundColor: elm.label_color }} className="product-label text-uppercase text-white top-0 left-0 mt-2 mx-2">
                        {elm.label_name}
                      </div>
                    )}

                    {elm.product_qty <= 0 ? (
                      <div className="product-label label--out-of-stock">
                        {t("Out Of Stock")}
                      </div>
                    ) : (
                      elm.discount && (
                        <div className="product-label label--sale">
                          {t("Sale")} {elm.discount.value}%
                        </div>
                      )
                    )}
                  </SwiperSlide>
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
              </div>

              <div className="pc__info position-relative">
                <p className="pc__category">{t(elm.category_name)}</p>
                <h6 className="pc__title">
                  <Link
                    href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(" ").join("-").toLowerCase()}/${isSubcategory(elm.category_name.split(" ").join("-").toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(" ").join("-").toLowerCase()}`}
                  >
                    {t(he.decode(elm.product_name))}
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

      {!loading && filteredProducts.length > 0 && (
        <p className="mt-5 mb-2 text-center fw-medium">
          {t("Showing")} {filteredProducts.length} {t("items")}
        </p>
      )}

      {/* ✅ Premium Pagination Controls */}
      {totalPages > 1 && (
        <Pagination2 
          totalPages={totalPages} 
          currentPage={page} 
          onPageChange={(p) => {
            setPage(p);
            gridRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}
    </section>
  );
}

export default DiscountGrid;
