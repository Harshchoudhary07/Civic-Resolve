import React, { useState } from 'react';
import { HiHandThumbUp, HiChatBubbleLeftRight } from 'react-icons/hi2';
import '../styles/feed-animations.css';

export default function FeedCard({ complaint, onUpvote }) {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentCount, setCommentCount] = useState(complaint.commentCount || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const [likeButtonAnimate, setLikeButtonAnimate] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    const handleUpvoteClick = () => {
        // Trigger animations
        setShowLikeAnimation(true);
        setLikeButtonAnimate(true);
        setIsLiked(!isLiked);
        
        // Call parent upvote handler
        onUpvote(complaint._id);
        
        // Reset animations
        setTimeout(() => setShowLikeAnimation(false), 1000);
        setTimeout(() => setLikeButtonAnimate(false), 300);
    };

    const fetchComments = async () => {
        if (showComments && comments.length > 0) {
            setShowComments(false);
            return;
        }

        setShowComments(true);
        setLoadingComments(true);
        try {
            const res = await fetch(`/api/feed/${complaint._id}/comments`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const data = await res.json();
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`/api/feed/${complaint._id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ content: newComment }),
            });
            const data = await res.json();
            if (res.ok) {
                setComments([data, ...comments]);
                setNewComment('');
                setCommentCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div style={styles.card}>
            {/* Header */}
            <div style={styles.header}>
                <img
                    src={complaint.user?.profilePicture || `https://ui-avatars.com/api/?name=${complaint.user?.name || 'User'}&background=random`}
                    alt="Avatar"
                    style={styles.avatar}
                />
                <div style={styles.headerInfo}>
                    <div style={styles.author}>{complaint.user?.name || 'Anonymous Citizen'}</div>
                    <div style={styles.meta}>
                        {formatDate(complaint.createdAt)} • {complaint.location.address || 'No Location'}
                    </div>
                </div>
                <div style={getStatusStyle(complaint.currentStatus)}>
                    {complaint.currentStatus}
                </div>
            </div>

            {/* Content */}
            <div style={styles.content}>
                <h3 style={styles.title}>{complaint.title}</h3>
                <p style={styles.description}>{complaint.description}</p>
                {complaint.attachments && complaint.attachments.length > 0 && (
                    <div 
                        style={styles.imageContainer}
                        onClick={() => setShowImageModal(true)}
                    >
                        <img 
                            src={complaint.attachments[0].url} 
                            alt="Complaint" 
                            style={styles.image} 
                        />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={styles.actions}>
                <button 
                    onClick={handleUpvoteClick} 
                    className={`btn-gradient-ghost ${likeButtonAnimate ? 'like-button-animate' : ''}`}
                    style={{
                        ...styles.actionButton,
                        color: isLiked ? '#FF9933' : 'var(--muted)',
                        fontWeight: isLiked ? '600' : '500'
                    }}
                >
                    <span style={{ 
                        display: 'inline-flex', 
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: likeButtonAnimate ? 'scale(1.3)' : 'scale(1)'
                    }}>
                        <HiHandThumbUp />
                    </span>
                    <span>{complaint.upvoteCount} Upvotes</span>
                </button>
                <button 
                    onClick={fetchComments} 
                    className={`btn-gradient-ghost ${showComments ? 'comment-button-active' : ''}`}
                    style={{
                        ...styles.actionButton,
                        color: showComments ? '#3b82f6' : 'var(--muted)',
                        fontWeight: showComments ? '600' : '500'
                    }}
                >
                    <span style={{ 
                        display: 'inline-flex',
                        transition: 'transform 0.3s ease',
                        transform: showComments ? 'rotate(15deg) scale(1.1)' : 'rotate(0) scale(1)'
                    }}>
                        <HiChatBubbleLeftRight />
                    </span>
                    <span>{commentCount} Comments</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={styles.commentsSection} className="comments-section-animate">
                    <form onSubmit={handlePostComment} style={styles.commentForm}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            style={styles.commentInput}
                        />
                        <button type="submit" className="btn-gradient-primary" style={styles.commentButton} disabled={!newComment.trim()}>
                            Post
                        </button>
                    </form>

                    {loadingComments ? (
                        <div style={{ padding: '10px', color: '#666' }}>Loading comments...</div>
                    ) : (
                        <div style={styles.commentsList}>
                            {comments.map((comment) => (
                                <div key={comment._id} style={styles.commentItem} className="comment-item-fade-in">
                                    <img
                                        src={comment.user?.profilePicture || `https://ui-avatars.com/api/?name=${comment.user?.name}&background=random`}
                                        alt="User"
                                        style={styles.commentAvatar}
                                    />
                                    <div style={styles.commentContent}>
                                        <div style={styles.commentAuthor}>{comment.user?.name}</div>
                                        <div style={styles.commentText}>{comment.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && complaint.attachments && complaint.attachments.length > 0 && (
                <div 
                    style={styles.modalOverlay}
                    onClick={() => setShowImageModal(false)}
                >
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button 
                            style={styles.closeButton}
                            onClick={() => setShowImageModal(false)}
                        >
                            ✕
                        </button>
                        <img 
                            src={complaint.attachments[0].url} 
                            alt="Complaint Full Size" 
                            style={styles.modalImage}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

const getStatusStyle = (status) => ({
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    background:
        status === "Resolved" ? "#dcfce7" :
            status === "In Progress" ? "#dbeafe" :
                status === "Pending" ? "#fef3c7" : "#fee2e2",
    color:
        status === "Resolved" ? "#166534" :
            status === "In Progress" ? "#1e40af" :
                status === "Pending" ? "#b45309" : "#991b1b",
});

const styles = {
    card: {
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        marginBottom: '20px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
    },
    header: {
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border)'
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover'
    },
    headerInfo: {
        flex: 1
    },
    author: {
        fontWeight: '600',
        color: 'var(--text)',
        fontSize: '15px'
    },
    meta: {
        fontSize: '12px',
        color: 'var(--muted)'
    },
    content: {
        padding: '16px'
    },
    title: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '8px',
        color: 'var(--text)'
    },
    description: {
        fontSize: '14px',
        color: 'var(--text)',
        lineHeight: '1.5',
        marginBottom: '12px'
    },
    imageContainer: {
        borderRadius: '8px',
        overflow: 'hidden',
        maxHeight: '300px',
        background: '#f1f5f9',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease'
    },
    actions: {
        display: 'flex',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
    },
    actionButton: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--muted)',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background 0.2s',
        '&:hover': {
            background: 'var(--hover)'
        }
    },
    commentsSection: {
        background: 'var(--bg-secondary)',
        padding: '16px'
    },
    commentForm: {
        display: 'flex',
        gap: '10px',
        marginBottom: '16px'
    },
    commentInput: {
        flex: 1,
        padding: '8px 12px',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        fontSize: '14px'
    },
    commentButton: {
        padding: '8px 16px',
        borderRadius: '20px',
        background: 'var(--primary)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500'
    },
    commentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    commentItem: {
        display: 'flex',
        gap: '10px'
    },
    commentAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%'
    },
    commentContent: {
        background: 'var(--card)',
        padding: '10px 14px',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        flex: 1
    },
    commentAuthor: {
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '2px',
        color: 'var(--text)'
    },
    commentText: {
        fontSize: '13px',
        color: 'var(--text)'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
    },
    modalContent: {
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalImage: {
        maxWidth: '100%',
        maxHeight: '90vh',
        objectFit: 'contain',
        borderRadius: '8px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    closeButton: {
        position: 'absolute',
        top: '-40px',
        right: '0',
        background: 'rgba(255, 255, 255, 0.9)',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
    }
};
