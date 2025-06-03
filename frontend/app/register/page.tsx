"use client";
import React, { useState, useRef } from "react";
import { apiUrl } from '../../utils/api';
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Autofocus email on mount
  React.useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
  const res = await fetch(apiUrl('/auth/register'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    let message = "Registration failed";
    try {
      const data = await res.json();
      if (data.detail) {
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          // FastAPI validation errors
          message = data.detail.map((d: any) => d.msg).join(", ");
        }
      }
    } catch {}
    setError(message);
  } else {
    setSuccess(true);
  }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f7fb" }}>
      <div style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        padding: 32,
        minWidth: 320,
        maxWidth: 400,
        width: "100%"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: 24, fontWeight: 600, fontSize: 28 }}>Create an Account</h1>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="register-email" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Email</label>
            <input
              ref={emailRef}
              id="register-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 16
              }}
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="register-password" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 16
              }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 6,
              background: loading ? "#d1d5db" : "#2563eb",
              color: "#fff",
              fontWeight: 600,
              fontSize: 18,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: 12
            }}
            aria-busy={loading}
          >
            {loading ? (
              <span>Registering<span className="animate-pulse">...</span></span>
            ) : (
              "Register"
            )}
          </button>
          {error && <div role="alert" style={{ color: "#dc2626", marginTop: 10, textAlign: "center" }}>{error}</div>}
          {success && (
            <div style={{ color: "#16a34a", marginTop: 10, textAlign: "center", fontWeight: 500 }}>
              Registration successful! You can now <Link href="/login" style={{ color: "#2563eb", textDecoration: "underline" }}>log in</Link>.
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
