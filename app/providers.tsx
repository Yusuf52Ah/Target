"use client";

import type { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

import { authClient } from "@/lib/auth-client";

type ProvidersProps = {
  children: ReactNode;
  initialToken?: string | null;
};

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children, initialToken }: ProvidersProps) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient} initialToken={initialToken}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
