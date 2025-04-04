import React, { useState, useEffect } from 'react';
import './styles.css';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';

const ReceivingReport = () => {
    const [items, setItems] = useState([]);
    const [itemName, setItemName] = useState('');
    const [quantityAccepted, setQuantityAccepted] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [unit, setUnit] = useState('Pc');
    const [description, setDescription] = useState('');
    const [receivingReportNo, setReceivingReportNo] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    // Set the current date on page load
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setCurrentDate(today);
    }, []);

    // Generate Receiving Report No on page load
    useEffect(() => {
        const generateReportNo = () => {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            setReceivingReportNo(randomNum.toString());
        };
        generateReportNo();
    }, []);

    const addItem = () => {
        const totalCost = quantityAccepted * unitCost;
        setItems([...items, { itemName, quantityAccepted, unit, unitCost, totalCost, description }]);
        setItemName('');
        setQuantityAccepted('');
        setUnitCost('');
        setUnit('Pc');
        setDescription('');
    };

    const handleValidation = () => {
        alert('Next step clicked');
    };

    const breadcrumbsLinks = [
        { label: "Home", path: "/home" },
        { label: "Receiving Report", path: "/receivingreport" },
      ];

    return (
        <div>
            <Navbar /> {/* Navbar is now properly wrapped in a div with the rest of the content */}

            <div className="gtv_full-container">
            <Breadcrumbs links={breadcrumbsLinks} />
                {/* Content Section */}
                <div className="gtv_dashboard-container">
                    <div className="gtv_dashboard-left">
                        <h1 style={{ textAlign: 'left' }}>RECEIVING REPORT</h1>

                        {/* Receiving Report Info */}
                        <div className="gtv_dashboard-group">
                            <label htmlFor="receivingReportNo">Receiving Report No:</label>
                            <input className="gtv_dashBoardInput" type="text" id="receivingReportNo" value={receivingReportNo} disabled />

                            <label htmlFor="dateReceived">Date Received:</label>
                            <input className="gtv_dashBoardInput" type="date" id="dateReceived" value={currentDate} />
                        </div>

                        <div className="gtv_dashboard-group">
                            <label htmlFor="assetType">Asset Type:</label>
                            <input className="gtv_dashBoardInput" type="text" id="assetType" />

                            <label htmlFor="department">Department:</label>
                            <input className="gtv_dashBoardInput" type="text" id="department" />

                            <label htmlFor="modeOfAcquisition">Mode of Acquisition:</label>
                            <select id="modeOfAcquisition" className="gtv_cashAdvInput">
                                <option value="Purchase">Purchase</option>
                                <option value="Donation">Donation</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="gtv_dashboard-group">
                        <label htmlFor="others">Others:</label>
                        <input className="gtv_dashBoardInput" type="text" id="others" />

                        {/* Item Details */}

                        <label htmlFor="itemName">Item Name:</label>
                        <input className="gtv_dashBoardInput" type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} />

                        <label htmlFor="quantityAccepted">Quantity Accepted:</label>
                        <input
                            type="number"
                            className="gtv_dashBoardInput"
                            id="quantityAccepted"
                            value={quantityAccepted}
                            onChange={(e) => setQuantityAccepted(e.target.value)}
                        />

                        </div>
                        <div className="gtv_dashboard-group">
                            <label htmlFor="unitCost">Unit Cost:</label>
                            <input type="number" id="unitCost" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />

                            <label htmlFor="unit">Unit:</label>
                            <select className="gtv_cashAdvInput" id="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                                <option value="Pc">Pc</option>
                                <option value="Kg">Kg</option>
                                <option value="Ltr">Ltr</option>
                            </select>

                            <label htmlFor="description">Description:</label>
                            <input className="gtv_dashBoardInput" type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <br></br>
                        <hr></hr>
                        <br></br>
                        {/* Add Item Button */}
                        <button className="gtv_btnDB" onClick={addItem}>Add</button>

                        {/* Display Items Table */}
                        <div className="gtv_content">
                            <div className="gtv_table">
                                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th className="gtv_th">Item Name</th>
                                            <th className="gtv_th">Quantity</th>
                                            <th className="gtv_th">Unit Cost</th>
                                            <th className="gtv_th">Total Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="gtv_td">{item.itemName}</td>
                                                <td className="gtv_td">{item.quantityAccepted}</td>
                                                <td className="gtv_td">{item.unitCost}</td>
                                                <td className="gtv_td">{item.totalCost}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Next Button */}
                        <div className="next-button-container">
                            <button className="gtv_btnDB" onClick={handleValidation}>Next</button>
                        </div>
                        {/* </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceivingReport;
