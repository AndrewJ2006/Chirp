import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookmarks } from "@api/BookmarkApi";
import { PostResponse } from "@api/PostApi";
import { getCurrentUser, UserProfile } from "@api/UserApi";
import { addLike, removeLike, getLikeStatus } from "@api/LikeApi";
import { removeBookmark } from "@api/BookmarkApi";
import { getCommentsByPost } from "@api/CommentApi";
import logo from "../assets/chirp.svg";

interface PostWithEngagement extends PostResponse {
  likeCount: number;
  isLiked: boolean;
  commentCount: number;
}

export default function BookmarksPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostWithEngagement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUser)
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const bookmarkedPosts = await getBookmarks();
      
      const postsWithEngagement = await Promise.all(
        bookmarkedPosts.map(async (post) => {
          try {
            const [likeStatus, comments] = await Promise.all([
              getLikeStatus(post.id),
              getCommentsByPost(post.id)
            ]);
            return {
              ...post,
              likeCount: likeStatus.likeCount || 0,
              isLiked: likeStatus.likedByCurrentUser || false,
              commentCount: comments.length || 0
            };
          } catch {
            return {
              ...post,
              likeCount: 0,
              isLiked: false,
              commentCount: 0
            };
          }
        })
      );
      
      setPosts(postsWithEngagement);
    } catch (err) {
      console.error("Failed to load bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        await removeLike(postId);
      } else {
        await addLike(postId);
      }

      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      ));
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleRemoveBookmark = async (postId: number) => {
    try {
      await removeBookmark(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
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

  const handleLogout = () => {
    localStorage.removeItem("chirp_token");
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
          <button className="nav-item" onClick={() => navigate("/explore")}>
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
          <button className="nav-item active">
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
          <h2 className="header-title">Bookmarks</h2>
        </div>
      </header>

      <main className="feed-main">
        <div className="feed-content">
          {loading ? (
            <div className="loading">Loading bookmarks...</div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div 
                    className="post-author" 
                    onClick={() => navigate(`/profile/${post.authorId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="avatar">{post.authorUsername[0].toUpperCase()}</div>
                    <div className="author-info">
                      <span className="author-name">{post.authorUsername}</span>
                      <span className="post-time">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="post-content">
                  {post.content}
                </div>

                <div className="post-actions">
                  <button 
                    className={`action-button ${post.isLiked ? "liked" : ""}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>{post.likeCount}</span>
                  </button>

                  <button 
                    className="action-button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{post.commentCount || 0}</span>
                  </button>

                  <button 
                    className="action-button"
                    onClick={() => handleRemoveBookmark(post.id)}
                    style={{ color: "#f4212e" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No bookmarks yet</p>
              <p style={{ fontSize: "14px", color: "#71767b", marginTop: "8px" }}>
                Save posts to read later
              </p>
            </div>
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
