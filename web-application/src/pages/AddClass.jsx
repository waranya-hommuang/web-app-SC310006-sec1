import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../AuthContext";
import { v4 as uuidv4 } from "uuid"; // ใช้สร้างรหัสสุ่ม
// import { Card,Button,Input } from "antd";
import { Button, Card } from "antd";

const AddClass = () => {
  const { user } = useAuth(); // ดึง user จาก AuthContext
  const db = getFirestore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ code: "", name: "", room: "", photoURL: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("กรุณาเข้าสู่ระบบก่อน");

    setLoading(true);
    const cid = uuidv4(); // สร้างรหัสสุ่มสำหรับห้องเรียน

    try {
      // บันทึกข้อมูลวิชาใน /classroom/{cid}/info
      await setDoc(doc(db, "classroom", cid), {
        owner: user.uid,
        info: {
          code: formData.code,
          name: formData.name,
          room: formData.room,
          photo: formData.photoURL, // ใช้ URL ที่ผู้ใช้กรอก
        },
      });

      // บันทึกข้อมูลวิชาใน /users/{uid}/classroom/{cid}
      await setDoc(doc(db, "users", user.uid, "classroom", cid), {
        status: 1, // เป็นอาจารย์
      });

      alert("เพิ่มวิชาสำเร็จ!");
      navigate("/teacher-profile"); // กลับไปหน้าโปรไฟล์อาจารย์
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="bg-gray-50 h-screen">
    <div className="p-6 max-w-lg mx-auto">
      <Card className="p-4">
        <h2 className="text-2xl font-bold text-center mb-4">เพิ่มวิชา</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="">รหัสวิชา</label>
            <input className="border-1 border-solid border-gray-300 rounded-sm ml-6" name="code" value={formData.code} onChange={handleChange} required />
          </div>
          <div>
            <label className="">ชื่อวิชา</label>
            <input className="border-1 border-solid border-gray-300 rounded-sm ml-8" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="">ห้องเรียน</label>
            <input className="border-1 border-solid border-gray-300 rounded-sm ml-5" name="room" value={formData.room} onChange={handleChange} required />
          </div>
          <div>
            <label className="">URL รูปภาพ</label>
            <input className="border-1 border-solid border-gray-300 rounded-sm ml-1" type="url" name="photoURL" value={formData.photoURL} onChange={handleChange} placeholder="https://example.com/image.jpg" required />
          </div>
          <button color="cyan" variant="solid" type="submit" className="text-white rounded-md py-1 w-full bg-sky-500/100" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึกวิชา"}
          </button>
        </form>
      </Card>
    </div>
    </div>
  );
};

export default AddClass;
