import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Alert  } from "react-native";
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
    <ScrollView contentContainerStyle={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }} // กำหนดให้รองรับ QR Code
      />

      {scanned && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      )}

      {classCode ? (
        <>
          <Text style={styles.classCodeText}>Class CID: {classCode}</Text>

          <TextInput
            placeholder="Enter Student ID"
            value={studentID}
            onChangeText={setStudentID}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Enter Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.instructionText}>Scan a QR Code to register</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,  // ทำให้ ScrollView ขยายเต็มที่
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  camera: {
    width: "100%",
    height: 400,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 12,
    margin: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  classCodeText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  scanAgainButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 5,
    width: "80%",
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ScanQRCode;
