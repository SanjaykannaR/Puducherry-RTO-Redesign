'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { Save, Plus, Trash2 } from 'lucide-react';

interface ServiceItem {
  name: string;
  description: string;
  href: string;
  category: string;
}

export default function AdminServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get<ServiceItem[]>('/services')
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    setServices((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const addService = () => {
    setServices((prev) => [
      ...prev,
      { name: '', description: '', href: '', category: '' },
    ]);
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const saveServices = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await api.put('/admin/services', services);
      setSuccess('Services updated successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error && services.length === 0) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Services Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addService}>
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </Button>
          <Button onClick={saveServices} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
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
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No services found. Click &quot;Add Service&quot; to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service, idx) => (
            <Card key={idx} className="transition-all hover:shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Input
                      value={service.name}
                      onChange={(e) => updateService(idx, 'name', e.target.value)}
                      placeholder="Service name"
                      className="font-medium text-base"
                      aria-label={`Service ${idx + 1} name`}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(idx)}
                    aria-label={`Remove service ${service.name || idx + 1}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Description
                    </label>
                    <Input
                      value={service.description}
                      onChange={(e) => updateService(idx, 'description', e.target.value)}
                      placeholder="Service description"
                      aria-label={`Description for ${service.name || 'service'}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Path
                    </label>
                    <Input
                      value={service.href}
                      onChange={(e) => updateService(idx, 'href', e.target.value)}
                      placeholder="/services/example"
                      aria-label={`Path for ${service.name || 'service'}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Category
                    </label>
                    <Input
                      value={service.category}
                      onChange={(e) => updateService(idx, 'category', e.target.value)}
                      placeholder="Category name"
                      aria-label={`Category for ${service.name || 'service'}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
