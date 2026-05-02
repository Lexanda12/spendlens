export type Category = {
  id: string;
  name: string;
  icon: string;
  colorHex: string;
}

export type Expense = {
  id: string;
  categoryId: string;
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  note?: string;
  createdAt: string;
}

export type Budget = {
  id: string;
  categoryId: string;
  limitAmount: number;
  period: "monthly";
  createdAt: string;
}