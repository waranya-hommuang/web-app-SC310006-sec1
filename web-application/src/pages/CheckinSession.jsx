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

    useEffect(() => {
        fetchClassroom();
        fetchStudents();
        fetchScores();
    }, [cid, cno]);

    useEffect(() => {
        if (classroom && qrRef.current) {
            qrRef.current.innerHTML = "";
            new window.QRCode(qrRef.current, {
                text: `https://your-app.com/checkin/${cno}`,
                width: 150,
                height: 150,
            });
        }
    }, [classroom, cno]);

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
        const studentsRef = collection(db, `classroom/${cid}/checkin/${cno}/students`);
        const scoresRef = collection(db, `classroom/${cid}/checkin/${cno}/scores`);
        const studentSnapshot = await getDocs(studentsRef);
        studentSnapshot.forEach(async (doc) => {
            await setDoc(doc.ref, { status: 1 }, { merge: true });
            await setDoc(doc(db, scoresRef.path, doc.id), { ...doc.data(), status: 1 });
        });
        fetchScores();
    };

    useEffect(() => {
        const fetchCode = async () => {
          if (!cid || !cno) return;
    
          try {
            const checkinRef = doc(db, `classroom/${cid}/checkin/${cno}`);
            const checkinSnap = await getDoc(checkinRef);
    
            if (checkinSnap.exists()) {
              setCode(checkinSnap.data().code);
            } else {
              setCode("ไม่มีข้อมูล");
            }
          } catch (error) {
            console.error("Error fetching code:", error);
            setCode("เกิดข้อผิดพลาด");
          }
        };
    
        fetchCode();
      }, [cid, cno]);

    const handleScoreChange = (id, field, value) => {
        setScores(scores.map(score => score.id === id ? { ...score, [field]: value } : score));
      };


    return (
        <div className="p-6 max-w-4xl mx-auto">
            {classroom && (
                <>
                    <h2 className="text-2xl font-bold">{classroom.info.name}</h2>
                    <p>รหัสวิชา: {classroom.info.code}</p>
                    {classroom.info.photo && <img src={classroom.info.photo} alt="classroom" className="mt-2" />}

                    <h3 className="text-lg font-semibold mt-6">QR Code เช็คชื่อ</h3>
                    <div ref={qrRef} className="mt-2"></div>

                    <h3 className="text-lg font-semibold mt-6">รหัส CNO: {cno}</h3>
                    <h3 className="text-lg font-semibold mt-6 mb-6">Code: {code !== null ? code : "กำลังโหลด..."}</h3>
                    <div>
                        <button className="bg-red-500 text-white mx-2 px-3 py-1 rounded">ออก</button>
                        <button className="bg-green-500 text-white mx-2 px-3 py-1 rounded">เปิดเช็คชื่อ</button>
                        <button className="bg-yellow-500 text-white mx-2 px-3 py-1 rounded">ปิดเช็คชื่อ</button>
                        <button className="bg-blue-500 text-white mx-2 px-3 py-1 rounded"
                        onClick={() => navigate("/question-answer")}>ถาม-ตอบ</button>
                    </div>

                    <h3 className="text-lg font-semibold mt-6">รายชื่อนักเรียน</h3>
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th>ลำดับ</th><th>รหัส</th><th>ชื่อ</th><th>หมายเหตุ</th><th>วันเวลา</th><th>ลบ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.id}>
                                    <td>{index + 1}</td>
                                    <td>{student.stdid}</td>
                                    <td>{student.name}</td>
                                    <td>{student.remark}</td>
                                    <td>{student.date}</td>
                                    <td><button onClick={() => deleteDoc(doc(db, studentsRef.path, student.id))}>ลบ</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={saveCheckin} className="bg-green-500 text-white mt-4 px-3 py-1 rounded">บันทึกการเช็คชื่อ</button>

                    <h3 className="text-lg font-semibold mt-6">คะแนนการเข้าเรียน</h3>
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th>ลำดับ</th><th>รหัส</th><th>ชื่อ</th><th>หมายเหตุ</th><th>วันเวลา</th><th>คะแนน</th><th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((score, index) => (
                                <tr key={score.id}>
                                    <td>{index + 1}</td>
                                    <td>{score.stdid}</td>
                                    <td>{score.name}</td>
                                    <td><input type="text" value={score.remark} onChange={(e) => handleScoreChange(score.id, "remark", e.target.value)} /></td>
                                    <td>{score.date}</td>
                                    <td><input type="number" value={score.score} onChange={(e) => handleScoreChange(score.id, "score", e.target.value)} /></td>
                                    <td><input type="text" value={score.status} onChange={(e) => handleScoreChange(score.id, "status", e.target.value)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="bg-green-500 text-white mt-4 px-3 py-1 rounded">บันทึกข้อมูล</button>
                </>
            )}
        </div>
    );
};

export default CheckinSession;
