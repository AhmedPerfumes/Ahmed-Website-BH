"use client";
import React, { useState } from "react";
// import StoreMap from "./StoreMap";
// import { storesLocations } from "@/data/storeLocations";
import Script from "next/script";

export default function StoreLocator() {
  return (
    <>
      <Script
        src="https://cdnsl.brandwizard.io/dist/widget.min.js"
        strategy="afterInteractive"
      />
      <div data-rd-locator="185f1188-4762-499b-bd2a-4612c5b4f101"></div>
    </>
  );
}
