import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses, useCategories } from '@/lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { subMonths, subDays, isAfter, parseISO } from 'date-fns';

export function Dashboard() {
  const { expenses } = useExpenses();
  const { categories } = useCategories();
  const [period, setPeriod] = useState<'7D' | '1M' | '3M' | '6M'>('1M');

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let cutoff: Date;

    if (period === '7D') cutoff = subDays(now, 7);
    else if (period === '1M') cutoff = subMonths(now, 1);
    else if (period === '3M') cutoff = subMonths(now, 3);
    else cutoff = subMonths(now, 6);

    return expenses.filter(e =>
      isAfter(parseISO(e.date), cutoff)
    );
  }, [expenses, period]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    filteredExpenses.forEach(e => {
      totals[e.categoryId] =
        (totals[e.categoryId] || 0) + e.amount;
    });

    return Object.entries(totals)
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        category: categories.find(c => c.id === categoryId),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, categories]);

  const pieData = categoryTotals.map(ct => ({
    name: ct.category?.name || 'Unknown',
    value: ct.amount,
    color: ct.category?.colorHex || '#ccc',
  }));

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Overview
        </h1>

        <div className="flex space-x-1 bg-surface rounded-lg p-1 border border-border">
          {['7D', '1M', '3M', '6M'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                period === p
                  ? 'bg-white text-black'
                  : 'text-primary-muted'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
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
                  <Pie data={pieData} dataKey="value" outerRadius={80}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value: any) =>
                      `₦${Number(value || 0).toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-primary-muted">
                No data for this period
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}