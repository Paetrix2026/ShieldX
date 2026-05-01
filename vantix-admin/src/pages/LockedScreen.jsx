
import React from 'react';

const LockedScreen = () => {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#051226',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{
                fontSize: '80px',
                marginBottom: '20px'
            }}>🔒</div>
            <h1 style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                background: 'linear-gradient(90deg, #FF3D00, #FF9100)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '10px'
            }}>
                PROJECT TERMINATED
            </h1>
            <p style={{ color: '#8A99AF', maxWidth: '500px', lineHeight: '1.6' }}>
                This project instance has been remotely locked by the original developer. 
                Unauthorized cloning or distribution of <strong>ShieldX</strong> is strictly prohibited.
            </p>
            <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'rgba(255, 61, 0, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 61, 0, 0.2)',
                fontSize: '14px'
            }}>
                Contact <strong>agjeevan85@gmail.com</strong> for official licensing.
            </div>
        </div>
    );
};

export default LockedScreen;
