'use client';

interface AuthErrorMessageProps {
  message: string | null;
  className?: string;
}

export function AuthErrorMessage({ message, className = '' }: AuthErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`
        flex items-center gap-2.5 p-3 rounded-lg
        bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800
        text-sm text-red-600 dark:text-red-400
        ${className}
      `}
      role="alert"
    >
      <svg className="w-4 h-4 shrink-0 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{message}</span>
    </div>
  );
}