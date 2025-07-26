'use client';

import { AuthProvider } from '@/providers/auth-provider-safe';

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
