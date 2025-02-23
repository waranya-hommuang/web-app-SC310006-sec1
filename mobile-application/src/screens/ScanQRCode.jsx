import React, { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View, TextInput, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { collection, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const ScanQRCode = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [studentID, setStudentID] = useState("");
  const [name, setName] = useState("");

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
  
    // ตัดค่า cid ออกจาก URL
    const extractedClassCode = data.split("/").pop(); 
  
    console.log("Scanned Data:", data);
    console.log("Extracted Class Code:", extractedClassCode);
  
    setClassCode(extractedClassCode); // เก็บเฉพาะค่า cid
  };

  const handleRegister = async () => {
    const user = auth.currentUser;
  
    if (!user) {
      Alert.alert("Error", "ผู้ใช้ยังไม่ได้ล็อกอิน");
      return;
    }
  
    if (!studentID || !name || !classCode) {
      Alert.alert("Error", "กรุณากรอกรหัสนักศึกษา ชื่อ และรหัสวิชาให้ครบ");
      return;
    }
  
    try {
      console.log("User ID:", user.uid);
      console.log("Class Code:", classCode);
  
      // ตรวจสอบว่า classCode และ user.uid มีค่าที่ถูกต้อง
      if (!user.uid || !classCode.trim()) {
        throw new Error("Invalid classCode or user ID");
      }
  
      const classroomRef = doc(db, "classroom", classCode);
      const studentRef = doc(collection(classroomRef, "students"), user.uid);
      const userClassroomRef = doc(collection(doc(db, "users", user.uid), "classroom"), classCode);
  
      console.log("Saving to Firestore:", studentRef.path, userClassroomRef.path);
  
      await setDoc(studentRef, {
        stdid: studentID,
        name: name,
        status: 1, // สถานะยังไม่ตรวจสอบ
      });
  
      await setDoc(userClassroomRef, {
        status: 2, // นักเรียน
      });
  
      Alert.alert("Success", "ลงทะเบียนสำเร็จ!");
    } catch (error) {
      console.error("Firestore Error:", error);
      Alert.alert("Error", "ลงทะเบียนไม่สำเร็จ: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }} // กำหนดให้รองรับ QR Code
      />
      {scanned && (
        <Button title="Scan Again" onPress={() => setScanned(false)} />
      )}

      {classCode ? (
        <>
          <Text>Class CID: {classCode}</Text>
          <TextInput
            placeholder="Enter Student ID"
            value={studentID}
            onChangeText={setStudentID}
            style={styles.input}
          />
          <TextInput
            placeholder="Enter Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <Button title="Register" onPress={handleRegister} />
        </>
      ) : (
        <Text>Scan a QR Code to register</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: { width: "100%", height: 400 },
  input: { borderWidth: 1, width: "80%", padding: 10, margin: 5 },
  message: { fontSize: 18, textAlign: "center", marginBottom: 20 },
});

export default ScanQRCode;
