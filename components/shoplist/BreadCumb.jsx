import React from "react";
import Link from "next/link";

import { useLocale, useTranslations } from "next-intl";

export default function BreadCumb({ category, subcategory }) {
  const locale = useLocale();
  const t = useTranslations();

  const formatName = (name) => {
    if (!name) return "";
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t("Home"),
        "item": `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${locale}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t("Shop"),
        "item": `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${locale}/shop`
      }
    ]
  };

  if (category) {
    breadcrumbData.itemListElement.push({
      "@type": "ListItem",
      "position": 3,
      "name": t(formatName(category)),
      "item": `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${locale}/product-category/${category}`
    });
  }

  if (subcategory) {
    breadcrumbData.itemListElement.push({
      "@type": "ListItem",
      "position": 4,
      "name": t(formatName(subcategory)),
      "item": `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${locale}/product-category/${category}/${subcategory}`
    });
  }

  return (
    <div className="breadcrumb-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {/* Desktop view (Full) */}
      <div className="d-none d-md-block">
        <Link href={`/${locale}`} className="menu-link menu-link_us-s text-uppercase fw-medium">
          {t("Home")}
        </Link>
        <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">/</span>
        <Link href={`/${locale}/shop`} className="menu-link menu-link_us-s text-uppercase fw-medium">
          {t("Shop")}
        </Link>
        <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">
          {category ? `/` : ``}
        </span>
        <Link 
          href={subcategory ? `/${locale}/product-category/${category}` : `#`} 
          className="menu-link menu-link_us-s text-uppercase fw-medium"
        >
          {t(formatName(category))}
        </Link>
        {subcategory && (
          <>
            <span className="breadcrumb-separator menu-link fw-medium ps-1 pe-1">/</span>
            <Link href="#" className="menu-link menu-link_us-s text-uppercase fw-medium">
              {t(formatName(subcategory))}
            </Link>
          </>
        )}
      </div>

      {/* Mobile view (Compact) */}
      <div className="d-flex d-md-none align-items-center">
        <Link 
          href={subcategory ? `/${locale}/product-category/${category}` : `/${locale}/shop`} 
          className="menu-link d-flex align-items-center text-uppercase fw-medium text-secondary"
          style={{ fontSize: '0.8125rem' }}
          aria-label={subcategory ? `${t("Back to")} ${t(formatName(category))}` : t("Back to Shop")}
        >
          <svg 
            className={locale === "ar" ? "ms-2" : "me-2"} 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: locale === "ar" ? "rotate(180deg)" : "none" }}
          >
            <path d="M7.5 9L4.5 6L7.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {subcategory ? t(formatName(category)) : t("Shop")}
        </Link>
        <span className="breadcrumb-separator px-2" aria-hidden="true">/</span>
        <span className="menu-link text-uppercase fw-medium" style={{ fontSize: '0.8125rem', color: '#222' }}>
          {subcategory ? t(formatName(subcategory)) : t(formatName(category))}
        </span>
      </div>
    </div>
  );
}
