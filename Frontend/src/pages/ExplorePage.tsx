import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchUsers, UserProfile, followUser, unfollowUser, isFollowing, getCurrentUser } from "@api/UserApi";
import logo from "../assets/chirp.svg";

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [followStatus, setFollowStatus] = useState<Record<number, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    getCurrentUser().then(setCurrentUser).catch(console.error);

    // Listen for profile updates
    const handleProfileUpdate = (event: Event) => {
      if (event instanceof CustomEvent) {
        setCurrentUser(event.detail);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchUsers(searchQuery);
      setSearchResults(results);

      // Load follow status for each user
      const statusMap: Record<number, boolean> = {};
      await Promise.all(
        results.map(async (user) => {
          if (currentUser && user.id !== currentUser.id) {
            try {
              const status = await isFollowing(user.id);
              statusMap[user.id] = status;
            } catch {
              statusMap[user.id] = false;
            }
          }
        })
      );
      setFollowStatus(statusMap);
    } catch (err) {
      console.error("Failed to search users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId: number) => {
    try {
      setFollowLoading({ ...followLoading, [userId]: true });
      
      if (followStatus[userId]) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }

      const status = await isFollowing(userId);
      setFollowStatus({ ...followStatus, [userId]: status });
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setFollowLoading({ ...followLoading, [userId]: false });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chirp_token");
    localStorage.removeItem("currentUserData");
    navigate("/login");
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
          <button className="nav-item active">
            <span></span>
            <span>Explore</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/notifications")}>
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
          <button className="nav-item" onClick={async () => {
            try {
              const user = await getCurrentUser();
              if (user?.id) {
                navigate(`/profile/${user.id}`);
              } else {
                alert("Unable to load profile. Please try again.");
              }
            } catch (err) {
              console.error("Failed to get current user:", err);
              alert("Unable to load profile. Please try logging in again.");
            }
          }}>
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
          <h2 className="header-title">Explore</h2>
        </div>
      </header>

      <main className="feed-main">
        <div className="feed-content">
          <div className="search-section">
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>

          {loading ? (
            <div className="loading">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="users-list">
              {searchResults.map((user) => (
                <div key={user.id} className="user-card">
                  <div 
                    className="user-info-section"
                    onClick={() => navigate(`/profile/${user.id}`)}
                    style={{ cursor: "pointer", flex: 1 }}
                  >
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
                  {currentUser && user.id !== currentUser.id && (
                    <button
                      className={`follow-btn ${followStatus[user.id] ? "following" : ""}`}
                      onClick={() => handleFollowToggle(user.id)}
                      disabled={followLoading[user.id]}
                    >
                      {followLoading[user.id] ? "..." : followStatus[user.id] ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="empty-state">No users found</div>
          ) : (
            <div className="empty-state">Search for users to follow</div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="right-sidebar">
      
      </aside>
    </div>
  );
}
