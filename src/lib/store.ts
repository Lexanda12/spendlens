import { useState, useEffect } from 'react';
import type { Category, Expense, Budget } from "./types";

// Default categories based on PRD
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food', icon: '🍔', colorHex: '#F97316' }, // Orange
  { id: 'cat-transport', name: 'Transport', icon: '🚗', colorHex: '#10B981' }, // Green
  { id: 'cat-housing', name: 'Housing', icon: '🏠', colorHex: '#3B82F6' }, // Blue
  { id: 'cat-health', name: 'Health', icon: '⚕️', colorHex: '#EF4444' }, // Red
  { id: 'cat-entertainment', name: 'Entertainment', icon: '🎮', colorHex: '#8B5CF6' }, // Purple
  { id: 'cat-other', name: 'Other', icon: '📦', colorHex: '#6B7280' }, // Gray
];

function getStorage<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('storage-update'));
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = getStorage<Category[]>('spendlens_categories', []);
    if (stored.length === 0) {
      setStorage('spendlens_categories', DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return stored;
  });

  useEffect(() => {
    const handleUpdate = () => setCategories(getStorage<Category[]>('spendlens_categories', []));
    window.addEventListener('storage-update', handleUpdate);
    return () => window.removeEventListener('storage-update', handleUpdate);
  }, []);

  const addCategory = (category: Category) => {
    const newCategories = [...categories, category];
    setStorage('spendlens_categories', newCategories);
  };

  return { categories, addCategory };
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => getStorage<Expense[]>('spendlens_expenses', []));

  useEffect(() => {
    const handleUpdate = () => setExpenses(getStorage<Expense[]>('spendlens_expenses', []));
    window.addEventListener('storage-update', handleUpdate);
    return () => window.removeEventListener('storage-update', handleUpdate);
  }, []);

  const addExpense = (expense: Expense) => {
    const newExpenses = [...expenses, expense];
    setStorage('spendlens_expenses', newExpenses);
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    const newExpenses = expenses.map(e => e.id === id ? { ...e, ...updated } : e);
    setStorage('spendlens_expenses', newExpenses);
  };

  const deleteExpense = (id: string) => {
    const newExpenses = expenses.filter(e => e.id !== id);
    setStorage('spendlens_expenses', newExpenses);
  };

  return { expenses, addExpense, updateExpense, deleteExpense };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>(() => getStorage<Budget[]>('spendlens_budgets', []));

  useEffect(() => {
    const handleUpdate = () => setBudgets(getStorage<Budget[]>('spendlens_budgets', []));
    window.addEventListener('storage-update', handleUpdate);
    return () => window.removeEventListener('storage-update', handleUpdate);
  }, []);

  const setBudget = (budget: Budget) => {
    const existing = budgets.findIndex(b => b.categoryId === budget.categoryId);
    let newBudgets = [...budgets];
    if (existing >= 0) {
      newBudgets[existing] = budget;
    } else {
      newBudgets.push(budget);
    }
    setStorage('spendlens_budgets', newBudgets);
  };

  const deleteBudget = (id: string) => {
    const newBudgets = budgets.filter(b => b.id !== id);
    setStorage('spendlens_budgets', newBudgets);
  };

  return { budgets, setBudget, deleteBudget };
}
