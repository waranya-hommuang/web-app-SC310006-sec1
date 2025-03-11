import React from "react";
import { useAuth } from "../AuthContext";
import { logout } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "antd";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="home-container">
      <h2>Welcome, {user.name}</h2>
      <img src={user.photo} alt="Profile" width="100" />
      <p>Email: {user.email}</p>
      <Button color="danger" variant="solid" onClick={logout}>Logout</Button>
      
      {/* <Link to="/edit">
        <button>Edit Profile</button>
      </Link> */}
    </div>
  );
};

export default Home;
