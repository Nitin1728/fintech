"use client";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { EntriesProvider } from "../context/EntriesContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return <>{children}</>;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <EntriesProvider>
        <AuthGuard>{children}</AuthGuard>
      </EntriesProvider>
    </AuthProvider>
  );
}
