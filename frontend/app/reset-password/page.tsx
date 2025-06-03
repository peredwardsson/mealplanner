"use client";
import { useState } from "react";
import { apiUrl } from '../../utils/api';
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(apiUrl('/auth/reset-password'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, new_password: newPassword }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to reset password");
      }
      
      setSuccess(true);
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
        <h1 style={{ textAlign: "center", marginBottom: 24, fontWeight: 600, fontSize: 28 }}>Reset Password</h1>
        
        {success ? (
          <div style={{
            padding: 16,
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 6,
            color: "#166534",
            marginBottom: 24,
            textAlign: "center"
          }}>
            Password has been reset successfully! You can now <Link href="/login" style={{ color: "#166534", fontWeight: 600, textDecoration: "underline" }}>login</Link> with your new password.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="reset-email" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Email</label>
              <input
                id="reset-email"
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
            
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="new-password" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>New Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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
              <label htmlFor="confirm-password" style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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
              {loading ? "Resetting..." : "Reset Password"}
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
            
            <div style={{ marginTop: 24, textAlign: "center", fontSize: 14 }}>
              Remember your password?{' '}
              <Link href="/login" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 500 }}>
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
