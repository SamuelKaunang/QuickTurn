import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import {
    ArrowLeft, Send, MessageSquare, Paperclip, X, FileText, Download, Image,
    LayoutDashboard, Briefcase, Search, Users, Settings, LogOut
} from 'lucide-react';
import { api, wsEndpoint } from './utils/apiConfig';
import { useSettings } from './SettingsContext';
import { performLogout } from './RouteGuards';
import { SkeletonChatContact, SkeletonChatMessage } from './Skeleton';
import './ChatPage.css';
import './DashboardM.css'; // Use Dashboard layout styles
import logoQ from './assets/logo/logo Q.png';
import logoText from './assets/logo/logo text.png';
import SettingsModal from './SettingsModal';

// Reusable Avatar Component
const UserAvatar = ({ src, name, type }) => {
    const [imgError, setImgError] = useState(false);

    useEffect(() => { setImgError(false); }, [src]);

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
    const { t } = useSettings();
    const token = sessionStorage.getItem("token");

    // Auth & User State
    const [user, setUser] = useState(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Chat State
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [stompClient, setStompClient] = useState(null);

    // UI State
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0); // For sidebar badge

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    // --- EFFECTS ---

    useEffect(() => {
        if (!token) { navigate('/login'); return; }

        // Load User Profile
        fetch(api("/api/users/profile"), { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setUser(data.data);
                    connectWebSocket(data.data.id);
                } else {
                    // Fallback
                    setUser({ id: 0, nama: "User" });
                }
            })
            .catch(() => navigate('/login'));

        // Initial Fetch for Badge
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);

    }, [token, navigate]);

    useEffect(() => {
        if (user) fetchContacts();
    }, [user]);

    useEffect(() => {
        if (activeChat && user) {
            fetchMessages();
        }
    }, [activeChat, user]);

    // --- API & LOGIC ---

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(api("/api/chat/unread"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.data) {
                setUnreadCount(data.data.unreadCount || 0);
            }
        } catch (err) { console.error("Failed to fetch unread count", err); }
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
                .filter(c => c.userId != user.id);
            setContacts(fixedContacts);
        } catch (err) { console.error(err); }
        finally { setLoadingContacts(false); }
    };

    const fetchMessages = () => {
        const targetId = activeChat.userId || activeChat.id;
        setLoadingMessages(true);
        fetch(api(`/api/chat/history?otherUserId=${targetId}`), {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                let validMessages = [];
                if (Array.isArray(data)) validMessages = data;
                else if (data.data && Array.isArray(data.data)) validMessages = data.data;
                else if (data.content && Array.isArray(data.content)) validMessages = data.content;
                setMessages(validMessages);
                scrollToBottom();
            })
            .catch(err => console.error("History fetch error:", err))
            .finally(() => setLoadingMessages(false));
    };

    const connectWebSocket = (myUserId) => {
        const client = Stomp.over(() => new SockJS(wsEndpoint('/ws')));
        client.debug = () => { };
        const headers = { 'Authorization': `Bearer ${token}` };
        client.connect(headers, () => {
            client.subscribe(`/topic/public/${myUserId}`, (payload) => {
                const newMessage = JSON.parse(payload.body);
                // If message is from current active chat, append it
                setMessages(prev => {
                    // Check if this message belongs to current chat context if needed
                    // For now just append, refine logic if global store exists
                    return [...prev, newMessage];
                });
                scrollToBottom();
                fetchContacts(); // Refresh last message in contacts list
            });
            setStompClient(client);
        }, (err) => console.error("WebSocket Error:", err));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!inputMsg.trim() && !selectedFile) || !activeChat || !stompClient) return;

        const recipientId = activeChat.userId || activeChat.id;

        try {
            let attachmentData = null;
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
                if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload failed');
                attachmentData = uploadData.data;
                setIsUploading(false);
            }

            const chatMessage = {
                senderId: user.id,
                recipientId: recipientId,
                content: inputMsg || '',
                senderName: user.nama
            };

            if (attachmentData) {
                chatMessage.attachmentUrl = attachmentData.attachmentUrl;
                chatMessage.attachmentType = attachmentData.attachmentType;
                chatMessage.originalFilename = attachmentData.originalFilename;
                chatMessage.fileSize = attachmentData.fileSize;
            }

            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            setInputMsg("");
            clearSelectedFile();
            // Optimistically append (optional, but socket usually echoes back quickly)
        } catch (error) {
            console.error("Send error:", error);
            setUploadError(error.message);
            setIsUploading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleLogout = () => performLogout(navigate);
    const getRole = () => sessionStorage.getItem("role");

    // File Helpers
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadError("");
        if (file.size > MAX_FILE_SIZE) {
            setUploadError("File size exceeds 10MB limit");
            return;
        }
        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setUploadError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const renderAttachment = (msg) => {
        if (!msg.attachmentUrl) return null;
        const isImage = msg.attachmentType === 'IMAGE';
        if (isImage) {
            return (
                <div className="message-attachment image-attachment">
                    <img src={msg.attachmentUrl} alt={msg.originalFilename || 'Image'} onClick={() => window.open(msg.attachmentUrl, '_blank')} />
                </div>
            );
        } else {
            return (
                <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="message-attachment document-attachment" download={msg.originalFilename}>
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

    return (
        <div className="dashboard-container">
            {/* Background Blobs (Inherited from DashboardM theme) */}
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>
            <div className="bg-glow glow-3"></div>

            {/* MAIN SIDEBAR (Global Navigation) */}
            <aside className="sidebar">
                <div className="sidebar-inner">
                    <div className="logo-section">
                        <img src={logoQ} alt="QuickTurn" className="logo-icon-img" />
                        <div>
                            <img src={logoText} alt="QuickTurn" className="logo-text-img" />
                            <p className="logo-subtext">{t('microInternships')}</p>
                        </div>
                    </div>

                    <nav className="nav-menu">
                        <button onClick={() => navigate('/dashboardm')} className="nav-item">
                            <LayoutDashboard size={20} />
                            <span>{t('dashboard')}</span>
                        </button>
                        <button onClick={() => { navigate('/dashboardm'); }} className="nav-item">
                            <Search size={20} />
                            <span>{t('browseProjects')}</span>
                        </button>
                        <button onClick={() => navigate('/dashboardm')} className="nav-item">
                            <Briefcase size={20} />
                            <span>{t('myProjects')}</span>
                        </button>
                        <button className="nav-item active">
                            <div className="nav-item-icon-wrapper">
                                <MessageSquare size={20} />
                                {unreadCount > 0 && <span className="unread-dot"></span>}
                            </div>
                            <span>{t('messages')}</span>
                            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                        </button>
                        <button onClick={() => navigate('/search-users')} className="nav-item">
                            <Users size={20} />
                            <span>{t('findUsers')}</span>
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="nav-item settings-nav" onClick={() => setShowSettingsModal(true)}>
                            <Settings size={18} />
                            <span>{t('settings')}</span>
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', padding: 0 }}>
                {/* Custom Topbar for Chat - or Integrated? 
                    The chat page layout is unique (full height split view). 
                    We should keep the Topbar concept but maybe simpler or integrated.
                    Actually, for Chat, we usually want max vertical space. 
                    Let's use a modified container inside main-content.
                */}

                <div className="chat-layout-wrapper">
                    {/* CHAT LIST SIDEBAR (Inner) */}
                    <div className="chat-list-sidebar">
                        <div className="chat-list-header">
                            <h3>{t('messages')}</h3>
                            <button onClick={() => navigate(getRole() === 'UMKM' ? '/dashboardu' : '/dashboardm')} className="btn-mini-back">
                                <ArrowLeft size={16} />
                            </button>
                        </div>
                        <div className="contacts-list-container">
                            {loadingContacts ? (
                                <>
                                    <SkeletonChatContact />
                                    <SkeletonChatContact />
                                    <SkeletonChatContact />
                                </>
                            ) : contacts.length === 0 ? (
                                <div className="no-contacts-state">
                                    <MessageSquare size={24} />
                                    <p>No conversations</p>
                                </div>
                            ) : (
                                contacts.map(contact => (
                                    <div key={contact.userId}
                                        className={`contact-card ${activeChat?.userId === contact.userId ? 'active' : ''}`}
                                        onClick={() => setActiveChat(contact)}>
                                        <div className="contact-avatar-wrapper">
                                            <UserAvatar src={contact.profilePictureUrl} name={contact.name} />
                                            {/* Optional: Online dot */}
                                        </div>
                                        <div className="contact-info-wrapper">
                                            <h4>{contact.name}</h4>
                                            <p>{contact.projectTitle || 'Project Chat'}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* CHAT WINDOW (Right) */}
                    <div className="chat-window-container">
                        {activeChat ? (
                            <>
                                <header className="chat-window-header">
                                    <div className="chat-partner-info" onClick={() => navigate(`/profile/${activeChat.userId}`)}>
                                        <UserAvatar src={activeChat.profilePictureUrl} name={activeChat.name} type="header" />
                                        <div>
                                            <h2>{activeChat.name}</h2>
                                            <span>{activeChat.projectTitle}</span>
                                        </div>
                                    </div>
                                </header>

                                <div className="messages-scroll-area">
                                    {loadingMessages ? (
                                        <div className="loading-pad">
                                            <SkeletonChatMessage />
                                            <SkeletonChatMessage isOwn />
                                            <SkeletonChatMessage />
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isMe = (msg.senderId || msg.sender_id) == user?.id;
                                            return (
                                                <div key={idx} className={`message-row ${isMe ? 'mine' : 'theirs'}`}>
                                                    {!isMe && <div className="msg-avatar-spacer"><UserAvatar src={activeChat.profilePictureUrl} name={activeChat.name} /></div>}
                                                    <div className="message-bubble-content">
                                                        {renderAttachment(msg)}
                                                        {msg.content && <p>{msg.content}</p>}
                                                        <span className="msg-time">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {selectedFile && (
                                    <div className="file-preview-panel">
                                        <div className="file-info-chip">
                                            {filePreview ? <img src={filePreview} alt="preview" /> : <FileText size={20} />}
                                            <div className="file-meta">
                                                <span className="fname">{selectedFile.name}</span>
                                                <span className="fsize">{formatFileSize(selectedFile.size)}</span>
                                            </div>
                                            <button onClick={clearSelectedFile}><X size={14} /></button>
                                        </div>
                                    </div>
                                )}

                                {uploadError && <div className="error-banner">{uploadError}</div>}

                                <form className="chat-input-bar" onSubmit={handleSendMessage}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                                    />
                                    <button type="button" className="icon-btn-secondary" onClick={() => fileInputRef.current?.click()}>
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        className="msg-input"
                                        placeholder={selectedFile ? "Add a caption..." : "Type your message..."}
                                        value={inputMsg}
                                        onChange={(e) => setInputMsg(e.target.value)}
                                        disabled={isUploading}
                                    />
                                    <button type="submit" className="send-btn" disabled={!inputMsg.trim() && !selectedFile}>
                                        {isUploading ? <div className="spinner-sm"></div> : <Send size={20} />}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="empty-chat-view">
                                <div className="empty-illustration">
                                    <div className="circle-bg">
                                        <MessageSquare size={48} />
                                    </div>
                                    <h3>Select a Conversation</h3>
                                    <p>Connect with talents and clients securely on QuickTurn</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Settings Modal */}
            <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        </div>
    );
};

export default ChatPage;