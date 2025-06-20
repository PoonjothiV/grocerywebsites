import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';

const Orders = () => {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setSelectedOrderId(prev => (prev === orderId ? null : orderId));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(`/api/order/updateStatus/${orderId}`, {
        status: newStatus,
      });
      if (data.success) {
        toast.success('Status updated!');
        setOrders(prev =>
          prev.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const orderToDelete = orders.find(order => order._id === orderId);
    
    // Block deletion only for delivered orders
    if (orderToDelete?.status === 'Delivered') {
      toast.error('Cannot delete delivered orders');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const { data } = await axios.delete(`/api/order/${orderId}`);
      if (data.success) {
        toast.success('Order deleted successfully!');
        setOrders(prev => prev.filter(order => order._id !== orderId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  return (
    <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders List</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No orders found.</p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr
                      onClick={() => toggleOrderDetails(order._id)}
                      className="cursor-pointer hover:bg-gray-50 border-b"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <img src={assets.box_icon} className="w-6 h-6 object-cover" alt="Order" />
                          <span className="text-primary text-sm">{order._id}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-medium">
                        {currency}
                        {order.amount}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : order.status === 'Order Placed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        {/* Status dropdown - hidden for delivered orders */}
                        {order.status !== 'Delivered' && (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`px-2 py-1 rounded text-sm cursor-pointer ${
                              order.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : order.status === 'Order Placed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Order Placed">Order Placed</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        )}
                        {/* Delete button - enabled for all except delivered */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order._id);
                          }}
                          className={`px-3 py-1.5 text-sm rounded border ${
                            order.status === 'Delivered'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                              : 'hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200'
                          }`}
                          title={
                            order.status === 'Delivered'
                              ? 'Cannot delete delivered orders'
                              : 'Delete order'
                          }
                          disabled={order.status === 'Delivered'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {/* Order details expandable row */}
                    {selectedOrderId === order._id && (
                      <tr className="border-b">
                        <td colSpan="5" className="p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold mb-2">Items</h4>
                              <ul className="space-y-1">
                                {order.items.map((item, idx) => (
                                  <li key={idx}>
                                    {item.product?.name || 'Unknown Product'} - Qty: {item.quantity}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Shipping Address</h4>
                              {typeof order.address === 'object' ? (
                                <div className="space-y-1">
                                  <p>
                                    {order.address.firstName} {order.address.lastName}
                                  </p>
                                  <p>
                                    {order.address.street}, {order.address.city}
                                  </p>
                                  <p>
                                    {order.address.state}, {order.address.zipcode}, {order.address.country}
                                  </p>
                                  <p>Phone: {order.address.phone}</p>
                                </div>
                              ) : (
                                <p>Address ID: {order.address}</p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Payment Details</h4>
                              <p>Method: {order.paymentType}</p>
                              <p>Status: {order.isPaid ? 'Paid' : 'Pending'}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Order Timeline</h4>
                              <p>Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                              <p>Updated: {new Date(order.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;