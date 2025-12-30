/**
 * API Configuration
 * Central configuration for all API endpoints
 */

// Base URL for HTTP/HTTPS requests
// In production, this should be set via environment variable REACT_APP_API_URL
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// WebSocket URL - automatically converts http(s) to ws(s)
const getWebSocketUrl = () => {
    const baseUrl = BASE_URL;
    if (baseUrl.startsWith('https://')) {
        return baseUrl.replace('https://', 'wss://');
    } else if (baseUrl.startsWith('http://')) {
        return baseUrl.replace('http://', 'ws://');
    }
    return baseUrl;
};

const WS_URL = getWebSocketUrl();

// API helper function to construct full URL
const api = (endpoint) => {
    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${BASE_URL}${cleanEndpoint}`;
};

// WebSocket/SockJS helper function
// SockJS uses HTTP(S) for initial connection, protocol upgrade happens automatically
const wsEndpoint = (path) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
};

export { BASE_URL, WS_URL, api, wsEndpoint };
export default api;
