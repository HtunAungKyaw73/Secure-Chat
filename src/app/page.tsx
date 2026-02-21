"use client";

import { useState, useEffect, useRef } from "react";
import { socket } from "@/lib/socket";
import { Send, User as UserIcon, MessageSquare, LogOut, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

type Message = {
  id: string;
  text: string;
  username: string;
  createdAt: string;
};

export default function ChatApp() {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check local storage for existing session
    const storedUsername = localStorage.getItem("vibe_chat_username");
    if (storedUsername) {
      setUsername(storedUsername);

      // Fetch history immediately for auto-joined session
      fetch("/api/messages")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to load history");
        })
        .then((history) => {
          setMessages(history);
        })
        .catch(console.error)
        .finally(() => {
          setIsJoined(true);
        });
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isJoined) {
      socket.connect();
      socket.emit("user_join", username);

      socket.on("receive_message", (msg: Message) => {
        // Using functional updater to avoid stale closure over `messages`
        setMessages((prev) => [...prev, msg]);
      });

      socket.on("user_joined", (newUsername: string) => {
        const sysMsg: Message = {
          id: `sys-${Date.now()}`,
          text: `${newUsername} joined the chat`,
          username: "System",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, sysMsg]);
      });

      return () => {
        socket.off("receive_message");
        socket.off("user_joined");
        socket.disconnect();
      };
    }
  }, [isJoined, username]);

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isDark = theme === "dark";
    const x = (e.clientX / window.innerWidth) * 100 + "%";
    const y = (e.clientY / window.innerHeight) * 100 + "%";

    document.documentElement.style.setProperty("--x", x);
    document.documentElement.style.setProperty("--y", y);

    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const history = await res.json();
        setMessages(history);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      localStorage.setItem("vibe_chat_username", username.trim());
      setLoading(false);
      setIsJoined(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit("send_message", { text: newMessage, username });
    setNewMessage("");
  };

  const handleLeave = () => {
    localStorage.removeItem("vibe_chat_username");
    setIsJoined(false);
    setUsername("");
    setMessages([]);
    socket.disconnect();
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-4 font-sans text-zinc-900 dark:text-zinc-100 transition-colors">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative"
        >
          {/* Decorative blur blob */}
          <div className="absolute -inset-1 bg-linear-to-r from-violet-600 to-indigo-600 rounded-2xl blur-xl opacity-20" />

          <form
            onSubmit={handleJoin}
            className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-2xl flex flex-col gap-6"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-linear-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-indigo-500 dark:from-white dark:to-zinc-400">
                Welcome to VibeChat
              </h1>
              <p className="text-zinc-500 text-sm text-center">
                Enter your username to join the real-time conversation.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  maxLength={20}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim() || loading}
              className="w-full py-3 px-4 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-300 disabled:to-zinc-300 dark:disabled:from-zinc-800 dark:disabled:to-zinc-800 disabled:text-zinc-400 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-violet-500/25 active:scale-[0.98]"
            >
              {loading ? "Connecting..." : "Join Chat"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center p-0 sm:p-4 md:p-8 font-sans transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl h-dvh sm:h-[85vh] bg-white/70 dark:bg-zinc-900/50 sm:backdrop-blur-2xl sm:border border-zinc-200/50 dark:border-zinc-800/50 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">VibeChat Room</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Connected as <span className="text-zinc-700 dark:text-zinc-300">{username}</span></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={handleThemeToggle}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={handleLeave}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Leave Chat"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.username === username;
              const isSystem = msg.username === "System";

              if (isSystem) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center my-2"
                  >
                    <span className="px-3 py-1 bg-zinc-200/60 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs rounded-full border border-zinc-300/50 dark:border-zinc-700/50">
                      {msg.text}
                    </span>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95, y: 10, originX: isMe ? 1 : 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`flex flex-col max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                >
                  <span className={`text-[11px] font-medium mb-1 px-1 ${isMe ? "text-violet-500" : "text-zinc-500 dark:text-zinc-400"}`}>
                    {isMe ? "You" : msg.username}
                  </span>
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${isMe
                      ? "bg-linear-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-violet-500/20"
                      : "bg-zinc-200 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-zinc-300/50 dark:border-zinc-700/50 rounded-tl-sm shadow-black/20"
                      } shadow-lg`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                      {msg.text}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 sm:p-6 bg-white/80 dark:bg-zinc-900/80 border-t border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md shrink-0">
          <form onSubmit={handleSendMessage} className="relative flex items-center max-w-3xl mx-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message ..."
              className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300/80 dark:border-zinc-800/80 rounded-full pl-5 pr-14 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-inner placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-1.5 p-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 text-white rounded-full transition-colors flex items-center justify-center shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
