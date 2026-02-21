"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");

            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-md glass glass-amethyst rounded-[3rem] shadow-2xl p-12 border border-white/10"
            >
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 text-violet-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                        <span className="w-12 h-0.5 bg-violet-600 rounded-full" />
                        Access
                    </div>
                    <h1 className="text-5xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter leading-none mb-4">Secure Chat</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-bold uppercase tracking-widest opacity-60">Synchronize your vibe.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-800 dark:text-zinc-500 uppercase tracking-widest ml-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-5 bg-black/3 dark:bg-zinc-800/40 border border-black/5 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/50 outline-none transition-all font-bold text-[12px] text-zinc-900 dark:text-zinc-50 shadow-inner backdrop-blur-md"
                            placeholder="you@nebula.com"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-800 dark:text-zinc-500 uppercase tracking-widest ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-5 bg-black/3 dark:bg-zinc-800/40 border border-white/10 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/50 outline-none transition-all font-bold text-[12px] text-zinc-900 dark:text-zinc-50 shadow-inner backdrop-blur-md"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                            Error: {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-2xl shadow-violet-500/30 transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center mt-12 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                    New user?{" "}
                    <Link href="/register" className="text-violet-500 hover:text-violet-400 transition-colors">
                        Register here
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
