"use client";
import Link from "next/link";
import './AccountMenu.css'
import { useState } from "react";
import { usePathname } from "@/i18n/routing";
import User from "./User";
import UserLoggedIn from "./UserLoggedIn";

export default function AccountMenu({isLoggedIn, locale, handleLogout,}) {
    const [couponCount, setCouponCount] = useState(0);
    const pathname = usePathname();
    const items = [
        {
            href: "/account_dashboard",
            label: locale === "ar" ? "ملفي الشخصي" : "My Profile",
        },
        {
            href: "/account_orders",
            label: locale === "ar" ? "مشترياتي" : "My Purchases",
        },
        {
            href: "/account_edit_address",
            label: locale === "ar" ? "العناوين" : "Addresses",
        },
        {
            href: "/account_coupons",
            label: locale === "ar" ? "كوبوناتي" : "My Coupons",
        },
        {
            href: "/account_loyalty",
            label: locale === "ar" ? "نقاط الولاء" : "Loyalty Points",
        },
    ];

    const isActive = (href) => pathname === href || pathname.startsWith(href);


    return (
        <div className="header-tools__item hover-account position-relative">
            {!isLoggedIn ? (
                <Link href={`/${locale}/login_register`} className="account-icon-link" >
                    <User />
                </Link>
            ) : (
                <Link href="/account_dashboard" className="account-icon-link" aria-haspopup="true">
                    <UserLoggedIn />
                </Link>
            )}

            <div className="account-hover-menu" role="menu" style={{ left: locale === "ar" ? "0" : "auto", right: locale === "ar" ? "auto" : "0", minWidth: "200px",}}>
                {isLoggedIn ? (
                    <>
                        <div className="menu-title text-uppercase fw-medium text-start px-3 py-2 border-bottom">
                            {locale === "ar" ? "إدارة الحساب" : "Manage Account"}
                        </div>

                        <ul className="list-unstyled mb-0 text-start">
                            {items.map((it) => (
                                <li key={it.href} className={ isActive(it.href) ? "active" : "" } >
                                    <Link href={it.href} className="d-flex align-items-center justify-content-between px-3 py-2">
                                        <span>{it.label}</span>

                                        {it.label.toLowerCase().includes("coupon") && couponCount > 0 && (
                                                <span className="badge rounded-pill bg-danger ms-2" 
                                                    style={{ fontSize: "0.75rem", minWidth: "1.5rem", textAlign: "center", marginRight: locale === "ar" ? "0.5rem" : "0", marginLeft: locale === "ar" ? "0" : "0.5rem", }}>
                                                    {couponCount}
                                                </span>
                                            )}
                                    </Link>
                                </li>
                            ))}

                            <li className="divider border-top" aria-hidden="true" />

                            <li className="logout">
                                <a href="#" onClick={handleLogout} className="text-danger fw-medium" >
                                    {locale === "ar" ? "تسجيل خروج" : "Logout"}
                                </a>
                            </li>
                        </ul>
                    </>
                ) : (
                    <ul className="list-unstyled mb-0 text-start">
                        <li>
                            <Link href={`/${locale}/login_register`}>
                                {locale === "ar" ? "تسجيل الدخول / التسجيل" : "Login / Register"}
                            </Link>
                        </li>
                    </ul>
                )}
            </div>
        </div>
    );
}