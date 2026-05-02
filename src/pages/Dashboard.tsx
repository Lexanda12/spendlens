import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses, useCategories, useBudgets } from '@/lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { startOfMonth, subMonths, subDays, isAfter, parseISO } from 'date-fns';

export function Dashboard() {
  const { expenses } = useExpenses();
  const { categories } = useCategories();
  const { budgets } = useBudgets();
  const [period, setPeriod] = useState<'7D' | '1M' | '3M' | '6M'>('1M');

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let cutoff: Date;
    if (period === '7D') cutoff = subDays(now, 7);
    else if (period === '1M') cutoff = subMonths(now, 1);
    else if (period === '3M') cutoff = subMonths(now, 3);
    else cutoff = subMonths(now, 6);

    return expenses.filter(e => isAfter(parseISO(e.date), cutoff));
  }, [expenses, period]);

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      totals[e.categoryId] = (totals[e.categoryId] || 0) + e.amount;
    });
    return Object.entries(totals)
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        category: categories.find(c => c.id === categoryId),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, categories]);

  const topCategory = categoryTotals[0];

  const pieData = categoryTotals.map(ct => ({
    name: ct.category?.name || 'Unknown',
    value: ct.amount,
    color: ct.category?.colorHex || '#ccc',
  }));

  const currentMonthStart = startOfMonth(new Date());
  const currentMonthExpenses = expenses.filter(e => isAfter(parseISO(e.date), currentMonthStart));

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <div className="flex space-x-1 bg-surface rounded-lg p-1 border border-border">
          {['7D', '1M', '3M', '6M'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${period === p ? 'bg-white shadow-sm text-primary' : 'text-primary-muted hover:text-primary'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-2">
          <CardContent className="pt-4">
            <div className="text-sm text-primary-muted">Total Spent</div>
            <div className="text-3xl font-bold tracking-tight">₦{totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-primary-muted">Top Category</div>
            <div className="font-semibold truncate mt-1">
              {topCategory ? `${topCategory.category?.icon} ${topCategory.category?.name}` : 'N/A'}
            </div>
            <div className="text-sm text-primary-muted">
              {topCategory ? `₦${topCategory.amount.toLocaleString()}` : '₦0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-primary-muted">Entries</div>
            <div className="text-2xl font-bold mt-1">{filteredExpenses.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-primary-muted text-sm">
                No data for this period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Budgets</h2>
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
            <Card key={budget.id}>
              <CardContent className="py-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                  <span className="text-primary-muted">
                    ₦{spent.toLocaleString()} / ₦{budget.limitAmount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-border rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${percent}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
        {budgets.length === 0 && (
          <div className="text-sm text-primary-muted text-center py-8 bg-surface rounded-xl border border-border border-dashed">
            No active budgets
          </div>
        )}
      </div>
    </div>
  );
}
