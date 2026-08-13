import React from "react";
import {useLocale, useTranslations } from "next-intl";

export default function Description({ product,product_name }) {
  const t = useTranslations();
    const locale = useLocale();
  const isAr = locale === "ar";
  function cleanProductName(productName) {
    // Step 1: Remove any non-alphanumeric characters except for spaces

     if (!productName) return "";
     
    const dynamicKey = productName.replace(/[^a-zA-Z0-9\s]/g, '') + ' Content';
  
    // Step 2: Words to remove
    const wordsToRemove = ['&', ' &', '& ', ' & ', 'amp', ' amp', 'amp ', ' amp ', ';', ' ;', '; ', ' ; '];
  
    // Step 3: Remove the words from the dynamic key (case insensitive)
    let cleanString = dynamicKey;
    wordsToRemove.forEach(word => {
      const regex = new RegExp(word, 'gi'); // 'gi' for global and case-insensitive replacement
      cleanString = cleanString.replace(regex, '');
    });
  
    // Step 4: Replace multiple spaces with a single space
    return cleanString.replace(/\s+/g, ' ').trim(); // Trim to remove leading/trailing spaces
    return cleanString;
  }
  const getContent = () => {
   let translatedContent = "";
    try {
      if (product_name) {
        translatedContent = t.raw(cleanProductName(product_name));
      }
    } catch (e) {
      translatedContent = "";
    }

    if (isAr) {
      if (product?.content_ar && product.content_ar !== "null") return product.content_ar;
      if (product?.content && product.content !== "null") return product.content;
      if (translatedContent && translatedContent !== "null") return translatedContent;
      return "";
    } else {
      if (product?.content && product.content !== "null") return product.content;
      if (translatedContent && translatedContent !== "null") return translatedContent;
      return "";
    }
  };
  return (
    <div className="product-single__description">
     
       <div dangerouslySetInnerHTML={{ __html: getContent() }}></div>
    </div>
  );
}
