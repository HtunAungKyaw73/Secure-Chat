"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MessageSquare,
  Search,
  Lock,
  LogOut,
  Sun,
  Moon,
  Hash,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface Room {
  id: string;
  name: string;
  description: string | null;
  isProtected: boolean;
  createdAt: string;
}

interface User {
  userId: string;
  username: string;
}

export default function LobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");

  // New room state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isDark = theme === "dark";
    const x = (e.clientX / window.innerWidth) * 100 + "%";
    const y = (e.clientY / window.innerHeight) * 100 + "%";

    document.documentElement.style.setProperty("--x", x);
    document.documentElement.style.setProperty("--y", y);

    if (!(document as unknown as { startViewTransition?: unknown }).startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meData = await meRes.json();
        const userData = meData.user;
        setUser({
          userId: userData.userId,
          username: userData.username
        });

        const roomsRes = await fetch("/api/rooms");
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData);
        }
      } catch (err) {
        console.error("Lobby fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc, password: newPassword }),
      });
      if (res.ok) {
        const newRoom = await res.json();
        setRooms([newRoom, ...rooms]);
        setIsModalOpen(false);
        setNewName("");
        setNewDesc("");
        setNewPassword("");
      }
      else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      console.error("Create room error:", err);
      setError(err instanceof Error ? err.message : "Create room failed");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading || !user) return (
    <div className="h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-0">
      {/* Header */}
      <header className="glass glass-border-b px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-violet-600 p-2 rounded-xl text-white shadow-lg shadow-violet-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h1 className="text-[10px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.3em]">VibeChat</h1>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleThemeToggle} className="p-2.5 hover:bg-black/5 dark:hover:bg-zinc-800/50 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 border border-black/5 dark:border-white/10 shadow-sm">
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div key="sun" initial={{ scale: 0.5, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5, rotate: 45 }}>
                  <Sun className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ scale: 0.5, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5, rotate: -45 }}>
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <div className="flex items-center gap-4 border-l border-black/5 dark:border-white/5 pl-4">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[9px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">{user?.username}</span>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Online</span>
            </div>
            <button onClick={handleLogout} className="p-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 border border-black/5 dark:border-white/10 shadow-sm">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-violet-500 font-black text-[10px] uppercase tracking-[0.4em]">
              <span className="w-12 h-0.5 bg-violet-600 rounded-full" />
              Pulse
            </div>
            <h2 className="text-6xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter leading-[0.85]">
              Virtual<br /><span className="text-transparent bg-clip-text bg-linear-to-r from-violet-500 to-fuchsia-500">Lounges</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-4 bg-violet-500/3 dark:bg-zinc-900/40 border border-violet-500/10 dark:border-white/10 rounded-2xl w-full md:w-72 backdrop-blur-md focus:ring-4 focus:ring-violet-500/10 outline-none font-bold text-[11px] transition-all shadow-xl text-zinc-900 dark:text-zinc-50"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-2xl shadow-violet-500/30 transition-all hover:scale-[1.05] active:scale-[0.95] uppercase tracking-[0.2em] text-[10px]"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {rooms
              .filter(room =>
                room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (room.description?.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
                  onClick={() => router.push(`/room/${room.id}`)}
                  className="group relative glass glass-amethyst rounded-[2.5rem] p-8 hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm border border-black/5 dark:border-white/5">
                        <Hash className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter uppercase group-hover:translate-x-1 transition-transform duration-300">
                          {room.name}
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[12px] font-bold line-clamp-1 opacity-80">
                          {room.description || "No description provided."}
                        </p>
                      </div>
                    </div>
                    {room.isProtected && (
                      <div className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl flex items-center gap-2 border border-amber-500/20">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Private</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.2em]">Open Vibe</span>
                    </div>
                    <div className="p-3 bg-zinc-900 dark:bg-violet-600 rounded-xl group-hover:px-6 group-hover:bg-violet-600 transition-all duration-500 shadow-lg">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-linear-to-r from-violet-600/20 to-fuchsia-600/20 blur-2xl group-hover:opacity-40 transition-opacity opacity-20" />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Create Room Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-lg bg-white/95 dark:bg-transparent glass dark:glass-amethyst rounded-[3rem] shadow-2xl overflow-hidden border border-black/5 dark:border-white/10 backdrop-blur-xl"
            >
              <div className="p-12">
                <div className="flex items-center gap-3 text-violet-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                  <span className="w-12 h-0.5 bg-violet-600 rounded-full" />
                  Manifest
                </div>
                <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter mb-10 leading-none">
                  New Universe
                </h2>

                <form onSubmit={handleCreateRoom} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-800 dark:text-zinc-500 uppercase tracking-widest ml-1">Room Name</label>
                    <input
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-6 py-5 bg-violet-500/3 dark:bg-zinc-800/40 border border-violet-500/10 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/50 outline-none transition-all font-bold text-[12px] text-zinc-900 dark:text-zinc-50 shadow-inner backdrop-blur-md"
                      placeholder="e.g. Neon Horizon"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-800 dark:text-zinc-500 uppercase tracking-widest ml-1">Aura (Description)</label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-6 py-5 bg-violet-500/3 dark:bg-zinc-800/40 border border-violet-500/10 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/50 outline-none transition-all font-bold text-[12px] text-zinc-900 dark:text-zinc-50 min-h-[120px] resize-none shadow-inner backdrop-blur-md"
                      placeholder="Define the vibration..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-800 dark:text-zinc-500 uppercase tracking-widest ml-1">Lock (Optional)</label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-900 dark:text-zinc-500" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-violet-500/3 dark:bg-zinc-800/40 border border-violet-500/10 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/50 outline-none transition-all font-bold text-[12px] text-zinc-900 dark:text-zinc-50 shadow-inner backdrop-blur-md"
                        placeholder="Add protection..."
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                      Error: {error}
                    </motion.div>
                  )}

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-5 text-zinc-800 dark:text-zinc-500 font-black rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 transition-all uppercase tracking-widest text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-2xl shadow-violet-500/30 border border-white/10 transition-all hover:scale-[1.05] active:scale-[0.95] uppercase tracking-widest text-[10px]"
                    >
                      Construct
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
