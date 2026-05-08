// Categories.js

"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Categoriess from "@/components/homes/home-3/Categories";
import { useTranslations } from "next-intl";

export default function Categories({ subCategories }) {
    const pathname = usePathname();
    const category = pathname.split("/")[3];
    const subcategory = pathname.split("/")[4];
    const t = useTranslations();

    // Helper to format slugs (oriental-fragrance) to translation keys (Oriental Fragrance)
    const formatKey = (str) => {
        if (!str) return "";
        return str
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <>
            <section className="category-header-section pt-4 pt-lg-5 pb-4">
                <div className="container">
                    <div className="text-center">
                        <h1 className="h3 mb-2 fw-normal text-uppercase" style={{ letterSpacing: '0.05em' }}>
                            {subcategory == null
                                ? t(formatKey(category))
                                : t(formatKey(subcategory))}
                        </h1>
                        <div 
                            className="title-accent mx-auto mb-2" 
                            style={{ 
                                width: '240px', 
                                height: '2px', 
                                background: 'linear-gradient(90deg, transparent, #BF953F, transparent)',
                                opacity: 0.7 
                            }}
                        ></div>
                    </div>
                </div>
            </section>

            {subcategory == null && subCategories && subCategories.length > 0 && (
                <div className="subcategory-wrapper pb-3">
                    <Categoriess subCategories={subCategories} />
                </div>
            )}
        </>
    );
}