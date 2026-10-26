import { useId, type ComponentProps, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

const control =
  "w-full h-12 rounded-xl border bg-surface text-fg text-[15px] placeholder:text-muted/70 transition " +
  "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand";

interface FieldShellProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  id: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({ label, error, hint, icon, id, children, className = "" }: FieldShellProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">{icon}</span>
        )}
        {children}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  wrapperClassName?: string;
}

export function Input({ label, error, hint, icon, wrapperClassName, className = "", id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} hint={hint} icon={icon} id={inputId} className={wrapperClassName}>
      <input
        id={inputId}
        aria-invalid={!!error}
        className={`${control} ${icon ? "pl-11" : "pl-4"} pr-4 ${error ? "border-danger" : "border-border"} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
}

interface SelectProps extends ComponentProps<"select"> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  wrapperClassName?: string;
}

export function Select({ label, error, icon, wrapperClassName, className = "", id, children, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} icon={icon} id={selectId} className={wrapperClassName}>
      <select
        id={selectId}
        aria-invalid={!!error}
        className={`${control} appearance-none ${icon ? "pl-11" : "pl-4"} pr-10 ${error ? "border-danger" : "border-border"} ${className}`}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </FieldShell>
  );
}
