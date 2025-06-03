'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '../utils/api';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface Meal {
  id: number;
  name: string;
  category: string;
  taste_profile: string;
  cost: string;
}

interface DayAssignment {
  day: string;
  meal: Meal | null;
}

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export default function WeeklyView() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [assignments, setAssignments] = useState<DayAssignment[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    return monday.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch meals
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(apiUrl('meals'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch meals');
        
        const data = await response.json();
        setMeals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meals');
      }
    };

    fetchMeals();
  }, [router]);

  // Fetch weekly assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Get the year and week number from selectedWeek
        const date = new Date(selectedWeek);
        const year = date.getFullYear();
        const weekNumber = getWeekNumber(date);

        const response = await fetch(
          apiUrl(`weeks/${year}/${weekNumber}`),
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          if (response.status === 404) {
            // No assignments exist for this week yet, initialize with empty assignments
            setAssignments(daysOfWeek.map(day => ({ day, meal: null })));
            return;
          }
          throw new Error('Failed to fetch schedule');
        }

        const data = await response.json();
        setAssignments(data.days || daysOfWeek.map(day => ({ day, meal: null })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    if (meals.length > 0) {
      fetchAssignments();
    }
  }, [selectedWeek, meals, router]);

  // Helper function to get ISO week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Handle meal assignment
  const handleAssignMeal = async (dayIndex: number, mealId: number | null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const date = new Date(selectedWeek);
      date.setDate(date.getDate() + dayIndex);
      const year = date.getFullYear();
      const weekNumber = getWeekNumber(date);
      const day = daysOfWeek[dayIndex].toLowerCase();

      const response = await fetch(
        apiUrl(`weeks/${year}/${weekNumber}/days/${day}`),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ meal_id: mealId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update schedule');
      }

      // Get the updated assignment from the response
      const data = await response.json();
      
      // Update local state
      setAssignments(prev => {
        const newAssignments = [...prev];
        newAssignments[dayIndex] = {
          day: data.day,
          meal: data.meal || null
        };
        return newAssignments;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
    }
  };

  // Drag and drop handlers
  const DraggableMeal = ({ meal }: { meal: Meal }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'meal',
      item: { id: meal.id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        style={{
          ...styles.draggableMeal,
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        {meal.name}
      </div>
    );
  };

  const DroppableDay = ({ day, index }: { day: string; index: number }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'meal',
      drop: (item: { id: number }) => {
        handleAssignMeal(index, item.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    const assignment = assignments[index];
    return (
      <div
        ref={drop}
        style={{
          ...styles.dayContainer,
          backgroundColor: isOver ? '#e0e7ff' : undefined,
        }}
      >
        <div style={styles.dayHeader}>
          <h3 style={styles.dayName}>{day}</h3>
          <div style={styles.mealSlot}>
            {assignment.meal ? (
              <div style={styles.assignedMeal}>
                <p style={styles.mealName}>{assignment.meal.name}</p>
                <p style={styles.mealDetails}>
                  {assignment.meal.category} • {assignment.meal.taste_profile}
                </p>
              </div>
            ) : (
              <p style={styles.emptySlot}>Drag meal here</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Navigate to previous/next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const date = new Date(selectedWeek);
    date.setDate(date.getDate() + (direction === 'prev' ? -7 : 7));
    setSelectedWeek(date.toISOString().split('T')[0]);
  };

  // Get formatted date range for the week
  const getWeekRange = () => {
    const start = new Date(selectedWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (loading && assignments.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading schedule...</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Weekly Meal Planner</h1>
          <div style={styles.weekNavigation}>
            <button 
              onClick={() => navigateWeek('prev')}
              style={styles.navButton}
            >
              &larr; Previous Week
            </button>
            <h2 style={styles.weekTitle}>
              {new Date(selectedWeek).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {' - Week ' + getWeekNumber(new Date(selectedWeek))}
            </h2>
            <button 
              onClick={() => navigateWeek('next')}
              style={styles.navButton}
            >
              Next Week &rarr;
            </button>
          </div>
          <p style={styles.weekRange}>{getWeekRange()}</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.mainContent}>
          <div style={styles.mealsList}>
            <h3 style={styles.sectionTitle}>Available Meals</h3>
            <div style={styles.draggableArea}>
              {meals.map((meal) => (
                <DraggableMeal key={meal.id} meal={meal} />
              ))}
            </div>
          </div>

          <div style={styles.weekGrid}>
            <h3 style={styles.sectionTitle}>Weekly Schedule</h3>
            <div style={styles.daysContainer}>
              {daysOfWeek.map((day, index) => (
                <DroppableDay key={day} day={day} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    color: '#111827',
  },
  weekNavigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  navButton: {
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
    border: '1px solid #c7d2fe',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 500,
  },
  weekTitle: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#374151',
  },
  weekRange: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: '2rem',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '2rem',
  },
  mealsList: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    margin: 0,
    marginBottom: '1rem',
    fontSize: '1.25rem',
    color: '#374151',
  },
  draggableArea: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  draggableMeal: {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'move',
    minWidth: '150px',
  },
  weekGrid: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  daysContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1rem',
  },
  dayContainer: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    minHeight: '150px',
  },
  dayHeader: {
    marginBottom: '1rem',
  },
  dayName: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
  },
  mealSlot: {
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedMeal: {
    backgroundColor: '#e0e7ff',
    padding: '1rem',
    borderRadius: '0.5rem',
  },
  mealName: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 500,
    color: '#111827',
  },
  mealDetails: {
    margin: '0.25rem 0 0',
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  emptySlot: {
    color: '#9ca3af',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    borderLeftColor: '#4f46e5',
    animation: 'spin 1s linear infinite',
  },
} as const;

// Add CSS animation for the spinner
const keyframes = {
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
};
