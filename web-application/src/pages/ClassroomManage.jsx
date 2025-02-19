import { useEffect, useState, useRef } from "react";
import { useAuth } from "../AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";

//ยังไม่มีการแสดงรายชื่อนักศึกษาที่ลงทะเบียนวิชา
const ClassroomManage = () => {
  const { user } = useAuth();
  const { cid } = useParams();
  const db = getFirestore();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const qrRef = useRef(null); // ใช้ ref สำหรับ QRCode div

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
      setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    
    const fetchCheckins = async () => {
      const checkinRef = collection(db, `classroom/${cid}/checkin`);
      const checkinSnap = await getDocs(checkinRef);
      setCheckins(checkinSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchClassroom();
    fetchStudents();
    fetchCheckins();
  }, [cid, db]);

  // Generate QR Code when classroom is available
  useEffect(() => {
    if (classroom && qrRef.current) {
      qrRef.current.innerHTML = ""; // ล้าง QR ก่อนสร้างใหม่
      new window.QRCode(qrRef.current, {
        text: `https://your-app.com/register/${cid}`,
        width: 150,
        height: 150,
      });
    }
  }, [classroom, cid]);

  const addCheckin = async () => {
    const cno = checkins.length + 1;
    const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
    await setDoc(checkinRef, {
      code: Math.random().toString(36).substring(7).toUpperCase(),
      date: new Date().toISOString(),
      status: 0,
    });

    for (const student of students) {
      const scoreRef = doc(db, `classroom/${cid}/checkin/${cno}/scores/${student.id}`);
      await setDoc(scoreRef, {
        uid: student.id,
        name: student.name,
        remark: "",
        score: 0,
        status: 0,
      });
    }
    alert("สร้างการเช็คชื่อสำเร็จ!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {classroom ? (
        <>
          <h2 className="text-2xl font-bold">{classroom.info.name}</h2>
          <p>รหัสวิชา: {classroom.info.code}</p>
          {classroom.info.photo && <img src={classroom.info.photo} alt="classroom" className="mt-2" />}

          {/* QR Code */}
          <h3 className="text-lg font-semibold mt-6">QR Code ลงทะเบียน</h3>
          <div ref={qrRef} className="mt-2"></div>

          {/* รายชื่อนักเรียน */}
          <h3 className="text-lg font-semibold mt-6">รายชื่อนักเรียน</h3>
          <table className="w-full border-collapse border border-gray-300 mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">ลำดับ</th>
                <th className="border p-2">รหัส</th>
                <th className="border p-2">ชื่อ</th>
                <th className="border p-2">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className="border">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{student.stdid}</td>
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">{student.status === 1 ? "ตรวจสอบแล้ว" : "ยังไม่ตรวจสอบ"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ปุ่มเพิ่มการเช็คชื่อ */}
          <button
            onClick={addCheckin}
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
          >
            + เพิ่มการเช็คชื่อ
          </button>
        </>
      ) : (
        <p className="text-center mt-10 text-gray-500">กำลังโหลดข้อมูล...</p>
      )}
    </div>
  );
};

export default ClassroomManage;