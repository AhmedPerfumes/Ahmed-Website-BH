"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useUser } from "@/context/UserContext";

export default function LoginRegister() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("login");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [registerStep, setRegisterStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [customerId, setCustomerId] = useState(null);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [decodedCoupon, setDecodedCoupon] = useState(null);
  const [mobile, setMobile] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  const { setIsLoggedIn } = useUser();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!hasMounted) return;
    const token = localStorage.getItem("user");
    if (token) {
      router.replace(`/${locale}/account_dashboard`);
    }
  }, [hasMounted, router, locale]);

  // Capture & decode voucher from URL (?q=Base64Code)
  useEffect(() => {
    if (!hasMounted) return;
    const encodedCoupon = searchParams.get("q");
    if (encodedCoupon) {
      try {
        const decoded = atob(encodedCoupon);
        setDecodedCoupon(decoded);
        sessionStorage.setItem("voucher_coupon_code", decoded);
      } catch (e) {
        console.error("Failed to decode voucher:", e);
      }
    }
  }, [hasMounted, searchParams]);

  // Set tab from query param
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    setActiveTab(tabParam === "register" ? "register" : "login");
  }, [searchParams]);

  // Validate mobile input
  const validateMobile = (event) => {
    setMobile(event.currentTarget.value);
  };

  // Apply coupon after login/register
  const applyCoupon = async (token) => {
    const couponCode = sessionStorage.getItem("voucher_coupon_code");
    if (!couponCode) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/claim-voucher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coupon_code: couponCode }),
      });
    } catch (error) {
      console.error("Error applying coupon:", error);
    } finally {
      sessionStorage.removeItem("voucher_coupon_code");
    }
  };

  // ----------- REGISTER ------------
  async function onRegister(event) {
    event.preventDefault();
    setIsLoading(true);

    if (regMobile === "") {
      setError("Mobile Number is Required");
      setIsLoading(false);
      return;
    }
    if (!/^\d{8}$/.test(regMobile)) {
      setError("Invalid Mobile Number");
      setIsLoading(false);
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("name", regName);
      formData.append("email", regEmail);
      formData.append("mobile", regMobile);
      formData.append("password", regPassword);
      formData.append("voucher", decodedCoupon);
      // formData.append("is_voucher_claim", decodedCoupon ? "1" : "0");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/signup`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to submit registration");

      const data = await response.json();

      if (!data.message.startsWith("OTP")) {
        setError(data.message);
      } else {
        setSuccess(data.message);
        setCustomerId(data?.data?.id || null);
        setRegisterStep(2);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ----------- OTP VERIFICATION ------------
  async function onVerifyOtp(event) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        name: regName.trim(),
        email: regEmail.trim(),
        mobile: regMobile.trim(),
        password: regPassword.trim(),
        otp: otp.trim(),
        flag: "signup",
        voucher: decodedCoupon || "",
        is_voucher_claim: decodedCoupon ? 1 : 0,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.message?.toLowerCase().includes("customer")) {
        setError(data.message || "Invalid OTP");
      } else {
        setSuccess("Account verified successfully.");
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", btoa(JSON.stringify(data.data)));
        setIsLoggedIn(true);

        // Apply coupon
        await applyCoupon(data.access_token);

        router.push(`/${locale}/account_dashboard`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ----------- LOGIN ------------
  async function onLogin(event) {
    event.preventDefault();
    setIsLoading(true);

    if (mobile === "") {
      setError("Mobile Number is Required");
      setIsLoading(false);
      return;
    }
    if (!/^\d{8}$/.test(mobile)) {
      setError("Invalid Mobile Number");
      setIsLoading(false);
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData(event.currentTarget);
        formData.append("voucher", decodedCoupon);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/signin`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to login");

      const data = await response.json();

      if (!data.message.startsWith("Login")) {
        setError(data.message);
      } else {
        setSuccess(data.message);
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", btoa(JSON.stringify(data.data)));
        localStorage.removeItem("address");
        setIsLoggedIn(true);

        // Apply coupon
        await applyCoupon(data.access_token);

        router.push("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ----------- RENDER ------------
  return (
    <section className="login-register container">
      <h2 className="d-none">Login & Register</h2>

      <ul className="nav nav-tabs mb-5" role="tablist">
        <li className="nav-items" role="presentation">
          <button
            type="button"
            className={`border-0 bg-transparent nav-links nav-link_underscore ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
        </li>
        <li className="nav-items" role="presentation">
          <button
            type="button"
            className={`border-0 bg-transparent nav-links nav-link_underscore ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </li>
      </ul>

      <div className="tab-content pt-2">
        {/* LOGIN TAB */}
        <div className={`tab-pane fade ${activeTab === "login" ? "show active" : ""}`}>
          {error ? <div style={{ color: "red" }}>{error}</div> : <div style={{ color: "green" }}>{success}</div>}
          <div className="pb-3"></div>

          <form onSubmit={onLogin} className="needs-validation">
            <div className="form-floating mb-3">
              <input name="mobile" type="number" className="form-control form-control_gray" placeholder="Mobile Number *" onChange={validateMobile} required />
              <label>Mobile Number (Eg. 50000000)*</label>
            </div>

            <div className="form-floating mb-3">
              <input name="password" type="password" className="form-control form-control_gray" placeholder="********" required />
              <label>Password *</label>
            </div>

            <button className="btn btn-primary w-100 text-uppercase" type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Login"}
            </button>

            <div className="d-flex align-items-center mb-3 pb-2">
              <div className="form-check mb-0">
                <input name="remember" className="form-check-input form-check-input_fill" type="checkbox" />
                <label className="form-check-label text-secondary">Remember me</label>
              </div>
              <Link href="/reset_password" className="btn-text ms-auto">Lost password?</Link>
            </div>

            <div className="customer-option mt-4 text-center">
              <span className="text-secondary">No account yet?</span>{" "}
              <button type="button" className={`border-0 bg-transparent btn-text`} onClick={() => setActiveTab("register")}>Create Account</button>
            </div>
          </form>
        </div>

        {/* REGISTER TAB */}
        <div className={`tab-pane fade ${activeTab === "register" ? "show active" : ""}`}>
          {error ? <div style={{ color: "red" }}>{error}</div> : <div style={{ color: "green" }}>{success}</div>}
          <div className="pb-3"></div>

          {registerStep === 1 && (
            <form onSubmit={onRegister} className="needs-validation">
              <div className="form-floating mb-3">
                <input name="name" type="text" className="form-control form-control_gray" placeholder="User Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                <label>User Name</label>
              </div>

              <div className="form-floating mb-3">
                <input name="email" type="email" className="form-control form-control_gray" placeholder="Email Address *" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                <label>Email address *</label>
              </div>

              <div className="form-floating mb-3">
                <input name="mobile" type="number" className="form-control form-control_gray" placeholder="Mobile Number *" value={regMobile} onChange={(e) => setRegMobile(e.target.value)} required />
                <label>Mobile Number (Eg. 50000000)*</label>
              </div>

              <div className="form-floating mb-3">
                <input name="password" type="password" className="form-control form-control_gray" placeholder="********" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                <label>Password *</label>
              </div>

              <p className="mb-3">
                Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our privacy policy.
              </p>

              <button className="btn btn-primary w-100 text-uppercase" type="submit" disabled={isLoading}>
                {isLoading ? "Sending OTP..." : "Register"}
              </button>
            </form>
          )}

          {registerStep === 2 && (
            <form onSubmit={onVerifyOtp}>
              <div className="form-floating mb-3">
                <input name="otp" type="text" className="form-control form-control_gray" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                <label>Enter OTP *</label>
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-secondary text-white w-50" onClick={() => setRegisterStep(1)} disabled={isLoading}>
                  Change Mobile
                </button>
                <button type="submit" className="btn btn-primary w-50" disabled={isLoading || !otp.trim()}>
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
