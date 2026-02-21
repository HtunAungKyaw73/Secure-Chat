import { io } from "socket.io-client";

// The URL is automatically inferred based on window.location
export const socket = io({
    autoConnect: false,
});
