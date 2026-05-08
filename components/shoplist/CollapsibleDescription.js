"use client";
import { useState } from "react";
import { Box, Container, Typography, Collapse } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useLocale, useTranslations } from "next-intl";

/**
 * Helper: render a paragraph string with linked phrases (from user example)
 * This can be used if the description is plain text and needs keyword linking.
 */
const renderParagraphWithLinks = (text, linksMap) => {
    if (!linksMap || Object.keys(linksMap).length === 0) return text;

    const phrases = Object.keys(linksMap).sort((a, b) => b.length - a.length);
    const escaped = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escaped.join("|")})`, "g");

    const parts = text.split(regex);

    return parts.map((part, i) => {
        const href = linksMap[part];
        if (href) {
            return (
                <a
                    key={i}
                    href={href}
                    style={{
                        color: "#BF953F",
                        textDecoration: "underline",
                        textUnderlineOffset: "2px",
                    }}
                    rel={href.startsWith("http") ? "noopener" : undefined}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

const CollapsibleDescription = ({ description, title, linksMap }) => {
    const [expanded, setExpanded] = useState(false);
    const locale = useLocale();
    const t = useTranslations();
    const isRtl = locale === "ar";

    if (!description) return null;

    // Use provided title or a default SEO-friendly title inspired by the example
    const displayTitle = title || (isRtl 
        ? "من العطور الشرقية المتميزة إلى مجموعات هدايا العطور الفاخرة" 
        : "From Premium Oriental Fragrances to Luxury Perfume Gift Sets");

    return (
        <Box
            component="section"
            dir={isRtl ? "rtl" : "ltr"}
            sx={{
                py: 2,
                background: "transparent",
                borderTop: "1px solid rgba(191, 149, 63, 0.05)"
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ textAlign: isRtl ? "right" : "left", opacity: 0.6 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: "#5C4A3A",
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            userSelect: "none",
                            "&:hover": { color: "#BF953F" }
                        }}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {displayTitle} {expanded ? <KeyboardArrowUp sx={{ fontSize: "0.9rem" }} /> : <KeyboardArrowDown sx={{ fontSize: "0.9rem" }} />}
                    </Typography>

                    <Collapse in={expanded}>
                        <Box sx={{ mt: 1 }}>
                            {/* If linksMap is provided, we assume description is plain text and we process it.
                                Otherwise, we treat description as HTML. */}
                            {linksMap ? (
                                description.split('\n').map((paragraph, index) => (
                                    paragraph.trim() && (
                                        <Typography
                                            key={index}
                                            variant="caption"
                                            component="p"
                                            sx={{
                                                color: "#5C4A3A",
                                                display: "block",
                                                fontSize: "0.65rem",
                                                mb: 1,
                                                lineHeight: 1.4,
                                                textAlign: "justify"
                                            }}
                                        >
                                            {renderParagraphWithLinks(paragraph.trim(), linksMap)}
                                        </Typography>
                                    )
                                ))
                            ) : (
                                <Typography
                                    variant="caption"
                                    component="div"
                                    sx={{
                                        color: "#5C4A3A",
                                        display: "block",
                                        fontSize: "0.65rem",
                                        lineHeight: 1.4,
                                        textAlign: "justify",
                                        "& p": { mb: 1 },
                                        "& a": {
                                            color: "#BF953F",
                                            textDecoration: "underline",
                                            textUnderlineOffset: "2px",
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: description }}
                                />
                            )}
                        </Box>
                    </Collapse>
                </Box>
            </Container>
        </Box>
    );
};

export default CollapsibleDescription;