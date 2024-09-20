import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import necessary components
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Complaint from "./Complaint"; // No need for `.js`
import LoginPage from './LoginPage'; // Import the LoginPage component
import Statistics from './Statistics'; // Import the Statistics component
import ChatBot from "./ChatBot";
import Feedback from './Feedback';


function App() {
    return (
        <Router> {/* Wrap your app with BrowserRouter */}
            <Header />
            <Routes> {/* Define your routes */}
                <Route path="/" element={<Complaint />} /> {/* Home route */}
                <Route path="/login" element={<LoginPage />} /> {/* Login route */}
                <Route path="/statistics" element={<Statistics />} /> {/* Statistics route */}
                <Route path="/chatbot" element={<ChatBot />}/>
                <Route path="/feedback" element={<Feedback />} />
            </Routes>
        </Router>
    );
}

export default App;
