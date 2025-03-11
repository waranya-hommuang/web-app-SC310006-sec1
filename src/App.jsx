import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import TeacherProfile from "./pages/teacherProfile";
import AddClass from "./pages/AddClass";
import EditTeacherProfile from "./pages/EditTeacherProfile";
import ClassroomManage from "./pages/ClassroomManage";
import CheckinSession from "./pages/CheckinSession";
import QuestionAnswer from "./pages/QuestionAnswerScreen";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/teacher-profile" element={<TeacherProfile />}/>
          <Route path="/add-class" element={<AddClass />}/>
          <Route path="/edit-teacher-profile" element={<EditTeacherProfile />} />
          <Route path="/classroom/:cid" element={<ClassroomManage />} />
          <Route path="/checkin/:cid/:cno" element={<CheckinSession />}/>
          <Route path="/question-answer/:cid/:cno" element={<QuestionAnswer />}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
