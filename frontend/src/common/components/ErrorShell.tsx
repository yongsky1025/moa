import type { ReactNode } from "react";

type ErrorAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

type ErrorShellProps = {
  code: string;
  title: string;
  message: string;
  icon: ReactNode;
  actions: ErrorAction[];
  detail?: string;
};

export default function ErrorShell({
  code,
  title,
  message,
  icon,
  actions,
  detail,
}: ErrorShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4">
      <div className="w-full max-w-md rounded-2xl border border-moa-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moa-accent-light text-moa-accent">
          {icon}
        </div>
        <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-moa-subtle">{code}</p>
        <h1 className="mt-2 text-2xl font-extrabold text-moa-text">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-moa-subtle">{message}</p>

        {detail && (
          <pre className="mt-4 max-h-36 overflow-auto rounded-lg border border-red-100 bg-red-50 p-3 text-left text-xs text-red-700">
            {detail}
          </pre>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={
                action.variant === "secondary"
                  ? "w-full rounded-xl border border-moa-border bg-white px-4 py-2.5 text-sm font-semibold text-moa-text transition-colors hover:bg-gray-50"
                  : "w-full rounded-xl bg-moa-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-moa-hover"
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
