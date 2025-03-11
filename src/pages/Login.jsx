import React,{ useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button, Card } from "antd";

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
    <div className="bg-gray-100 h-screen">
    <div className="p-6 max-w-4xl mx-auto ">
      <Card
      title="Login as Teacher"
      variant="borderless"
    
    >
      {/* <h1></h1> */}
      <Button color="cyan" variant="solid" onClick={handleLogin}>Sign in with Google</Button>
      </Card>
    </div>
    </div>
  );
};

export default Login;
