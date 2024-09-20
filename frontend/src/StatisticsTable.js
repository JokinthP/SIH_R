import React, { useState, useEffect } from "react";
import ComplaintDetail from './ComplaintDetail';
import MediaPopup from './MediaPopup'; 
import { useNavigate } from 'react-router-dom';

function StatisticsTable() {
    const [data, setData] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentComplaintId, setCurrentComplaintId] = useState(null);

    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const token = localStorage.getItem('authToken');

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://127.0.0.1:8000/get_complaints/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const complaints = await response.json();
                    setData(complaints);
                } else if (response.status === 401) {
                    setErrorMessage('Unauthorized access. Please log in.');
                    navigate('/login');
                } else {
                    throw new Error('Error fetching complaints.');
                }
            } catch (error) {
                console.error('Error fetching complaints:', error);
                setErrorMessage('Error fetching complaints. Please try again.');
            }
        };

        fetchComplaints();
    }, [navigate]);

    const handleRowClick = (complaint) => {
        setSelectedComplaint(complaint);
    };

    const handleCloseDetail = () => {
        setSelectedComplaint(null);
    };

    const handleShowMedia = (image) => {
        setSelectedMedia(image);
    };

    const handleCloseMedia = () => {
        setSelectedMedia(null);
    };

    const renderComplaintText = (text) => {
        if (typeof text !== 'string') {
            return 'No description available';
        }
        return text.length > 20 ? text.substring(0, 20) + '...' : text;
    };

    const handleStatusChange = async () => {
        try {
            console.log(`Updating complaint ID: ${currentComplaintId} with status: ${selectedStatus}`); // Debugging log

            const response = await fetch(`http://127.0.0.1:8000/update_complaint_status/${currentComplaintId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ status: selectedStatus }),
            });

            if (response.ok) {
                // Refresh the complaints list to reflect the updated status
                const updatedResponse = await fetch('http://127.0.0.1:8000/get_complaints/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });

                if (updatedResponse.ok) {
                    const complaints = await updatedResponse.json();
                    setData(complaints);
                } else {
                    throw new Error('Error fetching complaints after status update.');
                }
            } else {
                throw new Error('Error updating status.');
            }

            setStatusModalVisible(false);
            setCurrentComplaintId(null);
            setSelectedStatus("");
        } catch (error) {
            console.error('Error updating status:', error);
            setErrorMessage('Error updating status. Please try again.');
        }
    };

    const openStatusModal = (id, currentStatus) => {
        console.log(`Opening status modal for ID: ${id}`); // Debugging log
        setCurrentComplaintId(id);
        setSelectedStatus(currentStatus);
        setStatusModalVisible(true);
    };

    return (
        <>
            {errorMessage && <p className="text-danger text-center mt-3">{errorMessage}</p>}
            <div className="table-responsive-sm" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '250px', maxWidth: '100%' }}>
                <table className="table table-hover">
                    <thead>
                        <tr className="table-success">
                            <th>SL NO</th>
                            <th>PNR</th>
                            <th>Customer's Complaint</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Priority</th> {/* New Priority column */}
                            <th>Media</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((complaint, index) => (
                            <tr key={complaint.id} onClick={() => handleRowClick(complaint)} style={{ cursor: 'pointer' }}>
                                <td>{index + 1}</td>
                                <td>{complaint.pnr}</td>
                                <td>{renderComplaintText(complaint.description)}</td>
                                <td>{complaint.category}</td>
                                <td>{complaint.status}</td>
                                <td>{complaint.priority}</td> {/* Display priority */}
                                <td>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShowMedia(complaint.image);
                                        }}
                                        className="btn btn-link"
                                    >
                                        Show Media
                                    </button>
                                </td>
                                <td>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openStatusModal(complaint._id, complaint.status);
                                        }}
                                        className="btn btn-success"
                                    >
                                        Change Status
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedComplaint && <ComplaintDetail complaint={selectedComplaint} onClose={handleCloseDetail} />}
            {selectedMedia && <MediaPopup selectedMedia={selectedMedia} handleCloseMedia={handleCloseMedia} />}

            {statusModalVisible && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Change Status</h5>
                                <button
                                    type="button"
                                    className="close"
                                    style={{ position: 'absolute', right: '15px', top: '15px' }}
                                    onClick={() => setStatusModalVisible(false)}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="modal-body">
                                <label htmlFor="status" style={{ marginRight: '25px' }}>Update Status:</label>
                                <select
                                    id="status"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => setStatusModalVisible(false)}
                                >
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-success" onClick={handleStatusChange}>
                                    Save changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default StatisticsTable;
