"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M2.06 12.32c.16.36.4.83.75 1.35C4.34 15.9 7.4 19 12 19s7.66-3.1 9.19-5.33a8.7 8.7 0 0 0 .75-1.35.5.5 0 0 0 0-.44 8.7 8.7 0 0 0-.75-1.35C19.66 8.1 16.6 5 12 5S4.34 8.1 2.81 10.33a8.7 8.7 0 0 0-.75 1.35.5.5 0 0 0 0 .64Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c4.6 0 7.66 3.1 9.19 5.33a8.7 8.7 0 0 1 .75 1.35.5.5 0 0 1 0 .44 8.8 8.8 0 0 1-1.46 2.2" />
      <path d="M6.7 6.7C4.5 8.1 2.9 10 2.06 11.88a.5.5 0 0 0 0 .44c.16.36.4.83.75 1.35C4.34 15.9 7.4 19 12 19c1.4 0 2.66-.3 3.75-.8" />
    </svg>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, type = "text", ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-primary-dark">
          {label}
        </label>
      ) : null}
      <div className={cn(isPassword && "relative")}>
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={cn(
            "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-primary shadow-sm transition-colors placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-gray-50",
            isPassword && "pr-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-primary/50 transition-colors hover:text-primary"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            tabIndex={-1}
          >
            <EyeIcon open={!showPassword} />
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
});
