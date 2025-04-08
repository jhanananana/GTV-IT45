import React, { useState } from 'react';
import { collection, documentId, getDocs, query, where, arrayUnion, getDoc, setDoc, doc } from "firebase/firestore";
import { useLocation } from 'react-router-dom';
import Navbar from '../NavBarAndFooter/navbar.jsx';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';
import db from "../firebase";
import { useEffect } from 'react';


const ValidationPage = () => {
  const [purchaseOrderNo, setPurchaseOrderNo] = useState("");
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([]);
  const [receivingReportNo, setReceivingReportNo] = useState("");  // State for receiving report number search
  const [receivingReportItems, setReceivingReportItems] = useState([]);
  const [allReceivingReports, setAllReceivingReports] = useState([]);
  const location = useLocation();

  const breadcrumbsLinks = [
    { label: "Home", path: "/home" },
    { label: "Validation", path: "/validation" },
  ];

  useEffect(() => {
    const fetchAllReceivingReports = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Receiving Report"));
        const allItems = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.items) {
            const itemsWithReportNo = data.items.map(item => ({
              ...item,
              receivingReportNo: docSnap.id,
            }));
            allItems.push(...itemsWithReportNo);
          }

        });

        setAllReceivingReports(allItems);
        setReceivingReportItems(allItems); // Show all items by default
      } catch (error) {
        console.error("Error fetching all Receiving Reports:", error);
      }
    };

    fetchAllReceivingReports();
  }, []);

  useEffect(() => {
    const fetchAllPurchaseOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Purchase Order"));
        const allPOs = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          allPOs.push({ id: docSnap.id, ...data });
        });

        setPurchaseOrderItems(allPOs);
      } catch (error) {
        console.error("Error fetching all Purchase Orders:", error);
      }
    };

    fetchAllPurchaseOrders();
  }, []);


  // Function to search for receiving reports by the receiving report number
  console.log("Receiving Report No:", receivingReportNo);
  console.log("Purchase Order No:", purchaseOrderNo);

  const handleSearchReceivingReport = async () => {
    const trimmedReportNo = receivingReportNo.trim();

    if (!trimmedReportNo) {
      alert("Please enter a Receiving Report Number.");
      return;
    }

    try {
      const reportRef = doc(db, "Receiving Report", trimmedReportNo);
      const reportSnap = await getDoc(reportRef);

      if (reportSnap.exists()) {
        const reportData = reportSnap.data();
        console.log("Fetched data:", reportData); // <-- Check structure
        const itemsWithReportNo = (reportData.items || []).map(item => ({
          ...item,
          receivingReportNo: trimmedReportNo,
        }));
        setReceivingReportItems(itemsWithReportNo);

      } else {
        alert(`No Receiving Report found with number: ${trimmedReportNo}`);
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
        console.log("Document doesn't exist, creating new one...");
        await setDoc(reportRef, { items: [] }); // create the doc with an empty array field
      }
  
      // Update each item
      for (const item of receivingReportItems) {
        if (receivingReportNo && item.itemName) {
          console.log("Saving item:", item);
  
          // Fetch all items to check if the current item already exists
          const reportData = reportSnap.data();
          const existingItem = reportData.items.find(existing => existing.itemName === item.itemName && existing.receivingReportNo === receivingReportNo);
  
          if (existingItem) {
            // Item exists, update only the status
            const updatedItems = reportData.items.map(existing =>
              existing.itemName === item.itemName && existing.receivingReportNo === receivingReportNo
                ? { ...existing, status: item.status }
                : existing
            );
  
            // Save the updated items array back to the document
            await setDoc(reportRef, { items: updatedItems }, { merge: true });
          } else {
            // If item does not exist, add it using arrayUnion
            await setDoc(reportRef, {
              items: arrayUnion({
                itemName: item.itemName,
                quantityAccepted: item.quantityAccepted,
                unit: item.unit,
                unitCost: item.unitCost,
                totalCost: item.totalCost,
                description: item.description,
                status: item.status,
                receivingReportNo: receivingReportNo,
              }),
            }, { merge: true });
          }
  
          // Update inventory
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
        } else {
          console.log("Skipping invalid item:", item);
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

    // Function to get dynamic styles based on status
    const getStatusStyle = (status) => {
      switch (status) {
        case 'In Progress':
          return { backgroundColor: '#fff5cb', color: '#e6a029' }; // Yellowish for "In Progress"
        case 'Completed':
          return { backgroundColor: '#d1fae5', color: '#065f46' }; // Green for "Completed"
        case 'Pending':
          return { backgroundColor: '#fee2e2', color: '#ab3437' }; // Red for "Pending"
        default:
          return {}; // Default styles if no status is selected
      }
    };
  
  return (
    <div>
      <Navbar />
      <div className="gtv_dashboard3-container">
        <Breadcrumbs links={breadcrumbsLinks} />
        <h1 className="gtv_rrHeader" style={{ textAlign: 'left' }}>Validation Page</h1>
        <div className="gtv_dashboard-container">
          <div className="card">
              {/* Receiving Report Section */}
              <div className="gtv_input-group">
                <label className>Receiving Report No:</label>
                <input
                  className="gtv_dashBoardInput"
                  type="text"
                  value={receivingReportNo}
                  placeholder="Enter a receiving report number here..." 
                  onChange={(e) => setReceivingReportNo(e.target.value)}  // Update the search query state
                />
                <button className="gtv_vrBtn" onClick={handleSearchReceivingReport}>Search</button>
              </div>

              <div className="gtv_table">
                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <thead>
                    <tr>
                      <th className="gtv_th">RR No.</th> {/* New Column */}
                      <th className="gtv_th ">Item Name</th>
                      <th className="gtv_th ">Qty Accepted</th>
                      <th className="gtv_th ">Unit</th>
                      <th className="gtv_th">Unit Cost</th>
                      <th className="gtv_th">Total Cost</th>
                      <th className="gtv_th gtv-desc">Description</th>
                      <th className="gtv_th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivingReportItems.length > 0 ? (
                      receivingReportItems.map((item, index) => (
                        <tr key={index}>
                          <td className="gtv_td">{item.receivingReportNo || receivingReportNo}</td>
                          <td className="gtv_td">{item.itemName}</td>
                          <td className="gtv_td">{item.quantityAccepted}</td>
                          <td className="gtv_td">{item.unit}</td>
                          <td className="gtv_td">{item.unitCost}</td>
                          <td className="gtv_td">{item.totalCost}</td>
                          <td className="gtv_td">{item.description}</td>
                          <td>
                          <select
                            className="gtv_vrStatus-Input"
                            value={item.status || ''}
                            onChange={(e) => handleReceivingReportChange(index, e.target.value)}
                            style={getStatusStyle(item.status)} 
                          >
                            <option className="gtv_vrStatus select" value="">Select Status</option>
                            <option className="gtv_vrStatus in-progress" value="In Progress">In Progress</option>
                            <option className="gtv_vrStatus completed" value="Completed">Completed</option>
                            <option className="gtv_vrStatus pending" value="Pending">Pending</option>
                          </select>
                        </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="8" className="gtv_td">No items found</td></tr>
                    )}
                  </tbody>
                </table>

              </div>
              <br></br>
              {/* Purchase Order Section */}
              <h1 style={{textAlign: 'left'}}>Purchase Orders</h1>

              <div className="gtv_input-group">
                <label>Purchase Order No:</label>
                <input
                  placeholder="Enter a purchase order number here..." 
                  className="gtv_dashBoardInput"
                  type="text"
                  value={purchaseOrderNo}
                  onChange={(e) => setPurchaseOrderNo(e.target.value)}
                />
                <button className="gtv_vrBtn" onClick={handleFetch}>Search</button>
              </div>

              <div>
                <div className="gtv_table">
                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <thead>
                    <tr>
                      <th className="gtv_th">PO No.</th>
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
                            <tr key={`${index}-${itemIndex}`}>
                              <td className="gtv_td">{po.id}</td> {/* Shows actual PO Number from document ID */}
                              <td className="gtv_td">{item.particulars}</td>
                              <td className="gtv_td">{item.quantity}</td>
                              <td className="gtv_td">{item.unit}</td>
                              <td className="gtv_td">{item.cost}</td>
                              <td className="gtv_td">{item.totalCost}</td>
                              <td className="gtv_td">{item.gradeDescription}</td>
                            </tr>
                          ))
                        ) : (
                          <tr key={index}>
                            <td className="gtv_td">{po.id}</td>
                            <td className="gtv_td gtv_noItems" colSpan="6">No items found in this PO</td>
                          </tr>
                        )
                      ))
                    ) : (
                      <tr><td colSpan="7" className="gtv_td">No Purchase Orders found</td></tr>
                    )}
                  </tbody>
                  </table>
                </div>
              </div>
              {/* Save Button */}
              <div>
                <button className="gtv_btnDB" onClick={handleSave}>Update Inventory</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ValidationPage;
