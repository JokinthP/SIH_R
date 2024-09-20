import React from 'react';

const MediaPopup = ({ selectedMedia, handleCloseMedia }) => {
    return (
        <div 
            className="media-popup" 
            style={{
                position: 'fixed',
                top: '420px',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: '1000',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
        >
            <div 
                className="media-popup-content" 
                style={{ 
                    position: 'relative',
                    display: 'inline-block'  // Keeps the close button relative to the image
                }}
            >
                <span 
                    className="close" 
                    onClick={handleCloseMedia} 
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        fontSize: '24px',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        color: '#000',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',  // Adds a small shadow for better visibility
                    }}
                >
                    &times;
                </span>
                <img 
                    src={`data:image/jpeg;base64,${selectedMedia}`} 
                    alt="Complaint Media" 
                    style={{ 
                        maxWidth: '80vw',
                        maxHeight: '80vh',
                        borderRadius: '8px', 
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }} 
                />
            </div>
        </div>
    );
};

export default MediaPopup;
