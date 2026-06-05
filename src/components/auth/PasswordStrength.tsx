'use client';

import { useMemo } from 'react';

interface PasswordStrengthProps {
  password: string;
  show?: boolean;
}

function getChecks(password: string) {
  return [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'Contains uppercase', test: /[A-Z]/.test(password) },
    { label: 'Contains lowercase', test: /[a-z]/.test(password) },
    { label: 'Contains number', test: /\d/.test(password) },
    { label: 'Contains special character', test: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
}

function getStrengthColor(score: number) {
  if (score < 40) return 'bg-red-500';
  if (score < 70) return 'bg-yellow-500';
  return 'bg-brand-green';
}

function getStrengthLabel(score: number) {
  if (score < 40) return 'Weak';
  if (score < 70) return 'Fair';
  return 'Strong';
}

export function PasswordStrength({ password, show = true }: PasswordStrengthProps) {
  const checks = useMemo(() => getChecks(password), [password]);
  const passed = checks.filter(c => c.test).length;
  const total = checks.length;
  const strength = passed === 0 ? 0 : Math.round((passed / total) * 100);

  if (!show || !password) return null;

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Password strength</span>
        <span className="text-xs font-medium text-brand-green dark:text-brand-green-dark">{getStrengthLabel(strength)}</span>
      </div>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={100} aria-label="Password strength">
        <div className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(strength)}`} style={{ width: `${strength}%` }} />
      </div>
      <ul className="space-y-1" role="list" aria-label="Password requirements">
        {checks.map((check, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
              check.test ? 'bg-brand-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }`}>
              {check.test ? (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
            </span>
            <span className={`text-gray-600 dark:text-gray-400 ${check.test ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}