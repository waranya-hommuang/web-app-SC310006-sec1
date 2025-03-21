import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, doc, getDoc, getDocs, addDoc,setDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { db } from "../firebase";
import { Button, Card, Space, Table, Tag } from "antd";
import QRCode from 'qrcode';

const ClassroomManage = () => {
  const { user } = useAuth();
  const { cid } = useParams();
  const db = getFirestore();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [code, setCode] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState(0);
  const qrRef = useRef(null);

  useEffect(() => {
    const fetchClassroom = async () => {
      const classRef = doc(db, "classroom", cid);
      const classSnap = await getDoc(classRef);
      if (classSnap.exists()) {
        setClassroom(classSnap.data());
      }
    };

    const fetchStudents = async () => {
      const studentsRef = collection(db, `classroom/${cid}/students`);
      const studentsSnap = await getDocs(studentsRef);
      //console.log("Fetched Students:", studentsSnap.docs.map(doc => doc.data()));
      setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchClassroom();
    fetchStudents();
    // fetchCheckins();
  }, [cid, db]);

  useEffect(() => {
    if (classroom && qrRef.current) {
      QRCode.toCanvas(qrRef.current, `https://your-app.com/register/${cid}`, {
        width: 150,
        height: 150,
      });
    }
  }, [classroom, cid]);


  useEffect(() => {
    const q = query(collection(db, `classroom/${cid}/checkin`), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCheckins(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsubscribe();
  }, [cid]);

  const handleAddCheckin = async () => {
    if (!code || !date) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
  
    try {
      // คิวรี่เพื่อหาค่า cno ที่มากที่สุด
      const checkinRef = collection(db, `classroom/${cid}/checkin`);
      const checkinQuery = query(checkinRef, orderBy("cno", "desc"));
      const checkinSnap = await getDocs(checkinQuery);
  
      let newCno = 1; // ถ้ายังไม่มีเช็คอิน ให้เริ่มที่ 1
      if (!checkinSnap.empty) {
        const latestCheckin = checkinSnap.docs[0].data();
        newCno = latestCheckin.cno + 1; // คำนวณลำดับถัดไป
      }
  
      // สร้างเอกสารใหม่
      const newCheckinRef = doc(checkinRef);
      const newCheckin = {
        cno: newCno, // ใช้ค่า cno ที่เรียงลำดับ
        code,
        date,
        status,
        studentCount: 0, // ค่าเริ่มต้น
      };
      
      await setDoc(newCheckinRef, newCheckin);
  
  
      await Promise.all(batchPromises);
  
      // อัปเดต state checkins
      setCheckins([...checkins, { id: newCheckinRef.id, ...newCheckin }]);
      setCode("");
      setDate("");
      setStatus(0);
    } catch (error) {
      console.error("Error adding checkin: ", error);
    }
  };

  const handleNavigateToCheckin = (cno) => {
    console.log(`Navigating to CheckinSession with cno: ${cno}`);
    navigate(`/checkin/${cid}/${cno}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
      {classroom ? (
        <>
          <h2 className="text-2xl font-bold">{classroom.info.name}</h2>
          <p>รหัสวิชา: {classroom.info.code}</p>
          {classroom.info.photo && <img src={classroom.info.photo} alt="classroom" className="mt-2" />}

          {/* QR Code */}
          <h3 className="text-lg font-semibold mt-6">QR Code ลงทะเบียน</h3>
          <canvas ref={qrRef} />

          {/* ตารางแสดงรายชื่อนักเรียน */}
          <h3 className="text-lg font-semibold my-6">รายชื่อนักเรียนที่ลงทะเบียน</h3>
          <table className="min-w-full border-collapse border border-gray-300 mt-2">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">ลำดับ</th>
                <th className="border border-gray-300 px-4 py-2">รหัสนักเรียน</th>
                <th className="border border-gray-300 px-4 py-2">ชื่อ</th>
                <th className="border border-gray-300 px-4 py-2">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.stdid}</td>
                  <td className="border border-gray-300 px-4 py-2">{student.name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {student.status === 1 ? 'ตรวจสอบแล้ว' : 'ยังไม่ตรวจสอบ'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-lg font-semibold my-6">จัดการเช็คชื่อ</h2>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="รหัสเช็คชื่อ"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border p-2 rounded w-1/4"
            />
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded w-1/3"
            />
            <button
              onClick={handleAddCheckin}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              เพิ่มเช็คชื่อ
            </button>
          </div>

          <h3 className="text-lg font-semibold my-6">ประวัติการเช็คชื่อ</h3>
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">ลำดับ</th>
                <th className="border border-gray-300 px-4 py-2">วัน-เวลา</th>
                <th className="border border-gray-300 px-4 py-2">จำนวนคนเข้าเรียน</th>
                <th className="border border-gray-300 px-4 py-2">สถานะ</th>
                <th className="border border-gray-300 px-4 py-2">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {checkins.map((checkin, index) => (
                <tr key={checkin.id}>
                  <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{new Date(checkin.date).toLocaleString("th-TH")}</td>
                  <td className="border border-gray-300 px-4 py-2">{checkin.studentCount}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {checkin.status === 0 ? "ยังไม่เริ่ม" : checkin.status === 1 ? "กำลังเช็คชื่อ" : "เสร็จแล้ว"}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => handleNavigateToCheckin(checkin.id)}>
                      เช็คชื่อ
                    </button>
                  </td>
                </tr>
              ))}
              {/* <tr>
                <td colSpan="4" className="border border-gray-400 px-4 py-2"></td>
                <td className="border border-gray-400 px-4 py-2">
                  <button
                    onClick={addCheckin}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    เพิ่ม
                  </button>
                </td>
              </tr> */}
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-center mt-10 text-gray-500">กำลังโหลดข้อมูล...</p>
      )}
      </Card>
    </div>
  );
};

export default ClassroomManage;
