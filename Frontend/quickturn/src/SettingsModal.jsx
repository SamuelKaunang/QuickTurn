import React, { useState } from 'react';
import { X, Globe, Check } from 'lucide-react';
import { useSettings } from './SettingsContext';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
    const { settings, updateSetting, t } = useSettings();
    const [localSettings, setLocalSettings] = useState(settings);

    if (!isOpen) return null;

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        Object.entries(localSettings).forEach(([key, value]) => {
            updateSetting(key, value);
        });
        onClose();
    };

    const handleCancel = () => {
        setLocalSettings(settings);
        onClose();
    };

    return (
        <div className="settings-modal-overlay" onClick={handleCancel}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="settings-modal-header">
                    <h2>{t('settings')}</h2>
                    <button className="btn-close-settings" onClick={handleCancel}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="settings-modal-body">
                    {/* Language Section */}
                    <div className="settings-section">
                        <div className="section-label">
                            <Globe size={18} />
                            <span>{t('language')}</span>
                        </div>
                        <div className="toggle-group">
                            <button
                                className={`toggle-btn ${localSettings.language === 'id' ? 'active' : ''}`}
                                onClick={() => handleChange('language', 'id')}
                            >
                                <span className="flag-label">ID</span>
                                <span>{t('indonesian')}</span>
                                {localSettings.language === 'id' && <Check size={14} className="check-icon" />}
                            </button>
                            <button
                                className={`toggle-btn ${localSettings.language === 'en' ? 'active' : ''}`}
                                onClick={() => handleChange('language', 'en')}
                            >
                                <span className="flag-label">EN</span>
                                <span>{t('english')}</span>
                                {localSettings.language === 'en' && <Check size={14} className="check-icon" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="settings-modal-footer">
                    <button className="btn-cancel-settings" onClick={handleCancel}>
                        {t('cancel')}
                    </button>
                    <button className="btn-save-settings" onClick={handleSave}>
                        <Check size={16} />
                        {t('save')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
