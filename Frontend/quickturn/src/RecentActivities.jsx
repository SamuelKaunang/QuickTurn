import React, { useState, useEffect } from 'react';
import {
    Clock, CheckCircle, XCircle, FileText, Send, Briefcase, ChevronRight
} from 'lucide-react';
import { api } from './utils/apiConfig';
import './RecentActivities.css';

const RecentActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        if (token) {
            fetchActivities();
        }
    }, [token]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await fetch(api('/api/activities/recent?limit=5'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setActivities(data.data || []);
            } else {
                console.error("Failed to fetch activities");
            }
        } catch (err) {
            console.error("Error fetching activities", err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'APPLIED': return <Send size={18} className="text-blue-500" />;
            case 'ACCEPTED': return <CheckCircle size={18} className="text-green-500" />;
            case 'REJECTED': return <XCircle size={18} className="text-red-500" />;
            case 'SUBMITTED': return <FileText size={18} className="text-purple-500" />;
            case 'WORK_ACCEPTED': return <CheckCircle size={18} className="text-green-600" />;
            case 'WORK_REJECTED': return <XCircle size={18} className="text-red-600" />;
            case 'CONTRACT_SIGNED': return <Briefcase size={18} className="text-indigo-500" />;
            default: return <Clock size={18} className="text-gray-400" />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'APPLIED': return 'bg-blue-50 border-blue-100';
            case 'ACCEPTED': return 'bg-green-50 border-green-100';
            case 'REJECTED': return 'bg-red-50 border-red-100';
            case 'SUBMITTED': return 'bg-purple-50 border-purple-100';
            case 'WORK_ACCEPTED': return 'bg-green-50 border-green-100';
            case 'WORK_REJECTED': return 'bg-red-50 border-red-100';
            case 'CONTRACT_SIGNED': return 'bg-indigo-50 border-indigo-100';
            default: return 'bg-gray-50 border-gray-100';
        }
    };

    if (loading) {
        return <div className="activities-loading">Loading activities...</div>;
    }

    if (activities.length === 0) {
        return (
            <div className="empty-activities">
                <Clock size={40} />
                <p>No recent activities yet.</p>
                <span>Start applying to projects to see updates here!</span>
            </div>
        );
    }

    return (
        <div className="recent-activities-list">
            {activities.map((activity) => (
                <div key={activity.id} className={`activity-item ${getActivityColor(activity.type)}`}>
                    <div className="activity-icon-wrapper">
                        {getIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                        <p className="activity-text">{activity.description}</p>
                        <span className="activity-time">{activity.timeAgo}</span>
                    </div>
                </div>
            ))}
            <button className="view-all-activities">
                View All <ChevronRight size={14} />
            </button>
        </div>
    );
};

export default RecentActivities;
