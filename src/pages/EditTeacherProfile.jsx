import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { Avatar, Button, Input, Card } from "antd";
import { getStorage, ref, uploadBytes } from "firebase/storage";

const EditTeacherProfile = () => {
    const { user } = useAuth(); // ดึงข้อมูลผู้ใช้จาก AuthContext
    const db = getFirestore();
    const navigate = useNavigate();
  
    // ตรวจสอบว่า user มีข้อมูลหรือไม่
    if (!user) {
      return <p>กำลังโหลดข้อมูลผู้ใช้...</p>; // หรือแสดงข้อความหรือหน้าจอโหลด
    }
  
    // กำหนด state สำหรับเก็บข้อมูลของผู้ใช้
    const [name, setName] = useState(user.name || ""); // กำหนดค่าตั้งต้นจาก Firestore
    const [email, setEmail] = useState(user.email || ""); // กำหนดค่าตั้งต้นจาก Firestore
    const [photoURL, setPhotoURL] = useState(user.photo || ""); // กำหนด URL รูปภาพเริ่มต้น
    const [loading, setLoading] = useState(false); // กำหนดสถานะการโหลด
  
    // ฟังก์ชันสำหรับอัปเดตข้อมูลใน Firestore
    const handleSave = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, "users", user.uid);
  
        // ถ้ามีการกรอก URL รูปภาพใหม่, ใช้ URL นั้น
        const updatedPhoto = photoURL || user.photo; // ถ้าไม่มีการกรอก URL ใหม่ให้ใช้รูปเดิม
  
        await updateDoc(userRef, {
          name: name,
          email: email,
          photo: updatedPhoto, // ใช้ URL รูปภาพที่กรอกใหม่หรือรูปเดิม
        });
  
        navigate("/teacher-profile"); // กลับไปที่หน้าโปรไฟล์
  
      } catch (error) {
        console.error("Error updating profile:", error);
      }
      setLoading(false);
    };
  
    // ดึงข้อมูลผู้ใช้จาก Firestore เมื่อเข้าสู่หน้า
    useEffect(() => {
      if (!user) return;
      const fetchData = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setName(userSnap.data().name);
            setEmail(userSnap.data().email);
            setPhotoURL(userSnap.data().photo || ""); // กำหนดค่ารูปภาพเริ่มต้น
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setLoading(false);
      };
      fetchData();
    }, [user, db]);
  
    if (loading) return <p>กำลังโหลดข้อมูล...</p>;
  
    return (
      <div className="bg-gray-100 h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-4 flex flex-col items-center text-center">
          <Avatar className="w-24 h-24 mb-4" src={photoURL || "/default-avatar.png"} />
          <h2 className="text-2xl font-bold">แก้ไขข้อมูลโปรไฟล์</h2>
  
          <div className="mt-4 w-full">
            <Input
              label="ชื่อ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4"
            />
            <Input
              label="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            <div className="mb-4">
              <Input
                label="URL รูปภาพ"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
            </div>
          </div>
  
          <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
            บันทึกข้อมูล
          </Button>
        </Card>
      </div>
      </div>
    );
  };
  
  export default EditTeacherProfile;
