import React,{ useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "antd";

const Login = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        // ปิด popup เอง ถ้าเปิดอยู่
        if (window.opener) {
          window.close();
        } else {
          navigate("/teacher-profile");
        }
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  return (
    <div className="login-container">
      <h2>Login as Teacher</h2>
      <Button color="cyan" variant="solid" onClick={handleLogin}>Sign in with Google</Button>
    </div>
  );
};

export default Login;
