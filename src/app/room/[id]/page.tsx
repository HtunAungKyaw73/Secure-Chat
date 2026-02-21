"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
    Send,
    LogOut,
    User as UserIcon,
    MessageSquare,
    ArrowLeft,
    Sun,
    Moon,
    Lock,
    Unlock
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

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = React.use(params);
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
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
                    initSocket();
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

    const initSocket = async () => {
        // Fetch message history
        const msgRes = await fetch(`/api/rooms/${roomId}/messages`);
        if (msgRes.ok) {
            const msgData = await msgRes.json();
            setMessages(msgData);
        }

        const newSocket = io();
        setSocket(newSocket);

        newSocket.on("connect", () => {
            newSocket.emit("join_room", roomId);
        });

        newSocket.on("receive_message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => newSocket.disconnect();
    };

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
                initSocket();
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
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!isAuthenticated && roomInfo?.isProtected) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-10 text-center"
                >
                    <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-6">
                        <Lock className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-2 uppercase tracking-tight">{roomInfo.name}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">This room is password-protected.</p>

                    <form onSubmit={handleVerifyPassword} className="space-y-4">
                        <input
                            type="password"
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-zinc-900 dark:text-zinc-50"
                            placeholder="Enter Room Password"
                        />
                        {authError && <p className="text-red-500 text-sm font-bold bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-100 dark:border-red-900/50">{authError}</p>}
                        <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] uppercase tracking-tighter"
                        >
                            Unlock & Join
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="w-full py-4 text-zinc-500 dark:text-zinc-400 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"
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
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between shadow-sm z-10 transition-colors duration-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/")} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all text-zinc-600 dark:text-zinc-400 active:scale-90">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight uppercase tracking-tight">{roomInfo?.name}</h1>
                        <div className="flex items-center gap-1.5 text-emerald-500 font-medium text-[10px] uppercase tracking-widest">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            {user?.username}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleThemeToggle} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
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
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all border border-zinc-200 dark:border-zinc-800 font-bold active:scale-95">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Leave</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50 dark:bg-black/20 transition-colors duration-0">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                        const isMe = msg.userId === user?.id;
                        return (
                            <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} layout className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                                    {!isMe && <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 mb-1 ml-2 uppercase tracking-widest">{msg.user.username}</span>}
                                    <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-tl-none font-medium"}`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-2 px-1 font-bold italic opacity-60">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-0">
                <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative">
                    <input
                        type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all pr-16 text-zinc-900 dark:text-zinc-50 font-medium"
                        placeholder="Shout into the void..."
                    />
                    <button type="submit" disabled={!inputText.trim()} className="absolute right-2 top-2 bottom-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
