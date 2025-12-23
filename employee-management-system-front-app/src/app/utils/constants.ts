

export const VALIDATION_PATTERNS = {
  code: /^[A-Za-z0-9_-]*$/,
  name: /^[A-Za-z\s.'-]*$/,
  mobile: /^01[0-9]{9}$/
};

export const STATUS_OPTIONS = [
  { label: 'All', value: null },
  { label: 'Active', value: true },
  { label: 'Inactive', value: false }
];