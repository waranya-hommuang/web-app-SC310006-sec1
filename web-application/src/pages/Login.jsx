import React from "react";
import { signInWithGoogle } from "../firebase";
import { Button } from "antd";

const Login = () => {
  return (
    <div className="login-container">
      <h2>Login as Teacher</h2>
      <Button color="cyan" variant="solid" onClick={signInWithGoogle}>Sign in with Google</Button>
    </div>
  );
};

export default Login;
