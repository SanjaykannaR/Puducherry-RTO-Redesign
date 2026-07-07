export type Locale = 'en' | 'ta' | 'fr';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    'site.title': 'Puducherry RTO',
    'site.subtitle': 'Office of the Transport Commissioner',
    'site.lang': 'en',
    'skip.content': 'Skip to main content',
    'select.language': 'Select language',
    'sign.in': 'Sign In',

    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.services': 'Services',
    'nav.directory': 'Directory',
    'nav.fares': 'Fees & Fares',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Dashboard',

    'hero.title': 'Welcome to Puducherry RTO Portal',
    'hero.subtitle': 'Your gateway to efficient, transparent, and citizen-centric transport services across the Union Territory of Puducherry.',
    'hero.cta.primary': 'Explore Services',
    'hero.cta.secondary': 'Book Appointment',

    'highlights.transactions': 'Daily Transactions',
    'highlights.offices': 'Regional Offices',
    'highlights.digital': 'Digital Service Rate',
    'highlights.users': 'Registered Users',

    'services.title': 'Our Services',
    'services.vr': 'Vehicle Registration',
    'services.vr.desc': 'Register new or used vehicles',
    'services.dl': 'Driving License',
    'services.dl.desc': "Apply for learner's or permanent license",
    'services.appt': 'Book Appointment',
    'services.appt.desc': 'Schedule your RTO visit',
    'services.calc': 'Fee Calculator',
    'services.calc.desc': 'Calculate service fees',
    'services.track': 'Track Application',
    'services.track.desc': 'Check application status',
    'services.challan': 'Challan Payment',
    'services.challan.desc': 'View and pay traffic challans',

    'cta.title': 'Need Assistance?',
    'cta.desc': 'Contact our helpdesk or visit the nearest RTO office for support.',
    'cta.button': 'Contact Us',

    'footer.quick': 'Quick Links',
    'footer.citizen': 'Citizen Services',
    'footer.contact': 'Contact',
    'footer.social': 'Social Media',
    'footer.accessibility': 'Accessibility',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.sitemap': 'Sitemap',
    'footer.powered': 'Powered by OpenCode',

    'contact.address': 'No. 1, Sardar Vallabhbhai Patel Salai, Puducherry - 605001',
    'contact.phone': '+91 413 222 1234',
    'contact.email': 'rto.py@gov.in',
    'contact.hours': 'Mon-Fri: 10:00 AM - 5:00 PM',
  },

  ta: {
    'site.title': 'புதுச்சேரி ஆர்.டி.ஓ',
    'site.subtitle': 'போக்குவரத்து ஆணையர் அலுவலகம்',
    'site.lang': 'ta',
    'skip.content': 'முக்கிய உள்ளடக்கத்திற்கு செல்லவும்',
    'select.language': 'மொழியை தேர்ந்தெடுக்கவும்',
    'sign.in': 'உள்நுழைய',

    'nav.home': 'முகப்பு',
    'nav.about': 'எங்களைப் பற்றி',
    'nav.services': 'சேவைகள்',
    'nav.directory': 'அடைவு',
    'nav.fares': 'கட்டணங்கள்',
    'nav.contact': 'தொடர்பு',
    'nav.dashboard': 'டாஷ்போர்டு',

    'hero.title': 'புதுச்சேரி ஆர்.டி.ஓ இணையதளத்திற்கு வரவேற்கிறோம்',
    'hero.subtitle': 'புதுச்சேரி யூனியன் பிரதேசம் முழுவதும் திறமையான, வெளிப்படையான மற்றும் மக்கள் மைய போக்குவரத்து சேவைகளுக்கான உங்கள் நுழைவாயில்.',
    'hero.cta.primary': 'சேவைகளை ஆராயுங்கள்',
    'hero.cta.secondary': 'நியமனம் பதிவு செய்ய',

    'highlights.transactions': 'தினசரி பரிவர்த்தனைகள்',
    'highlights.offices': 'பிராந்திய அலுவலகங்கள்',
    'highlights.digital': 'டிஜிட்டல் சேவை விகிதம்',
    'highlights.users': 'பதிவு செய்த பயனர்கள்',

    'services.title': 'எங்கள் சேவைகள்',
    'services.vr': 'வாகன பதிவு',
    'services.vr.desc': 'புதிய அல்லது பயன்படுத்திய வாகனங்களை பதிவு செய்யவும்',
    'services.dl': 'ஓட்டுநர் உரிமம்',
    'services.dl.desc': 'கற்றோர் அல்லது நிரந்தர உரிமத்திற்கு விண்ணப்பிக்கவும்',
    'services.appt': 'நியமனம் பதிவு',
    'services.appt.desc': 'உங்கள் ஆர்.டி.ஓ வருகையை திட்டமிடவும்',
    'services.calc': 'கட்டண கால்குலேட்டர்',
    'services.calc.desc': 'சேவை கட்டணங்களை கணக்கிடவும்',
    'services.track': 'விண்ணப்பத்தை கண்காணிக்க',
    'services.track.desc': 'விண்ணப்ப நிலையை சரிபார்க்கவும்',
    'services.challan': 'சால்லன் கட்டணம்',
    'services.challan.desc': 'போக்குவரத்து சால்லன்களை பார்க்க மற்றும் செலுத்தவும்',

    'cta.title': 'உதவி தேவையா?',
    'cta.desc': 'எங்கள் ஹெல்ப்டெஸ்க் அல்லது அருகிலுள்ள ஆர்.டி.ஓ அலுவலகத்தை தொடர்பு கொள்ளவும்.',
    'cta.button': 'எங்களை தொடர்பு கொள்ள',

    'footer.quick': 'விரைவு இணைப்புகள்',
    'footer.citizen': 'குடிமக்கள் சேவைகள்',
    'footer.contact': 'தொடர்பு',
    'footer.social': 'சமூக ஊடகம்',
    'footer.accessibility': 'அணுகல் திறன்',
    'footer.privacy': 'தனியுரிமைக் கொள்கை',
    'footer.terms': 'பயன்பாட்டு விதிமுறைகள்',
    'footer.sitemap': 'தள வரைபடம்',
    'footer.powered': 'OpenCode ஆல் இயக்கப்படுகிறது',

    'contact.address': 'எண். 1, சர்தார் வல்லபாய் படேல் சாலை, புதுச்சேரி - 605001',
    'contact.phone': '+91 413 222 1234',
    'contact.email': 'rto.py@gov.in',
    'contact.hours': 'திங்கள்-வெள்ளி: காலை 10:00 - மாலை 5:00',
  },

  fr: {
    'site.title': 'RTO de Pondichéry',
    'site.subtitle': "Bureau du Commissaire aux Transports",
    'site.lang': 'fr',
    'skip.content': 'Aller au contenu principal',
    'select.language': 'Choisir la langue',
    'sign.in': 'Connexion',

    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.services': 'Services',
    'nav.directory': 'Répertoire',
    'nav.fares': 'Tarifs',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Tableau de bord',

    'hero.title': 'Bienvenue sur le portail RTO de Pondichéry',
    'hero.subtitle': 'Votre passerelle vers des services de transport efficaces, transparents et axés sur les citoyens dans tout le Territoire de Pondichéry.',
    'hero.cta.primary': 'Explorer les services',
    'hero.cta.secondary': 'Prendre rendez-vous',

    'highlights.transactions': 'Transactions quotidiennes',
    'highlights.offices': 'Bureaux régionaux',
    'highlights.digital': 'Taux de service numérique',
    'highlights.users': 'Utilisateurs inscrits',

    'services.title': 'Nos Services',
    'services.vr': 'Immatriculation des véhicules',
    'services.vr.desc': 'Immatriculer des véhicules neufs ou d\'occasion',
    'services.dl': 'Permis de conduire',
    'services.dl.desc': 'Demander un permis d\'apprenti ou permanent',
    'services.appt': 'Prendre rendez-vous',
    'services.appt.desc': 'Planifier votre visite au RTO',
    'services.calc': 'Calculateur de frais',
    'services.calc.desc': 'Calculer les frais de service',
    'services.track': 'Suivre une demande',
    'services.track.desc': 'Vérifier le statut de la demande',
    'services.challan': 'Paiement des amendes',
    'services.challan.desc': 'Voir et payer les contraventions',

    'cta.title': 'Besoin d\'aide ?',
    'cta.desc': 'Contactez notre helpdesk ou visitez le bureau RTO le plus proche.',
    'cta.button': 'Nous contacter',

    'footer.quick': 'Liens rapides',
    'footer.citizen': 'Services aux citoyens',
    'footer.contact': 'Contact',
    'footer.social': 'Réseaux sociaux',
    'footer.accessibility': 'Accessibilité',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': "Conditions d'utilisation",
    'footer.sitemap': 'Plan du site',
    'footer.powered': 'Propulsé par OpenCode',

    'contact.address': 'No. 1, Sardar Vallabhbhai Patel Salai, Pondichéry - 605001',
    'contact.phone': '+91 413 222 1234',
    'contact.email': 'rto.py@gov.in',
    'contact.hours': 'Lun-Ven: 10:00 - 17:00',
  },
};

export function t(key: string, locale: Locale): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}

export function getLocaleFromStorage(): Locale {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem('locale') as Locale) || 'en';
}

export function setLocaleToStorage(locale: Locale) {
  localStorage.setItem('locale', locale);
}
