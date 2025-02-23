import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, updateDoc, collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { useParams } from "react-router-dom";

const QuestionAnswerScreen = () => {
  const { cid, cno } = useParams();
  const [questionNo, setQuestionNo] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState([]);
  const [questionShow, setQuestionShow] = useState(false);

  // ✅ โหลดสถานะคำถามปัจจุบัน
  useEffect(() => {
    const fetchQuestionStatus = async () => {
      if (!cid || !cno) return;

      const questionRef = doc(db, `classroom/${cid}/checkin/${cno}`);
      const questionSnap = await getDoc(questionRef);

      if (questionSnap.exists()) {
        console.log("คำถามที่โหลดจาก Firestore:", data);
        const data = questionSnap.data();
        setQuestionNo(data.question_no || "");
        setQuestionText(data.question_text || "");
        setQuestionShow(data.question_show || false);
      }
    };

    fetchQuestionStatus();
  }, [cid, cno]);

  // ✅ โหลดคำตอบของคำถามที่กำลังเปิด
  useEffect(() => {
    if (!cid || !cno || !questionNo) return;

    const q = query(
      collection(db, `classroom/${cid}/checkin/${cno}/answers`),
      where("qno", "==", questionNo), // ดึงเฉพาะคำตอบของคำถามที่เปิดอยู่
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnswers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [cid, cno, questionNo]);

  // ✅ เริ่มตั้งคำถาม
  const handleStartQuestion = async () => {
    if (!questionNo || !questionText) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");

    try {
      await setDoc(doc(db, `classroom/${cid}/checkin/${cno}`), {
        question_no: Number(questionNo), // บันทึกเป็นตัวเลข
        question_text: questionText,
        question_show: true
      }, { merge: true });

      console.log("คำถามที่บันทึกลง Firestore:", questionData);
      setQuestionShow(true);
    } catch (error) {
      console.error("Error starting question: ", error);
    }
  };

  // ✅ ปิดคำถาม
  const handleCloseQuestion = async () => {
    try {
      await updateDoc(doc(db, `classroom/${cid}/checkin/${cno}`), {
        question_show: false
      });
      setQuestionShow(false);
    } catch (error) {
      console.error("Error closing question: ", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">ถาม-ตอบ</h2>

      {/* ✅ ฟอร์มตั้งคำถาม */}
      <div className="mb-4 flex gap-2">
        <input 
          type="number" 
          placeholder="ข้อที่" 
          value={questionNo} 
          onChange={(e) => setQuestionNo(e.target.value)}
          className="border p-2 rounded w-1/4"
        />
        <input 
          type="text" 
          placeholder="ข้อความคำถาม" 
          value={questionText} 
          onChange={(e) => setQuestionText(e.target.value)}
          className="border p-2 rounded w-1/2"
        />
        <button 
          onClick={handleStartQuestion} 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          เริ่มถาม
        </button>
        <button 
          onClick={handleCloseQuestion} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          ปิดคำถาม
        </button>
      </div>

      {/* ✅ แสดงรายการคำตอบ */}
      <h3 className="text-lg font-semibold mt-6">รายการคำตอบ</h3>
      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">ข้อที่</th>
            <th className="border border-gray-300 px-4 py-2">คำตอบ</th>
            <th className="border border-gray-300 px-4 py-2">เวลาตอบ</th>
          </tr>
        </thead>
        <tbody>
          {answers.map((answer, index) => (
            <tr key={answer.id}>
              <td className="border border-gray-300 px-4 py-2 text-center">{answer.qno}</td>
              <td className="border border-gray-300 px-4 py-2">{answer.text}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {answer.timestamp?.seconds ? new Date(answer.timestamp.seconds * 1000).toLocaleString("th-TH") : "ไม่ระบุ"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionAnswerScreen;