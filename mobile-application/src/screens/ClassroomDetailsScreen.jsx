import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ClassroomDetailsScreen = ({ route, navigation }) => {
  const { cid, cno } = route.params;
  const [classInfo, setClassInfo] = useState(null);
  const [remark, setRemark] = useState("");
  const [questionShow, setQuestionShow] = useState(false);
  const [answer, setAnswer] = useState("");
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchClassInfo = async () => {
      const classRef = doc(db, "classroom", cid);
      const classSnap = await getDoc(classRef);
      if (classSnap.exists() && classSnap.data().info) {
        setClassInfo(classSnap.data().info);
      }
    };

    const checkinRef = doc(db, "classroom", cid, "checkin", cno);
    
    // ตรวจสอบ question_show แบบ Realtime
    const unsubscribe = onSnapshot(checkinRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data().question_show) {
        setQuestionShow(snapshot.data().question_show);
      } else {
        setQuestionShow(false);
      }
    });

    fetchClassInfo();

    // บันทึก `cid` และ `cno` ลงใน LocalStorage
    AsyncStorage.setItem("lastCheckIn", JSON.stringify({ cid, cno }));

    return () => unsubscribe(); // Cleanup Listener
  }, [cid, cno]);

  // บันทึกหมายเหตุของนักเรียน
  const handleSaveRemark = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Please log in first");
      return;
    }
    try {
      await setDoc(doc(db, "classroom", cid, "checkin", cno, "students", user.uid), {
        remark: remark,
      }, { merge: true });
      Alert.alert("Success", "Remark saved");
    } catch (error) {
      console.error("Error saving remark:", error);
      Alert.alert("Error", "Failed to save remark");
    }
  };

  // ส่งคำตอบของนักเรียน
  const handleSubmitAnswer = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, "classroom", cid, "checkin", cno, "answers", "1", "students", user.uid), {
        text: answer,
        time: new Date().toISOString(),
      });
      Alert.alert("Success", "Answer submitted");
    } catch (error) {
      console.error("Submit answer error", error);
      Alert.alert("Error", "Failed to submit answer");
    }
  };

  // ฟังก์ชันในการส่งนักเรียนไปยังหน้า AnswerQuestionScreen
  const handleGoToAnswerQuestionScreen = () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Please log in first");
      return;
    }

    // ส่ง cid, cno, และ stdid (uid) ไปยังหน้า AnswerQuestionScreen
    navigation.navigate("AnswerQuestion", {
      cid: cid,
      cno: cno,
      stdid: user.uid
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Class Details</Text>
      <Text>Class ID: {cid}</Text>
      <Text>Check-in No: {cno}</Text>

      {classInfo ? (
        <>
          <Text>Subject Code: {classInfo.code}</Text>
          <Text>Subject Name: {classInfo.name}</Text>
          <Text>Room: {classInfo.room}</Text>
        </>
      ) : (
        <Text>Loading class info...</Text>
      )}

      {/* ช่องกรอกหมายเหตุ */}
      <TextInput
        placeholder="Enter Remark"
        value={remark}
        onChangeText={setRemark}
        style={styles.input}
      />
      <Button title="Save Remark" onPress={handleSaveRemark} />

      {/* ปุ่มที่พานักเรียนไปยังหน้าจอ AnswerQuestionScreen ถ้า question_show เป็น true */}
      
        <Button
          title="Go to Answer Questions"
          onPress={handleGoToAnswerQuestionScreen}
        />

      {/* ปุ่มกลับไปหน้าหลัก */}
      <Button title="Go to Home" onPress={() => navigation.navigate("Home")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, width: "80%", padding: 10, margin: 5 },
});

export default ClassroomDetailsScreen;