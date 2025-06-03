"use client";

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/reset-password';
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Redirect to dashboard if logged in and on auth pages
    if (token && isAuthPage) {
      router.push('/dashboard');
    }
    // Redirect to login if not logged in and on protected pages
    else if (!token && !isAuthPage && pathname !== '/') {
      router.push('/login');
    }
  }, [token, pathname, router]);

  return (
    <nav style={{
      display: "flex",
      gap: 24,
      padding: "16px 24px",
      borderBottom: "1px solid #e5e7eb",
      backgroundColor: "#f9fafb"
    }}>
      <Link 
        href="/" 
        style={{
          textDecoration: "none",
          color: "#111827",
          fontWeight: 600,
          fontSize: "1.1rem"
        }}
      >
        Meal Planner
      </Link>
      <div style={{ flex: 1 }}></div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {token ? (
          <>
            <Link 
              href="/dashboard" 
              style={{
                textDecoration: "none",
                color: "#111827",
                fontWeight: 500,
                fontSize: "0.9rem"
              }}
            >
              Dashboard
            </Link>
            <Link 
              href="/meals" 
              style={{
                textDecoration: "none",
                color: "#111827",
                fontWeight: 500,
                fontSize: "0.9rem"
              }}
            >
              Meals
            </Link>
            <Link 
              href="/weekly" 
              style={{
                textDecoration: "none",
                color: "#111827",
                fontWeight: 500,
                fontSize: "0.9rem"
              }}
            >
              Weekly
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              style={{
                backgroundColor: '#e0e7ff',
                color: '#4f46e5',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              href="/login" 
              style={{
                textDecoration: "none",
                color: "#111827",
                fontWeight: 500
              }}
            >
              Login
            </Link>
            <Link 
              href="/register" 
              style={{
                textDecoration: "none",
                color: "#4f46e5",
                fontWeight: 500
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#4338ca"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4f46e5"}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
