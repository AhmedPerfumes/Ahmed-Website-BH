"use client";
import { useContextElement } from "@/context/Context";
import { useUser } from "@/context/UserContext";
import { useMenu } from '@/context/MenuContext';
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import he from 'he';
import { products1 } from "@/data/products/fashion";
import { useRouter } from 'next/navigation';
import { useLocale } from "next-intl";
import Pagination1 from "../common/Pagination1";
import FreeGiftFeature from "../FreeGiftFeature";
import BOGOFeature from "../BogoFeature";
// import FreeGiftFeature from '@/components/FreeGiftFeature';

export default function Checkout() {
  // const [selectedRegion, setSelectedRegion] = useState("");
  // const [shippingAdd, setShippingAdd] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [idDDActive, setIdDDActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState('cod');
  const [createAccount, setCreateAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [OTPError, setOTPError] = useState(null);
  const [OTPSuccess, setOTPSuccess] = useState(null);
  const [isSendOTPLoading, setIsSendOTPLoading] = useState(false);
  const [isOTPButton, setIsOTPButton] = useState(true);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [termsChecked, setTermsChecked] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    shippingAddress: { first_name: '', last_name: '', mobile: '', email: '', country: 'BH', area: '', building: '', region: '' },
    billingAddress: { first_name: '', last_name: '', mobile: '', email: '', country: 'BH', area: '', building: '', region: '' },
    shippingAdd: false,
    note: '',
    password: '',
    otp: ''
  });

  const { cartProducts, totalPrice, freeShippingFlag, setOrderDetails, setCouponDataContext, setCartProducts, promotionsContext } = useContextElement();
  const { shippingServiceCharges, vatTax, isLoading: isMenuLoading, error: isMenuError, currency } = useMenu();
  const { isLoggedIn } = useUser();
  const router = useRouter();
  const locale = useLocale();
  const termsRef = useRef(null);
  const hasCleaned = useRef(false);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        const el = document.getElementById("general_error_msg");
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [error]);

  useEffect(() => {
    if (isLoggedIn) {
      let customer_id = -1;
      let firstName = "";
      let lastName = "";
      let email = "";
      let mobile = "";
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(atob(userStr));
          email = user.email || "";
          mobile = user.phone || user.mobile || "";
          customer_id = user.id || -1;

          if (user.name) {
            const [f, ...lArr] = user.name.split(" ");
            firstName = f || "";
            lastName = lArr.join(" ") || "";
          }
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }

      // Clean up legacy localStorage address
      localStorage.removeItem("address");

      setFormData((prev) => ({ 
        ...prev, 
        billingAddress: { ...prev.billingAddress, first_name: firstName, last_name: lastName, email, mobile }, 
        shippingAddress: { ...prev.shippingAddress, first_name: firstName, last_name: lastName, email, mobile }, 
      }));

      if (customer_id && customer_id !== -1) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}api/customerAddressDetails`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer_id }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.addresses && data.addresses.length) {
              const defaultAddr = data.addresses.find((addr) => addr.is_default === 1 || addr.is_default === true) || data.addresses[0];
              if (defaultAddr) {
                let addrFirstName = firstName;
                let addrLastName = lastName;
                if (defaultAddr.name) {
                  const [f, ...lArr] = defaultAddr.name.trim().split(" ");
                  addrFirstName = f || firstName;
                  addrLastName = lArr.join(" ") || lastName;
                }
                const addrEmail = defaultAddr.email || email;
                const addrMobile = defaultAddr.phone || defaultAddr.mobile || mobile;
                const area = defaultAddr.city || "";
                const building = defaultAddr.address || "";
                const region = defaultAddr.state || "";

                setFormData((prev) => ({ 
                  ...prev, 
                  billingAddress: { 
                    ...prev.billingAddress, 
                    first_name: addrFirstName || prev.billingAddress.first_name, 
                    last_name: addrLastName || prev.billingAddress.last_name, 
                    email: addrEmail || prev.billingAddress.email, 
                    mobile: addrMobile || prev.billingAddress.mobile, 
                    area, 
                    building, 
                    region, 
                  }, 
                  shippingAddress: { 
                    ...prev.shippingAddress, 
                    first_name: addrFirstName || prev.shippingAddress.first_name, 
                    last_name: addrLastName || prev.shippingAddress.last_name, 
                    email: addrEmail || prev.shippingAddress.email, 
                    mobile: addrMobile || prev.shippingAddress.mobile, 
                    area, 
                    building, 
                    region, 
                  }, 
                }));
              }
            }
          })
          .catch((err) => {
            console.error("Error fetching fresh customer addresses:", err);
          });
      }
    }
  }, [isLoggedIn]);

  const handleRadioChange = (event) => { setSelectedOption(event.target.value); };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name.startsWith('shipping') || name.startsWith('billing')) {
      const addressField = name.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
      const fieldName = name.split('.')[1]; // Get the specific field (e.g., street, city)
      setFormData((prevData) => ({ ...prevData, [addressField]: { ...prevData[addressField], [fieldName]: value, },
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value, }));
    }
  };

  const handleCheckboxChange = () => {
    setFormData((prevData) => {
      const newSameAsShipping = !prevData.shippingAdd;
      return {
        ...prevData,
        shippingAdd: newSameAsShipping,
        shippingAddress: { first_name: '', last_name: '', mobile: '', email: '', area: '', building: '', region: '' }
      }
    });
  };

  // const handleEmiratesChange = (event, emirates) => {
  //   const { id } = event.target;
  //   // console.log(id, emirates);
  //   if (id.startsWith('shipping') || id.startsWith('billing')) {
  //     const addressField = id.startsWith('shipping') ? 'shippingAddress' : 'billingAddress';
  //     const fieldName = id.split('.')[1]; // Get the specific field (e.g., street, city)
  //     setFormData((prevData) => {
  //       return { ...prevData, [addressField]: { ...prevData[addressField], [fieldName]: emirates, },};
  //     });
  //   }
  // };
   useEffect(() => {
   setCouponDataContext(null);
  }, []);

  const mapProductsFromFormData = (products) => {
    const mapped = [];
    products.forEach((item) => {
      if (item.bogo_free_qty && item.bogo_free_qty > 0) {
        const paidQty = (item.quantity || 0) - item.bogo_free_qty;

        // Paid portion
        if (paidQty > 0) {
          mapped.push({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: paidQty,
            category_name: item.category_name,
            subcategory_name: item.subcategory_name,
            coupon: item.coupon,
            discount: null,
            _original_discount: item._original_discount || null,
            ...('is_coupon' in item && { is_coupon: item.is_coupon }),
            ...('coupon_type' in item && { coupon_type: item.coupon_type }),
            ...('value' in item && { value: item.value }),
          });
        }

        // BOGO free portion
        mapped.push({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.bogo_free_qty,
          category_name: item.category_name,
          subcategory_name: item.subcategory_name,
          coupon: [],
          discount: null,
          is_gift: true,
          type: 'bogo',
          campaign: item.bogo_campaign,
        });
      } else {
        // Regular product (no BOGO)
        mapped.push({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          category_name: item.category_name,
          subcategory_name: item.subcategory_name,
          coupon: item.coupon,
          discount: item.discount,
          ...('_original_discount' in item && { _original_discount: item._original_discount }),
          ...('is_coupon' in item && { is_coupon: item.is_coupon }),
          ...('is_gift' in item && { is_gift: item.is_gift }),
          ...('coupon_type' in item && { coupon_type: item.coupon_type }),
          ...('value' in item && { value: item.value }),
          ...('campaign' in item && { campaign: item.campaign }),
          ...('type' in item && { type: item.type }),
        });
      }
    });
    return mapped;
  };
 
  async function onOrder(event) {
    event.preventDefault();

    if (!termsChecked) {
      setTermsError(true);
      if (termsRef.current) { 
        termsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // ---- Pixel: Fire AddPaymentInfo on first Place Order attempt only ----
    // Correct event for "Place Order" click — NOT Purchase (Purchase fires on Thank You page).
    try {
      if (!window.__placeOrderTracked && cartProducts && cartProducts.length > 0) {
        window.__placeOrderTracked = true;

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "add_payment_info",
          ecommerce: {
            currency: "BHD",
            value: parseFloat(totalPrice || 0),
            payment_type: selectedOption || "cod",
            items: cartProducts
              .filter((item) => !item.is_gift)
              .map((item) => ({
                item_id: item.product_id?.toString(),
                item_name: item.product_name,
                price: parseFloat(item.price || 0),
                quantity: item.quantity || 1,
              })),
          },
        });

        if (typeof window.fbq === "function") {
          window.fbq("track", "AddPaymentInfo", {
            content_ids: cartProducts
              .filter((item) => !item.is_gift)
              .map((item) => item.product_id?.toString()),
            content_type: "product",
            value: parseFloat(totalPrice || 0),
            currency: "BHD",
          });
        }
      }
    } catch (e) { /* tracking errors must never block order submission */ }

    const billing = formData.billingAddress;
    const newErrors = {};

    if (!billing.first_name.trim()) newErrors.first_name = "First Name is required";
    if (!billing.last_name.trim()) newErrors.last_name = "Last Name is required";
    if (!billing.area.trim()) newErrors.area = "Area / Mantaqa is required";
    if (!billing.building.trim()) newErrors.building = "Building / Villa is required";
    if (!billing.region.trim()) newErrors.region = "Region is required";
    if (!billing.email.trim()) newErrors.email = "Email is required";
    if (!billing.mobile.trim()) newErrors.mobile = "Mobile Number is required";
    if (!isLoggedIn && !isOTPVerified) newErrors.otp = "OTP must be verified";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setIsLoading(false); 
      
      setTimeout(() => {
        const firstErrorFieldId = Object.keys(newErrors)[0];
        let elementId = "";
        switch (firstErrorFieldId) {
          case "first_name": elementId = "checkout_first_name"; break;
          case "last_name": elementId = "checkout_last_name"; break;
          case "area": elementId = "checkout_street_address"; break;
          case "building": elementId = "checkout_street_address_2"; break;
          case "region": elementId = "checkout_region"; break;
          case "email": elementId = "billingAddress.email"; break;
          case "mobile": elementId = "checkout_otp"; break;
          case "otp": elementId = "billing_otp"; break;
        }
        
        const el = document.getElementById(elementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      return;
    } else { 
      setFieldErrors({}); 
    }

    const shippingPrice = freeShippingFlag ? 0.00 : parseFloat(shippingServiceCharges[0].price);
    const shippingPriceVat = shippingPrice / 100 * vatTax.percentage;
    const finalPrice = !freeShippingFlag ? parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price) : 0 + totalPrice + parseFloat(shippingServiceCharges[1].price);
    const servicePrice = shippingServiceCharges[1].price;
    const servicePriceVat = servicePrice / 100 * vatTax.percentage;

    let userJson = null;
    if(isLoggedIn) {
      const user = atob(localStorage.getItem('user'));
      userJson = JSON.parse(user);
    }

    const {
      shippingAdd,
      note,
      password,
      otp,
      ...cleanFormData
    } = formData;

    const additionalFields = { ...formData, products : mapProductsFromFormData(cartProducts), payment_method: selectedOption, shippingPrice, shippingPriceVat, servicePrice, servicePriceVat, vatTax: vatTax.percentage, totalPrice, finalPrice, customer_id: userJson ? userJson.id : null, locale, couponCode }

    const token = localStorage.getItem('token');
 
    try {
      // const formDataa = new FormData(additionalFields);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/storeOrder`, {
        method: 'POST',
        body: JSON.stringify(additionalFields),
        headers: { "content-type": "application/json", ...(token && { Authorization: `Bearer ${token}` })},
      })

      if (response.status === 401) {
        // Clear all authentication-related items
        if (localStorage.getItem('user')) {
          localStorage.removeItem('user');
        }
        if (localStorage.getItem('token')) {
          localStorage.removeItem('token');
        }
        localStorage.removeItem('address');

        // If they were a guest user verified via OTP, they need to re-verify
        // If they were logged in, they need to re-login
        const errorMsg = isLoggedIn 
          ? 'Your session has expired. Please login again.' 
          : 'Mobile verification expired. Please verify your number again.';

        setError(errorMsg);

        setTimeout(() => {
          // Redirecting to the combined login/register/OTP page
          window.location.reload();
        }, 2000);

        return; // Stop execution
      }
 
      if (!response.ok) {
        const errorMessage = data.message || data.error || "Failed to submit the data. Please try again.";
        throw new Error(errorMessage);
      }
      const data = await response.json();

      if (data.message && data.message.split(" ")[0] == "Order") {
        setSuccess(data.message);
        setError(null);
        setOrderDetails(data);
        setFormData({
          shippingAddress: { first_name: "", last_name: "", mobile: "", email: "", area: "", building: "", emirates: "" },
          billingAddress: {first_name: "", last_name: "", mobile: "", email: "", area: "", building: "", emirates: "" },
          shippingAdd: false,
        });
        setTimeout(() => router.push(`/${locale}/shop-order-complete`), 1000);
      } else if (data.message && data.message.split(" ")[0] == "Redirecting") {
        setSuccess(data.message);
        setError(null);
        router.push(data.redirect_url);
      } else if (data.qtyMessage) {
        setError(data.qtyMessage);
      } else if (data.discountMessage) {
        setError(data.discountMessage);

        setTimeout(() => {
          localStorage.setItem("cartList", JSON.stringify([])); // store an empty array in localStorage
          setCartProducts([]); // update the cartProducts state to an empty array
        }, 2000);
      } else if (data.couponMessage) {
        setError(data.couponMessage);
      } else if (data.duplicateOrderMessage) {
        setError(data.duplicateOrderMessage);
      } else if (data.priceMessage) {
        setError(data.priceMessage);
      } else if (data.collectionMessage) {
        setError(data.collectionMessage);
      } else if (data.focMessage) {
        setError(data.focMessage);
      } else if (data.bogoMessage) {
        setError(data.bogoMessage);
      } else {
        if (data.products) setError(data.products);
        if (data["billingAddress.first_name"]) setError(data["billingAddress.first_name"]);
        if (data["billingAddress.last_name"]) setError(data["billingAddress.last_name"]);
        if (data["billingAddress.area"]) setError(data["billingAddress.area"]);
        if (data["billingAddress.building"]) setError(data["billingAddress.building"]);
        if (data["billingAddress.region"]) setError(data["billingAddress.region"]);
        if (data["billingAddress.email"]) setError(data["billingAddress.email"]);
        if (data["billingAddress.mobile"]) setError(data["billingAddress.mobile"]);
        setSuccess(null);
      }
    } catch (error) {
      // Capture the error message to display to the user
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendOTP(e) {
    e.preventDefault();
    
    // console.log('Mobile:', formData.billingAddress.mobile);
    // return;
    setIsSendOTPLoading(true);
    if(formData.billingAddress.mobile == '') {
      setOTPError('Mobile Number is Required');
      setOTPSuccess(null);
      setIsSendOTPLoading(false);
      return;
    }
    const regex = /^\d{8}$/;
    if(!regex.test(formData.billingAddress.mobile)) {
      setOTPError('Invalid Mobile Number');
      setOTPSuccess(null);
      setIsSendOTPLoading(false);
      return;
    }
    setOTPError(null);
    setIsSendOTPLoading(true);
    // return false;
    
    try {
      const mobile = formData.billingAddress.mobile;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/sendOTP`, {
        method: 'POST',
        body: JSON.stringify({mobile}),
        headers: { 'Content-Type': 'application/json', }
      })
 
      if (!response.ok) {
        throw new Error('Failed to submit the data. Please try again.');
      }
 
      // Handle response if necessary
      const data = await response.json();
      if(data.message && data.message.split(' ')[0] == 'OTP') {
        setOTPSuccess(data.message);
        setOTPError(null);
        setIsOTPButton(false);
      } else {
        if(data['mobile']) {
          setOTPSuccess(data['mobile']);
        }
        setOTPSuccess(null);
      }
      // console.log(data);
    } catch (error) {
      // Capture the error message to display to the user
      setOTPSuccess(error.message);
      console.error(error);
    } finally {
      setIsSendOTPLoading(false);
    }
  }

  async function verifyOTP(e) {
    e.preventDefault();
    // console.log('Mobile:', formData.billingAddress.mobile);
    // console.log('OTP:', formData.otp);
    // return;
    setIsSendOTPLoading(true);
    if(formData.otp == '') {
      setOTPError('OTP is Required');
      setOTPSuccess(null);
      setIsSendOTPLoading(false);
      return;
    }
    const regex = /^\d+$/;
    if(!regex.test(formData.otp)) {
      setOTPError('Invalid OTP');
      setOTPSuccess(null);
      setIsSendOTPLoading(false);
      return;
    }
    setOTPError(null);
    setIsSendOTPLoading(true);
    // return false;
    
    try {
      const mobile = formData.billingAddress.mobile;
      const otp = formData.otp;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/verifyOTP`, {
        method: 'POST',
        body: JSON.stringify({mobile, otp, flag: 'checkout'}),
        headers: { 'Content-Type': 'application/json', }
      })
 
      if (!response.ok) {
        throw new Error('Failed to submit the data. Please try again.');
      }
 
      // Handle response if necessary
      const data = await response.json();
      if(data.message && data.message.split(' ')[0] == 'Invalid') {
        setOTPSuccess(null);
        setOTPError(data.message);
      } else if(data.message && data.message.split(' ')[0] == 'OTP') {
        setOTPSuccess(data.message);
        setIsOTPVerified(true);
        setIsDisabled(false);
        setOTPError(null);
        localStorage.setItem("token", data.access_token);
      } else {
        if(data['mobile']) {
          setOTPError(data['mobile']);
        }
        if(data['otp']) {
          setOTPError(data['otp']);
        }
        setOTPSuccess(null);
      }
      // console.log(data);
    } catch (error) {
      // Capture the error message to display to the user
      setOTPError(error.message);
      console.error(error);
    } finally {
      setIsSendOTPLoading(false);
    }
  }

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };

  const removeCoupon = (e) => {
    setCouponCode('');
    setCouponSuccess(null);
    setCouponData(null);
    setCouponDataContext(null);
  };

  const applyCoupon = async (e) => {
    e.preventDefault();
    if(couponCode == '') {
      setCouponError('Coupon Code is Required');
      setCouponSuccess(null);
      setCouponDataContext(null);
      return;
    }

    let product_coupon = false;
    cartProducts.map((item) => {
      if(item.coupon?.code == couponCode) {
        product_coupon = true;
      }
    });

    if(!product_coupon) {
      setCouponError('Invalid Coupon Code for this products');
      setCouponSuccess(null);
      setCouponDataContext(null);
      setCouponCode('');
      return;
    }
    else if(!isOTPVerified) {
      setCouponError('Verify Mobile Number First');
      setCouponSuccess(null);
      return;
    }
    try {
      // Call your backend API or validation logic for the coupon code
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/validateCoupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ couponCode, mobile_number: formData.billingAddress.mobile }),
      });

      const data = await res.json();

      if(data.message && data.message.split(' ')[0] == 'Details') {
        setCouponError(null);
        setCouponData(data.coupon);
        setCouponDataContext(data.coupon);
        setCouponSuccess(`Applied Coupon: ${data.coupon.code} - Discount: ${data.coupon.value}%`);
      } else {
        setCouponSuccess(null);
        setCouponData(null);
        setCouponDataContext(null);
        console.log(data);
        if(data['couponCode']) {
          setCouponError(data['couponCode']);
        } else if(data['mobile_number']) {
          setCouponError(data['mobile_number']);
        } else {
          setCouponError(data.message);
        }
      }
    } catch (err) {
      setCouponSuccess(null);
      setCouponData(null);
      setCouponDataContext(null);
      setCouponError("An error occurred. Please try again.");
    }
  };

  if (isMenuLoading) {
    return <div><Pagination1 /></div>;
  }
  if (isMenuError) {
    return <div>{ isMenuError }</div>;
  }

  // const subTotalPrice = (elm) => {
  //   if (elm.is_gift) {
  //     return <td>0.000{currency.symbol} (Free Gift)</td>;
  //   }
  //   const currentUTC = new Date(); // Current UTC time
  //   const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
  //   const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
  //   if(elm?.discount) {
  //     console.log('if');
  //     if(new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
  //       return <td>{((elm.price - (elm.price / 100 * elm.discount.value)) * elm.quantity).toFixed(currency.decimals)}{ currency.symbol }</td>;
  //     } else {
  //       return <td>{(elm.price * elm.quantity).toFixed(currency.decimals)}{ currency.symbol }</td>;
  //     }
  //   } else if(elm?.coupon && couponData != null && couponCode != null) {
  //     console.log('else if');
  //     if(new Date(current_date_time) >= new Date(elm.coupon.start_date) && new Date(current_date_time) <= new Date(elm.coupon.end_date)) {
  //       return <td><span className="money price price-old">{elm?.price}{ currency.symbol }</span><span className="money price price-sale">{((elm.price - (elm.price / 100 * elm.coupon.value)) * elm.quantity).toFixed(currency.decimals)}{ currency.symbol }</span></td>;
  //     } else {
  //       return <td>{(elm.price * elm.quantity).toFixed(currency.decimals)}{ currency.symbol }</td>;
  //     }
  //   } else if(elm?.sale_price) {
  //     console.log('else if 2');
  //     return <td>{((elm.price - (elm.price / 100 * elm.sale_price)) * elm.quantity).toFixed(currency.decimals)}{ currency.symbol }</td>;
  //   } else {
  //     console.log('else');
  //     return <td>{(elm.price * elm.quantity).toFixed(currency.decimals)}{ currency.symbol }</td>;
  //   }
  // };

  const subTotalPrice = (elm) => {
    if (elm.is_gift) { return <td>0.000{currency.symbol} (Free Gift)</td>; }
    const currentUTC = new Date(); // Current UTC time
    const currentGST = new Date(currentUTC.getTime() + (4 * 60 * 60 * 1000)); // Add 4 hours for GST
    const current_date_time = currentGST.toISOString().slice(0, 19).replace("T", " ");
     const bogoFreeQty = Number(elm.bogo_free_qty || 0);
    const paidQty = Math.max(0, (elm.quantity || 0) - bogoFreeQty);
    
    let itemPrice = elm.price;
     if ( elm?.discount && new Date(current_date_time) >= new Date(elm.discount.start_date) && new Date(current_date_time) <= new Date(elm.discount.end_date)) {
      if (elm.discount.discount_type == "percent") { itemPrice = elm.price - (elm.price / 100) * elm.discount.value; } 
      else if (elm.discount.discount_type == "amount") { itemPrice = elm.discount.final_price; }
      return (
        <td>
          <span className="money price price-sale"> {currency.symbol} {(itemPrice * elm.quantity).toFixed(currency.decimals)} </span>
          <span className="money price price-old"> {currency.symbol} {(elm.price * elm.quantity).toFixed(currency.decimals)} </span>
        </td>
      );
    }
    if (bogoFreeQty > 0) {
      return (
        <td>
          <span className="money price price-sale"> {currency.symbol} {(itemPrice * paidQty).toFixed(currency.decimals)} </span>
          <span className="money price price-old"> {currency.symbol} {(itemPrice * elm.quantity).toFixed(currency.decimals)} </span>
          <br /><span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '12px' }}>🎁 {bogoFreeQty} FREE</span>
        </td>
      );
    }
    // else if(elm?.sale_price) {
    //   console.log('else if 2');
    //   return (
    //     <td>
    //       <span className="money price price-old">{currency.symbol}{elm?.price}</span>
    //       <span className="money price price-sale">{currency.symbol}{(elm.sale_price * elm.quantity).toFixed(currency.decimals)}</span>
    //     </td>
    //   )
    // }
    else if (couponData && couponData.type === "customer" && elm.is_coupon) {
      if (couponData.coupon_type == "percent") { 
        itemPrice = elm.price - (elm.price / 100) * couponData.value;
      } else if (couponData.coupon_type == "amount") {
        itemPrice = elm.price - couponData.value;
      }
      return (
        <td>
          <span className="money price price-sale">{currency.symbol}{(itemPrice * elm.quantity).toFixed(currency.decimals)}</span>
          <span className="money price price-old">{currency.symbol}{(elm.price * elm.quantity).toFixed(currency.decimals)}</span>
        </td>
      );
    } else {
      return <td>{(elm.price * elm.quantity).toFixed(currency.decimals)}{ currency.symbol }</td>;
    }
  };
  const isExpired = (end_date) => { return new Date(end_date) < new Date(); };
  return (
    <>
    <FreeGiftFeature couponData={couponData}/>
    <BOGOFeature/>
    {cartProducts.length ? (
      <form onSubmit={onOrder}>
        <div className="checkout-form">
          <div className="billing-info__wrapper">
            <h4>BILLING DETAILS</h4>
            <div className="row">
              <div className="col-md-6 col-12">
                <div className="form-floating my-3">
                  <input type="text" className="form-control" id="checkout_first_name" placeholder="First Name" readOnly={isLoggedIn} name="billingAddress.first_name" value={formData.billingAddress.first_name} onChange={handleChange}/>
                  <label htmlFor="checkout_first_name">First Name</label>
                  {fieldErrors.first_name && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.first_name} </div> )}
                </div>
              </div>
              <div className="col-md-6 col-12">
                <div className="form-floating my-3">
                  <input type="text" className="form-control" id="checkout_last_name" placeholder="Last Name"   name="billingAddress.last_name" value={formData.billingAddress.last_name} onChange={handleChange}/>
                  <label htmlFor="checkout_last_name">Last Name</label>
                  {fieldErrors.last_name && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.last_name} </div> )}
                </div>
              </div>
              <div className="col-md-12">
                <div className="search-field my-3">
                  <div className={`form-label-fixed hover-container ${ idDDActive ? "js-content_visible" : "" }`}>
                    <label htmlFor="country" className="form-label"> Country / Region* </label>
                    <div className="js-hover__open">
                      <input type="text" className="form-control form-control-lg search-field__actor" id="country" name="billingAddress.country" value="Bahrain" readOnly placeholder="Bahrain"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-12">
                <div className="form-floating mt-3 mb-3">
                  <input type="text" className="form-control" id="checkout_street_address" placeholder="Area / Mantaqa *" readOnly={isLoggedIn} name="billingAddress.area" value={formData.billingAddress.area} onChange={handleChange} />
                  <label htmlFor="checkout_street_address"> Area / Mantaqa * </label>
                  {fieldErrors.area && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.area} </div> )}
                </div>
              </div>
              <div className="col-md-6 col-12">
                <div className="form-floating mt-3 mb-3">
                  <input type="text" className="form-control" id="checkout_street_address_2" placeholder="Building / Villa / Apartment" name="billingAddress.building" readOnly={isLoggedIn} value={formData.billingAddress.building} onChange={handleChange}  />
                  <label htmlFor="checkout_street_address_2"> Building / Villa </label>
                  {fieldErrors.building && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.building} </div> )}
                </div>
              </div>

              <div className="col-md-12">
                <div className="form-floating mt-3 mb-3">
                  <input type="text" className="form-control" id="checkout_region" placeholder="Region *" name="billingAddress.region" readOnly={isLoggedIn} value={formData.billingAddress.region} onChange={handleChange}  />
                  <label htmlFor="checkout_region"> Region * </label>
                  {fieldErrors.region && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.region} </div> )}
                </div>
              </div>
              {isLoggedIn && ( <Link className="btn-link btn-link_lg text-center fw-bold text-danger p-2" href={`/${locale}/account_edit_address`} target="_blank" > - Click to Edit Address - </Link> )}

              <div className="col-md-12">
                <div className="form-floating my-3">
                  <input type="email" className="form-control" id="billingAddress.email" placeholder="Your Mail *" name="billingAddress.email" readOnly={isLoggedIn} value={formData.billingAddress.email} onChange={handleChange}  />
                  <label htmlFor="checkout_email">Email Address *</label>
                  {fieldErrors.email && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.email} </div> )}
                </div>
              </div>
              <div className="col-md-12">
                <div className="form-floating my-3">
                  <input type="text" pattern="^\d{8}$" title="Only positive integers allowed" className="form-control" id="checkout_otp" placeholder="Eg. 50000000 *"  name="billingAddress.mobile" readOnly={isLoggedIn} value={formData.billingAddress.mobile} onChange={handleChange}  />
                  <label htmlFor="checkout_phone">Mobile Number (Eg. 50000000)*</label>
                  {fieldErrors.mobile && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.mobile} </div> )}
                  {fieldErrors.otp && ( <div style={{ color: "red", fontSize: "0.85rem" }}> {fieldErrors.otp} </div> )}
                </div>

                {!isLoggedIn && (
                    <div className="col-md-12">
                      {OTPError ? ( <div style={{ color: "red" }}>{OTPError}</div> ) : ( <div style={{ color: "green" }}>{OTPSuccess}</div> )}
                      {isOTPButton ? ( <button className="btn btn-primary w-100 text-uppercase" type="button" disabled={isSendOTPLoading} onClick={sendOTP} > {isSendOTPLoading ? "Loading..." : "Send OTP"} </button> ) : ( 
                        <>
                        {!isOTPVerified && ( 
                          <>
                            <div className="form-floating my-3">
                              <input type="number" className="form-control" id="billing_otp" placeholder="Eg. 1234 *" name="otp" value={formData.otp} onChange={handleChange} />
                              <label htmlFor="billing_otp"> OTP (Eg. 1234)* </label>
                            </div>
                            <button className="btn btn-primary w-100 text-uppercase" type="button" disabled={isSendOTPLoading} onClick={verifyOTP} >
                              {isSendOTPLoading ? "Loading..." : "Verify OTP"} 
                            </button>
                          </>
                        )}
                        </>
                      )}
                    </div>
                  )}
              </div>
              <div className="col-md-12">
                {!isLoggedIn && <div className="form-check mt-3">
                  <input className="form-check-input form-check-input_fill" type="checkbox" defaultValue="" id="create_account" onClick={(prev) => setCreateAccount(!createAccount)} name="create_account" />
                  <label className="form-check-label" htmlFor="create_account"> CREATE AN ACCOUNT? </label>
                </div>}
                <div className="form-check mb-3">
                  <input className="form-check-input form-check-input_fill" type="checkbox" defaultValue="" id="ship_different_address" onClick={handleCheckboxChange} name="shipping" />
                  <label className="form-check-label" htmlFor="ship_different_address" > SHIP TO A DIFFERENT ADDRESS? </label>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="mt-3 mb-3">
                <textarea className="form-control form-control_gray" placeholder="Order Notes (optional)" cols="30" rows="8" name="note" onChange={handleChange} value={ formData.note } ></textarea>
              </div>
            </div>
            {createAccount && <div className="col-md-12">
              <div className="form-floating my-3">
                <input type="password" className="form-control" id="password" placeholder="Password *" name="password" value={formData.password} onChange={handleChange}  />
                <label htmlFor="checkout_email">Password *</label>
              </div>
            </div>}

            {formData.shippingAdd == true ? (
              <div className="billing-info__wrapper mt-4">
                <h4>SHIPPING DETAILS</h4>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-floating my-3">
                      <input type="text" className="form-control" id="checkout_first_name" placeholder="First Name" name="shippingAddress.first_name" value={formData.shippingAddress.first_name} onChange={handleChange} required />
                      <label htmlFor="checkout_first_name">First Name</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating my-3">
                      <input type="text" className="form-control" id="checkout_last_name" placeholder="Last Name" name="shippingAddress.last_name" value={formData.shippingAddress.last_name} onChange={handleChange} required />
                      <label htmlFor="checkout_last_name">Last Name</label>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="search-field my-3">
                      <div className={`form-label-fixed hover-container ${ idDDActive ? "js-content_visible" : "" }`}>
                        <label htmlFor="country" className="form-label"> Country / Region* </label>
                        <div className="js-hover__open">
                          <input type="text" className="form-control form-control-lg search-field__actor" id="country" name="shippingAddress.country" value="Bahrain" readOnly placeholder="Bahrain"/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-floating mt-3 mb-3">
                      <input type="text" className="form-control" id="checkout_street_address" placeholder="Address *" name="shippingAddress.area" value={formData.shippingAddress.area} onChange={handleChange} required />
                      <label htmlFor="checkout_company_name"> Area / Mantaqa * </label>
                    </div>
                    <div className="form-floating mt-3 mb-3">
                      <input type="text" className="form-control" id="checkout_street_address_2" placeholder="Building / Villa / Apartment" name="shippingAddress.building" value={formData.shippingAddress.building} onChange={handleChange} required />
                      <label htmlFor="checkout_company_name"> Building / Villa / Apartment </label>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-floating mt-3 mb-3">
                      <input type="text" className="form-control" id="checkout_region" placeholder="Region *" name="shippingAddress.region" value={formData.shippingAddress.region} onChange={handleChange} required />
                      <label htmlFor="checkout_region"> Region * </label>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input type="email" className="form-control" id="checkout_email" placeholder="Your Mail *" name="shippingAddress.email" value={formData.shippingAddress.email} onChange={handleChange} required />
                      <label htmlFor="checkout_email">Email Address *</label>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-floating my-3">
                      <input type="text" pattern="^\d{8}$" title="Only positive integers allowed" className="form-control" id="checkout_phone" placeholder="Eg. 50000000 *" name="shippingAddress.mobile" value={formData.shippingAddress.mobile} onChange={handleChange} required />
                      <label htmlFor="checkout_phone">Phone (Eg. 50000000)*</label>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

          </div>
          <div className="checkout__totals-wrapper">
            <div className="sticky-content">
              <div className="checkout__totals">
                <h3>Your Order</h3>
                <div className="cart-items-collapse">
                  <table className="checkout-cart-items">
                    <thead> <tr> <th>PRODUCT</th> <th>SUBTOTAL</th> </tr> </thead>
                    <tbody> {cartProducts.map((elm, i) => ( <tr key={i}> <td> {he.decode(elm.product_name)} x {elm.quantity} </td> {subTotalPrice(elm)} </tr> ))} </tbody>
                  </table>
                </div>
                <table className="checkout-totals">
                  <tbody> 
                    <tr> <th>SUBTOTAL</th> <td>{totalPrice.toFixed(currency.decimals)}{ currency.symbol }</td> </tr>
                    <tr> <th>SHIPPING</th> <td>{freeShippingFlag ? 'You Got Free Shipping' : `Shipping Cost: ${ shippingServiceCharges[0].price }${ currency.symbol}`}</td> </tr>
                    <tr>
                      <th>TOTAL</th>
                      <td>{!freeShippingFlag ? 
                      (parseFloat(shippingServiceCharges[0].price) + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(currency.decimals) : 
                      (0 + totalPrice + parseFloat(shippingServiceCharges[1].price)).toFixed(currency.decimals)}{ currency.symbol } 
                      (includes { !freeShippingFlag ? (
                          ((parseFloat(shippingServiceCharges[0].price) - parseFloat(shippingServiceCharges[0].price) / (1 + parseFloat(vatTax.percentage / 100))) +
                            (parseFloat(totalPrice) - parseFloat(totalPrice) / (1 + parseFloat(vatTax.percentage / 100))) +
                            (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + parseFloat(vatTax.percentage / 100)))
                          ).toFixed(currency.decimals)) : (
                          ( 0 + (parseFloat(totalPrice) - parseFloat(totalPrice) / (1 + parseFloat(vatTax.percentage / 100))) + (parseFloat(shippingServiceCharges[1].price) - parseFloat(shippingServiceCharges[1].price) / (1 + parseFloat(vatTax.percentage / 100)))).toFixed(currency.decimals)) }{ currency.symbol } VAT)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* <div > */}
                {/* <form
                  onSubmit={applyCoupon}
                  className="position-relative bg-body"
                > */}
                  {/* {couponError ? <div style={{ color: 'red' }}>{couponError}</div> : <div style={{ color: 'green' }}>{couponSuccess}</div>}
                  <input
                    className="form-control"
                    type="text"
                    name="coupon_code"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={handleCouponChange}
                  />
                  {
                    !couponData ? <input
                      className="btn-link fw-medium position-absolute top-0 end-0 h-100 px-4 my-5"
                      type="button"
                      value="APPLY COUPON"
                      onClick={applyCoupon}
                    /> : <input
                      className="btn-link fw-medium position-absolute top-0 end-0 h-100 px-4 my-5"
                      type="button"
                      value="REMOVE COUPON"
                      onClick={removeCoupon}
                    />
                  } */}
                {/* </form> */}
                {/* <br/> */}
                {/* <button className="btn btn-light">UPDATE CART</button> */}
              {/* </div> */}
              <div className="checkout__payment-methods">
                <div className="form-check">
                  <input className="form-check-input form-check-input_fill" type="radio" name="checkout_payment_method" id="checkout_payment_method_3" value={'cod'} checked={selectedOption === 'cod'} onChange={handleRadioChange} />
                  <label className="form-check-label" htmlFor="checkout_payment_method_3" > Cash on delivery </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input form-check-input_fill" type="radio" name="checkout_payment_method" id="checkout_payment_method_4" value={'tap'} checked={selectedOption === 'tap'} onChange={handleRadioChange} />
                  <label className="form-check-label" htmlFor="checkout_payment_method_4" > 
                    Tap - Credit / Debit Card
                    <svg  width="100" height="20" xmlns="http://www.w3.org/2000/svg" id="Layer_1" viewBox="0 0 1679.5 696.5">
                      <path style={{ fill: '#000', 'stroke-width': '0px' }} class="cls-1" d="M790.2,41h-52.6v105.3h-.1v44.9h.1v206.4c0,20.1.7,36,2.1,47.7,1.4,11.7,4.8,23.3,10.2,34.7,11.9,23.6,32.2,38.9,60.7,45.8,28.6,6.9,60.5,6.7,95.8-.5v-46c-29.2,4.7-52.6,5.3-70,1.8s-30.2-12.7-38.4-27.7c-3.7-6.6-6-13.8-6.8-21.9s-1.1-19.7-.9-34.9v-205.3h116.1v-44.9s-76.8,1.2-116.1,1.2h-13.7c-3.7,0-10,.5-10-1,0-7,23.7-2,23.7-11V41h-.1Z"/>
                      <path style={{ fill: '#000', 'stroke-width': '0px' }} class="cls-1" d="M1264.6,246.4c-1.6-13-4.7-24.7-9.1-35.3-10.1-24.3-27.1-43-51.2-56-24.1-13-53.6-19.5-88.4-19.5s-75.6,9.3-101.9,27.9c-26.3,18.6-43.9,45-52.8,79.1l51.3,15.1c6.8-24.8,19-43.1,36.7-54.9,17.7-11.8,39.6-17.7,65.8-17.7s44.6,3.9,59.5,11.8c14.9,7.8,25.5,19.8,31.9,35.8,5.7,14.2,8.6,31.8,9,53.1-4.8.7-9.8,1.3-14.7,1.9-39.5,5.2-70.8,9.4-93.7,12.8-22.9,3.4-44.2,7.5-63.9,12.5-30.2,7.9-53.8,20.9-70.7,39-17,18-25.4,41.9-25.4,71.6s4.9,39.4,14.7,56.5,24.5,30.6,44,40.7c19.6,10,43.1,15.1,70.7,15.1s47.8-3.7,68.2-11.2c20.5-7.5,38.2-18.6,53.2-33.5,8.5-8.4,15.9-17.9,22.4-28.5l8.4-15.2c11.6,2.7-8.4,17.2-8.4,49s0,28.9,0,28.9h47v-235.1c0-16.1-.8-30.7-2.5-43.7h0l-.1-.2ZM1213.8,362.4c-.7,10.5-2.1,20.4-4.2,29.5-3.5,19.2-10.8,36.2-21.8,51-11,14.9-25.5,26.4-43.5,34.7-18,8.3-38.6,12.5-61.8,12.5s-35-3.2-47.4-9.5c-12.4-6.3-21.5-14.5-27.2-24.6-5.7-10-8.6-20.9-8.6-32.6,0-18.7,6.1-33.4,18.2-44,12.2-10.7,27.7-18.6,46.7-24,18-4.9,38.4-9,61.2-12.3,22.8-3.3,51.2-6.9,85.1-10.9l4.2-.5c0,11.5-.4,21.8-1,30.7h.1Z"/>
                      <path style={{ fill: '#000', 'stroke-width': '0px' }} class="cls-1" d="M1659.5,233.1c-13.4-30.3-32.8-54.1-57.9-71.4-25.2-17.3-54.7-26-88.6-26s-64.3,8.6-89,25.6c-36.3,25.7-36.5,46.2-43,46.2s6.7-16,6.7-28.5v-32.7h-47.4v550.2h53v-189.4c0-25.5-12.5-33-6.3-35,6.2-2,13.9,21.4,36.6,37.6,24.4,17.4,53.6,26.1,87.5,26.1s64.6-8.6,90-26c25.4-17.3,44.8-41.2,58.2-71.6,13.4-30.4,20.2-64.7,20.2-102.8s-6.7-72-20.2-102.3h.2ZM1610.2,413.3c-8.9,22.9-22.2,40.9-39.8,54-17.7,13.1-39.2,19.7-64.7,19.7s-47.4-6.4-65.1-19.3c-17.7-12.9-30.9-30.7-39.7-53.5-8.8-22.8-13.2-49.1-13.2-78.8s4.3-56.5,13-78.9c8.6-22.4,21.8-40.1,39.3-52.8s39.1-19.1,64.6-19.1,48.2,6.5,66,19.5c17.8,13,31.1,30.9,39.8,53.7,8.8,22.8,13.2,48.7,13.2,77.7s-4.5,55-13.3,77.9h0l-.1-.1Z"/>
                      <path style={{ fill: '#000', 'stroke-width': '0px' }} class="cls-1" d="M286.8,41c135.5,0,245.8,110.3,245.8,245.8s-110.3,245.8-245.8,245.8S41,422.3,41,286.8,151.2,41,286.8,41ZM286.8,0C128.4,0,0,128.4,0,286.8s128.4,286.8,286.8,286.8,286.8-128.4,286.8-286.8S445.1,0,286.8,0Z"/>
                      <path style={{ fill: '#000', 'stroke-width': '0px' }} class="cls-1" d="M286.8,122.9c90.4,0,163.9,73.5,163.9,163.9s-73.5,163.9-163.9,163.9-163.9-73.5-163.9-163.9,73.5-163.9,163.9-163.9ZM286.8,81.9c-113.1,0-204.8,91.7-204.8,204.8s91.7,204.8,204.8,204.8,204.8-91.7,204.8-204.8-91.7-204.8-204.8-204.8Z"/>
                    </svg>
                  </label>
                </div>
                <div className="policy-text">
                  Your personal data will be used to process your order, support
                  your experience throughout this website, and for other
                  purposes described in our
                  <Link href={`/${locale}/privacy`} target="_blank"> privacy policy </Link>
                  .
                </div>
                <br/>
                <label ref={termsRef} className={`d-flex align-items-center form-check-label ${termsError ? 'text-danger' : ''}`} style={termsError ? { border: '1px solid #dc3545', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(220, 53, 69, 0.05)' } : {}}>
                  <input type="checkbox"  checked={termsChecked} onChange={(e) => { setTermsChecked(e.target.checked); setTermsError(false); }} className="form-check-input mt-0 me-2" />
                  <span>I have read and agree to the website <Link href={`/${locale}/terms`} target="_blank" style={{ textDecoration: 'underline' }}>terms and conditions</Link> *</span>
                </label>
              </div>
              {error ? <div id="general_error_msg" style={{ color: 'red' }}>{error}</div> : <div style={{ color: 'green' }}>{success}</div>}

              <button
                className="btn btn-primary w-100 text-uppercase btn-checkout"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      {/* </form> */}

      </form>
      ) : (
        <>
          <div className="fs-20">Shop cart is empty</div>

          <button className="btn mt-3 mb-3 btn-light">
            <Link href={`/${locale}/shop`}>Explore Products</Link>
          </button>
        </>
      )}
    </>
  );
}
