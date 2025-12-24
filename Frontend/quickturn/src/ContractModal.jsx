import React, { useState, useEffect } from 'react';

const ContractModal = ({ projectId, token, onClose }) => {
    const [contractText, setContractText] = useState("Loading contract...");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContract = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}/contract`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setContractText(data.data);
                } else {
                    setError(data.message || "Gagal memuat kontrak");
                }
            } catch (err) {
                setError("Network error");
            }
        };
        fetchContract();
    }, [projectId, token]);

    return (
        <div style={styles.overlay}>
            <div style={styles.box}>
                <div style={styles.header}>
                    <h3>📄 Digital Contract</h3>
                    <button onClick={onClose} style={styles.closeBtn}>✖</button>
                </div>
                <div style={styles.body}>
                    {error ? (
                        <p style={{color:'red'}}>{error}</p>
                    ) : (
                        <pre style={styles.contractText}>{contractText}</pre>
                    )}
                </div>
                <div style={styles.footer}>
                    <button onClick={() => window.print()} style={styles.printBtn}>🖨️ Print / Save PDF</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
    },
    box: {
        background: '#fff', color: '#000', width: '600px', maxWidth: '90%',
        borderRadius: '10px', padding: '0', overflow: 'hidden'
    },
    header: {
        padding: '15px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
    body: { padding: '20px', maxHeight: '60vh', overflowY: 'auto', background: '#f9f9f9' },
    contractText: { whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5' },
    footer: { padding: '15px', borderTop: '1px solid #ccc', textAlign: 'right', background: '#fff' },
    printBtn: { background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }
};

export default ContractModal;