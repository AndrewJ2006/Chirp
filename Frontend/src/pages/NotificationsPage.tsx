import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAsRead, markAllAsRead, NotifResponse } from "@api/NotiApi";
import { getCurrentUser, UserProfile } from "@api/UserApi";
import logo from "../assets/chirp.svg";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotifResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "mentions">("all");

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUser)
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notifs = await getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chirp_token");
    navigate("/login");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return "";
      case "COMMENT":
        return "";
      case "FOLLOW":
        return "";
      case "MENTION":
        return "";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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
          <button className="nav-item active">
            <span></span>
            <span>Notifications</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/messages")}>
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

      <header className="feed-header">
        <div className="header-content">
          <h2 className="header-title">Notifications</h2>
          <button 
            onClick={handleMarkAllAsRead}
            style={{
              background: "transparent",
              border: "none",
              color: "#1da1f2",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600
            }}
          >
            
          </button>
        </div>
        <div className="notifications-tabs">
          <button 
            className={`notification-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button 
            className={`notification-tab ${activeTab === "mentions" ? "active" : ""}`}
            onClick={() => setActiveTab("mentions")}
          >
            Mentions
          </button>
        </div>
      </header>

      <main className="feed-main">
        <div className="feed-content">
          {loading ? (
            <div className="loading">Loading notifications...</div>
          ) : notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications
                .filter(notif => activeTab === "all" || notif.type === "MENTION")
                .map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${!notif.read ? "unread" : ""}`}
                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notif.message}</p>
                      <span className="notification-time">{formatDate(notif.createdAt)}</span>
                    </div>
                    {!notif.read && <div className="notification-dot"></div>}
                  </div>
                ))}
            </div>
          ) : (
            <div className="empty-state">No notifications yet</div>
          )}
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
