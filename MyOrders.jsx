import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([])
  const { currency, axios, user } = useAppContext()

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/user')
      if (data.success) {
        setMyOrders(data.orders)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleDelete = async (orderId) => {
    const confirmed = window.confirm("Are you sure you want to delete this order?")
    if (!confirmed) return

    try {
      const { data } = await axios.delete(`/api/order/${orderId}`)
      if (data.success) {
        toast.success("Order deleted successfully")
        fetchMyOrders()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error("Failed to delete order")
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(`/api/order/status/${orderId}`, { status: newStatus })
      if (data.success) {
        toast.success("Order status updated")
        fetchMyOrders()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  useEffect(() => {
    if (user) {
      fetchMyOrders()
    }
  }, [user])

  return (
    <div className="mt-16 pb-16 overflow-x-auto px-4">
      <h2 className="text-2xl font-semibold mb-2">My Orders</h2>

      {user && (
        <div className="flex items-center gap-4 mb-6">
          {user.photo && (
            <img
              src={user.photo}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border"
            />
          )}
          <div>
            <p className="text-lg font-medium text-gray-800">Welcome, {user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      )}

      {myOrders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <table className="min-w-[800px] w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myOrders.map((order) =>
              order.items.map((item, index) => (
                <tr key={order._id + index} className="border-t border-gray-200">
                  <td className="px-4 py-2">{order._id}</td>
                  <td className="px-4 py-2 flex items-center gap-3">
                    <img
                      src={item.product.image[0]}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover"
                    />
                    <span>{item.product.name}</span>
                  </td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">
                    {currency}
                    {item.product.offerPrice * item.quantity}
                  </td>
                  <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{order.status}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {order.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                       
                        
                      </>
                    ) : (
                      <span className="text-gray-400">Locked</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default MyOrders
