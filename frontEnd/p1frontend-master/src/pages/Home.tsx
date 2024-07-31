import React, { useEffect, useState } from 'react';
import config from '../config';
import { Post as PostType, Comment as CommentType, Like as LikeType } from '../interface/types';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/home.css';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [likes, setLikes] = useState<LikeType[]>([]);
    const [newComments, setNewComments] = useState<{ [postId: number]: string }>({});
    const [likedPosts, setLikedPosts] = useState<{ [postId: number]: boolean }>({});
    const { user, token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const postsResponse = await fetch(`${config.BASE_URL}/api/posts`, { credentials: 'include' });
                const postsData = await postsResponse.json();

                // Sort posts by date descending (newest first)
                postsData.sort((a: PostType, b: PostType) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setPosts(postsData);

                const commentsResponse = await fetch(`${config.BASE_URL}/api/comments`, { credentials: 'include' });
                const commentsData = await commentsResponse.json();
                setComments(commentsData);

                const likesResponse = await fetch(`${config.BASE_URL}/api/likes`, { credentials: 'include' });
                const likesData = await likesResponse.json();
                setLikes(likesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleCommentChange = (postId: number, value: string) => {
        setNewComments(prevState => ({
            ...prevState,
            [postId]: value
        }));
    };

    const handleCommentSubmit = async (postId: number) => {
        const commentContent = newComments[postId];
        if (!commentContent) return;

        try {
            const response = await fetch(`${config.BASE_URL}/api/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    post: { postId },
                    user: { userId: user?.userId },
                    content: commentContent
                }),
            });

            if (response.ok) {
                const newComment = await response.json();
                setComments(prevState => [...prevState, newComment]);
                setNewComments(prevState => ({
                    ...prevState,
                    [postId]: ''
                }));
            } else {
                console.error("Error submitting comment");
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    const handleLikeClick = async (postId: number) => {
        const isLiked = likedPosts[postId];

        try {
            const response = await fetch(`${config.BASE_URL}/api/likes`, {
                method: isLiked ? 'DELETE' : 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postId }),
            });

            if (response.ok) {
                setLikedPosts(prevState => ({
                    ...prevState,
                    [postId]: !isLiked
                }));

                const updatedLikes = await fetch(`${config.BASE_URL}/api/likes`, { credentials: 'include' });
                const updatedLikesData = await updatedLikes.json();
                setLikes(updatedLikesData);
            } else {
                console.error(`Error ${isLiked ? 'removing' : 'adding'} like`);
            }
        } catch (error) {
            console.error(`Error ${isLiked ? 'removing' : 'adding'} like:`, error);
        }
    };

    return (
        <div className="home">
            <div className="container mt-4">
                <div className="row">
                    <h1 className="mb-4 text-center">Home</h1>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div className="col-lg-4 col-md-6 mb-4" key={post.postId}>
                                <div className="card shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <div key={post.postId}>
                                                <Link to={`/profile/${post.userId}`}>
                                                    <h3>{post.username}</h3>
                                                </Link>
                                                <p>{post.content}</p>
                                                <span>{new Date(post.createdAt).toLocaleString('en-us', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                })}</span>
                                            </div>
                                        </h5>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <i
                                                className={`fas fa-thumbs-up like ${likedPosts[post.postId] ? 'text-primary' : 'text-secondary'}`}
                                                style={{ cursor: 'pointer', fontSize: '1.5em' }}
                                                onClick={() => handleLikeClick(post.postId)}
                                            ></i>
                                            <small className="text-muted">
                                                {likes.filter(like => like.postId === post.postId).length} Likes
                                            </small>
                                        </div>
                                        <div className="mt-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Add a comment..."
                                                value={newComments[post.postId] || ''}
                                                onChange={(e) => handleCommentChange(post.postId, e.target.value)}
                                            />
                                            <button
                                                className="btn btn-sm btn-secondary mt-2"
                                                onClick={() => handleCommentSubmit(post.postId)}
                                            >
                                                Submit Comment
                                            </button>
                                        </div>
                                        <div className="comments mt-3">
                                            {comments.filter(comment => comment.postId === post.postId).map((comment) => (
                                                <div key={comment.commentId} className="comment mb-2">
                                                    <strong>{comment.username}</strong>: {comment.content}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="card-footer text-muted">
                                        {comments.filter(comment => comment.postId === post.postId).length} Comments
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center">
                            <p>No posts available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
