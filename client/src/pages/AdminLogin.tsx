import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { setAdminToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const email = emailRef.current?.value ?? "";
    const pw = passwordRef.current?.value ?? "";
    if (!email || !pw) return;
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password: pw });
      const data = await res.json();
      if (data.success && data.token) {
        setAdminToken(data.token);
        setLocation("/admin");
      } else {
        toast({ title: "Incorrect credentials", description: "Check your email and password.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Incorrect credentials", description: "Check your email and password.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111827 100%)" }}>
      <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "400px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", fontWeight: "700", color: "white", fontFamily: "Georgia, serif", fontStyle: "italic"
          }}>A</div>
          <div>
            <div style={{ color: "white", fontWeight: "600", fontSize: "14px", letterSpacing: "-0.01em" }}>Andre Weissmann</div>
            <div style={{ color: "#6b7280", fontSize: "12px" }}>Portfolio Admin</div>
          </div>
        </div>

        <h1 style={{ color: "white", fontSize: "22px", fontWeight: "700", marginBottom: "4px", letterSpacing: "-0.02em" }}>Welcome back</h1>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "28px" }}>Sign in to manage your portfolio</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", color: "#9ca3af", fontSize: "12px", fontWeight: "500", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
            <input
              ref={emailRef}
              data-testid="input-email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              required
              style={{
                width: "100%", background: "#1f2937", border: "1px solid #374151",
                borderRadius: "12px", padding: "12px 16px", color: "white",
                fontSize: "14px", outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "#3b82f6"}
              onBlur={e => e.currentTarget.style.borderColor = "#374151"}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#9ca3af", fontSize: "12px", fontWeight: "500", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
            <input
              ref={passwordRef}
              data-testid="input-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              style={{
                width: "100%", background: "#1f2937", border: "1px solid #374151",
                borderRadius: "12px", padding: "12px 16px", color: "white",
                fontSize: "14px", outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "#3b82f6"}
              onBlur={e => e.currentTarget.style.borderColor = "#374151"}
            />
          </div>
          <button
            data-testid="button-login"
            type="submit"
            disabled={loading}
            style={{
              width: "100%", background: loading ? "#1d4ed8" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              border: "none", borderRadius: "12px", padding: "13px",
              color: "white", fontWeight: "600", fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              transition: "all 0.2s", marginTop: "4px"
            }}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <a href="/" style={{ color: "#4b5563", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
            onMouseOver={e => (e.currentTarget.style.color = "#9ca3af")}
            onMouseOut={e => (e.currentTarget.style.color = "#4b5563")}>
            ← Back to portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
