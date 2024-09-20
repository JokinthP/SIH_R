import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Feedback() {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!feedback) {
      setErrorMessage('Please provide your feedback.');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post('http://127.0.0.1:8000/submit_feedback', { description: feedback });
      setFeedback('');
      setErrorMessage('');
      navigate('/'); // Navigate to thank you page or home after feedback submission
    } catch (error) {
      setErrorMessage('Error submitting feedback');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card w-50 shadow" style={{ padding: '20px' }}>
        <div className="card-body">
          <h2 className="card-title text-center">We Value Your Feedback</h2>
          <br />
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          <div className="mb-3">
            <label htmlFor="feedback" className="form-label">Your Feedback</label>
            <textarea
              className="form-control"
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="3"
              style={{ padding: '10px', borderRadius: '5px' }}
            ></textarea>
          </div>

          <div className="text-center mt-3">
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ padding: '10px 20px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
