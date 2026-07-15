// ── Shared Form Validation Rules ──
// Returns an error string (truthy = invalid) or '' (valid).
// Used by all frontend forms for consistent client-side validation.

export const validators = {
  name: (v: string) => {
    if (!v.trim()) return 'Name is required';
    if (v.trim().length < 2) return 'Name must be at least 2 characters';
    if (v.trim().length > 100) return 'Name must be under 100 characters';
    return '';
  },

  email: (v: string) => {
    if (!v.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return '';
  },

  mobile: (v: string) => {
    if (!v.trim()) return 'Mobile number is required';
    // Indian mobile: 10 digits, optionally prefixed with +91 or 91
    const digits = v.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) return ''; // +91XXXXXXXXXX
    if (digits.length === 10 && /^[6-9]/.test(digits)) return ''; // 10-digit Indian
    return 'Enter a valid 10-digit Indian mobile number';
  },

  password: (v: string) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (v.length > 128) return 'Password must be under 128 characters';
    return '';
  },

  message: (v: string) => {
    if (!v.trim()) return 'Message is required';
    if (v.trim().length < 10) return 'Message must be at least 10 characters';
    if (v.trim().length > 2000) return 'Message must be under 2000 characters';
    return '';
  },

  year: (v: string) => {
    if (!v) return 'Year is required';
    const n = Number(v);
    const current = new Date().getFullYear();
    if (!Number.isInteger(n) || n < 1900 || n > current + 1) {
      return `Year must be between 1900 and ${current + 1}`;
    }
    return '';
  },

  vin: (v: string) => {
    // VIN / Chassis Number: 17 alphanumeric characters (no I, O, Q)
    if (!v.trim()) return 'Chassis number is required';
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(v.trim())) return 'Chassis number must be exactly 17 alphanumeric characters (no I/O/Q)';
    return '';
  },

  engineNo: (v: string) => {
    if (!v.trim()) return 'Engine number is required';
    if (!/^[A-Z0-9]{6,20}$/i.test(v.trim())) return 'Engine number must be 6-20 alphanumeric characters';
    return '';
  },

  registrationNo: (v: string) => {
    // Indian registration format: XX00XX0000 (e.g., PY01AB1234)
    if (!v.trim()) return 'Registration number is required';
    if (!/^[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{1,4}$/i.test(v.trim())) {
      return 'Enter a valid registration number (e.g., PY01AB1234)';
    }
    return '';
  },

  licenseNo: (v: string) => {
    if (!v.trim()) return 'License number is required';
    if (v.trim().length < 5) return 'Enter a valid license number';
    return '';
  },

  required: (label: string) => (v: string) => {
    if (!v?.trim()) return `${label} is required`;
    return '';
  },
};

// ── Validate an entire form object against a rule set ──
// rules: { fieldName: validatorFunction }
// Returns { valid: boolean, errors: Record<string, string> }
export function validateForm(
  data: Record<string, string>,
  rules: Record<string, (value: string) => string>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  for (const [field, validate] of Object.entries(rules)) {
    const error = validate(data[field] || '');
    if (error) errors[field] = error;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
