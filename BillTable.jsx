import React, { useEffect, useState } from "react";
import axios from "axios";

const BillTable = () => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    // Fetch all bills from the backend
    axios
      .get("/api/bills/all")
      .then(response => {
        setBills(response.data); // Set the fetched bills into state
      })
      .catch(error => {
        console.error("Error fetching bills:", error);
      });
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2 text-left">Customer Name</th>
            <th className="border px-4 py-2 text-left">Items</th>
            <th className="border px-4 py-2 text-left">Payment Method</th>
            <th className="border px-4 py-2 text-left">Total Amount</th>
            <th className="border px-4 py-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {bills.length > 0 ? (
            bills.map(bill => (
              <tr key={bill.id}>
                <td className="border px-4 py-2">{bill.customerName}</td>
                <td className="border px-4 py-2">{bill.items}</td>
                <td className="border px-4 py-2">{bill.paymentMethod}</td>
                <td className="border px-4 py-2">{bill.totalAmount}</td>
                <td className="border px-4 py-2">{bill.createdAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center border px-4 py-2">No Bills Available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BillTable;
