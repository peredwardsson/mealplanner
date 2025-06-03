"use client";
import { useState, useRef } from "react";
import { apiUrl } from '../../utils/api';
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const res = await fetch(apiUrl('/auth/login'), {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Login failed");
      } else {
        const { access_token } = await res.json();
        localStorage.setItem("token", access_token);
        setSuccess(true);
        // Redirect to dashboard after a short delay to show success message
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
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
        <h1 style={{ textAlign: "center", marginBottom: 24, fontWeight: 600, fontSize: 28 }}>Welcome Back</h1>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="login-email" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 16,
                boxSizing: "border-box"
              }}
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="login-password" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 16,
                boxSizing: "border-box"
              }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1,
              transition: "background-color 0.2s"
            }}
            onMouseOver={e => !loading && (e.currentTarget.style.backgroundColor = "#4338ca")}
            onMouseOut={e => !loading && (e.currentTarget.style.backgroundColor = "#4f46e5")}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          
          {error && (
            <div style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              color: "#b91c1c",
              fontSize: 14
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 6,
              color: "#166534",
              fontSize: 14
            }}>
              Login successful! Redirecting...
            </div>
          )}
          
          <div style={{ marginTop: 24, textAlign: "center", fontSize: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              Don't have an account?{' '}
              <Link href="/register" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>
                Sign up
              </Link>
            </div>
            <div>
              <Link href="/reset-password" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
