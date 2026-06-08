"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import DeveloperCredit from "./DeveloperCredit";

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li style={{ listStyle: "none" }}>
    <Link
      href={href}
      style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.color = "#c9a84c")}
      onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  return (
    <footer style={{
      background: "#101828",
      color: "#fff",
      width: "100%",
      fontFamily: "sans-serif",
      boxSizing: "border-box",
    }}>
      <div style={{
        width: "100%",
        padding: "36px 40px 0 40px",
        boxSizing: "border-box",
      }}>

        {/* Main grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "32px",
        }}>

          {/* 1. Brand & Mission */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "#fff", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid #374151", flexShrink: 0,
              }}>
                <Image src="/images/logo.jpg" alt="Logo" width={36} height={36} style={{ objectFit: "cover" }} />
              </div>
              <span style={{ fontSize: "17px", fontWeight: "700", letterSpacing: "-0.3px" }}>NoPainMoldova</span>
            </div>
            <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.6", maxWidth: "260px", margin: 0 }}>
              Pain is not a fatality. Let&apos;s manage it.
            </p>
            <Link
              href="https://nopainmoldova.org/contact/"
              style={{
                display: "inline-block",
                width: "fit-content",
                padding: "8px 18px",
                backgroundColor: "#02487d",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#3a5db0")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#02487d")}
            >
              Contact Us
            </Link>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 style={{
              color: "#fff", fontWeight: "600", marginBottom: "14px",
              fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 14px",
            }}>
              Navigation
            </h3>
            <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <FooterLink href="https://nopainmoldova.org/">Acasă</FooterLink>
              <FooterLink href="https://nopainmoldova.org/about-us/">Despre Noi</FooterLink>
              <FooterLink href="/shop">Bilete Congres</FooterLink>
              <FooterLink href="https://nopainmoldova.org/contact/">Contact</FooterLink>
            </ul>
          </div>

          {/* 3. Contact Details */}
          <div>
            <h3 style={{
              color: "#fff", fontWeight: "600",
              fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 14px",
            }}>
              Contact Info
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "#9ca3af" }}>
              <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#c9a84c" }}>📧</span>
                <a
                  href="mailto:mssmp.md@gmail.com"
                  style={{ color: "#9ca3af", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#c9a84c")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                >
                  mssmp.md@gmail.com
                </a>
              </p>
              <p style={{ margin: 0, display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ color: "#c9a84c" }}>📍</span>
                <span>Str. Bulgara 35, of. 11<br />Chișinău, MD-2001</span>
              </p>
            </div>
          </div>

          {/* 4. Social & QR */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <h3 style={{
              color: "#fff", fontWeight: "600",
              fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 14px",
            }}>
              Follow Us
            </h3>
            <div style={{ padding: "8px", background: "#fff", borderRadius: "8px", marginBottom: "14px" }}>
              <Image src="/images/NoPainQr.png" alt="QR Code" width={90} height={90} />
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#9ca3af", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
              >
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99h-2.54V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.12 22 16.99 22 12z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#9ca3af", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
              >
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-4.35.2-6.78 2.62-6.98 6.98C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.36-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84c-3.4 0-6.16 2.76-6.16 6.16s2.76 6.16 6.16 6.16 6.16-2.76 6.16-6.16-2.76-6.16-6.16-6.16zm0 10.16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.4-11.84c-.8 0-1.44.64-1.44 1.44s.64 1.44 1.44 1.44 1.44-.64 1.44-1.44-.64-1.44-1.44-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar — flush to edges */}
        <div style={{
          borderTop: "1px solid #1f2937",
          marginTop: "32px",
          padding: "20px 0",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}>
          <p style={{ color: "#6b7280", fontSize: "12px", margin: 0 }}>
            © {new Date().getFullYear()} NoPainMoldova. Toate drepturile rezervate.
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              { label: "Termeni și Condiții", href: "#" },
              { label: "Politică Privacy", href: "#" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                style={{ color: "#4b5563", fontSize: "12px", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#9ca3af")}
                onMouseLeave={e => (e.currentTarget.style.color = "#4b5563")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
      <DeveloperCredit />
    </footer>
  );
};

export default Footer;