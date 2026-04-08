/**
 * CLI Auth Page - /auth/cli
 *
 * 8gent Code opens this page during `8gent auth login`.
 * User authenticates via Clerk, then the page sends the token
 * back to the local CLI server running on localhost:port.
 *
 * Query params:
 *   port  - localhost port where CLI auth server is listening
 *   state - CSRF token to verify the callback
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser, SignIn, useAuth } from "@clerk/nextjs";

export default function CLIAuthPage() {
  const searchParams = useSearchParams();
  const port = searchParams.get("port");
  const state = searchParams.get("state");
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [status, setStatus] = useState<"signing-in" | "sending" | "done" | "error">("signing-in");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !port || !state) return;

    const sendToken = async () => {
      setStatus("sending");
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:${port}/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            state,
            user: {
              id: user?.id,
              email: user?.primaryEmailAddress?.emailAddress,
              name: user?.fullName || user?.firstName,
              imageUrl: user?.imageUrl,
            },
          }),
        });

        if (res.ok) {
          setStatus("done");
        } else {
          setError(`CLI server responded with ${res.status}`);
          setStatus("error");
        }
      } catch (err) {
        setError("Could not reach the CLI. Make sure 8gent is still running.");
        setStatus("error");
      }
    };

    sendToken();
  }, [isSignedIn, port, state, getToken, user]);

  if (!port || !state) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>8gent</h1>
          <p style={styles.error}>Missing parameters. Run `8gent auth login` from your terminal.</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>8gent</h1>
          <p style={styles.subtitle}>Sign in to connect your CLI</p>
          <div style={{ marginTop: 24 }}>
            <SignIn
              routing="hash"
              appearance={{
                elements: {
                  rootBox: { width: "100%" },
                  card: { boxShadow: "none", border: "1px solid #333" },
                },
                variables: {
                  colorPrimary: "#E8610A",
                  colorBackground: "#0d1117",
                  colorText: "#e6edf3",
                  colorInputBackground: "#161b22",
                  colorInputText: "#e6edf3",
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>8gent</h1>
        {status === "sending" && <p style={styles.subtitle}>Connecting to your CLI...</p>}
        {status === "done" && (
          <>
            <p style={styles.success}>Connected. You can close this tab.</p>
            <p style={styles.subtitle}>Welcome back, {user?.firstName || "friend"}.</p>
          </>
        )}
        {status === "error" && (
          <>
            <p style={styles.error}>{error}</p>
            <p style={styles.subtitle}>Try running `8gent auth login` again.</p>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0d1117",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    maxWidth: 420,
    width: "100%",
    padding: 40,
    textAlign: "center" as const,
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    color: "#E8610A",
    marginBottom: 8,
    fontFamily: "Fraunces, serif",
  },
  subtitle: {
    color: "#8b949e",
    fontSize: 14,
    marginBottom: 16,
  },
  success: {
    color: "#3fb950",
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
  },
  error: {
    color: "#f85149",
    fontSize: 14,
    marginBottom: 8,
  },
};
