import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { Avatar, Card, Button } from "antd";
import { logout } from "../firebase";

const TeacherProfile = () => {
  const { user } = useAuth(); // ดึง user จาก AuthContext
  const db = getFirestore();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchClassrooms = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "classroom"));
        const userClassrooms = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(classroom => classroom.owner === user.uid);
        setClassrooms(userClassrooms);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [user, db]);

  if (!user) return <p className="text-center mt-10 text-gray-500">กรุณาเข้าสู่ระบบ...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="p-4 flex flex-col items-center text-center">
        <Avatar className="w-24 h-24 mb-4" src={user.photo || "/default-avatar.png"} />
        <h2 className="text-2xl font-bold">{user.name || "ไม่ระบุชื่อ"}</h2>
        <p className="text-gray-600">{user.email}</p>
      </Card>
      <Link to="/edit-teacher-profile">
        <Button variant="outlined" color="primary" className="mt-4">
          แก้ไขข้อมูลส่วนตัว
        </Button>
      </Link>

      <div className="flex justify-between items-center mt-6">
        <h3 className="text-xl font-semibold">วิชาที่สอน</h3>
        <Button onClick={() => navigate("/add-class")}>+ เพิ่มวิชา</Button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-4">กำลังโหลด...</div>
      ) : classrooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {classrooms.map((classroom) => (
            <Card key={classroom.id} className="p-4 flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold">{classroom.info.name}</h4>
                <p className="text-gray-500">รหัสวิชา: {classroom.info.code}</p>
                <p className="text-gray-500">ห้องเรียน: {classroom.info.room}</p>
                {classroom.info.photo ? (
                  <img src={classroom.info.photo} alt="classroom" className="mt-2 w-32 h-32 object-cover" />
                ) : (
                  <p>ไม่มีรูปภาพ</p>
                )}
              </div>
              <Button onClick={() => navigate(`/classroom/${classroom.id}`)}>จัดการ</Button>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4 text-center">ยังไม่มีวิชาในระบบ</p>
      )}
      <Button color="danger" variant="solid" onClick={logout}>Logout</Button>
    </div>
  );
};

export default TeacherProfile;
