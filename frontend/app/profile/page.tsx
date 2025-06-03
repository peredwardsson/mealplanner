"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "../../utils/api";

export default function ProfilePage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(apiUrl("/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user");
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <div style={styles.loading}>Loading profile...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Profile</h1>
      <div style={styles.card}>
        <h2>Account Information</h2>
        <div style={styles.infoGroup}>
          <label style={styles.label}>Email</label>
          <div style={styles.value}>{user?.email}</div>
        </div>
        <button 
          onClick={() => router.push("/reset-password")}
          style={styles.button}
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem 1rem",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "2rem",
    color: "#111827",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "2rem",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  },
  infoGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    color: "#6b7280",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  value: {
    fontSize: "1rem",
    color: "#111827",
  },
  button: {
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "0.875rem",
    transition: "background-color 0.2s",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "1.125rem",
    color: "#6b7280",
  },
} as const;
