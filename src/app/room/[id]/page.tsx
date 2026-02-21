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
    id: string;
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
                setUser(meData.user);

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
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-zinc-900 dark:text-zinc-50 text-sm"
                            placeholder="Enter Room Password"
                        />
                        {authError && <p className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/40">{authError}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] text-sm"
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
        <div className="flex flex-col h-screen bg-background transition-colors duration-0">
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex items-center justify-between shadow-sm z-10 transition-colors duration-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 active:scale-90 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-zinc-900 dark:text-zinc-50 leading-tight uppercase tracking-wide">{roomInfo?.name}</h1>
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-bold text-[9px] uppercase tracking-widest mt-0.5">
                            <Users className="w-3 h-3 text-emerald-500" />
                            {members.length} Online
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Members list preview */}
                    <div className="hidden md:flex items-center -space-x-2 mr-2">
                        {members.slice(0, 3).map((m, i) => (
                            <div key={i} title={m.username} className="w-7 h-7 rounded-lg border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400">
                                {m.username.charAt(0)}
                            </div>
                        ))}
                        {members.length > 3 && (
                            <div className="w-7 h-7 rounded-lg border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-black text-zinc-400">
                                +{members.length - 3}
                            </div>
                        )}
                    </div>

                    <button onClick={handleThemeToggle} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm">
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
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all border border-zinc-200 dark:border-zinc-800 font-bold active:scale-95 shadow-sm">
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="text-xs">Leave</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/20 transition-colors duration-0">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                        const isMe = msg.userId === user?.id;
                        return (
                            <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} layout className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                                    {!isMe && (
                                        <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                                            <div className="w-4 h-4 rounded-md bg-blue-600/10 flex items-center justify-center text-[8px] font-black text-blue-600 uppercase">
                                                {msg.user.username.charAt(0)}
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-none">{msg.user.username}</span>
                                        </div>
                                    )}
                                    <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${isMe ? "bg-blue-600 text-white rounded-tr-none font-medium" : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-tl-none text-zinc-800 dark:text-zinc-200"}`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1.5 px-2 font-bold opacity-60">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-0">
                <form onSubmit={sendMessage} className="max-w-3xl mx-auto relative group">
                    <input
                        type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                        className="w-full pl-6 pr-14 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-zinc-50 font-medium text-sm shadow-inner"
                        placeholder="Type a message..."
                    />
                    <button type="submit" disabled={!inputText.trim()} className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-30 flex items-center justify-center">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
