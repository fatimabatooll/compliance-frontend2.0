export type PasswordRequirement = {
  label: string;
  test: (value: string) => boolean;
};

export const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  {
    label: "One special character",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

export const getPasswordStrengthError = (password: string): string | null => {
  const unmet = passwordRequirements.filter((rule) => !rule.test(password));
  if (unmet.length === 0) return null;
  return `Password must have ${passwordRequirements
    .map((rule) => rule.label.toLowerCase())
    .join(", ")}.`;
};
