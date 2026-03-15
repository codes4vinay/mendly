import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, MessageCircle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/shared/Layout";
import { fetchChats } from "@/features/chat/chatSlice";
import useAuth from "@/hooks/useAuth";
import { formatDateTime } from "@/utils/helpers";
import { toast } from "sonner";

const ChatsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const chats = useSelector((state) => state.chat.chats);
  const loading = useSelector((state) => state.chat.loading);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState(chats);

  // Fetch chats on mount
  useEffect(() => {
    dispatch(fetchChats({ page: 1, limit: 50 }));
  }, [dispatch]);

  // Filter chats based on search
  useEffect(() => {
    if (!chats) return;

    const filtered = chats.filter((chat) => {
      const otherUser = user?.role === "user" ? chat.serviceOwner : chat.user;
      const centreSearch = chat.serviceCentre?.name?.toLowerCase() || "";
      const userSearch = otherUser?.name?.toLowerCase() || "";

      return (
        centreSearch.includes(searchTerm.toLowerCase()) ||
        userSearch.includes(searchTerm.toLowerCase())
      );
    });

    setFilteredChats(filtered);
  }, [searchTerm, chats, user]);

  // Get unread count for chat
  const getUnreadCount = (chat) => {
    return user?.role === "user" ? chat.userUnreadCount : chat.ownerUnreadCount;
  };

  // Get other user info
  const getOtherUser = (chat) => {
    return user?.role === "user" ? chat.serviceOwner : chat.user;
  };

  if (loading && chats.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <MessageCircle className="h-8 w-8 text-indigo-600" />
            Messages
          </h1>
          <p className="text-muted-foreground">
            Chat with service centres and customers
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or centre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Chats List */}
        {filteredChats && filteredChats.length > 0 ? (
          <div className="space-y-3">
            {filteredChats.map((chat, index) => {
              const unreadCount = getUnreadCount(chat);
              const otherUser = getOtherUser(chat);

              return (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      unreadCount > 0
                        ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden">
                          {otherUser?.avatar ? (
                            <img
                              src={otherUser.avatar}
                              alt={otherUser?.name}
                              className="h-12 w-12 object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-indigo-600">
                              {otherUser?.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm truncate">
                              {user?.role === "user"
                                ? chat.serviceCentre?.name
                                : otherUser?.name}
                            </h3>
                            {unreadCount > 0 && (
                              <Badge className="bg-indigo-600 text-white text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {otherUser?.name} • {otherUser?.email}
                          </p>
                          <p
                            className={`text-sm truncate ${
                              unreadCount > 0
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {chat.lastMessage || "No messages yet"}
                          </p>
                        </div>

                        {/* Time */}
                        <div className="text-xs text-muted-foreground flex-shrink-0 text-right">
                          <p>
                            {formatDateTime(
                              chat.lastMessageAt || chat.createdAt,
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No chats found" : "No conversations yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? "Try a different search term"
                : "Start chatting by selecting a service centre"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => navigate("/service-centres")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Browse Service Centres
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChatsList;
