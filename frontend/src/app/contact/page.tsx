import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Puducherry RTO - address, phone, email, and office hours.',
};

const helplines = [
  { service: 'General Inquiry', number: '+91 413 222 1235' },
  { service: 'Driving License', number: '+91 413 222 1236' },
  { service: 'Vehicle Registration', number: '+91 413 222 1237' },
  { service: 'Tax & Permit', number: '+91 413 222 1238' },
];

const regionalOffices = [
  { name: 'Karaikal RTO', address: 'Government Complex, Karaikal - 609602', phone: '+91 4368 222 456' },
  { name: 'Mahe RTO', address: 'RTO Office, Mahe - 673310', phone: '+91 490 233 789' },
  { name: 'Yanam RTO', address: 'RTO Office, Yanam - 533464', phone: '+91 884 232 012' },
];

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact Us" subtitle="Get in touch with Puducherry RTO for inquiries, support, and feedback." />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
              <FadeInSection>
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      Main Office
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <address className="not-italic text-muted-foreground space-y-1">
                      <p>No. 1, Sardar Vallabhbhai Patel Salai,</p>
                      <p>Puducherry - 605001</p>
                    </address>
                    <div className="space-y-2 pt-2 border-t">
                      <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +91 413 222 1234</p>
                      <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> rto.py@gov.in</p>
                      <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Mon-Fri, 10:00 AM - 5:00 PM</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeInSection>

              <FadeInSection delay={100}>
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      Helpline Numbers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {helplines.map((h) => (
                        <li key={h.service} className="flex justify-between text-sm py-2 border-b last:border-0">
                          <span className="text-muted-foreground">{h.service}</span>
                          <span className="font-medium">{h.number}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </FadeInSection>
            </div>

            <FadeInSection delay={150}>
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Send a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <Input id="name" required />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input id="email" type="email" required />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
                      <Input id="phone" type="tel" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        required
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>

          <FadeInSection delay={200}>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
              <CardHeader>
                <CardTitle>Regional Offices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {regionalOffices.map((office) => (
                    <div key={office.name} className="p-4 rounded-lg bg-primary/5 border border-primary/10 hover:shadow-md transition-all">
                      <h3 className="font-semibold text-primary mb-1">{office.name}</h3>
                      <p className="text-sm text-muted-foreground">{office.address}</p>
                      <p className="text-sm text-muted-foreground">{office.phone}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
