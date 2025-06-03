"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save these settings to your backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Preferences</h2>
          
          <div style={styles.setting}>
            <div>
              <label htmlFor="notifications" style={styles.label}>
                Email Notifications
              </label>
              <p style={styles.settingDescription}>
                Receive email notifications about your account
              </p>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                id="notifications"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                style={styles.switchInput}
              />
              <span style={styles.slider}></span>
            </label>
          </div>

          <div style={styles.setting}>
            <div>
              <label htmlFor="darkMode" style={styles.label}>
                Dark Mode
              </label>
              <p style={styles.settingDescription}>
                Switch between light and dark theme
              </p>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                id="darkMode"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                style={styles.switchInput}
              />
              <span style={styles.slider}></span>
            </label>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => router.back()}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button type="submit" style={styles.saveButton}>
            Save Changes
          </button>
        </div>

        {saved && (
          <div style={styles.successMessage}>
            Settings saved successfully!
          </div>
        )}
      </form>
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
  form: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "2rem",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  },
  section: {
    marginBottom: "2.5rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    marginBottom: "1.5rem",
    color: "#111827",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid #e5e7eb",
  },
  setting: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    marginBottom: "0.25rem",
    color: "#111827",
    fontWeight: 500,
  },
  settingDescription: {
    margin: 0,
    color: "#6b7280",
    fontSize: "0.875rem",
  },
  switch: {
    position: "relative",
    display: "inline-block",
    width: "3.5rem",
    height: "2rem",
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  slider: {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#e5e7eb",
    transition: ".4s",
    borderRadius: "2rem",
  },
  "input:checked + slider": {
    backgroundColor: "#4f46e5",
  },
  "input:focus + slider": {
    boxShadow: "0 0 1px #4f46e5",
  },
  "slider:before": {
    position: "absolute",
    content: "",
    height: "1.5rem",
    width: "1.5rem",
    left: "0.25rem",
    bottom: "0.25rem",
    backgroundColor: "white",
    transition: ".4s",
    borderRadius: "50%",
  },
  "input:checked + slider:before": {
    transform: "translateX(1.5rem)",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "2rem",
  },
  saveButton: {
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
  cancelButton: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
    border: "1px solid #e5e7eb",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "0.875rem",
    transition: "background-color 0.2s",
  },
  successMessage: {
    marginTop: "1rem",
    padding: "0.75rem 1rem",
    backgroundColor: "#f0fdf4",
    color: "#166534",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    textAlign: "center",
  },
} as const;
