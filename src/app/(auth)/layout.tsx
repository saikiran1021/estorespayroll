import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        {children}
      </div>
    </div>
  );
}
