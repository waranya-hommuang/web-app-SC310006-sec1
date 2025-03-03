import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { getDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
// import * as ImagePicker from "expo-image-picker"; // สำหรับการเลือกภาพ

const HomeScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserInfo(docSnap.data());
        }
      });
    }
  }, []);


  return (
    <View style={styles.container}>
      {userInfo ? (
        <View style={styles.innerContainer}>
          <Text style={styles.emailText}>Email: {userInfo.email}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ScanQRCode")}
          >
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ClassroomsScreen")}
          >
            <Text style={styles.buttonText}>My Classroom</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  innerContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  emailText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 18,
    color: "#888",
  },
});

export default HomeScreen;
