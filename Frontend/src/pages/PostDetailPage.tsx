import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPost, PostResponse } from "@api/PostApi";
import { addLike, removeLike, getLikeStatus } from "@api/LikeApi";
import { getCommentsByPost, addComment, CommentResponse } from "@api/CommentApi";
import { getCurrentUser, UserProfile } from "@api/UserApi";
import logo from "../assets/chirp.svg";

interface PostWithEngagement extends PostResponse {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export default function PostDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostWithEngagement | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const loadPost = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);
      
      const postData = await getPost(parseInt(postId));
      const [likeStatus, commentsData] = await Promise.all([
        getLikeStatus(parseInt(postId)),
        getCommentsByPost(parseInt(postId))
      ]);

      setPost({
        ...postData,
        likeCount: likeStatus.likeCount || 0,
        commentCount: commentsData.length || 0,
        isLiked: likeStatus.likedByCurrentUser || false
      });
      setComments(commentsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load post";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("chirp_token");
    if (!token) {
      navigate("/login");
      return;
    }

    getCurrentUser()
      .then(user => {
        setCurrentUser(user);
      })
      .catch(err => {
        console.error("Failed to fetch current user", err);
        navigate("/login");
      });

    loadPost();
  }, [postId]);

  useEffect(() => {
    // Listen for profile updates
    const handleProfileUpdate = (event: Event) => {
      if (event instanceof CustomEvent) {
        const updatedUser = event.detail;
        setCurrentUser(updatedUser);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleLikeToggle = async (currentlyLiked: boolean) => {
    if (!post) return;

    try {
      if (currentlyLiked) {
        await removeLike(post.id);
      } else {
        await addLike(post.id);
      }

      setPost({
        ...post,
        isLiked: !currentlyLiked,
        likeCount: currentlyLiked ? post.likeCount - 1 : post.likeCount + 1
      });
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentContent.trim() || !post) return;

    try {
      const newComment = await addComment(post.id, { content: newCommentContent });
      setComments([...comments, newComment]);
      setNewCommentContent("");
      setPost({ ...post, commentCount: post.commentCount + 1 });
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

  const handleNavigateToProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="feed-container">
        <aside className="sidebar">
          <img className="sidebar-logo" src={logo} alt="Chirp" onClick={() => navigate("/feed")} />
        </aside>
        <div className="feed-main">
          <div className="loading">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="feed-container">
        <aside className="sidebar">
          <img className="sidebar-logo" src={logo} alt="Chirp" onClick={() => navigate("/feed")} />
        </aside>
        <div className="feed-main">
          <div className="alert error">{error || "Post not found"}</div>
        </div>
      </div>
    );
  }

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
      </aside>

      {/* Main Content */}
      <div className="feed-main">
        <header className="feed-header">
          <div className="header-content">
            <button className="back-button" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 className="header-title">Post</h2>
          </div>
        </header>

        <main className="feed-content">
          {/* Post Detail */}
          <div className="post-detail-card">
            <div className="post-header">
              <div 
                className="post-author" 
                onClick={() => handleNavigateToProfile(post.authorId)}
                style={{ cursor: "pointer" }}
              >
                <div className="avatar">
                  {currentUser && currentUser.id === post.authorId && currentUser.profilePictureUrl ? (
                    <img src={currentUser.profilePictureUrl} alt={post.authorUsername} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : post.authorProfilePictureUrl ? (
                    <img src={post.authorProfilePictureUrl} alt={post.authorUsername} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    post.authorUsername[0].toUpperCase()
                  )}
                </div>
                <div className="author-info">
                  <span className="author-name">{post.authorUsername}</span>
                  <span className="post-time">{formatTimestamp(post.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="post-detail-content">
              {post.content}
            </div>

            {post.mediaUrl && (
              <div className="post-detail-media">
                <img src={post.mediaUrl} alt="Post media" />
              </div>
            )}

            <div className="post-actions">
              <button 
                className={`action-button ${post.isLiked ? "liked" : ""}`}
                onClick={() => handleLikeToggle(post.isLiked)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>{post.likeCount}</span>
              </button>

              <button className="action-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>{post.commentCount}</span>
              </button>
            </div>
          </div>

          {/* Add Comment */}
          <div className="add-comment-box">
            <div className="comment-avatar">
              {currentUser?.profilePictureUrl ? (
                <img src={currentUser.profilePictureUrl} alt={currentUser.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                currentUser?.username[0].toUpperCase()
              )}
            </div>
            <div className="comment-input-wrapper">
              <textarea
                className="comment-textarea"
                placeholder="Post your reply"
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                rows={3}
              />
              <button 
                className="comment-reply-button"
                onClick={handleAddComment}
                disabled={!newCommentContent.trim()}
              >
                Reply
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">No comments yet. Be the first to reply!</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div 
                    className="comment-avatar"
                    onClick={() => handleNavigateToProfile(comment.authorId)}
                    style={{ cursor: "pointer" }}
                  >
                    {currentUser && currentUser.id === comment.authorId && currentUser.profilePictureUrl ? (
                      <img src={currentUser.profilePictureUrl} alt={comment.authorUsername} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      comment.authorUsername[0].toUpperCase()
                    )}
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span 
                        className="comment-author"
                        onClick={() => handleNavigateToProfile(comment.authorId)}
                        style={{ cursor: "pointer" }}
                      >
                        {comment.authorUsername}
                      </span>
                      <span className="comment-time">{formatTimestamp(comment.createdAt)}</span>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

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
