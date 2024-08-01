import React, { useEffect, useState } from 'react';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import '../css/connection.css';
import { Connection } from '../interface/types';

const ConnectionPage: React.FC = () => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const response = await fetch(`${config.BASE_URL}/api/connections/receiver/${user?.userId}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setConnections(data);
                } else {
                    console.error('Failed to fetch connections');
                }
            } catch (error) {
                console.error('Error fetching connections:', error);
            }
        };

        if (user) {
            fetchConnections();
        }
    }, [user]);

    const handleAccept = async (connection: Connection) => {
        try {
            const response = await fetch(`${config.BASE_URL}/api/connections/${connection.connectionId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: "ACCEPTED",
                    receiver: { userId: connection.receiverId },
                    requester: { userId: connection.requesterId },
                }),
            });
            if (response.ok) {
                setConnections(connections.map(conn => conn.connectionId === connection.connectionId ? { ...conn, status: 'ACCEPTED' } : conn));
            } else {
                console.error('Failed to accept connection');
            }
        } catch (error) {
            console.error('Error accepting connection:', error);
        }
    };

    const handleReject = async (connectionId: number) => {
        try {
            const response = await fetch(`${config.BASE_URL}/api/connections/${connectionId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: "DECLINED"
                })
            });
            if (response.ok) {
                setConnections(connections.filter(conn => conn.connectionId !== connectionId));
            } else {
                console.error('Failed to reject connection');
            }
        } catch (error) {
            console.error('Error rejecting connection:', error);
        }
    };

    const handleRemove = async (connectionId: number) => {
        try {
            const response = await fetch(`${config.BASE_URL}/api/connections/${connectionId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                setConnections(connections.filter(conn => conn.connectionId !== connectionId));
            } else {
                console.error('Failed to remove connection');
            }
        } catch (error) {
            console.error('Error removing connection:', error);
        }
    };

    return (
        <div className="connection-page">
        <h1>Connections</h1>
        {connections.length === 0 ? (
            <p>No connections available.</p>
        ) : (
            <div className="connection-list">
                {connections.map((conn) => (
                    <div key={conn.connectionId} className="connection-item">
                        <p>{conn.requesterId !== user?.userId ? conn.requesterUsername : conn.receiverUsername}</p>
                        {conn.status === 'PENDING' ? (
                            <div className="connection-actions">
                                <button onClick={() => handleAccept(conn)} className="accept-btn">Accept</button>
                                <button onClick={() => handleReject(conn.connectionId)} className="reject-btn">Reject</button>
                            </div>
                        ) : (
                            <button onClick={() => handleRemove(conn.connectionId)} className="remove-btn">Remove</button>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
    );
};

export default ConnectionPage;
