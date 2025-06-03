"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "../../utils/api";

interface Meal {
  id: number;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  },
  loadingSpinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    borderLeftColor: '#4f46e5',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '1rem',
    transition: 'background-color 0.2s',
  },
  dateSelector: {
    marginBottom: '2rem',
  },
  dateLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: '#374151',
  },
  dateInput: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    width: '100%',
    maxWidth: '300px',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    textAlign: 'center' as const,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  summaryValue: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '0.25rem',
  },
  summaryLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  mealsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  mealHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  mealName: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#111827',
  },
  mealCalories: {
    color: '#6b7280',
    fontWeight: 500,
  },
  mealDescription: {
    margin: '0.5rem 0 1rem',
    color: '#4b5563',
    fontSize: '0.9375rem',
    lineHeight: 1.5,
  },
  macros: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  macroItem: {
    textAlign: 'center' as const,
  },
  macroValue: {
    fontWeight: 600,
    color: '#111827',
  },
  macroLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  mealActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  editButton: {
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem 1rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  emptyStateButton: {
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '1rem',
    marginTop: '1rem',
    transition: 'background-color 0.2s',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' } as const,
    '100%': { transform: 'rotate(360deg)' } as const,
  },
} as const;

export default function MealsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const router = useRouter();

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(apiUrl(`/meals?date=${selectedDate}`), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch meals');
        }

        const data = await response.json();
        setMeals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [selectedDate, router]);

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const totalFat = meals.reduce((sum, meal) => sum + (meal.fat || 0), 0);

  if (loading && meals.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading your meals...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Meal Plans</h1>
        <button 
          onClick={() => router.push('/meals/add-meal')} 
          style={styles.addButton}
        >
          + Add Meal
        </button>
      </div>

      <div style={styles.dateSelector}>
        <label htmlFor="date" style={styles.dateLabel}>Select Date:</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.dateInput}
        />
      </div>

      <div style={styles.summaryCards}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{totalCalories}</div>
          <div style={styles.summaryLabel}>Calories</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{totalProtein}g</div>
          <div style={styles.summaryLabel}>Protein</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{totalCarbs}g</div>
          <div style={styles.summaryLabel}>Carbs</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{totalFat}g</div>
          <div style={styles.summaryLabel}>Fat</div>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.mealsContainer}>
        {meals.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No meals for this day</h3>
            <p>Add a meal to get started!</p>
            <button 
              onClick={() => router.push('/meals/add-meal')} 
              style={styles.emptyStateButton}
            >
              Add Your First Meal
            </button>
          </div>
        ) : (
          meals.map((meal) => (
            <div key={meal.id} style={styles.mealCard}>
              <div style={styles.mealHeader}>
                <h3 style={styles.mealName}>{meal.name}</h3>
                <div style={styles.mealCalories}>{meal.calories} cal</div>
              </div>
              {meal.description && (
                <p style={styles.mealDescription}>{meal.description}</p>
              )}
              <div style={styles.macros}>
                <div style={styles.macroItem}>
                  <div style={styles.macroValue}>{meal.protein}g</div>
                  <div style={styles.macroLabel}>Protein</div>
                </div>
                <div style={styles.macroItem}>
                  <div style={styles.macroValue}>{meal.carbs}g</div>
                  <div style={styles.macroLabel}>Carbs</div>
                </div>
                <div style={styles.macroItem}>
                  <div style={styles.macroValue}>{meal.fat}g</div>
                  <div style={styles.macroLabel}>Fat</div>
                </div>
              </div>
              <div style={styles.mealActions}>
                <button style={styles.editButton}>Edit</button>
                <button style={styles.deleteButton}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
