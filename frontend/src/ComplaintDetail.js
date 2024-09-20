import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';

function ComplaintDetail({ complaint, onClose }) {
    if (!complaint) return null;

    // Check if the image is a valid base64 string and set the correct MIME type
    const imageUrl = complaint.image ? `data:image/jpeg;base64,${complaint.image}` : null;

    return (
        <div 
            className="d-flex justify-content-center align-items-start"  // Align content to start
            style={{ 
                position: 'fixed', 
                top: '120px',   // Start 20px from the top of the viewport
                left: '50%',  // Center horizontally
                transform: 'translateX(-50%)',  // Adjust for perfect horizontal centering
                zIndex: '1000',  // Ensure it's on top
                width: '80%',  // Responsive width
                maxWidth: '90%',  // Limit max width to 90%
                height: '70vh',  // Set a fixed height for the box
                backgroundColor: 'grey',
                borderRadius: '10px',  // Rounded corners for a nicer look
                boxShadow: '0 4px 12px rgba(128, 128, 128, 0.5)',  // Grey shadow for depth
                overflow: 'hidden'  // Prevent scrollbars on the outer box
            }}
        >
            <Card style={{ width: '100%', position: 'relative', height: '100%' }}>
                <Card.Body style={{ overflowY: 'auto', maxHeight: '100%' }}> {/* Make the inner content scrollable */}
                    <Button 
                        variant="secondary" 
                        className="btn-close" 
                        style={{ position: 'absolute', top: '3px', right: '3px', zIndex: '1' }} 
                        onClick={onClose} 
                    />
                    <div className="card bg-success text-white" style={{ paddingTop: '10px' }}>
                        <Card.Title className="text-center">Complaint Details</Card.Title>
                    </div>
                    <Table bordered>
                        <tbody>
                            <tr>
                                <td><strong>PNR:</strong></td>
                                <td>{complaint.pnr}</td>
                            </tr>
                            <tr>
                                <td><strong>Customer's Complaint:</strong></td>
                                <td>{complaint.description}</td>
                            </tr>
                            <tr>
                                <td><strong>Category:</strong></td>
                                <td>{complaint.category}</td>
                            </tr>
                            {/* <tr>
                                <td><strong>Sub-Category:</strong></td>
                                <td>{complaint.sub_category}</td>
                            </tr>
                            <tr>
                                <td><strong>Priority:</strong></td>
                                <td>{complaint.priority}</td>
                            </tr> */}
                            <tr>
                                <td><strong>Status:</strong></td>
                                <td>{complaint.status}</td>
                            </tr>
                            <tr>
                                <td><strong>Media:</strong></td>
                                <td className="text-center">
                                    {imageUrl ? (
                                        <img 
                                            src={imageUrl} 
                                            alt="Complaint Media" 
                                            style={{ 
                                                maxWidth: '100%',  // Responsive width
                                                height: 'auto',    // Maintain aspect ratio
                                                borderRadius: '8px',  // Rounded corners
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'  // Add shadow for better appearance
                                            }} 
                                        />
                                    ) : (
                                        'No media attached'
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
}

export default ComplaintDetail;
