import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import './ChatPage.css';

const ChatPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null); 
    
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const messagesEndRef = useRef(null);

    // 1. Get My Profile
    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        fetch("/api/users/profile", { headers: { "Authorization": `Bearer ${token}` } })
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
            
            fetch(`/api/chat/history?otherUserId=${targetId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                console.log("HISTORY DATA:", data); // Check Console
                
                // Handle different data structures
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
            .catch(err => console.error("History fetch error:", err));
        }
    }, [activeChat, user]);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const fetchContacts = async () => {
        try {
            const res = await fetch("/api/chat/contacts", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            const fixedContacts = (data.data || [])
                .map(c => ({ ...c, userId: c.userId || c.id }))
                .filter(c => c.userId != user.id); 

            setContacts(fixedContacts);
        } catch (err) { console.error(err); }
    };

    const connectWebSocket = (myUserId) => {
        const client = Stomp.over(() => new SockJS('http://localhost:8080/ws'));
        client.debug = () => {}; 
        const headers = { 'Authorization': `Bearer ${token}` };

        client.connect(headers, () => {
            client.subscribe(`/topic/public/${myUserId}`, (payload) => {
                const newMessage = JSON.parse(payload.body);
                setMessages(prev => [...prev, newMessage]);
                scrollToBottom();
            });
            setStompClient(client);
        }, (err) => console.error("WebSocket Error:", err));
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMsg.trim() || !activeChat || !stompClient) return;

        const recipientId = activeChat.userId || activeChat.id;

        const chatMessage = {
            senderId: user.id,
            recipientId: recipientId,
            content: inputMsg,
            senderName: user.nama
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        setInputMsg("");
    };

    const getRole = () => localStorage.getItem("role");

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <button onClick={() => navigate(getRole() === 'UMKM' ? '/dashboardu' : '/dashboardm')} className="btn-back-chat">
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                    <h3>Messages</h3>
                </div>
                <div className="contacts-list">
                    {contacts.map(contact => (
                        <div 
                            key={contact.userId} 
                            className={`contact-item ${activeChat?.userId === contact.userId ? 'active' : ''}`}
                            onClick={() => setActiveChat(contact)}
                        >
                            <div className="contact-avatar">{contact.name.charAt(0).toUpperCase()}</div>
                            <div className="contact-info">
                                <h4>{contact.name}</h4>
                                <p>{contact.projectTitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-window">
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <h2>{activeChat.name}</h2>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg, index) => {
                                // ✅ FIX: NO FILTERING. If the backend sent it, we show it.
                                
                                // Determine "Is this me?"
                                // We check both possible field names: senderId (camelCase) OR sender_id (snake_case)
                                const sender = msg.senderId || msg.sender_id;
                                const isMe = sender == user?.id;

                                return (
                                    <div key={index} className={`message-bubble ${isMe ? 'my-message' : 'their-message'}`}>
                                        <div className="message-content">
                                            {msg.content}
                                            {/* DEBUG: Un-comment this line below if you still see blank bubbles */}
                                            {/* <br/><small style={{fontSize:'8px', color:'gray'}}>{JSON.stringify(msg)}</small> */}
                                        </div>
                                        <div className="message-time">
                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                value={inputMsg}
                                onChange={(e) => setInputMsg(e.target.value)}
                                placeholder="Ketik pesan..."
                            />
                            <button type="submit"><i className="fas fa-paper-plane"></i></button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected"><h2>Pilih kontak</h2></div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;