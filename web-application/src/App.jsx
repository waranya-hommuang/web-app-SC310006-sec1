import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import TeacherProfile from "./pages/teacherProfile";
import AddClass from "./pages/AddClass";
import EditTeacherProfile from "./pages/EditTeacherProfile";
import ClassroomManage from "./pages/ClassroomManage";
//
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/teacher-profile" element={<TeacherProfile />}/>
          <Route path="/add-class" element={<AddClass />}/>
          <Route path="/edit-teacher-profile" element={<EditTeacherProfile />} />
          <Route path="/classroom/:cid" element={<ClassroomManage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
