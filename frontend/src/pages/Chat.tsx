import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, MoreVertical, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const socket = io(API_URL, {
  transports: ["websocket"],
});

interface DecodedToken {
  id: string;
  email: string;
}

interface Message {
  sender?: { _id: string; full_name?: string; email?: string; isVerified?: boolean };
  text: string;
  createdAt: string;
}

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setUserId(decoded.id);
    }
  }, []);

  useEffect(() => {
    const fetchChat = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    };
    fetchChat();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);

    const handleNewMessage = (msg: Message & { _id?: string }) => {
      setMessages((prev) => {
        // Prevent duplicate append if already added via optimistic update
        if (msg._id && prev.some((m: any) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.emit("leaveChat", chatId);
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/chats/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId, text: input }),
      });
      const newMsg = await res.json();
      setMessages((prev) => {
        if (newMsg._id && prev.some((m: any) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
      setInput("");
    } catch (error) {
      console.error("Send error:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: Record<string, Message[]> = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const today = new Date();
      let label = date.toDateString();
      if (date.toDateString() === today.toDateString()) label = "Today";
      else {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) label = "Yesterday";
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(msg);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h2 className="font-semibold text-foreground leading-none">Chat</h2>
            <span className="text-xs text-muted-foreground mt-1">Online</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report User</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex justify-center mb-4">
                <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full shadow-sm">
                  {date}
                </span>
              </div>
              {msgs.map((msg, idx) => {
                const isMine = msg.sender?._id === userId;
                return (
                  <div key={idx} className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm relative group ${isMine
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-white border text-foreground rounded-bl-sm"
                        }`}
                    >
                      {!isMine && (
                        <p className="text-[10px] font-bold opacity-70 mb-1">
                          {msg.sender?.full_name || "User"}
                        </p>
                      )}

                      <p className="leading-relaxed">{msg.text}</p>

                      <span
                        className={`text-[10px] float-right mt-1 ml-2 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-12 px-6"
          />
          <Button type="submit" size="icon" className="h-12 w-12 rounded-full shadow-md bg-primary hover:bg-primary/90">
            <Send className="h-5 w-5 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
