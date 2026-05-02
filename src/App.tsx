import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Dashboard } from '@/pages/Dashboard';
import { Expenses } from '@/pages/Expenses';
import { Budgets } from '@/pages/Budgets';
import { Export } from '@/pages/Export';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-[100dvh] max-w-md mx-auto border-x border-border bg-background relative shadow-sm overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/export" element={<Export />} />
          </Routes>
        </main>
        
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
