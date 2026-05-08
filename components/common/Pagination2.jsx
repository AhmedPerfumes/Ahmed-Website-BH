"use client";
import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function Pagination2({ totalPages = 4, currentPage = 1, onPageChange }) {
  const locale = useLocale();
  const t = useTranslations();
  const isRTL = locale === 'ar';

  const handlePageClick = (pageNumber) => {
    onPageChange(pageNumber);
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPages = () => {
    const pages = [];
    const showRange = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i <= 2 ||
        i > totalPages - 2 ||
        (i >= currentPage - showRange && i <= currentPage + showRange)
      ) {
        if (pages.length > 0 && i - pages[pages.length - 1] > 1) {
          pages.push("...");
        }
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <nav
      className="shop-pages d-flex justify-content-center align-items-center mt-5 mb-5"
      aria-label="Page navigation"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Link
        href="#"
        className={`btn-link d-inline-flex align-items-center ${isRTL ? 'ms-3' : 'me-3'} ${
          currentPage === 1 ? "disabled opacity-50" : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          handlePrevClick();
        }}
      >
        <svg
          className={isRTL ? "ms-1" : "me-1"}
          width="7"
          height="11"
          viewBox="0 0 7 11"
          xmlns="http://www.w3.org/2000/svg"
          style={isRTL ? { transform: 'rotate(180deg)' } : {}}
        >
          <use href="#icon_prev_sm" />
        </svg>
        <span className="fw-medium d-none d-md-inline text-uppercase">{t("PREV")}</span>
      </Link>
      
      <ul className="mb-0 d-flex align-items-center" style={{ padding: 0, listStyle: 'none' }}>
        {getPages().map((page, index) => (
          <li key={index} className="page-item">
            {page === "..." ? (
              <span className="px-2 text-secondary">...</span>
            ) : (
              <Link
                className={`btn-link px-2 mx-1 mx-md-2 fw-medium ${
                  currentPage === page ? "btn-link_active border-bottom border-2 border-dark" : ""
                }`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(page);
                }}
              >
                {page}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <Link
        href="#"
        className={`btn-link d-inline-flex align-items-center ${isRTL ? 'me-3' : 'ms-3'} ${
          currentPage === totalPages ? "disabled opacity-50" : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          handleNextClick();
        }}
      >
        <span className="fw-medium d-none d-md-inline text-uppercase" style={isRTL ? { marginLeft: '0.25rem' } : { marginRight: '0.25rem' }}>{t("NEXT")}</span>
        <svg
          width="7"
          height="11"
          viewBox="0 0 7 11"
          xmlns="http://www.w3.org/2000/svg"
          style={isRTL ? { transform: 'rotate(180deg)' } : {}}
        >
          <use href="#icon_next_sm" />
        </svg>
      </Link>
    </nav>
  );
}
