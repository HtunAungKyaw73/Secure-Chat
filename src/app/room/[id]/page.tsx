"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
    Send,
    LogOut,
    MessageSquare,
    ArrowLeft,
    Sun,
    Moon,
    Lock,
    Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import * as React from "react";

interface Message {
    id: string;
    text: string;
    userId: string;
    user: { username: string };
    createdAt: string;
}

interface User {
    userId: string;
    username: string;
}

interface RoomInfo {
    id: string;
    name: string;
    description: string | null;
    isProtected: boolean;
}

interface Member {
    userId: string;
    username: string;
}

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = React.use(params);
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [inputText, setInputText] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
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
                const userData = meData.user;
                // Ensure we handle both 'id' and 'userId' if the API is inconsistent,
                // though our API should be returning userId from the payload.
                setUser({
                    userId: userData.userId || userData.id,
                    username: userData.username
                });

                const roomRes = await fetch(`/api/rooms/${roomId}`);
                if (!roomRes.ok) throw new Error("Room not found");
                const roomData = await roomRes.json();
                setRoomInfo(roomData);

                if (!roomData.isProtected) {
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.error("Room init error:", err);
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [roomId, router]);

    // Handle socket connection only after authentication
    useEffect(() => {
        if (isAuthenticated && roomId) {
            const newSocket = io();
            setSocket(newSocket);

            newSocket.on("connect", () => {
                const myId = user?.userId || (user as any)?.id;
                console.log(`[Socket] Connected to room ${roomId} as ${user?.username} (ID: ${myId})`);
                newSocket.emit("join_room", roomId);
            });

            // Fetch message history
            fetch(`/api/rooms/${roomId}/messages`)
                .then(res => res.json())
                .then(data => setMessages(data));

            newSocket.on("receive_message", (msg: Message) => {
                setMessages((prev) => [...prev, msg]);
            });

            newSocket.on("room_members", (memberList: Member[]) => {
                console.log("Member list updated:", memberList);
                setMembers(memberList);
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [isAuthenticated, roomId]);

    const handleVerifyPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        try {
            const res = await fetch(`/api/rooms/${roomId}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setIsAuthenticated(true);
            } else {
                setAuthError(data.error || "Invalid password");
            }
        } catch (err) {
            setAuthError("Verification failed");
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isAuthenticated]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim() && socket && user) {
            socket.emit("send_message", { text: inputText, roomId });
            setInputText("");
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    if (loading) return (
        <div className="h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!isAuthenticated && roomInfo?.isProtected) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-6">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">{roomInfo.name}</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 font-medium">This room is locked.</p>

                    <form onSubmit={handleVerifyPassword} className="space-y-4">
                        <input
                            type="password"
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-zinc-900 dark:text-zinc-50 text-sm"
                            placeholder="Enter Room Password"
                        />
                        {authError && <p className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/40">{authError}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] text-sm"
                        >
                            Unlock & Join
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="w-full py-3 text-zinc-500 dark:text-zinc-400 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-xs"
                        >
                            Back to Lobby
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-transparent transition-colors duration-0">
            <header className="glass glass-border-b px-6 py-3 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/")} className="p-2 hover:bg-white/5 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 active:scale-90 border border-transparent hover:border-white/10">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="bg-violet-600 p-2 rounded-xl text-white shadow-lg shadow-violet-500/20">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-[10px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-[0.2em] truncate">{roomInfo?.name}</h1>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                                    {members.length > 0 ? members.length : 1} Live
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-1">
                            {members.filter(m => {
                                const mId = m.userId || (m as any).id;
                                const myId = user?.userId || (user as any)?.id;
                                return mId && myId && String(mId) !== String(myId);
                            }).length > 0 ? (
                                <span className="text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20 truncate flex items-center gap-1">
                                    Talking with: <span className="font-black text-violet-300">
                                        {members
                                            .filter(m => {
                                                const mId = m.userId || (m as any).id;
                                                const myId = user?.userId || (user as any)?.id;
                                                return mId && myId && String(mId) !== String(myId);
                                            })
                                            .map(m => m.username)
                                            .join(", ")}
                                    </span>
                                </span>
                            ) : (
                                <div className="flex items-center gap-1.5 opacity-60 ml-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                    <span className="italic lowercase tracking-normal font-medium">Vibing solo...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center -space-x-2 mr-4">
                        {members.slice(0, 3).map((m, i) => (
                            <div key={i} title={m.username} className="w-8 h-8 rounded-xl border border-black/5 dark:border-white/10 bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400 backdrop-blur-md">
                                {m.username.charAt(0)}
                            </div>
                        ))}
                        {members.length > 3 && (
                            <div className="w-8 h-8 rounded-xl border border-black/5 dark:border-white/10 bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-[9px] font-black text-zinc-700 dark:text-zinc-500 backdrop-blur-md">
                                +{members.length - 3}
                            </div>
                        )}
                    </div>

                    <button onClick={handleThemeToggle} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 border border-black/5 dark:border-white/10 shadow-sm">
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
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-black/5 dark:border-white/10 font-bold active:scale-95 shadow-sm">
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase tracking-widest">Leave</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-transparent">
                <div className="max-w-2xl mx-auto w-full min-h-full p-8 space-y-8 bg-transparent">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                            const isMe = msg.userId === user?.userId;
                            return (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} layout className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex flex-col max-w-[85%] ${isMe ? "items-end" : "items-start"}`}>
                                        {!isMe && (
                                            <div className="flex items-center gap-2 mb-2 ml-1">
                                                <div className="w-5 h-5 rounded-lg bg-violet-600 flex items-center justify-center text-[9px] font-black text-white uppercase shadow-lg shadow-violet-500/20">
                                                    {msg.user.username.charAt(0)}
                                                </div>
                                                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-none">{msg.user.username}</span>
                                            </div>
                                        )}
                                        <div className={`px-5 py-3 rounded-2xl text-[12.5px] leading-relaxed shadow-xl backdrop-blur-md border ${isMe ? "glass-amethyst text-zinc-900 dark:text-white rounded-tr-none border-violet-500/30" : "glass text-zinc-800 dark:text-zinc-100 border-white/10 rounded-tl-none font-medium"}`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[9px] text-zinc-500 dark:text-zinc-500 mt-2 px-2 font-black uppercase tracking-tighter opacity-40">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </main>

            <footer className="p-6 bg-transparent">
                <form onSubmit={sendMessage} className="max-w-2xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-violet-600 to-fuchsia-600 rounded-4xl opacity-20 blur-xl group-focus-within:opacity-40 transition-opacity" />
                    <input
                        type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                        className="relative w-full pl-7 pr-16 py-4 glass dark:bg-zinc-900/60 border border-black/5 dark:border-white/20 rounded-3xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/50 outline-none transition-all text-zinc-900 dark:text-zinc-50 font-bold text-[13px] shadow-2xl"
                        placeholder="Transmit your message..."
                    />
                    <button type="submit" disabled={!inputText.trim()} className="absolute right-2 top-2 bottom-2 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl transition-all shadow-xl shadow-violet-500/30 active:scale-90 disabled:opacity-30 flex items-center justify-center backdrop-blur-md border border-black/5 dark:border-white/10">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
