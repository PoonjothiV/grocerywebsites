import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDetail = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await axios.get('/api/user/all');
      if (res.data.success) setUsers(res.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;
  
    try {
      const res = await axios.delete(`/api/user/delete/${id}`);
      if (res.data.success) {
        alert("User deleted successfully");
        loadUsers();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Error deleting user");
    }
  };
  
  

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-2">User Management</h2>
      
      {users.length === 0 ? (
        <p className="text-center text-gray-500">No users found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {users.map(user => (
            <div key={user._id} className="bg-white rounded-lg shadow-md p-5">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{user.name}</h3>
              <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Email:</span> {user.email}</p>
              <p className="text-sm text-gray-600 mb-3"><span className="font-medium">User ID:</span> {user._id}</p>
              <button
                onClick={() => handleDelete(user._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDetail;
