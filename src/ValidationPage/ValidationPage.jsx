import React, { useState } from 'react';
import { collection, documentId, getDocs, query, where, arrayUnion, getDoc, setDoc, doc } from "firebase/firestore";
import { useLocation } from 'react-router-dom';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';
import db from "../firebase";

const ValidationPage = () => {
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([]);
  const [receivingReportNo, setReceivingReportNo] = useState("");  // State for receiving report number search
  const [receivingReportItems, setReceivingReportItems] = useState([]);
  const location = useLocation();

  const breadcrumbsLinks = [
    { label: "Home", path: "/home" },
    { label: "Validation", path: "/validation" },
  ];

  // Function to search for receiving reports by the receiving report number
  const handleSearchReceivingReport = async () => {
    if (!receivingReportNo) {
      alert("Please enter a Receiving Report Number.");
      return;
    }
  
    try {
      const reportRef = doc(db, "Receiving Report", receivingReportNo); // Directly reference the document by its ID
      const reportSnap = await getDoc(reportRef);
  
      if (reportSnap.exists()) {
        const reportData = reportSnap.data();
        setReceivingReportItems(reportData.items || []); // Assuming the items are stored in the 'items' field of the document
      } else {
        alert("No Receiving Report found with this number.");
        setReceivingReportItems([]);
      }
    } catch (error) {
      console.error("Error searching for Receiving Report:", error);
      alert("Error fetching the Receiving Report.");
    }
  };
  

  const handleFetch = async () => {
    if (!purchaseOrderNo) {
      alert("Please enter a Purchase Order No.");
      return;
    }
  
    try {
      const purchaseOrderRef = collection(db, "Purchase Order");
      
      // First try searching by document ID
      const q = query(purchaseOrderRef, where(documentId(), "==", purchaseOrderNo));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // If documents are found by document ID, map them
        const items2 = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPurchaseOrderItems(items2);
      } else {
        // If no documents are found by document ID, search by 'name' field
        const qByName = query(purchaseOrderRef, where("name", "==", purchaseOrderNo)); // Assuming you have 'name' field
        const querySnapshotByName = await getDocs(qByName);
  
        if (!querySnapshotByName.empty) {
          const items2 = querySnapshotByName.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setPurchaseOrderItems(items2);
        } else {
          alert("No Purchase Order found!");
          setPurchaseOrderItems([]);
        }
      }
    } catch (error) {
      console.error("Error searching for Purchase Order:", error);
    }
  };
  

  const handleSave = async () => {
    try {
      const reportRef = doc(db, "Receiving Report", receivingReportNo);
  
      // First, ensure the document exists
      const reportSnap = await getDoc(reportRef);
      if (!reportSnap.exists()) {
        await setDoc(reportRef, { items: [] }); // create the doc with an empty array field
      }
  
      // Now safe to use arrayUnion
      for (const item of receivingReportItems) {
        if (receivingReportNo && item.itemName) {
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
          const currentStock = inventorySnap.exists() ? inventorySnap.data().stock || 0 : 0;
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
              <h3>Search Receiving Report by No:</h3>
              <div className="input-group">
                <label>Receiving Report No:</label>
                <input
                  className="gtv_dashBoardInput"
                  type="text"
                  value={receivingReportNo}
                  onChange={(e) => setReceivingReportNo(e.target.value)}  // Update the search query state
                />
                <button className="gtv_btnDB" onClick={handleSearchReceivingReport}>Search</button>
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
                    {receivingReportItems.length > 0 ? (
                      receivingReportItems.map((item, index) => (
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
                      ))
                    ) : (
                      <tr><td colSpan="7" className="gtv_td">No items found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Purchase Order Section */}
              <h1 style={{ textAlign: 'left' }}>Purchase Order Items</h1>
              <div className="input-group">
                <label>Purchasing Order No:</label>
                <input
                  className="gtv_dashBoardInput"
                  type="text"
                  value={purchaseOrderNo}
                  onChange={(e) => setPurchaseOrderNo(e.target.value)}
                />
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
      {purchaseOrderItems.length > 0 ? (
        purchaseOrderItems.map((po, index) => (
          po.items && po.items.length > 0 ? (
            po.items.map((item, itemIndex) => (
              <tr key={itemIndex}>
                <td className="gtv_td">{item.particulars}</td> {/* Assuming 'particulars' is the item name */}
                <td className="gtv_td">{item.quantity}</td>
                <td className="gtv_td">{item.unit}</td>
                <td className="gtv_td">{item.cost}</td> {/* Assuming 'cost' is the unit cost */}
                <td className="gtv_td">{item.totalCost}</td>
                <td className="gtv_td">{item.gradeDescription}</td> {/* Assuming 'gradeDescription' as description */}
              </tr>
            ))
          ) : (
            <tr key={index}>
              <td colSpan="6" className="gtv_td">No items found in this PO</td>
            </tr>
          )
        ))
      ) : (
        <tr><td colSpan="6" className="gtv_td">No Purchase Orders found</td></tr>
      )}
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
