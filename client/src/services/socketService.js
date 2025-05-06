import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {};
  }

  connect(token) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinSnippetRoom(snippetId) {
    if (!this.socket) return;
    this.socket.emit("join-snippet", snippetId);
  }

  leaveSnippetRoom(snippetId) {
    if (!this.socket) return;
    this.socket.emit("leave-snippet", snippetId);
  }

  onCodeChange(callback) {
    if (!this.socket) return;
    this.socket.on("code-change", callback);
    this.callbacks["code-change"] = callback;
  }

  emitCodeChange(snippetId, code, language, cursorPosition) {
    if (!this.socket) return;
    this.socket.emit("code-change", {
      snippetId,
      code,
      language,
      cursorPosition,
    });
  }

  onUserJoined(callback) {
    if (!this.socket) return;
    this.socket.on("user-joined", callback);
    this.callbacks["user-joined"] = callback;
  }

  onUserLeft(callback) {
    if (!this.socket) return;
    this.socket.on("user-left", callback);
    this.callbacks["user-left"] = callback;
  }

  cleanup() {
    if (!this.socket) return;

    Object.keys(this.callbacks).forEach((event) => {
      this.socket.off(event, this.callbacks[event]);
    });

    this.callbacks = {};
  }
}

export default new SocketService();
