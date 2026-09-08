"use client";
import Link from "next/link";
import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from "next-intl";
import { openCart } from "@/utlis/openCart";
import CartLength from "./components/CartLength";
import Nav from "./components/Nav";
import AccountMenu from "./components/AccountMenu";
import { currencyOptions, languageOptions2 } from "@/data/footer";
import { slideData1000 } from "@/data/heroslides";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRef, useState, useEffect } from "react";
import { FiLogOut } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { useMenu } from "../../context/MenuContext";
import { useUser } from "../../context/UserContext";
import { useRouter, usePathname } from "../../i18n/routing";
import { PersonOutline, PersonOutlineOutlined, PersonOutlineSharp } from "@mui/icons-material";

export default function Header14() {
    const locale = useLocale();
    const containerRef = useRef(null);
    const headerSearchRef = useRef(null);
    const { isLoggedIn } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations();
    const { categoriesSubCategories, isLoading: isMenuLoading, error, } = useMenu();
    
    const [scrollDirection, setScrollDirection] = useState("down");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isHeaderOpen, setIsHeaderOpen] = useState(false);
    const [searchKeyWord, setSearchKeyWord] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 250) {
                if (currentScrollY > lastScrollY.current) {
                    setScrollDirection("down");
                } else {
                    setScrollDirection("up");
                }
            } else {
                setScrollDirection("down");
            }

            lastScrollY.current = currentScrollY;
        };
        const lastScrollY = { current: window.scrollY };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutsidePopup = containerRef.current && !containerRef.current.contains(event.target);
            const isOutsideHeaderSearch = headerSearchRef.current && !headerSearchRef.current.contains(event.target);
            
            if (isOutsidePopup && isOutsideHeaderSearch) {
                setIsPopupOpen(false);
            }
        };

        const handleKeyEvents = (event) => {
            if (event.key === "Escape") {
                setIsPopupOpen(false);
            }
        };

        if (isPopupOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyEvents);
            document.addEventListener("focusin", handleClickOutside); // Handle tabbing out
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyEvents);
            document.removeEventListener("focusin", handleClickOutside);
        };
    }, [isPopupOpen]);

    const handleChange = (event) => {
        setSearchKeyWord(event.target.value);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("address");
        window.location.href = "/";
    };

    const handleLangChange = (e) => {
        router.push(pathname, { locale: e.target.value });
    };

    const swiperOptions = {
        autoplay: {
            delay: 5000,
        },
        modules: [Autoplay, Navigation, EffectFade],
        pagination: false,
        slidesPerView: 1,
        effect: "fade",
        loop: true,
    };

    const onSearch = (event) => {
        event.preventDefault();
        window.location.href = `/${locale}/shop?q=${removeSpecialCharactersAndAmp(searchKeyWord).split(" ").join("-")}`;
    };

    function removeSpecialCharactersAndAmp(str) {
        let cleanedStr = str.replace(/&amp;/g, "");
        cleanedStr = cleanedStr.replace(/[^\w\s-]/g, "");
        cleanedStr = cleanedStr.replace(/\s+/g, " ").trim();

        return cleanedStr;
    }

    return (
        <>
            <header id="header" className={ pathname == "/" ? `header header_sticky bg-white ${ scrollDirection == "up" ? "header_sticky-active" : "" } ` : "header header_sticky position-sticky w-100 bg-white"} style={pathname == "/" ? {} : {}}>
                <Swiper key={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="swiper-container js-swiper-slider slideshow type4 slideshow-navigation-white-sm bg-black" {...swiperOptions} style={{ height: "3rem" }} >
                    {slideData1000.map((elm, i) => (
                        <SwiperSlide key={i} 
                            style={{ textTransform: "uppercase", fontSize: "12px",}}
                            className="swiper-slide text-center"
                        >
                            <div className="slideshow-text container position-absolute start-50 top-50 translate-middle">
                                <Link href="#" className="animate animate_fade animate_btt animate_delay-5 lh-2rem text-white">
                                    {t(elm.description.split(" ").slice(0, 13).join(" "))}
                                </Link>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div ref={containerRef} className={`header-tools__item hover-container ${isPopupOpen ? "js-content_visible" : ""}`}>
                    <div className="search-popup js-hidden-content">
                        <form onSubmit={onSearch} className="search-field container" >
                            <p className="text-uppercase text-secondary fw-medium mb-4">
                                {t("title")}
                            </p>
                            <div className="position-relative">
                                <input
                                    className="search-field__input search-popup__input w-100 fw-medium" 
                                    type="text"
                                    name="search-keyword"
                                    placeholder={t("Search Products")}
                                    value={searchKeyWord}
                                    onChange={handleChange}
                                    style={{
                                        paddingLeft: locale === "ar" ? "2.5rem" : "0",
                                        paddingRight: locale === "ar" ? "0" : "2.5rem",
                                    }}
                                />
                                <button className="btn-icon search-popup__submit" type="submit" style={locale === "ar" ? { right: "auto", left: 0 } : {}}>
                                    <svg className="d-block" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" >
                                        <use href="#icon_search" />
                                    </svg>
                                </button>
                                <button className="btn-icon btn-close-lg search-popup__reset" type="reset" style={locale === "ar" ? { right: "auto", left: 0 } : {}}></button>
                            </div>

                            <div className="search-popup__results">
                                <div className="sub-menu search-suggestion">
                                    <h6 className="sub-menu__title fs-base">
                                        {t("Quicklinks")}
                                    </h6>
                                    <ul className="sub-menu__list list-unstyled">
                                        <li className="sub-menu__item">
                                            <Link href={`/${locale}/shop/perfumes/oriental-fragrance/zumar`} className="menu-link menu-link_us-s" >
                                                {t("Zumar")}
                                            </Link>
                                        </li>
                                        <li className="sub-menu__item">
                                            <Link href={`/${locale}/shop/perfumes/oriental-fragrance/marj`} className="menu-link menu-link_us-s" >
                                                {t("Marj")}
                                            </Link>
                                        </li>
                                        <li className="sub-menu__item">
                                            <Link href={`/${locale}/shop/perfumes/occidental-fragrance/oud-roses`} className="menu-link menu-link_us-s" >
                                                {t("Oud & Roses")}
                                            </Link>
                                        </li>
                                        <li className="sub-menu__item">
                                            <Link href={`/${locale}/shop/perfumes/oriental-fragrance/bin-shaikh`} className="menu-link menu-link_us-s" >
                                                {t("Bin Shaikh")}
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                {/* <div className="search-result row row-cols-5"></div> */}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="header-desk_type_8">
                    <div className="header-middle">
                        <div className="container-fluid d-flex align-items-center my-2 px-5">
                            <div className="flex-1 d-flex align-items-center gap-3">
                                <div className="heeader-top__right flex-1 d-flex gap-1">
                                    <select className="form-select form-select-sm bg-transparent color-black"
                                        name="store-currency"
                                        onChange={(e) => window.open(e.target.value, "_blank")}
                                    >
                                        {currencyOptions.map((option, index) => <option key={index} value={option.link}>{t(option.text)}</option>)}
                                    </select>

                                    <select className="form-select form-select-sm bg-transparent color-black"
                                        name="store-language"
                                        value={locale}
                                        onChange={handleLangChange}
                                    >
                                        {languageOptions2.map(
                                            (option, index) => (
                                                <option key={index} value={option.value} >
                                                    {option.text}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="logo">
                                <a href="/">
                                <img src="/assets/images/logo/Desktop.svg" width="100px" alt="Ahmed"/>
                                </a>
                            </div>
                            <div className="header-tools d-flex align-items-center flex-1 justify-content-end me-2">
                                <div ref={headerSearchRef} className="header-search search-field d-none d-lg-flex  mx-4">
                                    <form onSubmit={onSearch}>
                                        <input className="header-search__input w-100" type="text" name="search-keyword" placeholder={t("Search Products")} 
                                            onFocus={() => setIsPopupOpen(true) }
                                            onClick={() => setIsPopupOpen(true) }
                                            value={searchKeyWord}
                                            onChange={handleChange}
                                            style={locale === "ar" ? { paddingLeft: 0, paddingRight: "1rem" } : {}}
                                        />
                                    </form>
                                </div>

                                {/* <div className="header-tools__item hover-account position-relative">
                                    {!isLoggedIn ? (
                                        <Link href="/login_register" className="account-icon-link" >
                                            <User />
                                        </Link>
                                    ) : (
                                        <Link href="/account_dashboard" className="account-icon-link" aria-haspopup="true" >
                                            <UserLoggedIn />
                                        </Link>
                                    )}
                                </div> */}
                                <AccountMenu isLoggedIn={isLoggedIn} locale={locale} handleLogout={handleLogout} />

                                <Link className="header-tools__item" href={`/${locale}/store-locator`}>
                                    <IoLocationOutline size={20} />
                                </Link>

                                <a onClick={() => openCart()} className="header-tools__item header-tools__cart js-open-aside">
                                    <svg className="d-block" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" >
                                        <use href="#icon_cart" />
                                    </svg>
                                    <span className="cart-amount d-block position-absolute js-cart-items-count" style={locale === "ar" ? { left: "auto", right: "1.375rem" } : {}}>
                                        <CartLength />
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="header-bottom">
                        <div className="container">
                            <nav className="navigation w-100 d-flex align-items-center justify-content-center py-2">
                                <ul className="navigation__list list-unstyled d-flex my-1">
                                    <Nav categoriesSubCategories={ categoriesSubCategories } />
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}