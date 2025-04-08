import React, { useState, useEffect } from 'react';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';
import db from "../firebase";
import { collection, doc, setDoc, query, orderBy, limit, getDoc, getDocs } from "firebase/firestore";

const ReceivingReport = () => {
    const [items, setItems] = useState([]);
    const [itemName, setItemName] = useState('');
    const [quantityAccepted, setQuantityAccepted] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [unit, setUnit] = useState('Pc');
    const [description, setDescription] = useState('');
    const [receivingReportNo, setReceivingReportNo] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [assetType, setAssetType] = useState('');
    const [department, setDepartment] = useState('');
    const [modeOfAcquisition, setModeOfAcquisition] = useState('Purchase');
    const [others, setOthers] = useState('');
    const [purchaseOrderNo, setPurchaseOrderNo] = useState('');

    // Set the current date on page load
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setCurrentDate(today);
    }, []);

    const fetchLastReportNo = async () => {
        try {
            const reportQuery = query(
                collection(db, "Receiving Report"),
                orderBy("receivingReportNo", "desc"),
                limit(1)
            );
            const querySnapshot = await getDocs(reportQuery);
            if (!querySnapshot.empty) {
                const lastReport = querySnapshot.docs[0].data();
                const lastReportNo = parseInt(lastReport.receivingReportNo, 10);
                setReceivingReportNo((lastReportNo + 1).toString());
            } else {
                setReceivingReportNo("1000");  // Set starting number if no previous report exists
            }
        } catch (error) {
            console.error("Error fetching last report number:", error);
        }
    };

    // Generate the Receiving Report No on page load
    useEffect(() => {
        fetchLastReportNo();
    }, []);

    const addItem = () => {
        if (!itemName || !quantityAccepted || !unitCost) {
            alert("Please fill in all required fields!");
            return;
        }
        
        const totalCost = quantityAccepted * unitCost;
        const newItem = {
            itemName,
            quantityAccepted,
            unit,
            unitCost,
            totalCost,
            description,
            assetType,
            department,
            modeOfAcquisition,
            others
        };
    
        setItems(prevItems => [...prevItems, newItem]);
    
        // Clear inputs after adding item
        setItemName('');
        setQuantityAccepted('');
        setUnitCost('');
        setUnit('Pc');
        setDescription('');
        setAssetType('');
        setDepartment('');
        setModeOfAcquisition('Purchase');
        setOthers('');
    };

    const handleSubmit = async () => {
        if (!purchaseOrderNo) {
            alert("Please enter a Purchase Order No.");
            return;
        }

        try {
            const poDocRef = doc(db, "Purchase Order", purchaseOrderNo);
            const poDocSnap = await getDoc(poDocRef);
    
            if (!poDocSnap.exists()) {
                alert(`Purchase Order No "${purchaseOrderNo}" not found in the database.`);
                return;
            }
    
            const data = {
                receivingReportNo,
                purchaseOrderNo,
                items,
                currentDate,
                status: "Pending"
            };

            await setDoc(doc(db, "Receiving Report", receivingReportNo), data);
            alert("Receiving Report saved successfully!");
            setItems([]);
            setPurchaseOrderNo('');
            await fetchLastReportNo();
        } catch (error) {
            console.error("Error saving document: ", error);
            alert("Error saving to Firestore");
        }
    };

    const breadcrumbsLinks = [
        { label: "Home", path: "/home" },
        { label: "Receiving Report", path: "/receivingreport" },
    ];

    const preventNumberInput = (e) => {
        if (!isNaN(e.key) && e.key !== ' ') {
            e.preventDefault();
        }
    };
    
    const preventInvalidInput = (e) => {
        if (["e", "E", "+", "-"].includes(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <div>
            <Navbar />
            <div className="gtv_full-container">
                <Breadcrumbs links={breadcrumbsLinks} />
                <h1 className="gtv_rrHeader" style={{ textAlign: 'left' }}>Receiving Report</h1>
                <div className="gtv_dashboard-container">
                    <div className="gtv_rrReport">
                        <h3 className="gtv_formTitle">Report Details</h3>
                        {/* Receiving Report Info */}
                        <div className="gtv_dashboard-group" style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                            <label htmlFor="receivingReportNo">RR No:</label>
                            <input className="gtv_dashBoardInput" type="text" id="receivingReportNo" value={receivingReportNo} disabled />

                            <label htmlFor="purchaseOrderNo">PO No:</label>
                            <input className="gtv_dashBoardInput" type="text" id="purchaseOrderNo" value={purchaseOrderNo} onChange={(e) => setPurchaseOrderNo(e.target.value)} />

                            <label htmlFor="dateReceived">Date Received:</label>
                            <input className="gtv_dashBoardInput" type="date" id="dateReceived" value={currentDate} />
                        </div>

                        <div className="gtv_dashboard-group" style={{display: 'flex', justifyContent: 'center'}}>
                            <label htmlFor="assetType">Asset Type:</label>
                            <input className="gtv_dashBoardInput" style={{width: '500px'}} type="text" id="assetType" value={assetType} onChange={(e) => setAssetType(e.target.value)} onKeyDown={preventNumberInput} />
                        </div>

                        <div className="gtv_dashboard-group" style={{display: 'flex', justifyContent: 'center'}}>
                            <label htmlFor="department">Department:</label>
                            <input style={{width: '500px'}} className="gtv_dashBoardInput" type="text" id="department" value={department} onChange={(e) => setDepartment(e.target.value)} onKeyDown={preventNumberInput} />
                        </div>

                        <div className="gtv_dashboard-group" style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                            <label htmlFor="modeOfAcquisition">Mode of Acquisition:</label>
                            <select id="modeOfAcquisition" className="gtv_qtyInput" style={{width: '150px'}} value={modeOfAcquisition} onChange={(e) => { const value = e.target.value; setModeOfAcquisition(value); if (value !== "Other") { setOthers(''); } }} >
                                <option value="Purchase">Purchase</option>
                                <option value="Donation">Donation</option>
                                <option value="Other">Other</option>
                            </select>
                            
                            <label htmlFor="others" style={{marginLeft: '50px'}}>Others:</label>
                            <input className="gtv_dashBoardInput" type="text" id="others" value={others} onChange={(e) => setOthers(e.target.value)} onKeyDown={preventNumberInput} disabled={modeOfAcquisition !== "Other"} />
                        </div>

                        <h3 className='gtv_formTitle'>Item Details</h3>

                        <div className="gtv_dashboard-group" style={{display: 'flex', justifyContent: 'center'}}>
                            <label htmlFor="itemName">Item Name:</label>
                            <input style={{width: '500px'}} className="gtv_dashBoardInput" type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                        </div>

                        <div className="gtv_dashboard-group" style={{display: 'flex', justifyContent: 'center'}}>
                            <label htmlFor="description">Description:</label>
                            <input style={{width: '500px'}} className="gtv_dashBoardInput" type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)}/>
                        </div>

                        <div className="gtv_dashboard-group" style={{display: 'flex', justifyContent: 'center', width: '96%' }}>
                            <label htmlFor="quantityAccepted">Quantity Accepted:</label>
                            <input
                                type="number"
                                className="gtv_dashBoardInput"
                                id="quantityAccepted"
                                style={{width: '85px'}} 
                                value={quantityAccepted}
                                onChange={(e) => setQuantityAccepted(e.target.value)}
                                onKeyDown={preventInvalidInput}
                            />
                            
                            <label htmlFor="unitCost">Unit Cost:</label>
                            <input style={{width: '100px'}} className="gtv_dashBoardInput" type="number" id="unitCost" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} onKeyDown={preventInvalidInput}/>

                            <label htmlFor="unit">Unit:</label>
                            <select className="gtv_qtyInput" id="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                                <option value="Pc">Pc</option>
                                <option value="Kg">Kg</option>
                                <option value="Ltr">Ltr</option>
                            </select>
                        </div>

                        <div className="gtv_rrBtnBg">
                            <button className="gtv_rrBtn" onClick={addItem}>Add Item</button>
                        </div>

                        <div className="gtv_content">
                            <h3 style={{textAlign: 'center'}}>List of Items</h3>
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
                                        {items.length === 0 ? (
                                            <tr><td colSpan="4" className="gtv_emptyMsg">No item(s) added yet.</td></tr>
                                        ) : (
                                            items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="gtv_td">{item.itemName}</td>
                                                    <td className="gtv_td">{item.quantityAccepted}</td>
                                                    <td className="gtv_td">{item.unitCost}</td>
                                                    <td className="gtv_td">{item.totalCost}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="gtv_rrBtnBg">
                            <button className="gtv_rrBtn" onClick={handleSubmit}>Submit Report</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceivingReport;
