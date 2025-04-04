import React, { useState } from 'react';
import { collection, documentId, getDocs, query, where, arrayUnion, getDoc, setDoc, doc } from "firebase/firestore";
import db from "../firebase";
import { useLocation } from 'react-router-dom';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';
// import './styles.css';

const ValidationPage = () => {
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([]);
  const location = useLocation();
  const [receivingReportItems, setReceivingReportItems] = useState(location.state?.items || []);
  const receivingReportNo = location.state?.receivingReportNo || "";

  const breadcrumbsLinks = [
    { label: "Home", path: "/home" },
    { label: "Validation", path: "/validation" },
  ];

  const handleFetch = async () => {
    if (!purchaseOrderNo) {
      alert("Please enter a Purchase Order No.");
      return;
    }

    try {
      const purchaseOrderRef = collection(db, "Purchase Order");
      const q = query(purchaseOrderRef, where(documentId(), "==", purchaseOrderNo));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const items2 = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPurchaseOrderItems(items2);
      } else {
        alert("No Purchase Order found!");
        setPurchaseOrderItems([]);
      }
    } catch (error) {
      console.error("Error searching for Purchase Order:", error);
    }
  };

  const handleSave = async () => {
    try {
      for (const item of receivingReportItems) {
        if (receivingReportNo && item.itemName) {
          const reportRef = doc(db, "Receiving Report", receivingReportNo);
          await setDoc(reportRef, {
            items: arrayUnion({
              itemName: item.itemName,
              quantityAccepted: item.quantityAccepted,
              unit: item.unit,
              unitCost: item.unitCost,
              totalCost: item.totalCost,
              description: item.description,
              status: item.status,
            }),
          }, { merge: true });

          const inventoryRef = doc(db, "Inventory", item.itemName);
          const inventorySnap = await getDoc(inventoryRef);
          let currentStock = inventorySnap.exists() ? inventorySnap.data().stock || 0 : 0;
          const updatedStock = currentStock + (item.quantityAccepted || 0);

          await setDoc(inventoryRef, {
            stock: updatedStock,
            unit: item.unit,
            unitCost: item.unitCost,
            totalCost: updatedStock * item.unitCost,
            description: item.description,
          }, { merge: true });
        }
      }
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes.");
    }
  };

  const handleReceivingReportChange = (index, value) => {
    const updatedItems = [...receivingReportItems];
    updatedItems[index].status = value;
    setReceivingReportItems(updatedItems);
  };

  return (
    <div>
      <Navbar />
      <div className="gtv_full-container">
      <Breadcrumbs links={breadcrumbsLinks} />
        <div className="gtv_dashboard-container">
          <div className="gtv_dashboard-left">
            <div className="card">
              <h1 style={{ textAlign: 'left' }}>Validation Page</h1>

              {/* Receiving Report Section */}
              <h3>Receiving Report Items</h3>
              <div className="input-group">
                <label>Receiving Report No:</label>
                <input className="gtv_dashBoardInput" type="text" value={receivingReportNo} readOnly />
              </div>

              <div className="gtv_content" style={{ width: '100%' }}>
                <table className="gtv_table">
                  <thead>
                    <tr>
                      <th className="gtv_th">Item Name</th>
                      <th className="gtv_th">Qty Accepted</th>
                      <th className="gtv_th">Unit</th>
                      <th className="gtv_th">Unit Cost</th>
                      <th className="gtv_th">Total Cost</th>
                      <th className="gtv_th">Description</th>
                      <th className="gtv_th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivingReportItems.map((item, index) => (
                      <tr key={index}>
                        <td className="gtv_td">{item.itemName}</td>
                        <td className="gtv_td">{item.quantityAccepted}</td>
                        <td className="gtv_td">{item.unit}</td>
                        <td className="gtv_td">{item.unitCost}</td>
                        <td className="gtv_td">{item.totalCost}</td>
                        <td className="gtv_td">{item.description}</td>
                        <td>
                          <select value={item.status || ''} onChange={(e) => handleReceivingReportChange(index, e.target.value)}>
                            <option value="">Select Status</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Purchase Order Section */}
              <h1 style={{ textAlign: 'left' }}>Purchase Order Items</h1>
              <div className="input-group">
                <label>Purchasing Order No:</label>
                <input className="gtv_dashBoardInput"type="text" value={purchaseOrderNo} onChange={(e) => setPurchaseOrderNo(e.target.value)} />
                <button className="gtv_btnDB" onClick={handleFetch}>Search</button>
              </div>

              <div className="gtv_content" style={{ width: '100%' }}>
                <table className="gtv_table">
                  <thead>
                    <tr>
                      <th className="gtv_th">Item Name</th>
                      <th className="gtv_th">Qty Ordered</th>
                      <th className="gtv_th">Unit</th>
                      <th className="gtv_th">Unit Cost</th>
                      <th className="gtv_th">Total Cost</th>
                      <th className="gtv_th">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrderItems.map((items2, index) => (
                      <tr key={index}>
                        <td className="gtv_td">{items2.itemName}</td>
                        <td className="gtv_td">{items2.qty}</td>
                        <td className="gtv_td">{items2.unit}</td>
                        <td className="gtv_td">{items2.unitCost}</td>
                        <td className="gtv_td">{items2.totalCost}</td>
                        <td className="gtv_td">{items2.Description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save Button */}
              <div>
                <button className="gtv_btnDB" onClick={handleSave}>Update Inventory</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationPage;
