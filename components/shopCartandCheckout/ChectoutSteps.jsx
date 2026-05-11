"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useLocale } from "next-intl";

const steps = [
  {
    id: 1,
    href: "/shop-cart",
    number: "01",
    title: "Shopping Bag",
    shortTitle: "Shopping Bag",
    description: "Manage Your Items List",
    align: "start",
  },
  {
    id: 2,
    href: "/shop-checkout",
    number: "02",
    title: "Shipping and Checkout",
    shortTitle: "Checkout",
    description: "Checkout Your Items List",
    align: "center",
  },
  {
    id: 3,
    href: "/shop-order-complete",
    number: "03",
    title: "Confirmation",
    shortTitle: "Confirm",
    description: "Review And Submit Your Order",
    align: "end",
  },
];
export default function ChectoutSteps() {
  const locale = useLocale();
  const [activePathIndex, setactivePathIndex] = useState(0);
  const pathname = usePathname();
  useEffect(() => {
    const activeTab = steps.filter((elm) => elm.href == '/'+pathname.split('/')[2])[0];
    const activeTabIndex = steps.indexOf(activeTab);
    setactivePathIndex(activeTabIndex);
  }, [pathname]);
  return (
    <div className="checkout-steps">
      {steps.map((elm, i) => (
        <Link
          key={i}
          href={elm.id == 3 ? '#' : `/${locale}${elm.href}`}
          className={`checkout-steps__item checkout-steps__item--${elm.align} ${
            activePathIndex >= i ? "active" : ""
          }`}
        >
          <span className="checkout-steps__item-number">{elm.number}</span>
          <span className="checkout-steps__item-title">
            <span className="d-none d-lg-inline">{elm.title}</span>
            <span className="d-inline d-lg-none">{elm.shortTitle}</span>
            <em className="d-none d-lg-block">{elm.description}</em>
          </span>
        </Link>
      ))}
    </div>
  );
}
