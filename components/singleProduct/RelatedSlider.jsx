"use client";
import { useContextElement } from "@/context/Context";
import { products51 } from "@/data/products/fashion";
import Link from "next/link";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import he from 'he';
import { useLocale, useTranslations } from "next-intl";
import { useMenu } from '@/context/MenuContext';

export default function RelatedSlider({ relatedProds, isLiveLoading }) {
  const { isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const locale = useLocale();
  const t = useTranslations();

  if (isLiveLoading || isMenuLoading) {
    return (
      <section className="products-carousel container mb-5">
        <div className="skeleton-bar mb-4" style={{ height: '35px', width: '250px', background: '#f5f5f5', borderRadius: '4px' }}></div>
        <div className="row">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="col-6 col-md-3 mb-4">
              <div className="skeleton-bar mb-3" style={{ height: '350px', width: '100%', background: '#f5f5f5', borderRadius: '4px' }}></div>
              <div className="skeleton-bar mb-2" style={{ height: '22px', width: '80%', background: '#f5f5f5', borderRadius: '4px' }}></div>
              <div className="skeleton-bar" style={{ height: '22px', width: '40%', background: '#f5f5f5', borderRadius: '4px' }}></div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  const { toggleWishlist, isAddedtoWishlist } = useContextElement();
  const { setQuickViewItem } = useContextElement();
  const { addProductToCart, isAddedToCartProducts, cartProducts, setCartProducts } = useContextElement();
  const swiperOptions = {
    autoplay: false,
    slidesPerView: 4,
    slidesPerGroup: 4,
    effect: "none",
    loop: relatedProds && relatedProds.length > 4,
    modules: [Pagination, Navigation],
    pagination: {
      el: "#related_products .products-pagination",
      type: "bullets",
      clickable: true,
    },
    navigation: {
      nextEl: ".ssn11",
      prevEl: ".ssp11",
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
        spaceBetween: 24,
      },
      992: {
        slidesPerView: 4,
        slidesPerGroup: 4,
        spaceBetween: 30,
      },
    },
  };

  // "WARNING: If you change this logic, update the corresponding PHP/JS file."
  function removeSpecialCharactersAndAmp(str) {
    // Remove the specific word "&amp;"
    let cleanedStr = str.replace(/&amp;/g, '');

    // Remove all special characters
    cleanedStr = cleanedStr.replace(/[^\w\s-]/g, '');

    // Replace multiple spaces with a single space and trim
    cleanedStr = cleanedStr.replace(/\s+/g, ' ').trim();

    return cleanedStr;
  }

  const isSubcategory = (category, subcategory) => {
    let subcat = "";
    if (subcategory != null) {
      return subcat =
        removeSpecialCharactersAndAmp(subcategory.subcategory_name)
          .split(" ")
          .join("-")
          .toLowerCase();
    } else {
      if (removeSpecialCharactersAndAmp(category) == "gift-sets") {
        console.log("gift-sets");
        return subcat = "gift-sets";
      } else if (removeSpecialCharactersAndAmp(category) == "hair-mist") {
        console.log("hair-mist");
        return subcat = "hair-mist";
      } else {
        console.log("extrait-de-parfum");
        return subcat = "extrait-de-parfum";
      }
    }
  }

  const price = (elm) => {
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    if(elm?.discount) {
      if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
        return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {(elm.price - (elm.price / 100 * elm.discount.value)).toFixed(currency.decimals)}{ currency.symbol }</span></>;
      } else {
        return <span className="money price">{elm?.price}{ currency.symbol }</span>;
      }
    } else if(elm?.sale_price) {
      return <><span className="money price price-old">{elm?.price}{ currency.symbol }</span> <span className="money price price-sale"> {(elm.price - (elm.price / 100 * elm.sale_price)).toFixed(currency.decimals)}{ currency.symbol }</span></>;
    } else {
      return <span className="money price">{elm?.price}{ currency.symbol }</span>;
    }
  };

  const getProductQuantity = (id) => {
    const item = cartProducts?.find(p => p.product_id === id);
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

  const capitalizeEachWord = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <section className="products-carousel container">
      <h2 className="h3 text-uppercase mb-4 pb-xl-2 mb-xl-4">
        Related <strong>Products</strong>
      </h2>

      <div id="related_products" className="position-relative">
        <Swiper
          {...swiperOptions}
          className="swiper-container js-swiper-slider"
          data-settings=""
        >
          {relatedProds && relatedProds.map((elm, i) => {
            const qty = getProductQuantity(elm.product_id);
            const inCart = qty > 0;
            return (
            <SwiperSlide key={i} className="swiper-slide product-card">
              <div className="pc__img-wrapper">
                <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>
                  {elm?.images &&
                        <>
                          {JSON.parse(elm.images)[0] && <Image
                            loading="lazy"
                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[0]}`}
                            width="330"
                            height="400"
                            alt="img"
                            className="pc__img"
                          />
                          }

                          {JSON.parse(elm.images)[1] && <Image
                            loading="lazy"
                            src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(elm.images)[1]}`}
                            width="330"
                            height="400"
                            alt="img"
                            className="pc__img pc__img-second"
                          />
                          }
                        </>
                    }
                </Link>
                  {elm?.label_name && (
                  <div style={{ backgroundColor: elm.label_color }} className="product-label text-uppercase text-white">
                    { elm?.label_name }
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
                      onClick={() => addProductToCart({...elm, category_name: capitalizeEachWord(elm.category_name.split('-').join(' ')), subcategory_name: elm.subcategory ? capitalizeEachWord(elm.subcategory.subcategory_name.split('-').join(' ')) : ''})}
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
              </div>

              <div className="pc__info position-relative">
                <h6 className="pc__title">
                  <Link href={`/${locale}/shop/${removeSpecialCharactersAndAmp(elm.category_name).split(' ').join('-').toLowerCase()}/${isSubcategory(elm.category_name.split(' ').join('-').toLowerCase(), elm.subcategory)}/${removeSpecialCharactersAndAmp(elm.product_name).split(' ').join('-').toLowerCase()}`}>{elm?.product_name && t(he.decode(elm?.product_name))}</Link>
                </h6>
                <div className="product-card__price d-flex">
                  { price(elm) }
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
                    onClick={() => addProductToCart({...elm, category_name: capitalizeEachWord(elm.category_name.split('-').join(' ')), subcategory_name: elm.subcategory ? capitalizeEachWord(elm.subcategory.subcategory_name.split('-').join(' ')) : ''})}
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
            </SwiperSlide>
          )})}

          {/* <!-- /.swiper-wrapper --> */}
        </Swiper>
        {/* <!-- /.swiper-container js-swiper-slider --> */}

        <div className="cursor-pointer products-carousel__prev ssp11 position-absolute top-50 d-flex align-items-center justify-content-center">
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_prev_md" />
          </svg>
        </div>
        {/* <!-- /.products-carousel__prev --> */}
        <div className="cursor-pointer products-carousel__next ssn11 position-absolute top-50 d-flex align-items-center justify-content-center">
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_next_md" />
          </svg>
        </div>
        {/* <!-- /.products-carousel__next --> */}

        <div className="products-pagination mt-4 mb-5 d-flex align-items-center justify-content-center"></div>
        {/* <!-- /.products-pagination --> */}
      </div>
      {/* <!-- /.position-relative --> */}
    </section>
  );
}
