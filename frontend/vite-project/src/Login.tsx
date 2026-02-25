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
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // sends/receives cookies
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json()
      console.log(res)
      if (res.ok) {
        onLogin();  // no longer passing a token
      } else {
        setError(data.message || "Login failed");
      }
    } catch (e) {
      const error = e as Error
      console.log(error.message)
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020d14] flex items-center justify-center font-mono relative overflow-hidden">

      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px)",
        }}
      />

      {/* Card */}
      <div className="relative z-20 w-full max-w-md mx-4 p-12 bg-[#020d14] border border-[#1e3a4a] shadow-[0_0_60px_rgba(0,212,255,0.08)]">

        {/* Status */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-pulse" />
          <span className="text-[#00ff88] text-xs tracking-[3px]">SYSTEM ONLINE</span>
        </div>

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4 drop-shadow-[0_0_12px_rgba(0,212,255,0.4)]">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="4" width="32" height="40" rx="2" stroke="#00d4ff" strokeWidth="2" />
              <rect x="8" y="4" width="32" height="16" rx="2" fill="#00d4ff" fillOpacity="0.1" stroke="#00d4ff" strokeWidth="2" />
              <line x1="8" y1="20" x2="40" y2="20" stroke="#00d4ff" strokeWidth="2" />
              <circle cx="24" cy="32" r="4" stroke="#00d4ff" strokeWidth="1.5" />
              <line x1="24" y1="28" x2="24" y2="24" stroke="#00d4ff" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-[8px] mb-2">FRIGIDWATCH</h1>
          <p className="text-[10px] text-[#4a7a8a] tracking-[3px]">MONITORING CONTROL SYSTEM v1.0</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[#4a7a8a] tracking-[3px]">OPERATOR ID</label>
            <input
              type="email"
              placeholder="operator@domain.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="bg-[rgba(0,212,255,0.03)] border border-[#1e3a4a] text-[#00d4ff] px-4 py-3 text-sm font-mono outline-none focus:border-[#00d4ff] transition-colors w-full placeholder-[#1e3a4a]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[#4a7a8a] tracking-[3px]">ACCESS CODE</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleLogin()}
              className="bg-[rgba(0,212,255,0.03)] border border-[#1e3a4a] text-[#00d4ff] px-4 py-3 text-sm font-mono outline-none focus:border-[#00d4ff] transition-colors w-full placeholder-[#1e3a4a]"
            />
          </div>

          {error && (
            <div className="bg-[rgba(255,60,60,0.1)] border border-[rgba(255,60,60,0.3)] text-[#ff6060] px-4 py-3 text-xs tracking-wider">
              ⚠ {error.toUpperCase()}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-2 border border-[#00d4ff] text-[#00d4ff] py-4 text-xs tracking-[4px] font-mono transition-all hover:bg-[#00d4ff] hover:text-[#020d14] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-5 border-t border-[#0d2030] text-center">
          <span className="text-[9px] text-[#1e3a4a] tracking-[2px]">SECURE ACCESS · ENCRYPTED CHANNEL</span>
        </div>
      </div>
    </div>
  );
}