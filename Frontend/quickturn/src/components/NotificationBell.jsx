import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, X, MessageCircle, Briefcase, Star, UserCheck, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BASE_URL, WS_URL } from '../utils/apiConfig';
import './NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const stompClientRef = useRef(null);

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${BASE_URL}/api/notifications/unread`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${BASE_URL}/api/notifications/count`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [token]);

    // Setup WebSocket connection for real-time notifications
    useEffect(() => {
        if (!token || !userId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                // Subscribe to user-specific notification channel
                client.subscribe(`/topic/notifications/${userId}`, (message) => {
                    const notification = JSON.parse(message.body);
                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });

                // Subscribe to unread count updates
                client.subscribe(`/topic/notifications/${userId}/count`, (message) => {
                    const count = JSON.parse(message.body);
                    setUnreadCount(count);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message']);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [token, userId]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            await fetch(`${BASE_URL}/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await fetch(`${BASE_URL}/api/notifications/read-all`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            setIsOpen(false);
        }
    };

    // Get icon based on notification type
    const getNotificationIcon = (type) => {
        const iconProps = { size: 18 };
        switch (type) {
            case 'APPLICATION_RECEIVED':
            case 'APPLICATION_ACCEPTED':
            case 'APPLICATION_REJECTED':
                return <UserCheck {...iconProps} />;
            case 'WORK_SUBMITTED':
            case 'WORK_ACCEPTED':
            case 'WORK_REVISION_REQUESTED':
                return <FileCheck {...iconProps} />;
            case 'PROJECT_STARTED':
            case 'PROJECT_COMPLETED':
                return <Briefcase {...iconProps} />;
            case 'REVIEW_RECEIVED':
                return <Star {...iconProps} />;
            case 'NEW_MESSAGE':
                return <MessageCircle {...iconProps} />;
            default:
                return <Bell {...iconProps} />;
        }
    };

    // Get icon color based on notification type
    const getIconColor = (type) => {
        if (type?.includes('ACCEPTED') || type?.includes('COMPLETED')) {
            return 'notification-icon success';
        }
        if (type?.includes('REJECTED') || type?.includes('REVISION')) {
            return 'notification-icon warning';
        }
        if (type?.includes('RECEIVED') || type?.includes('REVIEW')) {
            return 'notification-icon info';
        }
        return 'notification-icon';
    };

    if (!token) return null;

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button
                className={`notification-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <div className="notification-actions">
                            {unreadCount > 0 && (
                                <button
                                    className="mark-all-read-btn"
                                    onClick={markAllAsRead}
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={16} />
                                </button>
                            )}
                            <button
                                className="close-dropdown-btn"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-loading">
                                <div className="loading-spinner" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <Bell size={40} strokeWidth={1} />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className={getIconColor(notification.type)}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <p className="notification-title">{notification.title}</p>
                                        <p className="notification-message">{notification.message}</p>
                                        <span className="notification-time">{notification.timeAgo}</span>
                                    </div>
                                    {!notification.read && (
                                        <button
                                            className="mark-read-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification.id);
                                            }}
                                            title="Mark as read"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <button onClick={() => { navigate('/notifications'); setIsOpen(false); }}>
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
