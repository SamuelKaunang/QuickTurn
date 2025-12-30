import React, { useState, useEffect } from 'react';
import { FileText, X, Printer } from 'lucide-react';
import { api } from './utils/apiConfig';
import './ContractModal.css';

const ContractModal = ({ projectId, token, onClose }) => {
    const [contractText, setContractText] = useState("Loading contract...");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const response = await fetch(api(`/api/projects/${projectId}/contract`), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setContractText(data.data);
                } else {
                    setError(data.message || "Failed to load contract");
                }
            } catch (err) {
                setError("Network error");
            } finally {
                setLoading(false);
            }
        };
        fetchContract();
    }, [projectId, token]);

    return (
        <div className="contract-modal-overlay">
            <div className="contract-modal-box">
                <div className="contract-modal-header">
                    <div className="contract-title">
                        <FileText size={20} />
                        <h3>Digital Contract</h3>
                    </div>
                    <button onClick={onClose} className="contract-close-btn">
                        <X size={20} />
                    </button>
                </div>
                <div className="contract-modal-body">
                    {loading ? (
                        <div className="contract-loading">
                            <div className="contract-spinner"></div>
                            <p>Loading contract...</p>
                        </div>
                    ) : error ? (
                        <p className="contract-error">{error}</p>
                    ) : (
                        <pre className="contract-text">{contractText}</pre>
                    )}
                </div>
                <div className="contract-modal-footer">
                    <button onClick={onClose} className="contract-btn-secondary">
                        Close
                    </button>
                    <button onClick={() => window.print()} className="contract-btn-primary">
                        <Printer size={16} />
                        Print / Save PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContractModal;