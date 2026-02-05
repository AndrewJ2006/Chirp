import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFeed, createPost, PostResponse } from "@api/PostApi";
import { addLike, removeLike, getLikeStatus } from "@api/LikeApi";
import { getCommentsByPost, addComment, CommentResponse } from "@api/CommentApi";
import { getUserProfile, getCurrentUser } from "@api/UserApi";
import logo from "../assets/chirp.svg";

interface PostWithEngagement extends PostResponse {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export default function FeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [postingInProgress, setPostingInProgress] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, CommentResponse[]>>({});
  const [newCommentContent, setNewCommentContent] = useState<Record<number, string>>({});

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const feedPosts = await getFeed(0, 20);
      
      const postsWithEngagement = await Promise.all(
        feedPosts.map(async (post) => {
          try {
            const [likeStatus, comments] = await Promise.all([
              getLikeStatus(post.id),
              getCommentsByPost(post.id)
            ]);
            return {
              ...post,
              likeCount: likeStatus.likeCount || 0,
              commentCount: comments.length || 0,
              isLiked: likeStatus.likedByCurrentUser || false
            };
          } catch {
            return {
              ...post,
              likeCount: 0,
              commentCount: 0,
              isLiked: false
            };
          }
        })
      );

      setPosts(postsWithEngagement);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load feed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always get fresh token from localStorage
    const token = localStorage.getItem("chirp_token");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    // Clear comments cache on mount/remount
    setComments({});
    setExpandedPostId(null);
    setNewCommentContent({});
    
    loadFeed();
    
    // Fetch current user from /users/me endpoint
    getCurrentUser()
      .then(user => {
        setCurrentUser({ id: user.id, username: user.username });
      })
      .catch(err => {
        console.error("Failed to fetch current user", err);
        navigate("/login");
      });
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      setPostingInProgress(true);
      await createPost({ content: newPostContent });
      setNewPostContent("");
      await loadFeed();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create post";
      setError(message);
    } finally {
      setPostingInProgress(false);
    }
  };

  const handleLikeToggle = async (postId: number, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        await removeLike(postId);
      } else {
        await addLike(postId);
      }

      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !currentlyLiked, 
              likeCount: currentlyLiked ? post.likeCount - 1 : post.likeCount + 1 
            }
          : post
      ));
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chirp_token");
    navigate("/login");
  };

  const handleNavigateToProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  const handleToggleComments = async (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      // Always fetch fresh comments
      try {
        const postComments = await getCommentsByPost(postId);
        setComments({ ...comments, [postId]: postComments });
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    }
  };

  const handleAddComment = async (postId: number) => {
    const content = newCommentContent[postId]?.trim();
    if (!content) return;

    try {
      const newComment = await addComment(postId, { content });
      setComments({
        ...comments,
        [postId]: [newComment, ...(comments[postId] || [])]
      });
      setNewCommentContent({ ...newCommentContent, [postId]: "" });
      
      // Update comment count
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      ));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) return date.toLocaleDateString();
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };

  return (
    <div className="feed-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <img className="sidebar-logo" src={logo} alt="Chirp" onClick={() => navigate("/feed")} />
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span></span>
            <span>Home</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/explore")}>
            <span></span>
            <span>Explore</span>
          </button>
          <button className="nav-item">
            <span></span>
            <span>Notifications</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/messages")}>
            <span></span>
            <span>Chat</span>
          </button>
          <button className="nav-item">
            <span></span>
            <span>Bookmarks</span>
          </button>
          <button className="nav-item" onClick={() => currentUser && navigate(`/profile/${currentUser.id}`)}>
            <span></span>
            <span>Profile</span>
          </button>
        </nav>
        <button className="sidebar-compose">Chirp</button>
        <div className="sidebar-user">
          {currentUser && (
            <button 
              className="user-button"
              style={{ width: "100%" }}
              onClick={() => setShowMenu(!showMenu)}
            >
              {currentUser.username}
            </button>
          )}
          {showMenu && (
            <div className="user-menu" style={{ right: "-160px" }}>
              <button 
                className="menu-item"
                onClick={() => {
                  navigate(`/profile/${currentUser?.id}`);
                  setShowMenu(false);
                }}
              >
                View My Profile
              </button>
              <button 
                className="menu-item"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <header className="feed-header">
        <div className="header-content">
          <h2 className="header-title">Home</h2>
        </div>
      </header>

      <main className="feed-main">
        <div className="feed-content">
          <div className="new-post-card">
            <textarea
              className="new-post-input"
              placeholder="What's happening?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={3}
              maxLength={280}
            />
            <div className="new-post-footer">
              <span className="char-count">{newPostContent.length}/280</span>
              <button 
                className="post-button" 
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || postingInProgress}
              >
                {postingInProgress ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {error && <div className="alert error">{error}</div>}

          {loading ? (
            <div className="loading">Loading feed...</div>
          ) : posts.length === 0 ? (
            <div className="empty-feed">
              <p>No posts yet. Follow some users or create your first post!</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div 
                      className="post-author" 
                      onClick={() => handleNavigateToProfile(post.authorId)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="avatar">{post.authorUsername[0].toUpperCase()}</div>
                      <div className="author-info">
                        <span className="author-name">{post.authorUsername}</span>
                        <span className="post-time">{formatTimestamp(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="post-content">
                    {post.content}
                  </div>

                  <div className="post-actions">
                    <button 
                      className={`action-button ${post.isLiked ? "liked" : ""}`}
                      onClick={() => handleLikeToggle(post.id, post.isLiked)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span>{post.likeCount}</span>
                    </button>

                    <button 
                      className={`action-button ${expandedPostId === post.id ? "active" : ""}`}
                      onClick={() => handleToggleComments(post.id)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>{post.commentCount}</span>
                    </button>
                  </div>

                  {expandedPostId === post.id && (
                    <div className="comments-section">
                      <div className="add-comment">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newCommentContent[post.id] || ""}
                          onChange={(e) => setNewCommentContent({ ...newCommentContent, [post.id]: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <button 
                          className="comment-send-button"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newCommentContent[post.id]?.trim()}
                        >
                          Send
                        </button>
                      </div>
                      <div className="comments-list">
                        {comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="comment">
                            <div className="comment-avatar">{comment.authorUsername[0].toUpperCase()}</div>
                            <div className="comment-content">
                              <div className="comment-header">
                                <span className="comment-author">{comment.authorUsername}</span>
                                <span className="comment-time">{formatTimestamp(comment.createdAt)}</span>
                              </div>
                              <p className="comment-text">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
