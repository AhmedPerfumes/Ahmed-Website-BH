"use client";
import { shopCategories } from "@/data/categories";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Categoriess from "@/components/homes/home-3/Categories";
import { useTranslations } from "next-intl";

export default function Categories({ description, subCategories }) {
    const pathname = usePathname();
    const category = pathname.split("/")[3];
    const subcategory = pathname.split("/")[4];
    const t = useTranslations();

    const [expanded, setExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [maxHeight, setMaxHeight] = useState("auto");

    const contentRef = useRef(null);

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            const parentStyle = window.getComputedStyle(element);
            const lineHeight = parseFloat(parentStyle.lineHeight);

            // --- START OF FIX ---
            // The previous logic failed because scrollHeight includes the margins
            // of child elements (like <p>), making it > lineHeight for a single line.
            // This new logic accounts for those margins for a more accurate check.
            
            let doesOverflow = false;
            // Check if there are child elements (like <p>) to measure
            if (element.children.length > 0) {
                const firstChild = element.children[0];
                const childStyle = window.getComputedStyle(firstChild);
                const childMargin =
                    parseFloat(childStyle.marginTop) +
                    parseFloat(childStyle.marginBottom);

                // A single line's true height is ~lineHeight + its margins.
                // Overflow happens if scrollHeight exceeds this combined value.
                // A small tolerance (e.g., 2px) is added for rounding differences.
                doesOverflow = element.scrollHeight > lineHeight + childMargin + 2;
            } else {
                // Fallback for plain text without child tags
                doesOverflow = element.scrollHeight > lineHeight + 2;
            }
            // --- END OF FIX ---

            setIsOverflowing(doesOverflow);

            if (doesOverflow) {
                setMaxHeight(expanded ? `${element.scrollHeight}px` : `${lineHeight}px`);
            } else {
                setMaxHeight("none");
            }
        }
    }, [description, expanded]);

    return (
        <>
            <section className="full-width_padding pb-3">
                <div className="shop-categories position-relative">
                    <h2 className="h3 pb-3 mb-4 fw-normal text-uppercase text-center">
                        {subcategory == null
                            ? t(
                                  category
                                      .split("-")
                                      .join(" ")
                                      .charAt(0)
                                      .toUpperCase() + category.slice(1)
                              )
                            : t(subcategory.split("-").join(" "))}
                    </h2>

                    {/* Collapsible Description */}
                    {description && (
                        <div
                            style={{
                                fontFamily: "Merriweather, serif",
                                maxWidth: "930px",
                                margin: "0 auto",
                            }}
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: description,
                                }}
                                ref={contentRef}
                                style={{
                                    maxHeight: maxHeight,
                                    overflow: "hidden",
                                    transition: "max-height 0.5s ease-in-out",
                                    fontSize: "0.875rem",
                                    color: "#6E6E73",
                                    letterSpacing: "0.02em",
                                    fontWeight: "500",
                                    textAlign: "center",
                                }}
                            ></div>
                            {isOverflowing && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <a
                                        onClick={() => setExpanded(!expanded)}
                                        style={{ cursor: "pointer" }}
                                        className="btn-rounded btn-link_lg text-uppercase fw-medium hover-effect mt-3"
                                    >
                                        {expanded
                                            ? t("Show less")
                                            : t("Find Out More")}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
            {subcategory == null ? (
                <Categoriess subCategories={subCategories} />
            ) : null}
        </>
    );
}
