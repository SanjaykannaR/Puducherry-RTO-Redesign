'use client';

// ── Revenue Dashboard: shows payment revenue, monthly trends, and recent transactions ──

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, CreditCard, Clock, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { LucideIcon } from 'lucide-react';

// ── Types ──

interface Transaction {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  user?: { name: string; email: string };
}

interface RevenueData {
  totalRevenue: number;
  completedPayments: number;
  pendingPayments: number;
  pendingAmount: number;
  avgTransaction: number;
  monthlyRevenue: { month: string; revenue: number; count: number }[];
  byMethod: { method: string; count: number; total: number }[];
  recentTransactions: Transaction[];
}

interface KpiCard {
  key: keyof Pick<RevenueData, 'totalRevenue' | 'completedPayments' | 'pendingPayments' | 'avgTransaction'>;
  label: string;
  icon: LucideIcon;
  color: string;
  prefix?: string;
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const kpiCards: KpiCard[] = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: IndianRupee, color: '#22c55e', prefix: '₹' },
  { key: 'completedPayments', label: 'Completed Payments', icon: CreditCard, color: '#3b82f6' },
  { key: 'pendingPayments', label: 'Pending Payments', icon: Clock, color: '#f59e0b' },
  { key: 'avgTransaction', label: 'Avg Transaction', icon: TrendingUp, color: '#8b5cf6', prefix: '₹' },
];

export default function AdminRevenue() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<RevenueData>('/admin/revenue')
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-primary">Revenue Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((item) => {
          const Icon = item.icon;
          const value = data ? data[item.key] : 0;
          return (
            <Card key={item.key} className="transition-all hover:shadow-md hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <p className="text-4xl font-bold">
                    {item.prefix || ''}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-gray-100 animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-gray-100 animate-pulse rounded" />
            ) : (data?.byMethod?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.byMethod || []}
                    dataKey="total"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ method, percent }) => `${method ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {(data?.byMethod || []).map((_entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No payment data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-40 bg-gray-100 animate-pulse rounded" />
          ) : (data?.recentTransactions?.length ?? 0) > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.recentTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.user?.name || 'Unknown'}</TableCell>
                    <TableCell className="font-semibold">₹{txn.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        txn.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {txn.status}
                      </span>
                    </TableCell>
                    <TableCell>{txn.paymentMethod || '—'}</TableCell>
                    <TableCell>{txn.paidAt ? new Date(txn.paidAt).toLocaleDateString('en-IN') : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No transactions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
