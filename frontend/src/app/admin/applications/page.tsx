'use client';

import { useEffect, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

interface AdminApplication {
  id: string;
  type: string;
  status: string;
  formData: string | null;
  createdAt: string;
  applicant: { id: string; name: string; email: string };
  documents: any[];
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-50 text-blue-700',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function AdminApplications() {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const data = await api.get<{ applications: AdminApplication[] }>('/admin/applications');
      setApplications(data.applications);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/applications/${id}/status`, { status });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      toast.success(`Application ${status.toLowerCase().replace('_', ' ')}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Applications</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? '...' : `${applications.length} total`}
        </p>
      </div>

      <div className="rounded-lg border bg-white overflow-x-auto">
        {/* ── Desktop: Table view (sm+) ── */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{app.applicant.name}</p>
                        <p className="text-xs text-muted-foreground">{app.applicant.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{app.type.replace(/_/g, ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[app.status] || 'bg-gray-100 text-gray-700'} border-0`}>
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {app.status === 'SUBMITTED' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, 'UNDER_REVIEW')} disabled={updatingId === app.id} className="text-amber-600 border-amber-200 hover:bg-amber-50">
                              <Clock className="h-3.5 w-3.5 mr-1" /> Review
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, 'APPROVED')} disabled={updatingId === app.id} className="text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, 'REJECTED')} disabled={updatingId === app.id} className="text-red-600 border-red-200 hover:bg-red-50">
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {app.status === 'UNDER_REVIEW' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, 'APPROVED')} disabled={updatingId === app.id} className="text-green-600 border-green-200 hover:bg-green-50">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, 'REJECTED')} disabled={updatingId === app.id} className="text-red-600 border-red-200 hover:bg-red-50">
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {(app.status === 'APPROVED' || app.status === 'REJECTED' || app.status === 'CANCELLED') && (
                          <span className="text-xs text-muted-foreground italic">Finalized</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Mobile: Card view (<sm) ── */}
        <div className="sm:hidden divide-y">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : applications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No applications found.</p>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{app.applicant.name}</p>
                    <p className="text-xs text-muted-foreground">{app.applicant.email}</p>
                  </div>
                  <Badge className={`${statusColors[app.status] || 'bg-gray-100 text-gray-700'} border-0 text-[10px]`}>
                    {app.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{app.type.replace(/_/g, ' ')}</span>
                  <span>{new Date(app.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {/* ── Action buttons: full-width on mobile for easy tapping ── */}
                {(app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW') && (
                  <div className="flex flex-col gap-2 pt-1">
                    {app.status === 'SUBMITTED' && (
                      <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, 'UNDER_REVIEW')} disabled={updatingId === app.id} className="w-full min-h-[44px] text-amber-600 border-amber-200 hover:bg-amber-50">
                        <Clock className="h-3.5 w-3.5 mr-1" /> Review
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, 'APPROVED')} disabled={updatingId === app.id} className="flex-1 min-h-[44px] text-green-600 border-green-200 hover:bg-green-50">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, 'REJECTED')} disabled={updatingId === app.id} className="flex-1 min-h-[44px] text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                )}
                {(app.status === 'APPROVED' || app.status === 'REJECTED' || app.status === 'CANCELLED') && (
                  <p className="text-xs text-muted-foreground italic pt-1">Finalized</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
