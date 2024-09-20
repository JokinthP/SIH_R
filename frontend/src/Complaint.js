import React, { useState, useRef } from 'react';
import axios from 'axios';
import Notification from './Notification'; // Import the Notification component
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
import TrainGif from './Assets/TrainGif.gif'
import { useNavigate } from 'react-router-dom';
function Complaint() {

  const [pnr, setPnr] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');  // This will be the mobile number
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [pnrValid, setPnrValid] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate =useNavigate();

  const validatePnr = (pnr) => {
    const pnrRegex = /^[1-9]{3}-\d{7}$/;
    return pnrRegex.test(pnr);
  };

  const handlePnrChange = (event) => {
    const newPnr = event.target.value;
    const allowedCharacters = /^[0-9-]*$/;

    if (newPnr.length <= 11 && allowedCharacters.test(newPnr)) {
      setPnr(newPnr);

      if (validatePnr(newPnr)) {
        setPnrValid(true);
        setErrorMessage('');
      } else {
        setPnrValid(false);
        setErrorMessage('Enter valid PNR');
      }
    }
  };

  const handlePhoneNumberChange = (event) => {
    const newPhoneNumber = event.target.value;
    if (/^\d*$/.test(newPhoneNumber) && newPhoneNumber.length <= 10) {
      setPhoneNumber(newPhoneNumber);
    }
  };

  const handleFileChange = (event) => setFile(event.target.files[0]);
  const handleDescriptionChange = (event) => setDescription(event.target.value);
  const handleOtpChange = (event) => setOtp(event.target.value);

  // Send OTP 
  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      await axios.post(`http://127.0.0.1:8000/send_otp/${phoneNumber}`);
      setOtpSent(true);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error sending OTP');
      console.error(error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/verify_otp/${phoneNumber}/${otp}`);
      setOtpVerified(true);
      setErrorMessage('');
      console.log('OTP Verified:', response.data.message);
    } catch (error) {
      setOtpVerified(false);
      const errorMessage = error.response?.data?.detail || 'An error occurred. Please try again.';
      setErrorMessage(errorMessage);
      console.error('Error verifying OTP:', error);
    }
  };

  const handleSubmit = async () => {
    if (!pnr || !file || !description || !otpVerified || !pnrValid || !phoneNumber) {
      setErrorMessage('Please complete all fields with valid inputs before submitting.');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('pnr', pnr);
    formData.append('description', description);
    formData.append('mobile_number', phoneNumber); // Add mobile number to form data

    try {
      const response = await axios.post('http://127.0.0.1:8000/add_complaint_with_image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowNotification(true);
      setPnr('');
      setFile(null);
      setDescription('');
      setPhoneNumber('');
      setOtp('');
      setOtpVerified(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      console.log(response.data);
      if(response.data.message === "not proper image"){
        setErrorMessage('Error submitting the complaint give correct image');
      }
    } catch (error) {
      setErrorMessage('Error submitting the complaint');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => setShowNotification(false);
  const handleGifClick = () => {
    navigate('/chatbot'); // Navigating to the ChatBot page
  };
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100" style={{ paddingTop: '150px', paddingBottom: '50px' }}>
      <div className="card w-50 shadow" style={{ padding: '20px' }}>
        <div className="card-body">
          <h2 className="card-title text-center">Grievance Details</h2>
          <br />
          <br />
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          <div className="mb-3">
            <label htmlFor="pnr" className="form-label" style={{ paddingBottom: '5px' }}>
              Passenger Name Record (PNR)
            </label>
            <input
              type="text"
              className="form-control"
              id="pnr"
              value={pnr}
              onChange={handlePnrChange}
              maxLength={11}
              placeholder="Enter PNR (e.g., 123-4567890)"
              style={{ padding: '10px', borderRadius: '5px' }}
            />
          </div>

          <div className="mb-3 d-flex align-items-center">
            <div className="me-2 flex-grow-1">
              <label htmlFor="phoneNumber" className="form-label" style={{ paddingBottom: '5px' }}>
                Phone Number
              </label>
              <input
                type="text"
                className="form-control"
                id="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                maxLength={10}
                style={{ padding: '10px', borderRadius: '5px' }}
              />
            </div>
            <button
              className="btn btn-success"
              onClick={handleSendOtp}
              disabled={otpSent}
              style={{ height: '38px', marginTop: '30px' }}
            >
              {otpSent ? 'OTP Sent' : 'Send OTP'}
            </button>
          </div>

          {otpSent && (
            <div className="mb-3 d-flex align-items-center">
              <div className="me-2 flex-grow-1">
                <label htmlFor="otp" className="form-label" style={{ paddingBottom: '5px' }}>
                  Enter OTP
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={4}
                  style={{ padding: '10px', borderRadius: '5px' }}
                />
              </div>
              <button
                className="btn btn-success"
                onClick={handleVerifyOtp}
                style={{ height: '38px', marginTop: '30px' }}
              >
                {otpVerified ? 'Verified' : 'Verify OTP'}
              </button>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="file" className="form-label" style={{ paddingBottom: '5px' }}>
              Upload File
            </label>
            <input
              type="file"
              className="form-control"
              id="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ padding: '10px', borderRadius: '5px' }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label" style={{ paddingBottom: '5px' }}>
              Grievance Description
            </label>
            <textarea
              className="form-control"
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              rows="3"
              style={{ padding: '10px', borderRadius: '5px' }}
            ></textarea>
          </div>

          <div className="text-center mt-3">
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={isSubmitting || !otpVerified}
              style={{ padding: '10px 20px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {showNotification && <Notification onClose={handleCloseNotification} />}
      <img 
        src={TrainGif} 
        alt="Train GIF" 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '100px',
          height: '100px',
          cursor: 'pointer',
          zIndex: 1000
        }}
        onClick={handleGifClick} // Navigating to ChatBot page on click
      />
    </div>
  );
}

export default Complaint;
