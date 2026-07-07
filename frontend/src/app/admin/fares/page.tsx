'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { Save } from 'lucide-react';

interface FareItem {
  type: string;
  fee: number;
}

type FareCategory = Record<string, FareItem[]>;

const categoryLabels: Record<string, string> = {
  vehicle_registration: 'Vehicle Registration',
  driving_license: 'Driving License',
  permits: 'Permits',
  taxes: 'Taxes',
};

export default function AdminFares() {
  const [fares, setFares] = useState<FareCategory>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get<FareCategory>('/fares')
      .then(setFares)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateFee = (category: string, index: number, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setFares((prev) => ({
      ...prev,
      [category]: prev[category].map((item, i) =>
        i === index ? { ...item, fee: num } : item
      ),
    }));
  };

  const saveFares = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await api.put('/admin/fares', fares);
      setSuccess('Fares updated successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error && Object.keys(fares).length === 0) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const categories = Object.keys(fares);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Fares Management</h1>
        <Button onClick={saveFares} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-muted-foreground">No fare data available.</p>
      ) : (
        <Tabs defaultValue={categories[0]}>
          <TabsList className="mb-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {categoryLabels[cat] || cat}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <Card>
                <CardHeader>
                  <CardTitle>{categoryLabels[cat] || cat}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fares[cat].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 pb-3 border-b last:border-b-0"
                      >
                        <span className="flex-1 text-sm">{item.type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">₹</span>
                          <Input
                            type="number"
                            value={item.fee}
                            onChange={(e) => updateFee(cat, idx, e.target.value)}
                            className="w-32 text-right"
                            aria-label={`Fee for ${item.type}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
