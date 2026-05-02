import { useState } from 'react';
import { useBudgets, useCategories, useExpenses } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Trash2 } from 'lucide-react';
import { startOfMonth, isAfter, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';

export function Budgets() {
  const { budgets, setBudget, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const { expenses } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentMonthStart = startOfMonth(new Date());

  const currentMonthExpenses = expenses.filter(e =>
    isAfter(parseISO(e.date), currentMonthStart)
  );

  const resetForm = () => {
    setCategoryId('');
    setAmount('');
    setEditingId(null);
  };

  const handleOpenEdit = (budget: any) => {
    setEditingId(budget.id);
    setCategoryId(budget.categoryId);
    setAmount(budget.limitAmount.toString());
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!categoryId || !amount) return;

    setBudget({
      id: editingId || crypto.randomUUID(),
      categoryId,
      limitAmount: parseFloat(amount),
      period: 'monthly',
      createdAt: new Date().toISOString(),
    });

    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="p-4 space-y-4 relative min-h-full pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>

        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-accent hover:bg-accent-hover text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="space-y-4">
        {budgets.map(budget => {
          const category = categories.find(c => c.id === budget.categoryId);
          if (!category) return null;

          const spent = currentMonthExpenses
            .filter(e => e.categoryId === budget.categoryId)
            .reduce((sum, e) => sum + e.amount, 0);

          const percent = Math.min((spent / budget.limitAmount) * 100, 100);

          let barColor = 'bg-accent';
          if (percent >= 100) barColor = 'bg-danger';
          else if (percent >= 80) barColor = 'bg-warning';

          return (
            <Card
              key={budget.id}
              className="cursor-pointer hover:border-accent transition-colors"
              onClick={() => handleOpenEdit(budget)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{
                        backgroundColor: `${category.colorHex}20`,
                        color: category.colorHex,
                      }}
                    >
                      {category.icon}
                    </div>

                    <div>
                      <div className="font-semibold">{category.name}</div>
                      <div className="text-xs text-primary-muted">
                        {percent >= 100
                          ? 'Over budget'
                          : `${(100 - percent).toFixed(0)}% remaining`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">
                      ₦{spent.toLocaleString()}
                    </div>
                    <div className="text-xs text-primary-muted">
                      of ₦{budget.limitAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="h-2.5 w-full bg-border rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {budgets.length === 0 && (
          <div className="text-sm text-primary-muted text-center py-8 bg-surface rounded-xl border border-border border-dashed">
            You haven't set any budgets yet.
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-xl p-5 z-40 w-[90%] max-w-sm shadow-xl border border-border"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {editingId ? 'Edit Budget' : 'Set Budget'}
                </h2>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <select
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 text-sm"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  placeholder="Monthly limit"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />

                <div className="flex space-x-3 pt-4">
                  {editingId && (
                    <Button
                      variant="danger"
                      size="icon"
                      onClick={() => {
                        deleteBudget(editingId);
                        setIsModalOpen(false);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    className="flex-1 bg-accent hover:bg-accent-hover text-white"
                    onClick={handleSave}
                    disabled={!amount || !categoryId}
                  >
                    Save Budget
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