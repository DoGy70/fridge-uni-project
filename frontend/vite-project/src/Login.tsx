import React, { useState } from "react";

const BASE_URL = "http://localhost:8080";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin();
      } else {
        setError(data.message || "Login failed");
      }
    } catch (e) {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans relative overflow-hidden">
      {/* Decorative orange circle */}
      <div className="fixed top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-[#ff7828] opacity-10 pointer-events-none" />
      <div className="fixed bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full bg-[#ff7828] opacity-5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ff7828] mb-6 shadow-[0_8px_30px_rgba(255,120,40,0.3)]">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="4" width="32" height="40" rx="4" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2" />
              <rect x="8" y="4" width="32" height="16" rx="4" fill="white" fillOpacity="0.4" stroke="white" strokeWidth="2" />
              <line x1="8" y1="20" x2="40" y2="20" stroke="white" strokeWidth="2" />
              <circle cx="24" cy="32" r="4" stroke="white" strokeWidth="2" />
              <line x1="24" y1="28" x2="24" y2="24" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black tracking-tight mb-1">Frigidwatch</h1>
          <p className="text-sm text-black/40">Monitoring Control System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-black/5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-black/50 font-medium tracking-wide">Email</label>
              <input
                type="email"
                placeholder="operator@domain.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="bg-black/5 rounded-xl px-4 py-3 text-black text-sm outline-none border border-transparent focus:border-[#ff7828] transition-colors placeholder-black/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-black/50 font-medium tracking-wide">Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleLogin()}
                className="bg-black/5 rounded-xl px-4 py-3 text-black text-sm outline-none border border-transparent focus:border-[#ff7828] transition-colors placeholder-black/20"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-500 text-xs">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-[#ff7828] hover:bg-[#e86a1a] text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,120,40,0.3)] mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>

        <p className="text-center text-black/20 text-xs mt-6">Secure · Encrypted</p>
      </div>
    </div>
  );
}
