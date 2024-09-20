import React from 'react';
import { useNavigate } from 'react-router-dom';

function Notification() {
  const navigate = useNavigate();

  const handleOkClick = () => {
    navigate('/feedback'); // Navigate to the Feedback page when OK is clicked
  };

  return (
    <div className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50">
      <div className="card shadow-lg" style={{ width: '300px' }}>
        <div className="card-body text-center">
          <h4 className="card-title">Success!</h4>
          <p>Your complaint has been successfully submitted.</p>
          <button className="btn btn-success" onClick={handleOkClick}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default Notification;
