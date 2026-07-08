'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { Search, Activity, Shield, Wrench, Receipt } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ── VehicleStatusPage: Lookup tool that shows a vehicle's lifecycle status — RC details,
//     insurance, fitness certificate, PUC, and road tax — all in one place. Users enter a
//     registration number and see colour-coded expiry timelines with days-remaining badges.
//     Currently uses mock data; real API integration would replace handleSearch. ──
export default function VehicleStatusPage() {
  // ── Search Input State ──
  const [regNo, setRegNo] = useState('');
  // ── Result State: populated after search; each date drives the days-left calculation ──
  const [result, setResult] = useState<null | {
    registrationNo: string; make: string; model: string; year: number;
    insuranceUpto: string; fitnessUpto: string; pucUpto: string; taxPaidUpto: string; status: string;
  }>(null);

  async function handleSearch() {
    if (!regNo.trim()) return;
    try {
      const res = await api.get<any>(`/vehicles/search/${encodeURIComponent(regNo)}`);
      setResult({
        registrationNo: res.registrationNo,
        make: res.make,
        model: res.model,
        year: res.manufactureYear,
        insuranceUpto: res.insuranceUpto?.split('T')[0] || '',
        fitnessUpto: res.fitnessUpto?.split('T')[0] || '',
        pucUpto: res.pucUpto?.split('T')[0] || '',
        taxPaidUpto: res.taxPaidUpto?.split('T')[0] || '',
        status: res.status || 'ACTIVE',
      });
    } catch (err: any) {
      toast.error(err.message || 'Vehicle not found');
    }
  }

  // ── daysLeft: calculates whole days remaining until a given date.
  //     Used by each lifecycle row to show a coloured badge (e.g. "120 days left"). ──
  function daysLeft(date: string): number {
    const diff = new Date(date).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <RequireAuth>
      <>
        <PageHero title="Vehicle Lifecycle Status" subtitle="Check RC, insurance, PUC, and fitness status of your vehicle" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* ── Search Card: text input + search button. Enter key also triggers search. ── */}
          <FadeInSection>
            <Card className="border-0 shadow-xl overflow-hidden mb-6">
              <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Search Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter Registration No. (e.g. PY-01-AB-1234)"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeInSection>

          {/* ── Results Section: only shown after a successful search. Displays vehicle basic info
               (make, model, year, status) plus a lifecycle breakdown with colour-coded rows
               showing validity dates and days remaining for Insurance, FC, PUC, and Road Tax. ── */}
          {result && (
            <FadeInSection>
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    {result.registrationNo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-primary/5 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">Make</p>
                      <p className="font-semibold">{result.make}</p>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">Model</p>
                      <p className="font-semibold">{result.model}</p>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">Year</p>
                      <p className="font-semibold">{result.year}</p>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-semibold text-green-600">{result.status}</p>
                    </div>
                  </div>
                  <div className="border-t pt-5">
                    <h3 className="font-semibold mb-4 text-primary">Lifecycle Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-green-600" />
                          <div>
                            <span className="font-medium">Insurance</span>
                            <p className="text-xs text-muted-foreground">Valid until {result.insuranceUpto}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {daysLeft(result.insuranceUpto)} days left
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                          <Wrench className="w-5 h-5 text-blue-600" />
                          <div>
                            <span className="font-medium">Fitness Certificate (FC)</span>
                            <p className="text-xs text-muted-foreground">Valid until {result.fitnessUpto}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {daysLeft(result.fitnessUpto)} days left
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-purple-600" />
                          <div>
                            <span className="font-medium">PUC Certificate</span>
                            <p className="text-xs text-muted-foreground">Valid until {result.pucUpto}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {daysLeft(result.pucUpto)} days left
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-3">
                          <Receipt className="w-5 h-5 text-amber-600" />
                          <div>
                            <span className="font-medium">Road Tax</span>
                            <p className="text-xs text-muted-foreground">Paid until {result.taxPaidUpto}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          {daysLeft(result.taxPaidUpto)} days left
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>
          )}
        </div>
      </section>
      </>
    </RequireAuth>
  );
}
