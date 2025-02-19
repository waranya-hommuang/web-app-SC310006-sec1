import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { updateUserProfile } from "../firebase";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [photo, setPhoto] = useState(user?.photo || "");

  const handleSave = async () => {
    await updateUserProfile(user.uid, { name, email, photo });
    setUser({ ...user, name, email, photo });
    navigate("/teacher-profile");
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      {/* แก้เป็นอัปรูป */}
      {/* <input type="text" value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="Photo URL" /> */}
      <button onClick={handleSave}>Save</button>
      <button onClick={() => navigate("/")}>Cancel</button>
    </div>
  );
};

export default EditProfile
