import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Tab, Nav } from 'react-bootstrap';
import RM_Emblem from './Assets/RM_Emblem.png';
import RM_railMadad from './Assets/RM_railMadad.jpg';
import RM_G2 from './Assets/RM_G2.jpg';
//import Header from "./Header";
import StatisticsTable from "./StatisticsTable";
import ComplaintAnalytics from './ComplaintAnalytics';

function Statistics() {
    const [activeTab, setActiveTab] = useState("statistics");

    return (
        <Container fluid>
            <Row className="justify-content-center">
                <Col md={10}>
                <header>
                    <nav className="navbar navbar-expand-sm bg-success fixed-top" style={{ padding: '15px' }}>
                        <div className="container-fluid d-flex justify-content-between">
                            <div className="d-flex justify-content-start">
                                <img src={RM_Emblem} alt="RM_Emblem" style={{ width: '100px', marginRight: '10px' }} className="rounded-pill" />
                                <img src={RM_railMadad} alt="Rail Madad" style={{ width: '100px', marginRight: '10px' }} className="rounded-pill" />
                                <img src={RM_G2} alt="G2" style={{ width: '100px' }} className="rounded-pill" />
                            </div>
                        </div>
                    </nav>
                </header>
                    <div  style={{paddingBottom:'150px'}}>

                    </div>
                    <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)} >
                        <Nav variant="tabs" className="justify-content-center mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="statistics">Statistics</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="analytics">Complaint Analytics</Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <Tab.Content>
                            <Tab.Pane eventKey="statistics">
                                <StatisticsTable />
                            </Tab.Pane>
                            <Tab.Pane eventKey="analytics">
                                < ComplaintAnalytics />
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Col>
            </Row>
        </Container>
        
    );
}

export default Statistics;