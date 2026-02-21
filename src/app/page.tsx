"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Plus,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  DoorOpen,
  Settings,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface Room {
  id: string;
  name: string;
  description: string | null;
  passwordHash: string | null;
  createdAt: string;
  _count: { messages: number };
}

interface User {
  id: string;
  username: string;
}

export default function LobbyPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomPass, setNewRoomPass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();

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
    const init = async () => {
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
        console.error("Lobby init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName,
          description: newRoomDesc,
          password: newRoomPass
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      router.push(`/room/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background transition-colors duration-0">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-8 py-5 flex items-center justify-between shadow-sm sticky top-0 z-20 transition-colors duration-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-500/20">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">VibeChat</h1>
            <p className="text-zinc-400 font-medium text-xs mt-1 uppercase tracking-widest">Connect & Vibe</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleThemeToggle}
            className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all text-zinc-600 dark:text-zinc-400 active:scale-95 border border-zinc-100 dark:border-zinc-800"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.div key="sun" initial={{ scale: 0.5, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5, rotate: 45 }}>
                  <Sun className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ scale: 0.5, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5, rotate: -45 }}>
                  <Moon className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
              {user.username[0].toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 leading-none mb-0.5 uppercase tracking-tighter">Profile</p>
              <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 leading-none">{user.username}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-black text-zinc-900 dark:text-zinc-50 mb-4 tracking-tight">Explore Rooms</h2>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium">Join an existing room or create your own protected space to chat with friends.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-3 px-8 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-3xl shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-6 h-6" />
            Create New Room
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer overflow-hidden border-b-8 border-b-zinc-100 dark:border-b-zinc-800"
                onClick={() => router.push(`/room/${room.id}`)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-3xl ${room.passwordHash ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                    {room.passwordHash ? <Lock className="w-6 h-6" /> : <DoorOpen className="w-6 h-6" />}
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-2xl text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border border-zinc-100 dark:border-zinc-800">
                    {room._count.messages} MESSAGES
                  </div>
                </div>

                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{room.name}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed line-clamp-2">
                  {room.description || "No description provided for this room."}
                </p>

                <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                  <span>CREATED {new Date(room.createdAt).toLocaleDateString()}</span>
                  <span className="text-blue-600 dark:text-blue-500 group-hover:translate-x-1 transition-transform">JOIN ROOM →</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
            >
              <div className="bg-blue-600 px-10 py-10 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <h3 className="text-4xl font-black mb-2 tracking-tight">New Room</h3>
                <p className="text-blue-100 font-medium">Configure your private space.</p>
              </div>

              <form onSubmit={handleCreateRoom} className="p-10 space-y-6">
                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Room Name</label>
                  <input
                    type="text" required value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-zinc-900 dark:text-zinc-50"
                    placeholder="E.g. Squad Secret Spot"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Description</label>
                  <textarea
                    value={newRoomDesc} onChange={(e) => setNewRoomDesc(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-zinc-900 dark:text-zinc-50 h-24 resize-none"
                    placeholder="What's this room about?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Optional Room Password</label>
                  <input
                    type="password" value={newRoomPass} onChange={(e) => setNewRoomPass(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-zinc-900 dark:text-zinc-50"
                    placeholder="Leave empty for public"
                  />
                </div>

                {error && <p className="text-red-500 text-sm font-bold bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border border-red-100 dark:border-red-900/50">{error}</p>}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button" onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black rounded-3xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.98] uppercase tracking-tighter"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-tighter"
                  >
                    Launch Room
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
