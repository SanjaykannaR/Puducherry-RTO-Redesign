import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Directory',
  description: 'Puducherry RTO office directory with contact details and services.',
};

const offices = [
  {
    name: 'Puducherry RTO Main Office',
    address: 'No. 1, S.V. Patel Salai, Puducherry - 605001',
    phone: '+91 413 222 1234',
    email: 'rto.py@gov.in',
    services: ['Vehicle Registration', 'Driving License', 'Permits', 'Tax Collection'],
    hours: '10:00 AM - 5:00 PM',
  },
  {
    name: 'Karaikal RTO',
    address: 'Government Complex, Karaikal - 609602',
    phone: '+91 4368 222 456',
    email: 'rto.kkl@gov.in',
    services: ['Vehicle Registration', 'Driving License', 'Tax Collection'],
    hours: '10:00 AM - 5:00 PM',
  },
  {
    name: 'Mahe RTO',
    address: 'RTO Office, Mahe - 673310',
    phone: '+91 490 233 789',
    email: 'rto.mahe@gov.in',
    services: ['Vehicle Registration', 'Driving License'],
    hours: '10:00 AM - 4:30 PM',
  },
  {
    name: 'Yanam RTO',
    address: 'RTO Office, Yanam - 533464',
    phone: '+91 884 232 012',
    email: 'rto.yanam@gov.in',
    services: ['Vehicle Registration', 'Driving License'],
    hours: '10:00 AM - 4:30 PM',
  },
];

export default function DirectoryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-4">RTO Directory</h1>
      <p className="text-muted-foreground mb-8">
        Find contact information and services offered at RTO offices across Puducherry, Karaikal, Mahe, and Yanam.
      </p>
      <div className="space-y-6">
        {offices.map((office, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-xl">{office.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{office.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span>{office.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span>{office.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>{office.hours}</span>
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Services Offered:</p>
                  <div className="flex flex-wrap gap-2">
                    {office.services.map((s, j) => (
                      <Badge key={j} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
