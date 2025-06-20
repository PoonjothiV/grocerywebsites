import React from 'react';
import { useAppContext } from '../context/AppContext';

const EditProfile = () => {
  const { setShowEditProfile, user, setUser } = useAppContext();
  
  const [name, setName] = React.useState(user?.name || '');

  const handleSave = () => {
    // Save the new name or other profile data
    setUser({ ...user, name });
    setShowEditProfile(false); // Close the modal after saving
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={() => setShowEditProfile(false)}>Cancel</button>
      </div>
    </div>
  );
};

export default EditProfile;
