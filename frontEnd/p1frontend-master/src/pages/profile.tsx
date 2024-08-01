import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/profile.css';
import { Helmet } from 'react-helmet';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import { Post as PostType, Comment as CommentType, Like as LikeType, Post } from '../interface/types';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
    };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options);
};

const Profile: React.FC = () => {
    const { userId } = useParams<{ userId?: string }>();
    const { user, token } = useAuth();
    const location = useLocation();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [posts, setPosts] = useState<PostType[]>([]);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [likes, setLikes] = useState<LikeType[]>([]);
    const [singlePostContents, setSinglePostContents] = useState<string[]>([]);
    const [postDates, setPostDates] = useState<string[]>([]);
    const [newPostContent, setNewPostContent] = useState<string>('');
    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editingPostContent, setEditingPostContent] = useState<string>('');
    const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
    const [shareUrl, setShareUrl] = useState('');
    const [showModal, setShowModal] = useState(false);


    const fetchData = async () => {
        const currentUserId = user?.userId;

        if (!currentUserId) return;

        try {
            const fetchUserId = userId ? Number(userId) : currentUserId;

            const userResponse = await fetch(`${config.BASE_URL}/api/users/${fetchUserId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            const userData = await userResponse.json();
            setProfileUser(userData);

            const postsResponse = await fetch(`${config.BASE_URL}/api/posts`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            const postsData = await postsResponse.json();
            const userPosts = postsData.filter((post: PostType) => post.userId === fetchUserId);

            // Sort posts by date descending
            userPosts.sort((a: PostType, b: PostType) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setPosts(userPosts);

            const contents = userPosts.map((post: PostType) => post.content);
            const dates = userPosts.map((post: PostType) => formatDate(post.createdAt));

            setSinglePostContents(contents);
            setPostDates(dates);

            const commentsResponse = await fetch(`${config.BASE_URL}/api/comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            const commentsData = await commentsResponse.json();
            setComments(commentsData);

            const likesResponse = await fetch(`${config.BASE_URL}/api/likes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            const likesData = await likesResponse.json();
            setLikes(likesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {

        fetchData();


        const fetchConnectionStatus = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/connections/${user?.userId}/${userId}`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setConnectionStatus(data.status);
                } else {
                    setConnectionStatus(null);
                }
            } catch (error) {
                console.error('Error fetching connection status:', error);
            }
        };

        if (user && user.userId !== Number(userId)) {
            fetchConnectionStatus();
        }
        const intervalId = setInterval(() => {
            fetchData();
        }, 10000);

        return () => clearInterval(intervalId);



    }, [userId, user, token]);

    if (!profileUser) return <p>Loading user...</p>;

    const isCurrentUserProfile = user?.userId === Number(profileUser.userId);


    const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch(`${config.BASE_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ content: newPostContent, user: { userId: user?.userId } })
            });
            const newPost = await response.json();

            // Update posts state
            setPosts([newPost, ...posts]); // Add new post to the beginning
            setSinglePostContents([newPost.content, ...singlePostContents]);
            setPostDates([formatDate(newPost.createdAt), ...postDates]);

            setNewPostContent('');
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const handleEditPost = (postId: number, currentContent: string) => {
        setEditingPostId(postId);
        setEditingPostContent(currentContent);
    };

    const handleUpdatePost = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (editingPostId === null) return;

        try {
            const response = await fetch(`${config.BASE_URL}/api/posts/${editingPostId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ content: editingPostContent, user: { userId: user?.userId } })
            });
            const updatedPost = await response.json();

            // Update posts state
            setPosts(posts.map(post => post.postId === editingPostId ? updatedPost : post));
            setSinglePostContents(singlePostContents.map((content, index) => posts[index].postId === editingPostId ? updatedPost.content : content));
            setPostDates(postDates.map((date, index) => posts[index].postId === editingPostId ? formatDate(updatedPost.createdAt) : date));

            setEditingPostId(null);
            setEditingPostContent('');
        } catch (error) {
            console.error("Error updating post:", error);
        }
    };

    const handleDeletePost = async (postId: number) => {
        try {
            await fetch(`${config.BASE_URL}/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',

            });
            // Update posts state
            const updatedPosts = posts.filter(post => post.postId !== postId);
            const updatedContents = singlePostContents.filter((_, index) => posts[index].postId !== postId);
            const updatedDates = postDates.filter((_, index) => posts[index].postId !== postId);

            setPosts(updatedPosts);
            setSinglePostContents(updatedContents);
            setPostDates(updatedDates);
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const sendConnectionRequest = async () => {
        try {
            const response = await fetch(`${config.BASE_URL}/api/connections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    requester: { userId: user?.userId },
                    receiver: { userId: Number(userId) },
                    status: 'PENDING'
                })
            });

            if (response.ok) {
                setConnectionStatus('PENDING');
                alert('Connection request sent!');
            } else {
                alert('Failed to send connection request.');
            }
        } catch (error) {
            console.error('Error sending connection request:', error);
        }
    };

    const handleSharePost = (postId: any) => {
        const url = `${window.location.origin}/post/${postId}`;
        setShareUrl(url);
        setShowModal(true);
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(shareUrl);
        alert('URL copied to clipboard!');
    };



    return (
        <div id='profileBody'>
            <Helmet>
                <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet" />
            </Helmet>

            <div className="container bootstrap snippets bootdeys">
                <div className="row" id="user-profile">
                    <div className="col-lg-3 col-md-4 col-sm-4">
                        <div className="main-box clearfix">
                            <h2>{profileUser.firstName} {profileUser.lastName}</h2>
                            <div className="profile-status">
                                <i className="fa fa-check-circle"></i> Online
                            </div>
                            <img src={profileUser.profilePicture || "https://bootdey.com/img/Content/avatar/avatar1.png"} alt="Profile" className="profile-img img-responsive center-block" />

                            <div className="profile-details">
                                <ul className="fa-ul">
                                    <li><i className="fa-li fa fa-comment"></i>Posts: <span>{singlePostContents.length}</span></li>
                                </ul>
                            </div>
                            {!isCurrentUserProfile ? (
                                <div className="profile-message-btn center-block text-center">
                                    {connectionStatus === 'ACCEPTED' ? (
                                        <Link to={`/chat/${userId}`} className="btn btn-success">
                                            <i className="fa fa-envelope"></i> Message
                                        </Link>
                                    ) : <p>You need to connect to send Message.</p>}
                                    {connectionStatus === null ? (
                                        <button onClick={sendConnectionRequest} className="btn btn-primary">
                                            <i className="fa fa-user-plus"></i> Connect
                                        </button>
                                    ) : connectionStatus === 'PENDING' ? (
                                        <button className="btn btn-warning" disabled>
                                            Pending
                                        </button>
                                    ) : connectionStatus === 'ACCEPTED' ? (
                                        <button className="btn btn-success" disabled>
                                            Connected
                                        </button>
                                    ) : (
                                        <button className="btn btn-danger" disabled>
                                            Declined
                                        </button>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="col-lg-9 col-md-8 col-sm-8">
                        <div className="main-box clearfix">
                            <div className="profile-header">
                                <h3><span>User info</span></h3>
                                {location.pathname === '/profile' || location.pathname === `/profile/${user?.userId}` ? (
                                    <a href="/edit-profile" className="btn btn-primary edit-profile">
                                        <i className="fa fa-pencil-square fa-lg"></i> Edit profile
                                    </a>
                                ) : null}
                            </div>

                            <div className="row profile-user-info">
                                <div className="col-sm-8">
                                    <div className="profile-user-details clearfix">
                                        <div className="profile-user-details-label">
                                            First Name
                                        </div>
                                        <div className="profile-user-details-value">
                                            {profileUser.firstName}
                                        </div>
                                    </div>
                                    <div className="profile-user-details clearfix">
                                        <div className="profile-user-details-label">
                                            Last Name
                                        </div>
                                        <div className="profile-user-details-value">
                                            {profileUser.lastName}
                                        </div>
                                    </div>
                                    <div className="profile-user-details clearfix">
                                        <div className="profile-user-details-label">
                                            Email
                                        </div>
                                        <div className="profile-user-details-value">
                                            {profileUser.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-4">
                                    <div className='profile-bio'>
                                        My Bio:
                                    </div>
                                    <div className='profile-user-details-value'>
                                        {profileUser.bio}
                                    </div>
                                </div>
                            </div>

                            <div className="tabs-wrapper profile-tabs">
                                <ul className="nav nav-tabs">
                                    <li className="nav-item">
                                        <a className="nav-link active" href="#tab-posts" data-bs-toggle="tab">Posts</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#tab-followers" data-bs-toggle="tab">Followers</a>
                                    </li>
                                </ul>

                                <div className="tab-content">
                                    <div className="tab-pane fade show active" id="tab-posts">
                                        {location.pathname === '/profile' || location.pathname === `/profile/${user?.userId}` ? (
                                            <form onSubmit={handleCreatePost} className="mb-4">
                                                <div className="form-group">
                                                    <textarea
                                                        className="form-control"
                                                        rows={3}
                                                        value={newPostContent}
                                                        onChange={(e) => setNewPostContent(e.target.value)}
                                                        placeholder="What's on your mind?"
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary mt-2">Create Post</button>
                                            </form>) : null}
                                        <div className="table-responsive">
                                            <table className="table">
                                                <tbody>
                                                    {singlePostContents.length > 0 ? (
                                                        singlePostContents.map((content, index) => (
                                                            <tr key={index}>
                                                               
                                                                {/* {location.pathname === '/profile' || location.pathname === `/profile/${user?.userId}` ? (
                                                                    <td>
                                                                        {editingPostId === posts[index].postId ? (
                                                                            <form onSubmit={handleUpdatePost}>
                                                                                <div className="form-group">
                                                                                    <textarea
                                                                                        className="form-control"
                                                                                        rows={3}
                                                                                        value={editingPostContent}
                                                                                        onChange={(e) => setEditingPostContent(e.target.value)}
                                                                                        required
                                                                                    />
                                                                                </div>
                                                                                <button type="submit" className="btn btn-primary mt-2">Update Post</button>
                                                                                <button type="button" className="btn btn-secondary mt-2 ms-2" onClick={() => { setEditingPostId(null); setEditingPostContent(''); }}>Cancel</button>
                                                                            </form>
                                                                        ) : null}
                                                                    </td>
                                                                ) : null} */}




                                                                <td>
                                                                    {editingPostId === posts[index].postId ? (
                                                                        <form onSubmit={handleUpdatePost}>
                                                                            <div className="form-group">
                                                                                <textarea
                                                                                    className="form-control"
                                                                                    rows={3}
                                                                                    value={editingPostContent}
                                                                                    onChange={(e) => setEditingPostContent(e.target.value)}
                                                                                    required
                                                                                />
                                                                            </div>
                                                                            <button type="submit" className="btn btn-custom btn-edit mt-2">Update Post</button>
                                                                            <button type="button" className="btn btn-secondary mt-2 ms-2" onClick={() => { setEditingPostId(null); setEditingPostContent(''); }}>Cancel</button>
                                                                        </form>
                                                                    ) : (
                                                                        <div>
                                                                            <div>
                                                                                <p>{content}</p>
                                                                                {location.pathname === '/profile' || location.pathname === `/profile/${user?.userId}` ? (
                                                                                    <button className="btn btn-warning btn-sm" onClick={() => handleEditPost(posts[index].postId, content)}>Edit</button>) : null}
                                                                                {location.pathname === '/profile' || location.pathname === `/profile/${user?.userId}` ? (
                                                                                    <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDeletePost(posts[index].postId)}>Delete</button>) : null}
                                                                                <button className="btn btn-info btn-sm small-btn" onClick={() => handleSharePost(posts[index].postId)}>Share</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {postDates[index] || 'No date available'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="text-center">
                                                                No posts available.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {showModal && (
                                                        <div className="modal" tabIndex={-1} style={{ display: 'block' }}>
                                                            <div className="modal-dialog">
                                                                <div className="modal-content">
                                                                    <div className="modal-header">
                                                                        <h5 className="modal-title">Share Post</h5>

                                                                    </div>
                                                                    <div className="modal-body">
                                                                        <p>Copy the URL below to share the post:</p>
                                                                        <input type="text" className="form-control" value={shareUrl} readOnly />
                                                                    </div>
                                                                    <div className="modal-footer">
                                                                        <button type="button" className="btn btn-primary" onClick={handleCopyUrl}>Copy URL</button>
                                                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="tab-pane fade" id="tab-followers">
                                        <ul className="widget-users row">
                                            <li className="col-md-6">
                                                <div className="img">
                                                    <img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="img-responsive" alt="Friend" />
                                                </div>
                                                <div className="details">
                                                    <div className="name">
                                                        <a href="#">John Doe</a>
                                                    </div>
                                                    <div className="time">
                                                        <i className="fa fa-clock-o"></i> Last online: 5 minutes ago
                                                    </div>
                                                    <div className="type">
                                                        <span className="badge bg-danger">Admin</span>
                                                    </div>
                                                </div>
                                            </li>
                                            {/* Add more followers list items as needed */}
                                        </ul>
                                        <br />
                                        <a href="#" className="btn btn-success float-end">View all users</a>
                                    </div>

                                    <div className="tab-pane fade" id="tab-chat">
                                        <div className="conversation-wrapper">
                                            <div className="conversation-content">
                                                <div className="conversation-inner" style={{ height: '340px', overflowY: 'scroll' }}>
                                                    <div className="conversation-item item-left clearfix">
                                                        <div className="conversation-user">
                                                            <img src="https://bootdey.com/img/Content/avatar/avatar1.png" className="img-responsive" alt="User" />
                                                        </div>
                                                        <div className="conversation-body">
                                                            <div className="name">
                                                                Ryan Gossling
                                                            </div>
                                                            <div className="time">
                                                                September 21, 2013 18:28
                                                            </div>
                                                            <div className="text">
                                                                I don't think they tried to market it to the billionaire, spelunking, base-jumping crowd.
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Add more chat items as needed */}
                                                </div>
                                            </div>
                                            <div className="conversation-new-message">


                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default Profile;