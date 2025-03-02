import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, getDoc, query, orderBy, updateDoc, deleteDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

const CheckinSession = () => {
    const { cid, cno } = useParams();
    const navigate = useNavigate();
    const qrRef = useRef(null);
    const [classroom, setClassroom] = useState(null);
    const [students, setStudents] = useState([]);
    const [checkins, setCheckins] = useState([]);
    const [scores, setScores] = useState([]);
    const [status, setStatus] = useState(0);
    const [code, setCode] = useState(null);
    const [cnoData, setCnoData] = useState(null);

    useEffect(() => {
        fetchClassroom();
        fetchStudents();
        fetchScores();
        fetchCheckinData();
    }, [cid, cno]);

    // useEffect(() => {
    //     if (classroom && qrRef.current) {
    //         qrRef.current.innerHTML = "";
    //         new window.QRCode(qrRef.current, {
    //             text: `https://your-app.com/checkin/${cno}`,
    //             width: 150,
    //             height: 150,
    //         });
    //     }
    // }, [classroom, cno]);

    const fetchClassroom = async () => {
        const classRef = doc(db, "classroom", cid);
        const classSnap = await getDoc(classRef);
        if (classSnap.exists()) {
            setClassroom(classSnap.data());
        }
    };

    const fetchStudents = async () => {
        const studentsRef = collection(db, `classroom/${cid}/checkin/${cno}/students`);
        const studentsSnap = await getDocs(studentsRef);
        //console.log("Fetching students from:", `classroom/${cid}/checkin/${cno}/students`);
        setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchScores = async () => {
        const scoresRef = collection(db, `classroom/${cid}/checkin/${cno}/scores`);
        const scoresSnap = await getDocs(scoresRef);
        //console.log("Fetching scores from:", `classroom/${cid}/checkin/${cno}/scores`);
        setScores(scoresSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const saveCheckin = async () => {
        try {
            const studentsRef = collection(db, `classroom/${cid}/checkin/${cno}/students`);
            const scoresRef = collection(db, `classroom/${cid}/checkin/${cno}/scores`);
            const studentSnapshot = await getDocs(studentsRef);
    
            const batchPromises = studentSnapshot.docs.map(async (docSnap) => {
                const studentData = docSnap.data();
                const studentId = docSnap.id;
    
                // อัปเดต status ของ student เป็น 1
                await updateDoc(doc(db, studentsRef.path, studentId), { status: 1 });
    
                // คัดลอกข้อมูลไปยัง scores พร้อมตั้งค่า status = 1
                await setDoc(doc(db, scoresRef.path, studentId), { 
                    ...studentData, 
                    status: 1, 
                    remark: studentData.remark || "", // ตั้งค่า remark เป็นว่าง ถ้าไม่มีค่า
                    score: studentData.score || 0 // ตั้งค่า score เป็น 0 ถ้าไม่มีค่า
                });
            });
    
            await Promise.all(batchPromises); // รอให้ทุกคำสั่งดำเนินการเสร็จ
    
            fetchScores(); // โหลดคะแนนใหม่หลังจากบันทึกข้อมูล
        } catch (error) {
            console.error("Error saving check-in data:", error);
        }
    };
    

    const fetchCheckinData = async () => {
        if (!cid || !cno) return;

        try {
            const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
            const checkinSnap = await getDoc(checkinRef);

            if (checkinSnap.exists()) {
                const data = checkinSnap.data();
                setCnoData(data.cno || "ไม่มีข้อมูล");
                setCode(data.code || "ไม่มีข้อมูล");
            } else {
                setCnoData("ไม่มีข้อมูล");
                setCode("ไม่มีข้อมูล");
            }
        } catch (error) {
            console.error("Error fetching check-in data:", error);
            setCnoData("เกิดข้อผิดพลาด");
            setCode("เกิดข้อผิดพลาด");
        }
    };

    const handleScoreChange = (id, field, value) => {
        setScores(scores.map(score => score.id === id ? { ...score, [field]: value } : score));
    };

    const handleDeleteStudent = async (studentId) => {
        const isConfirmed = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบนักเรียนคนนี้?");
        if (!isConfirmed) return; // ถ้าผู้ใช้กด "ยกเลิก" ให้หยุดการทำงาน
    
        try {
            await deleteDoc(doc(db, `classroom/${cid}/checkin/${cno}/students`, studentId));
            setStudents(students.filter(student => student.id !== studentId)); // อัปเดต state
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    };    

    const saveScores = async () => {
        try {
            const scoresRef = collection(db, `classroom/${cid}/checkin/${cno}/scores`);
            
            const updatePromises = scores.map(async (score) => {
                const scoreDocRef = doc(scoresRef, score.id);
                await updateDoc(scoreDocRef, {
                    remark: score.remark ?? "",
                    score: Number(score.score), // แปลงเป็นตัวเลข
                    status: score.status
                });
            });
    
            await Promise.all(updatePromises); // รอให้อัปเดตทั้งหมดเสร็จสิ้น
            alert("บันทึกคะแนนเรียบร้อยแล้ว!");
        } catch (error) {
            console.error("Error saving scores:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกคะแนน");
        }
    };


    return (
        <div className="p-6 max-w-4xl mx-auto">
            
            {classroom && (
                <>
                    <h2 className="text-2xl font-bold">{classroom.info.name}</h2>
                    <p>รหัสวิชา: {classroom.info.code}</p>
                    {classroom.info.photo && <img src={classroom.info.photo} alt="classroom" className="mt-2" />}

                    {/* <h3 className="text-lg font-semibold mt-6">QR Code เช็คชื่อ</h3>
                    <div ref={qrRef} className="mt-2"></div> */}

                    <h3 className="text-lg font-semibold mt-6">ลำดับ CNO: {cnoData !== null ? cnoData : "กำลังโหลด..."}</h3>
                    <h3 className="text-lg font-semibold mt-6 mb-6">Code: {code !== null ? code : "กำลังโหลด..."}</h3>
                    <div>
                        {/* <button className="bg-red-500 text-white mx-2 px-3 py-1 rounded">ออก</button>
                        <button className="bg-green-500 text-white mx-2 px-3 py-1 rounded">เปิดเช็คชื่อ</button>
                        <button className="bg-yellow-500 text-white mx-2 px-3 py-1 rounded">ปิดเช็คชื่อ</button> */}
                        <button className="bg-blue-500 text-white mx-2 px-3 py-1 rounded"
                           onClick={() => navigate(`/question-answer/${cid}/${cno}`)} >ถาม-ตอบ</button>
                    </div>

                    <h3 className="text-lg font-semibold my-6">รายชื่อนักเรียน</h3>
                    <table className="min-w-full border-collapse border border-gray-300 mt-2">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">ลำดับ</th>
                                <th className="border border-gray-300 px-4 py-2">รหัส</th>
                                <th className="border border-gray-300 px-4 py-2">ชื่อ</th>
                                <th className="border border-gray-300 px-4 py-2">หมายเหตุ</th>
                                <th className="border border-gray-300 px-4 py-2">วันเวลา</th>
                                <th className="border border-gray-300 px-4 py-2">ลบ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.id}>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{student.stdid}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{student.name}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{student.remark}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{student.date}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => handleDeleteStudent(student.id)}
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={saveCheckin} className="bg-green-500 text-white my-6 px-3 py-1 rounded">บันทึกการเช็คชื่อ</button>

                    <h3 className="text-lg font-semibold my-6">คะแนนการเข้าเรียน</h3>
                    <p className="mb-4">สถานะ  0:ไม่มา  1:มาเรียน  2: มาสาย</p>
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">ลำดับ</th>
                                <th className="border border-gray-300 px-4 py-2">รหัส</th>
                                <th className="border border-gray-300 px-4 py-2">ชื่อ</th>
                                <th className="border border-gray-300 px-4 py-2">หมายเหตุ</th>
                                <th className="border border-gray-300 px-4 py-2">วันเวลา</th>
                                <th className="border border-gray-300 px-4 py-2">คะแนน</th>
                                <th className="border border-gray-300 px-4 py-2">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((score, index) => (
                                <tr key={score.id}>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{score.stdid}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{score.name}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center"><input type="text" value={score.remark} onChange={(e) => handleScoreChange(score.id, "remark", e.target.value)} /></td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{score.date}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center"><input type="number" value={score.score} onChange={(e) => handleScoreChange(score.id, "score", e.target.value)} /></td>
                                    <td className="border border-gray-300 px-4 py-2 text-center"><input type="text" value={score.status} onChange={(e) => handleScoreChange(score.id, "status", e.target.value)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={saveScores} className="bg-green-500 text-white my-6 px-3 py-1 rounded">บันทึกข้อมูล</button>
                </>
            )}
           
        </div>
    );
};

export default CheckinSession;
