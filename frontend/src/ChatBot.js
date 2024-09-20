import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap

function ChatBot() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg">
        <div className="card-body">
          <h2 className="text-center mb-4">ChatBot</h2>
          <iframe
            width="500"
            height="400"
            allow="microphone;"
            src="https://console.dialogflow.com/api-client/demo/embedded/b150e9b7-4953-4c98-be68-f53009dfbbe0"
            title="ChatBot"
            className="border-0"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
