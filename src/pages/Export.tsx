import { useState } from 'react';
import { useExpenses, useCategories } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export function Export() {
  const { expenses } = useExpenses();
  const { categories } = useCategories();
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [categoryId, setCategoryId] = useState('ALL');

  const getFilteredData = () => {
    return expenses.filter(e => {
      const isDateValid = isWithinInterval(parseISO(e.date), {
        start: parseISO(startDate),
        end: parseISO(endDate),
      });
      const isCategoryValid = categoryId === 'ALL' || e.categoryId === categoryId;
      return isDateValid && isCategoryValid;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleExportPDF = () => {
    const data = getFilteredData();
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('SpendLens Expense Report', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 30);
    if (categoryId !== 'ALL') {
      doc.text(`Category: ${categories.find(c => c.id === categoryId)?.name}`, 14, 36);
    }

    const tableData = data.map(e => [
      e.date,
      e.vendor,
      categories.find(c => c.id === e.categoryId)?.name || 'Unknown',
      `N${e.amount.toLocaleString()}`,
      e.note || ''
    ]);

    const total = data.reduce((sum, e) => sum + e.amount, 0);
    tableData.push(['', '', 'TOTAL', `N${total.toLocaleString()}`, '']);

    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Vendor', 'Category', 'Amount', 'Note']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] }, // Accent color
      footStyles: { fillColor: [249, 250, 251], textColor: 0 },
    });

    doc.save(`SpendLens_Report_${startDate}_${endDate}.pdf`);
  };

  const handleExportCSV = () => {
    const data = getFilteredData().map(e => ({
      ID: e.id,
      Date: e.date,
      Vendor: e.vendor,
      Category: categories.find(c => c.id === e.categoryId)?.name || 'Unknown',
      Amount: e.amount,
      Currency: e.currency,
      Note: e.note || '',
      CreatedAt: e.createdAt,
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SpendLens_Data_${startDate}_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = getFilteredData();
  const totalAmount = filteredData.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-2xl font-semibold tracking-tight">Export</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">From</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Category Filter</label>
            <select
              className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={handleExportPDF} className="h-14 bg-red-500 hover:bg-red-600 text-white border-0" disabled={filteredData.length === 0}>
          <FileText className="mr-2 w-5 h-5" /> PDF
        </Button>
        <Button onClick={handleExportCSV} className="h-14 bg-green-500 hover:bg-green-600 text-white border-0" disabled={filteredData.length === 0}>
          <Table className="mr-2 w-5 h-5" /> CSV
        </Button>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-medium text-primary-muted">Preview ({filteredData.length} entries)</h2>
          <span className="font-semibold text-sm">Total: ₦{totalAmount.toLocaleString()}</span>
        </div>
        
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {filteredData.slice(0, 5).map((e, i) => (
            <div key={e.id} className={`p-3 text-sm flex justify-between ${i !== 0 ? 'border-t border-border' : ''}`}>
              <div>
                <div className="font-medium">{e.vendor}</div>
                <div className="text-xs text-primary-muted">{e.date} • {categories.find(c => c.id === e.categoryId)?.name}</div>
              </div>
              <div className="font-semibold">₦{e.amount.toLocaleString()}</div>
            </div>
          ))}
          {filteredData.length > 5 && (
            <div className="p-3 text-xs text-center text-primary-muted border-t border-border bg-border/20">
              + {filteredData.length - 5} more entries
            </div>
          )}
          {filteredData.length === 0 && (
            <div className="p-6 text-sm text-center text-primary-muted">
              No data in this range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
