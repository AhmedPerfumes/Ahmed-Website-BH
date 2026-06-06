"use client";
import { allProducts } from "@/data/products";
import React, { useEffect } from "react";
import { useContext, useState,useReducer } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useMenu } from "./MenuContext";
const dataContext = React.createContext();
export const useContextElement = () => {
  return useContext(dataContext);
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const existingProduct = state.products.find(
        (p) =>
          p.product_id === action.payload.product_id &&
          p.campaign === action.payload.campaign
      );

      let updatedProducts;

      if (existingProduct) {
        updatedProducts = state.products.map((p) =>
          p.product_id === action.payload.product_id &&
          p.campaign === action.payload.campaign
            ? { ...p, quantity: (p.quantity || 0) + (action.payload.quantity || 1) }
            : p
        );

        return {
          ...state,
          products: updatedProducts,
          isProcessing: false,
          toastMeta: action.meta?.toast || null,
        };
      }

      updatedProducts = [
        ...state.products,
        { ...action.payload, quantity: action.payload.quantity || 1 },
      ];

      return {
        ...state,
        products: updatedProducts,
        isProcessing: false,
        toastMeta: action.meta?.toast || null,
      };
    }
    case 'REMOVE_GIFT':
      return {
        ...state,
        products: state.products.filter(
          (p) =>
            !p.is_gift ||
            (action.payload.productId && p.product_id !== action.payload.productId) ||
            (action.payload.campaign && p.campaign !== action.payload.campaign)
        ),
        isProcessing: false,
      };
    case 'REMOVE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.product_id !== action.payload.productId),
        isProcessing: false,
      };
    case 'SET_PRODUCTS':
      // Ensure payload is an array
      const newProducts = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, products: newProducts, isProcessing: false };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    default:
      return state;
  }
};


export default function Context({ children }) {
  const t = useTranslations();
  const [state, dispatch] = useReducer(cartReducer, {
    products: [],
    isProcessing: false,
  });
  const [wishList, setWishList] = useState([]);
  const [quickViewItem, setQuickViewItem] = useState(allProducts[0]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [freeShippingFlag, setFreeShippingFlag] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [couponDataContext, setCouponDataContext] = useState(null);
  const[promotionsContext, setPromotionsContext] = useState([]);

  const { shippingServiceCharges } = useMenu();
  // console.log(shippingServiceCharges, "123123")

  useEffect(() => {
    const currentUTC = new Date();
    const currentGST = new Date(currentUTC.getTime() + 4 * 60 * 60 * 1000);
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
    
    const isCustomerCoupon = couponDataContext && couponDataContext.type === "customer";
    const isCustomerCouponActive = isCustomerCoupon && (!couponDataContext.start_date || !couponDataContext.end_date || (new Date(current_date_time) >= new Date(couponDataContext.start_date) && new Date(current_date_time) <= new Date(couponDataContext.end_date)));
    
    const subtotal = state.products.reduce((accumulator, product) => {
      const qty = Number(product?.quantity || 0);
      const bogoFreeQty = Number(product?.bogo_free_qty || 0);
      const paidQty = Math.max(0, qty - bogoFreeQty); // BOGO free units don't get charged
      
      const basePrice = Number(product?.price || 0);

      // Skip free gifts entirely in the subtotal
      if (product?.is_gift) return accumulator;
       
      if (paidQty <= 0) return accumulator;

      // 1. Check for Product Specific Discounts
      if (product?.discount) {
        let discounted = basePrice;
        if (
          new Date(current_date_time) >= new Date(product.discount.start_date) &&
          new Date(current_date_time) <= new Date(product.discount.end_date)
        ) {
          if (product.discount.discount_type === 'percent') {
            discounted = basePrice - (basePrice * Number(product.discount.value || 0)) / 100;
          } else if (product.discount.discount_type === 'amount') {
            discounted = Number(product.discount.final_price || 0);
          }
          // Using .toFixed(3) for Oman currency format
          // return accumulator + qty * Number(discounted.toFixed(3));
          return accumulator + paidQty * Number(discounted.toFixed(3));
        }
      }

      // 2. Check for Customer/Global Coupon (if no product discount & not part of a promotion)
      if (isCustomerCouponActive && !product.discount && !promotionsContext.some((promo) => promo.buy_products.some((item) => item.product_id === product.product_id))) {
        const value = Number(couponDataContext?.value || 0);
        let discounted = basePrice; 

        if (couponDataContext.coupon_type === "percent") {
          discounted = basePrice - (basePrice * value) / 100;
        } else if (couponDataContext.coupon_type === "amount") {
          discounted = basePrice - value;
        }

       return accumulator + paidQty * Number(discounted.toFixed(3));
      }

      // Default
      return accumulator + paidQty * basePrice;
    }, 0);

    setTotalPrice(subtotal);
    
    // Oman static free shipping threshold (20) based on your original commented code
    // const freeShippingThreshold = shippingServiceCharges?.[3]?.price ?? 15;
    setFreeShippingFlag(Number(subtotal.toFixed(3)) >= 20);
  }, [state.products, couponDataContext, promotionsContext]);

  const addProductToQuickView = (product) => {
    setQuickViewItem(product);
  };

  // const addProductToCart = (product) => {
  //   const item = {
  //     ...product,
  //     quantity: 1,
  //   };
  //   setCartProducts((prevCart) => [...prevCart, item]);

  //   document
  //     .getElementById("cartDrawerOverlay")
  //     .classList.add("page-overlay_visible");
  //   document.getElementById("cartDrawer").classList.add("aside_visible");
  // };
  // const isAddedToCartProducts = (id) => {
  //   if (cartProducts.filter((elm) => elm.product_id == id)[0]) {
  //     return true;
  //   }
  //   return false;
  // };
   const addProductToCart = (product) => {
    if (state.isProcessing) return;

    product.quantity = product.quantity || 1;

    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({
      type: 'ADD_PRODUCT',
      payload: product
    });

    const imageUrl = product.image 
      ? `${process.env.NEXT_PUBLIC_API_URL}storage/${product.image}` 
      : `${process.env.NEXT_PUBLIC_API_URL}storage/${product?.images && JSON.parse(product.images)[0]}`;

    toast.custom((toastObj) => (
      <div className={`custom-cart-toast ${toastObj.visible ? 'animate-enter' : 'animate-leave'}`}>
        <img src={imageUrl} alt={product.product_name} className="toast-image" />
        <div className="toast-details">
          <p className="toast-title">{product.product_name}</p>
          <div className="toast-actions">
            <button 
              className="view-cart-btn" 
              onClick={() => {
                document.getElementById("cartDrawerOverlay")?.classList.add("page-overlay_visible");
                document.getElementById("cartDrawer")?.classList.add("aside_visible");
                toast.dismiss(toastObj.id);
              }}
            >
              {t("View Cart")}
            </button>
          </div>
        </div>
        <button className="close-toast" onClick={() => toast.dismiss(toastObj.id)}>×</button>
      </div>
    ), {
      duration: 3000,
      position: 'bottom-right',
    });
    
    // document.getElementById("cartDrawerOverlay")?.classList.add("page-overlay_visible");
    // document.getElementById("cartDrawer")?.classList.add("aside_visible");
  };

  // 3. SAFE REMOVE GIFT USING REDUCER

  const removeProduct = (productId) => {
    if (state.isProcessing) return;
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'REMOVE_PRODUCT', payload: { productId } });
  };

  // Helper to safely set products from local storage
  const setCartProducts = (productsOrFn) => {
    let newProducts = [];
    if (typeof productsOrFn === 'function') {
      newProducts = productsOrFn(state.products);
    } else {
      newProducts = productsOrFn;
    }
    if (!Array.isArray(newProducts)) return;
    dispatch({ type: 'SET_PRODUCTS', payload: newProducts });
  };

  const isAddedToCartProducts = (id) => {
    return state.products.some((elm) => elm.product_id === id);
  };
   const removeGiftFromCart = (productId = null, campaign = null) => {
    if (state.isProcessing) return;
    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'REMOVE_GIFT', payload: { productId, campaign } });
  };

  const toggleWishlist = (id) => {
    if (wishList.includes(id)) {
      setWishList((pre) => [...pre.filter((elm) => elm != id)]);
    } else {
      setWishList((pre) => [...pre, id]);
    }
  };
  const isAddedtoWishlist = (id) => {
    if (wishList.includes(id)) {
      return true;
    }
    return false;
  };
  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem("cartList"));
      if (Array.isArray(items)) {
        dispatch({ type: 'SET_PRODUCTS', payload: items });
      } else {
        dispatch({ type: 'SET_PRODUCTS', payload: [] });
      }
    } catch (error) {
      dispatch({ type: 'SET_PRODUCTS', payload: [] });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartList", JSON.stringify(state.products));
  }, [state.products]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("wishlist"));
    if (items?.length) {
      setWishList(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishList));
  }, [wishList]);
  // const removeGiftFromCart = () => {
  //   const updatedCart = cartProducts.filter((item) => !item.is_gift);
  //   setCartProducts(updatedCart);
  //   localStorage.setItem('cartList', JSON.stringify(updatedCart));
  // };

  const contextElement = {
   cartProducts: state.products,
    setCartProducts,
    totalPrice,
    addProductToCart,
    isAddedToCartProducts,
    toggleWishlist,
    isAddedtoWishlist,
    quickViewItem,
    wishList,
    setQuickViewItem,
    addProductToQuickView,
    freeShippingFlag,
    setOrderDetails,
    orderDetails,
      promotionsContext,      // Added so the app can read active promotions
    setPromotionsContext  , 
    setCouponDataContext,
    removeGiftFromCart
  };
  return (
    <dataContext.Provider value={contextElement}>
      {children}
    </dataContext.Provider>
  );
}
