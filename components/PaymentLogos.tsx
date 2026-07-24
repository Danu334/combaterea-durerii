"use client";
import React from "react";

// Accepted-payment-method logos required by maib's e-commerce integration
// requirements (https://docs.maibmerchants.md/main/ro/integration/requirements).
// These are self-contained marks so there are no missing-asset risks. If maib
// asks for their exact official artwork, drop the files in /public and swap the
// <img> in place of the wordmark spans below.

const badge: React.CSSProperties = {
  background: "#fff",
  borderRadius: "6px",
  padding: "6px 10px",
  height: "32px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
};

export function MaibLogo() {
  return (
    <span style={badge} aria-label="maib">
      <span style={{ color: "#0a5c46", fontWeight: 800, fontSize: "16px", letterSpacing: "0.3px", fontFamily: "Arial, sans-serif" }}>
        maib
      </span>
    </span>
  );
}

export function VisaLogo() {
  return (
    <span style={badge} aria-label="Visa">
      <span style={{ color: "#1A1F71", fontWeight: 800, fontStyle: "italic", fontSize: "17px", letterSpacing: "0.5px", fontFamily: "Arial, sans-serif" }}>
        VISA
      </span>
    </span>
  );
}

export function MastercardLogo() {
  return (
    <span style={badge} aria-label="Mastercard">
      <svg width="34" height="21" viewBox="0 0 34 21" role="img" aria-label="Mastercard">
        <circle cx="12" cy="10.5" r="9.5" fill="#EB001B" />
        <circle cx="22" cy="10.5" r="9.5" fill="#F79E1B" />
        <path d="M17 3.2a9.5 9.5 0 0 0 0 14.6 9.5 9.5 0 0 0 0-14.6z" fill="#FF5F00" />
      </svg>
    </span>
  );
}

export default function PaymentLogos({ label }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {label && <span style={{ color: "#9ca3af", fontSize: "12px", marginRight: "2px" }}>{label}</span>}
      <MaibLogo />
      <VisaLogo />
      <MastercardLogo />
    </div>
  );
}
