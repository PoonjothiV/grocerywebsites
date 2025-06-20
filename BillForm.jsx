import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/images/logo.png"; // adjust path as needed

const BillForm = () => {
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState([{ name: "", quantity: 1, price: 0 }]);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [generatedBill, setGeneratedBill] = useState(null);

  const handleItemChange = (index, key, value) => {
    const updatedItems = [...items];
    updatedItems[index][key] = key === "quantity" || key === "price" ? parseInt(value) : value;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1, price: 0 }]);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  const handleGenerateBill = () => {
    const bill = {
      customerName,
      items,
      paymentMethod,
      totalAmount: calculateTotal(),
      createdAt: new Date(),
    };
    setGeneratedBill(bill);
  };

  const downloadPDF = () => {
    const input = document.getElementById("bill-summary");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("grocery-bill.pdf");
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Bill Generator</h2>

      <div className="bg-white shadow rounded p-4 mb-6">
        <label className="block mb-2 font-semibold">Customer Name</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded"
        />

        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 mb-2">
            <input
              type="text"
              placeholder="Item Name"
              value={item.name}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => handleItemChange(index, "price", e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
        ))}
        <button
          onClick={handleAddItem}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Item
        </button>

        <div className="mt-4">
          <label className="block mb-2 font-semibold">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option>Cash on Delivery</option>
            <option>Online Payment</option>
          </select>
        </div>

        <button
          onClick={handleGenerateBill}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded"
        >
          Generate Bill
        </button>
      </div>

      {generatedBill && (
        <div className="bg-white p-6 shadow rounded">
          <div
            id="bill-summary"
            className="border border-gray-400 p-4 rounded print:text-black"
          >
            <div className="flex items-center mb-4">
              <img src={logo} alt="Logo" className="h-14 mr-4" />
              <div>
                <h3 className="text-2xl font-bold">Grocery Store</h3>
                <p className="text-sm">Your Trusted Shop</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">Bill Summary</h3>
            <p><strong>Customer:</strong> {generatedBill.customerName}</p>
            <p><strong>Date:</strong> {new Date(generatedBill.createdAt).toLocaleString()}</p>
            <p><strong>Payment:</strong> {generatedBill.paymentMethod}</p>

            <table className="w-full mt-4 border border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-3 py-2 text-left">Item</th>
                  <th className="border px-3 py-2 text-right">Qty</th>
                  <th className="border px-3 py-2 text-right">Price</th>
                  <th className="border px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {generatedBill.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-3 py-2">{item.name}</td>
                    <td className="border px-3 py-2 text-right">{item.quantity}</td>
                    <td className="border px-3 py-2 text-right">₹{item.price}</td>
                    <td className="border px-3 py-2 text-right">₹{item.quantity * item.price}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="border px-3 py-2 text-right font-bold">Grand Total</td>
                  <td className="border px-3 py-2 text-right font-bold">₹{generatedBill.totalAmount}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
              <p>Thank you for shopping with Grocery Store!</p>
              <p>123 Market Street, Cityville, India</p>
              <p>Phone: +91-9876543210 | Email: support@grocerystore.com</p>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded"
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default BillForm;
