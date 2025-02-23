import React, { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
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

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      // ทำการอัพโหลดภาพไป Firebase หรือใช้ในแอป
    }
  };

  return (
    <View>
      {userInfo ? (
        <>
          <Text>Name: {userInfo.name}</Text>
          <Text>Email: {userInfo.email}</Text>
          <Button title="Edit Profile" onPress={handlePickImage} />
          <Button title="Add Class" onPress={() => navigation.navigate("AddClass")} />
          <Button title="Scan QR Code" onPress={() => navigation.navigate("ScanQRCode")} />
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

export default HomeScreen;
