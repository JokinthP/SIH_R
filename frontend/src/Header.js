import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import RM_Emblem from './Assets/RM_Emblem.png';
import RM_railMadad from './Assets/RM_railMadad.jpg';
import RM_G2 from './Assets/RM_G2.jpg';

function Header() {
    const navigate = useNavigate(); // Get the navigate function

    const handleAdminLogin = () => {
        navigate('/login'); // Use navigate to go to the login page
    };

    const home = () => {
        navigate('/'); // Use navigate to go to the home page
    };

    return (
        <header>
            <nav className="navbar navbar-expand-sm bg-success fixed-top" style={{ padding: '15px' }}>
                <div className="container-fluid">
                    {/* Left side: Images */}
                    <div className="d-flex justify-content-start">
                        <img src={RM_Emblem} alt="RM_Emblem" style={{ width: '100px', marginRight: '10px' }} className="rounded-pill" />
                        <img src={RM_railMadad} alt="Rail Madad" style={{ width: '100px', marginRight: '10px' }} className="rounded-pill" />
                        <img src={RM_G2} alt="G2" style={{ width: '100px' }} className="rounded-pill" />
                    </div>

                    {/* Right side: Buttons */}
                    <div className="d-flex justify-content-end ms-auto" style={{ gap: '10px' }}>
                        <button onClick={home} className="btn btn-outline-light" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            Home
                        </button>
                        <button onClick={handleAdminLogin} className="btn btn-outline-light" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            Admin Login
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
