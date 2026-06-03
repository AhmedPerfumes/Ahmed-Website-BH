// utils/priceRenderer.js
import React from "react";

export const renderPrice = (product, currency) => {
  if (!product) return null;

  const now = new Date(new Date().getTime() + 4 * 60 * 60 * 1000); // GST offset
  const start = product?.discount?.start_date ? new Date(product.discount.start_date) : null;
  const end = product?.discount?.end_date ? new Date(product.discount.end_date) : null;

  if (product.discount && start && end && now >= start && now <= end) {
    const discountType = product.discount.discount_type || "percent"; // default
    const value = parseFloat(product.discount.value);
    const price = parseFloat(product.price);

    if (discountType === "percent") {
      const discounted = (price - (price * value) / 100).toFixed(currency.decimals);
      return (
        <>
          <span className="money price price-old">
            {currency.symbol}{price}
          </span>
          <span className="money price price-sale">
            {currency.symbol}{discounted}
          </span>
        </>
      );
    } else if (discountType === "amount") {
      const discounted = product.discount.final_price
        ? parseFloat(product.discount.final_price).toFixed(currency.decimals)
        : (price - value).toFixed(currency.decimals);
      return (
        <>
          <span className="money price price-old">
            {currency.symbol}{price}
          </span>
          <span className="money price price-sale">
            {currency.symbol}{discounted}
          </span>
        </>
      );
    }
  }

  return (
    <span className="money price">
      {currency.symbol}{product.price}
    </span>
  );
};
