import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getDatabase, ref, set, onValue, get } from 'firebase/database';

const AnswerQuestionScreen = ({ route, navigation }) => {
  const { cid, cno, stdid } = route.params; // รับ cid, cno, stdid จากหน้าที่แล้ว
  const [questionShow, setQuestionShow] = useState(null); // สถานะการแสดงคำถาม
  const [questionText, setQuestionText] = useState(''); // คำถามที่ได้จาก Firebase
  const [answer, setAnswer] = useState(''); // คำตอบของนักเรียน

  useEffect(() => {
    const db = getDatabase(); // รับการตั้งค่าฐานข้อมูล Firebase
    console.log('Firebase DB Initialized'); // ตรวจสอบว่า Firebase เชื่อมต่อแล้ว

    const questionRef = ref(db, `/classroom/${cid}/checkin/${cno}/question_show`);
    const questionTextRef = ref(db, `/classroom/${cid}/checkin/${cno}/question_text`);

    // ฟังการเปลี่ยนแปลงของ `question_show`
    onValue(questionRef, (snapshot) => {
      const show = snapshot.val();
      console.log('question_show value:', show); // ตรวจสอบค่าที่ได้จาก Firebase

      // กำหนดค่าของ `questionShow` ตามที่ได้จาก Firebase
      setQuestionShow(show);

      // ถ้า show เป็น true ก็โหลดคำถามจากฐานข้อมูล
      if (show) {
        get(questionTextRef).then((snapshot) => {
          const question = snapshot.val();
          console.log('Loaded question text:', question); // ตรวจสอบข้อมูลคำถาม
          setQuestionText(question || '');  // เพิ่มการจัดการค่า null หรือ undefined
        }).catch(error => {
          console.log('Error loading question text:', error); // ตรวจสอบข้อผิดพลาดการโหลดข้อมูล
        });
      }
    });

    // Cleanup listener
    return () => {
      console.log('Cleanup listener');
      // ปิดการฟังเมื่อหน้าจอไม่แสดง
    };
  }, [cid, cno]);

  const handleSubmitAnswer = () => {
    if (answer.trim() === '') return;

    const db = getDatabase();
    const questionNoRef = ref(db, `/classroom/${cid}/checkin/${cno}/question_no`);

    // เพิ่มคำตอบลงฐานข้อมูล
    get(questionNoRef).then((snapshot) => {
      const questionNo = snapshot.val();
      const answerRef = ref(db, `/classroom/${cid}/checkin/${cno}/answers/${questionNo}/students/${stdid}`);

      set(answerRef, {
        text: answer,
        time: Date.now(),  // ใช้ Date.now() แทน firebase.database.ServerValue.TIMESTAMP
      }).then(() => {
        alert('คำตอบของคุณถูกบันทึกแล้ว');
        setAnswer(''); // ล้างคำตอบ
      });
    });
  };

  // หาก questionShow ยังไม่ได้รับค่าหรือเป็น false ให้แสดงข้อความว่าไม่สามารถแสดงคำถาม
  if (questionShow === null) {
    return <Text>กำลังโหลด...</Text>; // แสดงข้อความระหว่างที่กำลังโหลดข้อมูลจาก Firebase
  }

  if (questionShow === false) {
    return <Text>คำถามไม่ได้แสดงในขณะนี้</Text>; // ถ้า question_show เป็น false
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Answer the Question</Text>

      {/* ตรวจสอบว่า questionShow เป็น true หรือไม่ */}
      {questionShow ? (
        <>
          <Text style={styles.questionText}>{questionText}</Text>

          {/* ช่องกรอกคำตอบ */}
          <TextInput
            placeholder="Enter your answer here..."
            value={answer}
            onChangeText={setAnswer}
            style={styles.input}
            multiline
            numberOfLines={4}
          />

          {/* ปุ่มส่งคำตอบ */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAnswer}>
            <Text style={styles.buttonText}>Submit Answer</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noQuestionText}>No question available for this check-in.</Text>
      )}

      {/* ปุ่มกลับไปหน้าหลัก */}
      <TouchableOpacity style={styles.goHomeButton} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    width: '100%',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
  },
  goHomeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  noQuestionText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
});

export default AnswerQuestionScreen;
