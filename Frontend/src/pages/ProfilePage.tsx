import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserProfile, getFollowers, getFollowing, isFollowing, followUser, unfollowUser, getCurrentUser, UserProfile, Follower, Following } from "@api/UserApi";
import { getPostsByUser, PostResponse } from "@api/PostApi";
import { addLike, removeLike, getLikeStatus } from "@api/LikeApi";
import { getCommentsByPost, addComment, CommentResponse } from "@api/CommentApi";
import logo from "../assets/chirp.svg";

interface PostWithEngagement extends PostResponse {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostWithEngagement[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, CommentResponse[]>>({});
  const [newCommentContent, setNewCommentContent] = useState<Record<number, string>>({});

  const loadProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const profileData = await getUserProfile(parseInt(userId));
      setProfile(profileData);

      const [followersData, followingData, postsData] = await Promise.all([
        getFollowers(parseInt(userId)),
        getFollowing(parseInt(userId)),
        getPostsByUser(parseInt(userId), 0, 20)
      ]);

      setFollowers(followersData);
      setFollowing(followingData);

      const postsWithEngagement = await Promise.all(
        postsData.map(async (post) => {
          try {
            const [likeStatus, postComments] = await Promise.all([
              getLikeStatus(post.id),
              getCommentsByPost(post.id)
            ]);
            return {
              ...post,
              likeCount: likeStatus.likeCount || 0,
              commentCount: postComments.length || 0,
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

      try {
        const followStatus = await isFollowing(parseInt(userId));
        setIsFollowingUser(followStatus);
      } catch {
        setIsFollowingUser(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load profile";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const curr = await getCurrentUser();
        setCurrentUser(curr);
      } catch (err) {
        console.error("Failed to load current user:", err);
      }
    };

    loadCurrentUser();
    loadProfile();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!profile) return;

    try {
      setFollowLoading(true);
      if (isFollowingUser) {
        await unfollowUser(profile.id);
      } else {
        await followUser(profile.id);
      }
      
      // Re-check the follow status from the server
      const followStatus = await isFollowing(profile.id);
      console.log("Follow status response:", followStatus, typeof followStatus);
      
      // Handle both boolean and object responses
      const isNowFollowing = typeof followStatus === 'boolean' ? followStatus : followStatus === true;
      setIsFollowingUser(isNowFollowing);
      
      // Refresh followers list
      const followersData = await getFollowers(profile.id);
      setFollowers(followersData);
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setFollowLoading(false);
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

  const handleToggleComments = async (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      // Always fetch fresh comments
      try {
        const postComments = await getCommentsByPost(postId);
        setComments({ ...comments, [postId]: postComments });
        setPosts(posts.map(post =>
          post.id === postId
            ? { ...post, commentCount: postComments.length }
            : post
        ));
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
      const updatedComments = [newComment, ...(comments[postId] || [])];
      setComments({
        ...comments,
        [postId]: updatedComments
      });
      setNewCommentContent({ ...newCommentContent, [postId]: "" });
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, commentCount: updatedComments.length }
          : post
      ));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chirp_token");
    navigate("/login");
  };

  const handleNavigateToProfile = (id: number) => {
    navigate(`/profile/${id}`);
    window.scrollTo(0, 0);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(date);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <header className="feed-header">
          <div className="header-content">
            <img className="header-logo" src={logo} alt="Chirp" onClick={() => navigate("/feed")} style={{ cursor: "pointer" }} />
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-container">
        <header className="feed-header">
          <div className="header-content">
            <img className="header-logo" src={logo} alt="Chirp" onClick={() => navigate("/feed")} style={{ cursor: "pointer" }} />
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <div className="alert error">{error || "User not found"}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <img className="sidebar-logo" src={logo} alt="Chirp" onClick={() => navigate("/feed")} />
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate("/feed")}>
            <span></span>
            <span>Home</span>
          </button>
          <button className="nav-item">
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
          <button className="nav-item active">
            <span></span>
            <span>Profile</span>
          </button>
        </nav>
        <button className="sidebar-compose">Chirp</button>
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
          <h2 className="header-title">{profile?.username}</h2>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-content">
          <button className="back-button" onClick={() => navigate("/feed")}>←</button>

          <div className="profile-header-card">
            <div className="profile-avatar-large">{profile?.username[0].toUpperCase()}</div>
            
            <div className="profile-info">
              <h1 className="profile-username">{profile?.username}</h1>
              <p className="profile-email">{profile?.email}</p>
              <p className="profile-joined">Joined {profile?.createdAt ? formatDate(profile.createdAt) : ""}</p>
            </div>

            <button 
              className={`follow-button ${isFollowingUser ? "following" : ""}`}
              onClick={handleFollowToggle}
              disabled={followLoading}
              style={{ display: currentUser && profile && currentUser.id !== profile.id ? "block" : "none" }}
            >
              {followLoading ? "Loading..." : isFollowingUser ? "Unfollow" : "Follow"}
            </button>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-label">Posts</span>
              <span className="stat-value">{posts.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Followers</span>
              <span className="stat-value">{followers.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Following</span>
              <span className="stat-value">{following.length}</span>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="empty-feed">
              <p>{profile.username} hasn't posted yet.</p>
            </div>
          ) : (
            <div className="posts-list">
              <h2 className="section-title">Posts</h2>
              {posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div 
                        className="avatar" 
                        onClick={() => handleNavigateToProfile(post.authorId)}
                        style={{ cursor: "pointer" }}
                      >
                        {post.authorUsername[0].toUpperCase()}
                      </div>
                      <div className="author-info">
                        <span 
                          className="author-name" 
                          onClick={() => handleNavigateToProfile(post.authorId)}
                          style={{ cursor: "pointer" }}
                        >
                          {post.authorUsername}
                        </span>
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
