"use client";
import { useContextElement } from "@/context/Context";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import User from "../headers/components/User";
import UserLoggedIn from "../headers/components/UserLoggedIn";
import { useUser } from "@/context/UserContext";

export default function MobileFooter1() {
    const locale = useLocale();
    const [showFooter, setShowFooter] = useState(false);
    const { wishList, cartProducts } = useContextElement();
    const { isLoggedIn } = useUser();
    useEffect(() => {
        setShowFooter(true);
    }, []);

    return (
        <footer
            className={`footer-mobile container w-100 px-5 d-md-none bg-body ${
                showFooter ? "position-fixed footer-mobile_initialized" : ""
            }`}
        >
            <div className="row text-center">
                <div className="col-3">
                    <a href="/" className="footer-mobile__link d-flex flex-column align-items-center" >
                        <svg className="d-block" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <use href="#icon_home" />
                        </svg>
                        <span>Home</span>
                    </a>
                </div>
                {/* <!-- /.col-3 --> */}

                <div className="col-3">
                    <Link href={`/${locale}/shop`} className="footer-mobile__link d-flex flex-column align-items-center">
                        <svg className="d-block" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" >
                            <use href="#icon_gift" />
                        </svg>
                        <span>Shop</span>
                    </Link>
                </div>
                {/* <!-- /.col-3 --> */}

                <div className="col-3">
                    {!isLoggedIn ? (
                        <Link href="/account_dashboard" className="footer-mobile__link d-flex flex-column align-items-center">
                            <User />
                            <span> LogIn </span>
                        </Link>
                    ) : (
                        <Link href="/account_dashboard" className="footer-mobile__link d-flex flex-column align-items-center">
                            <UserLoggedIn />
                            <span> Account </span>
                        </Link>
                    )}
                </div>

                <div className="col-3">
                    <Link href={`/${locale}/shop-cart`} className="footer-mobile__link d-flex flex-column align-items-center" >
                        <div className="position-relative">
                            <svg className="d-block" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <use href="#icon_cart"></use>
                            </svg>
                            <span className="wishlist-amount d-block position-absolute js-wishlist-count">
                                {cartProducts.length}
                            </span>
                        </div>
                        <span>Cart</span>
                    </Link>
                </div>
                {/* <!-- /.col-3 --> */}
            </div>
            {/* <!-- /.row --> */}
        </footer>
    );
}