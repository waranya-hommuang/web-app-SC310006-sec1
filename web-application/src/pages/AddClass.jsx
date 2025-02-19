import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../AuthContext";
import { v4 as uuidv4 } from "uuid"; // ใช้สร้างรหัสสุ่ม
// import { Card,Button,Input } from "antd";

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
    <div className="p-6 max-w-lg mx-auto">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-center mb-4">เพิ่มวิชา</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>รหัสวิชา</label>
            <input name="code" value={formData.code} onChange={handleChange} required />
          </div>
          <div>
            <label>ชื่อวิชา</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <label>ห้องเรียน</label>
            <input name="room" value={formData.room} onChange={handleChange} required />
          </div>
          <div>
            <label>URL รูปภาพ</label>
            <input type="url" name="photoURL" value={formData.photoURL} onChange={handleChange} placeholder="https://example.com/image.jpg" required />
          </div>
          <button type="submit" className="w-full" disabled={loading}>
            {loading ? "กำลังบันทึก..." : "บันทึกวิชา"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddClass;
