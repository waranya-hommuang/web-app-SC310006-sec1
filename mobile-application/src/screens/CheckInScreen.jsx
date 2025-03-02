import React, { useState } from "react";
import { View, Text, Button, Alert, StyleSheet, TextInput } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CheckInScreen = ({ route }) => {
    const { cid } = route.params;
    const [cnoInput, setCnoInput] = useState(""); // กรอก cno
    const [code, setCode] = useState(""); // กรอก code
    const auth = getAuth();
    const db = getFirestore();
    const navigation = useNavigation();

    const handleCheckIn = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "Please log in first");
            return;
        }

        if (!cnoInput.trim() || !code.trim()) {
            Alert.alert("Error", "Please enter Check-in No (CNO) and Code.");
            return;
        }

        try {
            console.log(`Searching for document with cno: ${cnoInput} in /classroom/${cid}/checkin`);

            // 🔍 **ค้นหา document ID ของ checkin ที่มี cno ตรงกัน**
            const checkinQuery = query(
                collection(db, "classroom", cid, "checkin"),
                where("cno", "==", Number(cnoInput)) // แปลง cnoInput เป็นตัวเลข
            );
            const checkinSnap = await getDocs(checkinQuery);

            if (checkinSnap.empty) {
                Alert.alert("Error", "Check-in session not found.");
                return;
            }

            // ดึง document ID ของ checkin ที่เจอ
            const checkinDoc = checkinSnap.docs[0];
            const checkinId = checkinDoc.id;
            const checkinData = checkinDoc.data();

            console.log("Fetched check-in data:", checkinData);

            if (!checkinData.code) {
                Alert.alert("Error", "Invalid check-in data.");
                return;
            }

            console.log(`Entered CNO: ${cnoInput}, Entered Code: ${code}, Expected Code: ${checkinData.code}`);

            // ตรวจสอบว่ารหัสเช็คชื่อตรงกันหรือไม่
            if (checkinData.code.trim() === code.trim()) {
                // 🔹 **ดึงข้อมูลนักเรียนจาก /classroom/{cid}/students/{uid}** โดยใช้ user.uid
                const studentRef = doc(db, "classroom", cid, "students", user.uid);
                const studentSnap = await getDoc(studentRef);

                if (!studentSnap.exists()) {
                    Alert.alert("Error", "Student data not found.");
                    return;
                }

                const studentData = studentSnap.data();
                console.log("Fetched student data:", studentData);

                const now = new Date();
                const bangkokTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // บวก 7 ชั่วโมง

                // 🔹 **บันทึกข้อมูลนักเรียนที่เช็คอิน**
                await setDoc(doc(db, "classroom", cid, "checkin", checkinId, "students", user.uid), {
                    stdid: studentData.stdid || user.uid, // ใช้ stdid จาก students หรือ uid ถ้าไม่มี
                    name: studentData.name || user.displayName || "Unknown", // ใช้ name จาก students หรือ displayName ถ้าไม่มี
                    date: bangkokTime.toISOString(), // ใช้เวลาปัจจุบันจากระบบ
                }, { merge: true });

                Alert.alert("Success", "Check-in successful");

                // 📌 **บันทึกข้อมูลล่าสุดใน localStorage**
                await AsyncStorage.setItem("lastCheckIn", JSON.stringify({ cid, cno: checkinId }));

                // 🔄 **นำไปยังหน้าจอเข้าเรียน**
                navigation.navigate("ClassroomDetails", { cid, cno: checkinId });
            } else {
                Alert.alert("Error", "Incorrect Check-in Code.");
            }
        } catch (error) {
            console.error("Check-in error", error);
            Alert.alert("Error", "Failed to check in.");
        }
    };

    return (
        <View style={styles.container}>
            <Text>Class ID: {cid}</Text>

            <TextInput
                placeholder="Enter Check-in No (CNO)"
                value={cnoInput}
                onChangeText={setCnoInput}
                style={styles.input}
                keyboardType="numeric"
            />

            <TextInput
                placeholder="Enter Check-in Code"
                value={code}
                onChangeText={setCode}
                style={styles.input}
            />

            <Button title="Check In" onPress={handleCheckIn} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    input: { borderWidth: 1, width: "80%", padding: 10, margin: 10, borderRadius: 5 },
});

export default CheckInScreen;