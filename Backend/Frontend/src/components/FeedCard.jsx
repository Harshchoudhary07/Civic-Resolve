import React, { useState } from 'react';

export default function FeedCard({ complaint, onUpvote }) {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentCount, setCommentCount] = useState(complaint.commentCount || 0);

    const handleUpvoteClick = () => {
        onUpvote(complaint._id);
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
                    <div style={styles.imageContainer}>
                        <img src={complaint.attachments[0].url} alt="Complaint" style={styles.image} />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={styles.actions}>
                <button onClick={handleUpvoteClick} style={styles.actionButton}>
                    <span>👍</span>
                    <span>{complaint.upvoteCount} Upvotes</span>
                </button>
                <button onClick={fetchComments} style={styles.actionButton}>
                    <span>💬</span>
                    <span>{commentCount} Comments</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={styles.commentsSection}>
                    <form onSubmit={handlePostComment} style={styles.commentForm}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            style={styles.commentInput}
                        />
                        <button type="submit" style={styles.commentButton} disabled={!newComment.trim()}>
                            Post
                        </button>
                    </form>

                    {loadingComments ? (
                        <div style={{ padding: '10px', color: '#666' }}>Loading comments...</div>
                    ) : (
                        <div style={styles.commentsList}>
                            {comments.map((comment) => (
                                <div key={comment._id} style={styles.commentItem}>
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
        background: '#f1f5f9'
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
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
    }
};
