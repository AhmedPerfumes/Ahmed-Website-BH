"use client";
import { currencyOptions, languageOptions } from "@/data/footer";

import { socialLinks } from "@/data/socials";

import React, { useEffect, useState } from "react";
import CartLength from "./components/CartLength";
import { openCart } from "@/utlis/openCart";
import MobileNav from "./components/MobileNav";
import Image from "next/image";
import Link from "next/link";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "../../i18n/routing";
import { IoLocationOutline } from "react-icons/io5";
export default function MobileHeader() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  const [scrollDirection, setScrollDirection] = useState("down");
  const [currentCountryLink, setCurrentCountryLink] = useState("");

  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = React.useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentOrigin = window.location.origin;
      const matchedOption = currencyOptions.find(option =>
        option.link && (currentOrigin.includes(option.link) || option.link.includes(currentOrigin))
      );
      if (matchedOption) {
        setCurrentCountryLink(matchedOption.link);
      } else {
        setCurrentCountryLink(currencyOptions[0].link);
      }
    }
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  const [searchKeyWord, setSearchKeyWord] = useState("");

  const handleChange = (event) => {
    setSearchKeyWord(event.target.value);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 250) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down
          setScrollDirection("down");
        } else {
          // Scrolling up
          setScrollDirection("up");
        }
      } else {
        // Below 250px
        setScrollDirection("down");
      }

      lastScrollY.current = currentScrollY;
    };

    const lastScrollY = { current: window.scrollY };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLangChange = (e) => {
    // console.log(pathname, e.target.value);
    router.push(pathname, { locale: e.target.value });
  };

  const onSearch = (event) => {
    event.preventDefault();
    window.location.href = `/${locale}/shop?q=${removeSpecialCharactersAndAmp(
      searchKeyWord
    )
      .split(" ")
      .join("-")}`;
  };

  function removeSpecialCharactersAndAmp(str) {
    // Remove the specific word "&amp;"
    let cleanedStr = str.replace(/&amp;/g, "");

    // Remove all special characters
    cleanedStr = cleanedStr.replace(/[^\w\s-]/g, "");

    // Replace multiple spaces with a single space and trim
    cleanedStr = cleanedStr.replace(/\s+/g, " ").trim();

    return cleanedStr;
  }

  return (
    <div style={{ height: scrollDirection === "up" && headerHeight ? `${headerHeight}px` : 'auto' }}>
    <div
     ref={headerRef}
      className={`header-mobile header_sticky ${
        scrollDirection == "up" ? "header_sticky-active" : "position-relative"
      } `}
    >
      <div className="container d-flex align-items-center h-100">
        <Link className="mobile-nav-activator d-block position-relative" href="#">
          <svg
            className="nav-icon"
            width="25"
            height="18"
            viewBox="0 0 25 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_nav" />
          </svg>
          <span className="btn-close-lg position-absolute top-0 start-0 w-100"></span>
        </Link>

        <div className="logo">
          <a href="/">
          <Image
              src="/assets/images/logo/Mobile.svg"
              width={190}
              height={80}
              alt="Ahmed"
              className=""
            />
          </a>
        </div>
        {/* <!-- /.logo --> */}

        <a
          onClick={() => openCart()}
          className="header-tools__item header-tools__cart js-open-aside"
        >
          <svg
            className="d-block"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href="#icon_cart" />
          </svg>
          <span className="cart-amount d-block position-absolute js-cart-items-count">
            <CartLength />
          </span>
        </a>
      </div>
      {/* <!-- /.container --> */}

      <nav className="header-mobile__navigation navigation d-flex flex-column w-100 position-absolute top-100 bg-body overflow-auto">
        <div className="container">
          <form
            onSubmit={onSearch}
            className="search-field position-relative mt-4 mb-3"
          >
            <div className="position-relative">
              <input
                className="search-field__input w-100 border rounded-1"
                type="text"
                name="search-keyword"
                placeholder="Search products"
                value={searchKeyWord}
                onChange={handleChange}
              />
              <button
                className="btn-icon search-popup__submit pb-0 me-2"
                type="submit"
              >
                <svg
                  className="d-block"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <use href="#icon_search" />
                </svg>
              </button>
              <button
                className="btn-icon btn-close-lg search-popup__reset pb-0 me-2"
                type="reset"
              ></button>
            </div>

            <div className="position-absolute start-0 top-100 m-0 w-100">
              <div className="search-result"></div>
            </div>
          </form>
          {/* <!-- /.header-search --> */}
        </div>
        {/* <!-- /.container --> */}

        <div className="container">
          <div className="overflow-hidden">
            <ul className="navigation__list list-unstyled position-relative">
              <MobileNav />
            </ul>
            {/* <!-- /.navigation__list --> */}
          </div>
          {/* <!-- /.overflow-hidden --> */}
        </div>
        {/* <!-- /.container --> */}

        <div className="border-top mt-2 pb-2">
          {/* <div className="customer-links container mt-4 mb-2 pb-1">
            <svg
              className="d-inline-block align-middle"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <use href="#icon_user" />
            </svg>
            <span className="d-inline-block ms-2 text-uppercase align-middle fw-medium">
              My Account
            </span>
          </div> */}
      <div className="d-flex">
          <div className="container d-flex align-items-center">
            <label className="me-2 text-secondary">Language</label>
            <select
              className="form-select form-select-sm bg-transparent border-0"
              aria-label="Default select example"
              name="store-language"
              value={locale}
              onChange={handleLangChange}
            >
              {languageOptions.map((option, index) => (
                <option
                  key={index}
                  className="footer-select__option"
                  value={option.value}
                >
                  {option.text}
                </option>
              ))}
            </select>
          </div>

          <div className="container d-flex align-items-center">
            <label className="me-2 text-secondary">Country</label>
            <select
              className="form-select form-select-sm bg-transparent border-0"
              aria-label="Default select example"
              name="store-language"
              onChange={(e) => window.open(e.target.value,"_self")}
            >
              {currencyOptions.map((option, index) => (
                <option
                  key={index}
                  className="footer-select__option"
                  value={option.link}
                >
                  {option.text}
                </option>
              ))}
            </select>
          </div>
          </div>

          <div className="container mt-2 mb-2 pb-3 border-bottom">
              <div className="d-flex align-items-center justify-content-between gap-2">
                {/* Find a Store Button */}
                <Link
                  href={`/${locale}/store-locator`}
                  className="d-flex align-items-center justify-content-center p-2 rounded text-decoration-none border"
                  style={{
                    backgroundColor: '#fcfcfc',
                    color: '#111',
                    borderColor: '#f0f0f0',
                    height: '42px',
                    flex: '1 1 0px',
                    minWidth: '0'
                  }}
                >
                  <IoLocationOutline size={16} className="me-1 flex-shrink-0" />
                  <span className="text-uppercase fw-bold text-truncate" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    {t("Find a store")}
                  </span>
                </Link>

                {/* Language Selector */}
                <div
                  className="d-flex flex-column justify-content-center px-2 py-1 border rounded"
                  style={{ borderColor: '#f0f0f0', backgroundColor: '#fcfcfc', height: '42px', flex: '1 1 0px', minWidth: '0' }}
                >
                  <span
                    className="text-uppercase fw-semibold text-muted text-start"
                    style={{ fontSize: '8px', letterSpacing: '0.5px', display: 'block', lineHeight: '1', marginBottom: '2px' }}
                  >
                    {t("Language")}
                  </span>
                  <select
                    className="form-select form-select-sm border-0 bg-transparent p-0 shadow-none fw-semibold text-dark text-start"
                    aria-label="Language selector"
                    name="store-language"
                    value={locale}
                    onChange={handleLangChange}
                    style={{ fontSize: '11px', cursor: 'pointer', outline: 'none', width: '100%', maxWidth: '100%', textOverflow: 'ellipsis', overflow: 'hidden' }}
                  >
                    {languageOptions.map((option, index) => (
                      <option key={index} className="text-dark bg-white" value={option.value}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country Selector */}
                <div
                  className="d-flex flex-column justify-content-center px-2 py-1 border rounded"
                  style={{ borderColor: '#f0f0f0', backgroundColor: '#fcfcfc', height: '42px', flex: '1 1 0px', minWidth: '0' }}
                >
                  <span
                    className="text-uppercase fw-semibold text-muted text-start"
                    style={{ fontSize: '8px', letterSpacing: '0.5px', display: 'block', lineHeight: '1', marginBottom: '2px' }}
                  >
                    {t("Country")}
                  </span>
                  <select
                    className="form-select form-select-sm border-0 bg-transparent p-0 shadow-none fw-semibold text-dark text-start"
                    aria-label="Country selector"
                    name="store-country"
                    value={currentCountryLink}
                    onChange={(e) => window.open(e.target.value, "_self")}
                    style={{ fontSize: '11px', cursor: 'pointer', outline: 'none', width: '100%', maxWidth: '100%', textOverflow: 'ellipsis', overflow: 'hidden' }}
                  >
                    {currencyOptions.map((option, index) => (
                      <option key={index} className="text-dark bg-white" value={option.link}>
                        {t(option.text)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          <ul className="container social-links list-unstyled d-flex flex-wrap mb-0">
            {socialLinks.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className="footer__social-link d-block color-white"
                >
                  <svg
                    className={link.className}
                    width={link.width}
                    height={link.height}
                    viewBox={link.viewBox}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <use href={link.icon} />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      {/* <!-- /.navigation --> */}
      
    </div>
    </div>
    
  );
}
