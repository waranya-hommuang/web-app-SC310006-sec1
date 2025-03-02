
import React, { useState, useEffect } from "react";
import { rtdb, ref, set, update, onValue } from '../firebase';
import { useParams } from 'react-router-dom';
import { Card } from "antd";

const QuestionAnswerScreen = () => {
  const { cid, cno } = useParams();
  const [questionNo, setQuestionNo] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [answers, setAnswers] = useState([]);

  // เริ่มต้นคำถาม
  const handleStartQuestion = () => {
    const questionRef = ref(rtdb, `/classroom/${cid}/checkin/${cno}`);
    update(questionRef, {
      question_no: questionNo,
      question_text: questionText,
      question_show: true,
    });
    setShowQuestion(true);
  };

  // ปิดคำถาม
  const handleCloseQuestion = () => {
    const questionRef = ref(rtdb, `/classroom/${cid}/checkin/${cno}`);
    update(questionRef, {
      question_show: false,
    });
    setShowQuestion(false);
  };

  // ดึงข้อมูลคำตอบแบบ Realtime
  useEffect(() => {
    const questionRef = ref(rtdb, `/classroom/${cid}/checkin/${cno}`);
    onValue(questionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setQuestionNo(data.question_no || "");
        setQuestionText(data.question_text || "");
        setShowQuestion(data.question_show || false);
      }
    });

    const answersRef = ref(rtdb, `/classroom/${cid}/checkin/${cno}/answers/${questionNo}`);
    onValue(answersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.students) {
        const answersList = Object.keys(data.students).map((key) => ({
          studentId: key,
          answer: data.students[key].text,
          time: data.students[key].time,
        }));
        setAnswers(answersList);
      } else {
        setAnswers([]);
      }
    });
  }, [cid, cno, questionNo]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
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
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          เริ่มถาม
        </button>
        <button
          onClick={handleCloseQuestion}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          ปิดคำถาม
        </button>
      </div>

      {/* ✅ แสดงรายการคำตอบ */}
      <h3 className="text-lg font-semibold mt-6">รายการคำตอบ</h3>
      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">รหัสนักเรียน</th>
            <th className="border border-gray-300 px-4 py-2">คำตอบ</th>
            <th className="border border-gray-300 px-4 py-2">เวลาตอบ</th>
          </tr>
        </thead>
        <tbody>
          {answers.length > 0 ? (
            answers.map((answer, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {answer.studentId}
                </td>
                <td className="border border-gray-300 px-4 py-2">{answer.answer}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {new Date(answer.time).toLocaleString("th-TH")}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="border border-gray-300 px-4 py-2 text-center">
                ยังไม่มีคำตอบ
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </Card>
    </div>
  );
};

export default QuestionAnswerScreen;
