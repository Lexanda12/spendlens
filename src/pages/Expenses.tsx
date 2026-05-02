import { useState, useMemo } from 'react';
import { useExpenses, useCategories } from '@/lib/store';
import type { Expense } from '../lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';

export function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');

  const resetForm = () => {
    setAmount('');
    setVendor('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCategoryId('');
    setNote('');
    setEditingId(null);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setAmount(expense.amount.toString());
    setVendor(expense.vendor);
    setDate(expense.date);
    setCategoryId(expense.categoryId);
    setNote(expense.note || '');
    setIsSheetOpen(true);
  };

  const handleSave = () => {
    if (!amount || !vendor || !categoryId || !date) return;

    if (editingId) {
      updateExpense(editingId, {
        amount: parseFloat(amount),
        vendor,
        date,
        categoryId,
        note,
      });
    } else {
      addExpense({
        id: crypto.randomUUID(),
        amount: parseFloat(amount),
        vendor,
        date,
        categoryId,
        note,
        currency: 'NGN',
        createdAt: new Date().toISOString(),
      });
    }
    setIsSheetOpen(false);
    resetForm();
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => e.vendor.toLowerCase().includes(search.toLowerCase()) || e.note?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, search]);

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    filteredExpenses.forEach(e => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return groups;
  }, [filteredExpenses]);

  return (
    <div className="p-4 space-y-4 relative min-h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary-muted" />
        <Input
          placeholder="Search expenses..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-6 pb-20">
        {Object.entries(groupedExpenses).map(([dateStr, dayExpenses]) => (
          <div key={dateStr} className="space-y-2">
            <div className="text-xs font-semibold text-primary-muted uppercase tracking-wider">
              {format(parseISO(dateStr), 'MMM d, yyyy')}
            </div>
            {dayExpenses.map(expense => {
              const category = categories.find(c => c.id === expense.categoryId);
              return (
                <Card key={expense.id} className="cursor-pointer hover:border-accent transition-colors" onClick={() => handleOpenEdit(expense)}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${category?.colorHex}20`, color: category?.colorHex }}>
                        {category?.icon}
                      </div>
                      <div>
                        <div className="font-medium">{expense.vendor}</div>
                        <div className="text-xs text-primary-muted">{category?.name}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-right">
                      ₦{expense.amount.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}

        {filteredExpenses.length === 0 && (
          <div className="text-sm text-primary-muted text-center py-8">
            No expenses found.
          </div>
        )}
      </div>

      <button
        onClick={() => { resetForm(); setIsSheetOpen(true); }}
        className="fixed bottom-20 right-6 w-14 h-14 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-20 md:absolute"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsSheetOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl p-4 z-40 max-h-[90vh] overflow-y-auto mx-auto max-w-md border-x border-border"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4 pb-6">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategoryId(c.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-colors ${categoryId === c.id ? 'border-accent bg-accent/10' : 'border-border bg-surface hover:bg-border/50'}`}
                      >
                        <span className="text-2xl mb-1">{c.icon}</span>
                        <span className="text-xs">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Amount (₦)</label>
                  <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Vendor</label>
                  <Input placeholder="E.g. Shoprite" value={vendor} onChange={(e) => setVendor(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Date</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Note (Optional)</label>
                  <Input placeholder="What was this for?" value={note} onChange={(e) => setNote(e.target.value)} />
                </div>

                <div className="pt-4 flex space-x-3">
                  {editingId && (
                    <Button variant="danger" className="w-1/3" onClick={() => { deleteExpense(editingId); setIsSheetOpen(false); }}>
                      Delete
                    </Button>
                  )}
                  <Button className="flex-1 bg-accent hover:bg-accent-hover text-white" onClick={handleSave} disabled={!amount || !vendor || !categoryId || !date}>
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
