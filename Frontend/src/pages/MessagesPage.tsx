import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchUsers, UserProfile, getCurrentUser } from "@api/UserApi";
import { getConversation, sendMessage, MessageResponse, getRecentConversations, ConversationUser } from "@api/MessageApi";
import logo from "../assets/chirp.svg";

export default function MessagesPage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [recentUsers, setRecentUsers] = useState<ConversationUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [sendError, setSendError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");

  useEffect(() => {
    getCurrentUser()
      .then(user => {
        console.log('Current user loaded:', user);
        setCurrentUser(user);
      })
      .catch(err => {
        console.error('Failed to get current user:', err);
      });
  }, []);

  useEffect(() => {
    loadRecentConversations();
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadRecentConversations = async () => {
    try {
      setLoadingRecent(true);
      console.log("Loading recent conversations...");
      const users = await getRecentConversations();
      console.log("Recent users received:", users);
      setRecentUsers(users);
    } catch (err) {
      console.error("Failed to load recent conversations:", err);
      setRecentUsers([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchUsers(searchQuery);
      setSearchResults(results.filter(user => user.id !== currentUser?.id));
    } catch (err) {
      console.error("Failed to search users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: UserProfile | ConversationUser) => {
    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    setSelectedUser(userProfile);
    setSendError(null);
    setSearchResults([]);
    setSearchQuery(user.username);
    try {
      const convo = await getConversation(user.id);
      setMessages(convo);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  const handleSend = async () => {
    if (!selectedUser || !newMessage.trim()) return;

    try {
      setSendError(null);
      console.log('handleSend - currentUser:', currentUser);
      console.log('handleSend - selectedUser:', selectedUser);
      console.log('Sending message:', newMessage, 'to user:', selectedUser.id);
      const message = await sendMessage(selectedUser.id, { content: newMessage.trim() });
      console.log('Message sent successfully:', message);
      console.log('Message senderId:', message.senderId, 'type:', typeof message.senderId);
      console.log('CurrentUser id:', currentUser?.id, 'type:', typeof currentUser?.id);
      setMessages(prevMessages => {
        const updated = [...prevMessages, message];
        console.log('Updated messages array:', updated);
        return updated;
      });
      setNewMessage("");
      // Refresh recent conversations after sending a message
      loadRecentConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
      const message = err instanceof Error ? err.message : "Message failed to send.";
      setSendError(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chirp_token");
    navigate("/login");
  };

  const getTabStyle = (tab: "all" | "requests") => ({
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid #2f3336",
    background: activeTab === tab ? "#e7e9ea" : "transparent",
    color: activeTab === tab ? "#000" : "#e7e9ea",
    fontSize: "12px",
    fontWeight: 600
  });

  return (
    <div className="feed-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <img className="sidebar-logo" src={logo} alt="Chirp" onClick={() => navigate("/feed")} />
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate("/feed")}>
            <span></span>
            <span>Home</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/explore")}>
            <span></span>
            <span>Explore</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/notifications")}>
            <span></span>
            <span>Notifications</span>
          </button>
          <button className="nav-item active">
            <span></span>
            <span>Chat</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/bookmarks")}>
            <span></span>
            <span>Bookmarks</span>
          </button>
          <button className="nav-item" onClick={() => currentUser && navigate(`/profile/${currentUser.id}`)}>
            <span></span>
            <span>Profile</span>
          </button>
        </nav>
        <button className="sidebar-compose" onClick={() => navigate("/feed", { state: { openCompose: true } })}>
          Chirp
        </button>
        <div className="sidebar-user">
          <button 
            className="user-button"
            style={{ width: "100%" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <header className="feed-header" style={{ position: "static", top: "auto", height: "auto" }}>
        <div
          className="header-content"
          style={{
            padding: "8px 16px",
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <h2 className="header-title" style={{ fontSize: "18px" }}>Chat</h2>
        </div>
      </header>

      <main className="feed-main" style={{ borderLeft: "none", borderRight: "none", marginTop: 0 }}>
        <div className="feed-content messages-layout">
          <div className="messages-sidebar" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                padding: "8px 16px 6px",
                width: "100%",
                maxWidth: "320px"
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "16px",
                    color: "#71767b",
                    fontSize: "16px",
                    pointerEvents: "none"
                  }}
                >
                  
                </span>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 14px 8px 40px",
                    borderRadius: "999px",
                    border: "none",
                    background: "#202327",
                    color: "#e7e9ea",
                    fontSize: "15px",
                    outline: "none"
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                width: "100%",
                maxWidth: "320px",
                padding: "0 16px 8px"
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                style={getTabStyle("all")}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                style={getTabStyle("requests")}
              >
                Requests
              </button>
            </div>

            {activeTab === "requests" ? (
              <div className="empty-state-small">No message requests yet.</div>
            ) : loading ? (
              <div className="loading">Searching...</div>
            ) : loadingRecent && recentUsers.length === 0 ? (
              <div className="loading">Loading conversations...</div>
            ) : searchResults.length > 0 ? (
              <div className="users-list" style={{ width: "100%", maxWidth: "320px" }}>
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    className={`user-card ${selectedUser?.id === user.id ? "active" : ""}`}
                    onClick={() => handleSelectUser(user)}
                    type="button"
                    style={{ width: "100%" }}
                  >
                    <div className="user-info-section">
                      <div className="user-avatar-large">
                        {user.profilePictureUrl ? (
                          <img src={user.profilePictureUrl} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          user.username[0].toUpperCase()
                        )}
                      </div>
                      <div className="user-details">
                        <h3 className="user-name">{user.username}</h3>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : recentUsers.length > 0 ? (
              <div className="users-list" style={{ width: "100%", maxWidth: "320px" }}>
                <p className="section-label" style={{ textAlign: "center" }}>Recent Conversations</p>
                {recentUsers.map((user) => (
                  <button
                    key={user.id}
                    className={`user-card ${selectedUser?.id === user.id ? "active" : ""}`}
                    onClick={() => handleSelectUser(user)}
                    type="button"
                    style={{ width: "100%" }}
                  >
                    <div className="user-info-section">
                      <div className="user-avatar-large">
                        {user.profilePictureUrl ? (
                          <img src={user.profilePictureUrl} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          user.username[0].toUpperCase()
                        )}
                      </div>
                      <div className="user-details">
                        <h3 className="user-name">{user.username}</h3>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-state-small">No conversations yet. Search to start messaging!</div>
            )}
          </div>

          <div className="messages-panel">
            {selectedUser ? (
              <>
                <div className="messages-header">
                  <div className="user-avatar-large">
                    {selectedUser.profilePictureUrl ? (
                      <img src={selectedUser.profilePictureUrl} alt={selectedUser.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      selectedUser.username[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="user-name">{selectedUser.username}</h3>
                    <p className="user-email">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="messages-list">
                  {!currentUser ? (
                    <div className="loading">Loading...</div>
                  ) : (
                    messages.map((msg) => {
                      const isOutgoing = Number(msg.senderId) === Number(currentUser.id);
                      console.log('Rendering message - content:', msg.content, 'senderId:', msg.senderId, 'currentUserId:', currentUser.id, 'isOutgoing:', isOutgoing);
                      return (
                        <div
                          key={msg.id}
                          className={`message-bubble ${isOutgoing ? "outgoing" : "incoming"}`}
                        >
                          <p style={{margin:0}}>{msg.content}</p>
                          <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {sendError && <div className="alert error">{sendError}</div>}
                <div className="message-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSend();
                      }
                    }}
                  />
                  <button onClick={handleSend} disabled={!newMessage.trim() || !selectedUser}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">Search and select a user to start messaging</div>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
       <aside className="right-sidebar">
        <input 
          type="text" 
          placeholder="Search Chirp" 
          className="search-box"
        />
        
      </aside>
    </div>
  );
}
