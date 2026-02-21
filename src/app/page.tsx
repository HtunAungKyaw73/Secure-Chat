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
  ArrowRight,
  User as UserIcon
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
  id: string;
  username: string;
}

export default function LobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  // New room state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isDark = theme === "dark";
    const x = (e.clientX / window.innerWidth) * 100 + "%";
    const y = (e.clientY / window.innerHeight) * 100 + "%";

    document.documentElement.style.setProperty("--x", x);
    document.documentElement.style.setProperty("--y", y);

    if (!(document as any).startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    (document as any).startViewTransition(() => {
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
        setUser(meData.user);

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
    } catch (err) {
      console.error("Create room error:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading || !user) return (
    <div className="h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-0">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20 transition-colors duration-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h1 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">VibeChat Lobby</h1>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleThemeToggle} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm">
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

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest leading-none">{user.username}</span>
              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter mt-0.5">Active now</span>
            </div>
            <button onClick={handleLogout} className="p-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 rounded-xl transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm active:scale-95">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
              <span className="w-8 h-0.5 bg-blue-600 rounded-full" />
              Discover
            </div>
            <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter leading-none">
              Chat Rooms
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Find a vibe..."
                className="pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full md:w-64 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-xs transition-all shadow-sm"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-[10px]"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/room/${room.id}`)}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden border-b-4 hover:border-b-blue-600 active:scale-[0.99]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    <Hash className="w-6 h-6" />
                  </div>
                  {room.isProtected && (
                    <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center gap-1.5 shadow-sm border border-amber-100 dark:border-amber-900/40">
                      <Lock className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">Private</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 mb-2 truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                  {room.name}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {room.description || "No description provided."}
                </p>

                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Join the Vibe</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
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
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                  <span className="w-8 h-0.5 bg-blue-600 rounded-full" />
                  New Space
                </div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter mb-8 leading-none">
                  Create a Room
                </h2>

                <form onSubmit={handleCreateRoom} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Room Name</label>
                    <input
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm text-zinc-900 dark:text-zinc-50 shadow-inner"
                      placeholder="e.g. Midnight Vibin'"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm text-zinc-900 dark:text-zinc-50 min-h-[100px] resize-none shadow-inner"
                      placeholder="What's this room about?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Privacy (Optional)</label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm text-zinc-900 dark:text-zinc-50 shadow-inner"
                        placeholder="Add a password for protection"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 text-zinc-500 font-black rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all uppercase tracking-widest text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-[10px]"
                    >
                      Launch Room
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
