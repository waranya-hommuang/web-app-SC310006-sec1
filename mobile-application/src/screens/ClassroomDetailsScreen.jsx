import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet, Alert } from "react-native";
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

      {/* แสดงข้อมูลพื้นฐาน */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Class ID: <Text style={styles.infoValue}>{cid}</Text></Text>
        <Text style={styles.infoText}>Check-in No: <Text style={styles.infoValue}>{cno}</Text></Text>

        {classInfo ? (
          <>
            <Text style={styles.infoText}>Subject Code: <Text style={styles.infoValue}>{classInfo.code}</Text></Text>
            <Text style={styles.infoText}>Subject Name: <Text style={styles.infoValue}>{classInfo.name}</Text></Text>
            <Text style={styles.infoText}>Room: <Text style={styles.infoValue}>{classInfo.room}</Text></Text>
          </>
        ) : (
          <Text style={styles.infoText}>Loading class info...</Text>
        )}
      </View>

      {/* ช่องกรอกหมายเหตุ */}
      <TextInput
        placeholder="Enter Remark"
        value={remark}
        onChangeText={setRemark}
        style={styles.input}
      />

      {/* ปุ่ม Save Remark */}
      <TouchableOpacity style={styles.button} onPress={handleSaveRemark}>
        <Text style={styles.buttonText}>Save Remark</Text>
      </TouchableOpacity>

      {/* ปุ่มไปยังหน้าถัดไป */}
      <TouchableOpacity style={styles.button} onPress={handleGoToAnswerQuestionScreen}>
        <Text style={styles.buttonText}>Go to Answer Questions</Text>
      </TouchableOpacity>

      {/* ปุ่มกลับไปหน้าหลัก */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start", // Align items to the top
    backgroundColor: "#f9f9f9", // เพิ่มสีพื้นหลัง
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  infoContainer: {
    width: "100%",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#555",
  },
  infoValue: {
    fontWeight: "bold",
    color: "#2b8a3e",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ClassroomDetailsScreen;