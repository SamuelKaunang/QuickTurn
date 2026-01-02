import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { ArrowLeft, Send, MessageSquare, Paperclip, X, FileText, Download, Image } from 'lucide-react';
import { api, wsEndpoint } from './utils/apiConfig';
import { SkeletonChatContact, SkeletonChatMessage } from './Skeleton';
import './ChatPage.css';

// Reusable Avatar Component
const UserAvatar = ({ src, name, type }) => {
    const [imgError, setImgError] = useState(false);

    // Reset error state when src changes
    useEffect(() => {
        setImgError(false);
    }, [src]);

    const isHeader = type === 'header';
    const containerClass = isHeader ? 'chat-header-avatar' : 'contact-avatar';
    const imgClass = isHeader ? 'chat-header-avatar-img' : 'contact-avatar-img';

    if (!src || imgError) {
        return (
            <div className={`${containerClass} avatar-red-circle`}>
                {name?.charAt(0)?.toUpperCase()}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            className={imgClass}
            onError={() => setImgError(true)}
        />
    );
};

const ChatPage = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");
    const [user, setUser] = useState(null);

    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Attachment state
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Max file size 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    // 1. Get My Profile
    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        fetch(api("/api/users/profile"), { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setUser(data.data);
                    connectWebSocket(data.data.id);
                }
            })
            .catch(() => navigate('/login'));
    }, [token, navigate]);

    // 2. Fetch Contacts
    useEffect(() => {
        if (user) fetchContacts();
    }, [user]);

    // 3. Fetch History
    useEffect(() => {
        if (activeChat && user) {
            const targetId = activeChat.userId || activeChat.id;
            setLoadingMessages(true);

            fetch(api(`/api/chat/history?otherUserId=${targetId}`), {
                headers: { "Authorization": `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    let validMessages = [];
                    if (Array.isArray(data)) {
                        validMessages = data;
                    } else if (data.data && Array.isArray(data.data)) {
                        validMessages = data.data;
                    } else if (data.content && Array.isArray(data.content)) {
                        validMessages = data.content;
                    }

                    setMessages(validMessages);
                    scrollToBottom();
                })
                .catch(err => console.error("History fetch error:", err))
                .finally(() => setLoadingMessages(false));
        }
    }, [activeChat, user]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const fetchContacts = async () => {
        try {
            setLoadingContacts(true);
            const res = await fetch(api("/api/chat/contacts"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();

            const fixedContacts = (data.data || [])
                .map(c => ({ ...c, userId: c.userId || c.id }))
                .filter(c => c.userId != user.id)
                // Sort by unread count (highest first), then by name
                .sort((a, b) => {
                    // Prioritize contacts with unread messages
                    if ((b.unreadCount || 0) !== (a.unreadCount || 0)) {
                        return (b.unreadCount || 0) - (a.unreadCount || 0);
                    }
                    return a.name?.localeCompare(b.name || '') || 0;
                });

            setContacts(fixedContacts);
        } catch (err) { console.error(err); }
        finally { setLoadingContacts(false); }
    };

    const connectWebSocket = (myUserId) => {
        const client = Stomp.over(() => new SockJS(wsEndpoint('/ws')));
        client.debug = () => { };
        const headers = { 'Authorization': `Bearer ${token}` };

        client.connect(headers, () => {
            client.subscribe(`/topic/public/${myUserId}`, (payload) => {
                const newMessage = JSON.parse(payload.body);
                setMessages(prev => [...prev, newMessage]);
                scrollToBottom();

                // Update unread count for the sender in contacts list
                // Only if the message is from someone else and not currently viewing their chat
                const senderId = newMessage.senderId || newMessage.sender_id;
                if (senderId && senderId !== myUserId) {
                    setContacts(prevContacts => {
                        const updated = prevContacts.map(contact => {
                            if (contact.userId === senderId) {
                                // If this contact's chat is currently active, don't increment
                                // (messages are being read in real-time)
                                if (activeChat?.userId === senderId) {
                                    return contact;
                                }
                                return {
                                    ...contact,
                                    unreadCount: (contact.unreadCount || 0) + 1
                                };
                            }
                            return contact;
                        });
                        // Re-sort contacts after update
                        return updated.sort((a, b) => {
                            if ((b.unreadCount || 0) !== (a.unreadCount || 0)) {
                                return (b.unreadCount || 0) - (a.unreadCount || 0);
                            }
                            return a.name?.localeCompare(b.name || '') || 0;
                        });
                    });
                }
            });
            setStompClient(client);
        }, (err) => console.error("WebSocket Error:", err));
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadError("");

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setUploadError("File size exceeds 10MB limit");
            return;
        }

        setSelectedFile(file);

        // Generate preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    // Clear selected file
    const clearSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setUploadError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Upload file and send message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!inputMsg.trim() && !selectedFile) || !activeChat || !stompClient) return;

        const recipientId = activeChat.userId || activeChat.id;

        try {
            let attachmentData = null;

            // If there's a file, upload it first
            if (selectedFile) {
                setIsUploading(true);

                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('recipientId', recipientId);

                const uploadRes = await fetch(api('/api/chat/upload'), {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                const uploadData = await uploadRes.json();

                if (!uploadRes.ok) {
                    throw new Error(uploadData.message || 'Upload failed');
                }

                attachmentData = uploadData.data;
                setIsUploading(false);
            }

            // Build message
            const chatMessage = {
                senderId: user.id,
                recipientId: recipientId,
                content: inputMsg || '',  // Empty string if no caption - don't use filename
                senderName: user.nama
            };

            // Add attachment info if present
            if (attachmentData) {
                chatMessage.attachmentUrl = attachmentData.attachmentUrl;
                chatMessage.attachmentType = attachmentData.attachmentType;
                chatMessage.originalFilename = attachmentData.originalFilename;
                chatMessage.fileSize = attachmentData.fileSize;
            }

            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            setInputMsg("");
            clearSelectedFile();

        } catch (error) {
            console.error("Send error:", error);
            setUploadError(error.message);
            setIsUploading(false);
        }
    };

    // Navigate to user profile
    const navigateToProfile = (userId, e) => {
        e.stopPropagation();
        navigate(`/profile/${userId}`);
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Render attachment in message
    const renderAttachment = (msg) => {
        if (!msg.attachmentUrl) return null;

        const isImage = msg.attachmentType === 'IMAGE';

        if (isImage) {
            return (
                <div className="message-attachment image-attachment">
                    <img
                        src={msg.attachmentUrl}
                        alt={msg.originalFilename || 'Image'}
                        onClick={() => window.open(msg.attachmentUrl, '_blank')}
                    />
                </div>
            );
        } else {
            return (
                <a
                    href={msg.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="message-attachment document-attachment"
                    download={msg.originalFilename}
                >
                    <FileText size={24} />
                    <div className="doc-info">
                        <span className="doc-name">{msg.originalFilename}</span>
                        <span className="doc-size">{formatFileSize(msg.fileSize)}</span>
                    </div>
                    <Download size={18} />
                </a>
            );
        }
    };

    const getRole = () => sessionStorage.getItem("role");

    return (
        <div className={`chat-container ${activeChat ? 'chat-active' : ''}`}>
            {/* Sidebar */}
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <button onClick={() => navigate(getRole() === 'UMKM' ? '/dashboardu' : '/dashboardm')} className="btn-back-chat">
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h3>Messages</h3>
                </div>
                <div className="contacts-list">
                    {loadingContacts ? (
                        <>
                            <SkeletonChatContact />
                            <SkeletonChatContact />
                            <SkeletonChatContact />
                            <SkeletonChatContact />
                        </>
                    ) : contacts.length === 0 ? (
                        <div className="no-contacts">
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        contacts.map(contact => (
                            <div
                                key={contact.userId}
                                className={`contact-item ${activeChat?.userId === contact.userId ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveChat(contact);
                                    // Clear unread count for this contact when selected
                                    setContacts(prevContacts =>
                                        prevContacts.map(c =>
                                            c.userId === contact.userId
                                                ? { ...c, unreadCount: 0 }
                                                : c
                                        )
                                    );
                                }}
                            >
                                <div
                                    className="contact-avatar-wrapper"
                                    onClick={(e) => navigateToProfile(contact.userId, e)}
                                    title="View profile"
                                >
                                    <UserAvatar
                                        src={contact.profilePictureUrl}
                                        name={contact.name}
                                        type="sidebar"
                                    />
                                </div>
                                <div className="contact-info">
                                    <h4
                                        className="contact-name-link"
                                        onClick={(e) => navigateToProfile(contact.userId, e)}
                                    >
                                        {contact.name}
                                    </h4>
                                    <p>
                                        {contact.projects && contact.projects.length > 1
                                            ? `${contact.projects.length} projects`
                                            : contact.projectTitle}
                                    </p>
                                </div>
                                {/* Unread Badge */}
                                {contact.unreadCount > 0 && (
                                    <span className="unread-badge">
                                        {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <button
                                className="mobile-chat-back-btn"
                                onClick={() => setActiveChat(null)}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div
                                className="chat-header-avatar-wrapper"
                                onClick={(e) => navigateToProfile(activeChat.userId, e)}
                                title="View profile"
                            >
                                <UserAvatar
                                    src={activeChat.profilePictureUrl}
                                    name={activeChat.name}
                                    type="header"
                                />
                            </div>
                            <div className="chat-header-info">
                                <h2
                                    className="chat-header-name-link"
                                    onClick={(e) => navigateToProfile(activeChat.userId, e)}
                                >
                                    {activeChat.name}
                                </h2>
                                <span>
                                    {activeChat.projects && activeChat.projects.length > 1
                                        ? activeChat.projects.join(' • ')
                                        : activeChat.projectTitle}
                                </span>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {loadingMessages ? (
                                <>
                                    <SkeletonChatMessage />
                                    <SkeletonChatMessage isOwn />
                                    <SkeletonChatMessage />
                                    <SkeletonChatMessage isOwn />
                                </>
                            ) : (
                                messages.map((msg, index) => {
                                    const sender = msg.senderId || msg.sender_id;
                                    const isMe = sender == user?.id;

                                    return (
                                        <div key={index} className={`message-bubble ${isMe ? 'my-message' : 'their-message'}`}>
                                            {renderAttachment(msg)}
                                            {msg.content && (
                                                <div className="message-content">
                                                    {msg.content}
                                                </div>
                                            )}
                                            <div className="message-time">
                                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* File Preview */}
                        {selectedFile && (
                            <div className="file-preview-bar">
                                <div className="file-preview-content">
                                    {filePreview ? (
                                        <img src={filePreview} alt="Preview" className="file-preview-thumb" />
                                    ) : (
                                        <div className="file-preview-icon">
                                            <FileText size={24} />
                                        </div>
                                    )}
                                    <div className="file-preview-info">
                                        <span className="file-preview-name">{selectedFile.name}</span>
                                        <span className="file-preview-size">{formatFileSize(selectedFile.size)}</span>
                                    </div>
                                </div>
                                <button className="file-preview-remove" onClick={clearSelectedFile}>
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        {/* Upload Error */}
                        {uploadError && (
                            <div className="upload-error">
                                {uploadError}
                            </div>
                        )}

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                            />
                            <button
                                type="button"
                                className="attach-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="text"
                                value={inputMsg}
                                onChange={(e) => setInputMsg(e.target.value)}
                                placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
                                disabled={isUploading}
                            />
                            <button type="submit" disabled={isUploading || (!inputMsg.trim() && !selectedFile)}>
                                {isUploading ? (
                                    <div className="upload-spinner" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="no-chat-icon">
                            <MessageSquare size={36} />
                        </div>
                        <h2>Select a Conversation</h2>
                        <p>Choose a contact from the sidebar to start chatting</p>
                    </div>
                )}
            </div >
        </div >
    );
};

export default ChatPage;