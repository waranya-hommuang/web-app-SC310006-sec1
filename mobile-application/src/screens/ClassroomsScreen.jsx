import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, FlatList, Image } from "react-native";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const ClassroomsScreen = () => {
  const [classes, setClasses] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchClasses = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("User not logged in.");
        return;
      } else {
        console.log("Logged in user:", user.uid);
      }

      try {
        // ดึงรายการห้องเรียนที่ผู้ใช้ลงทะเบียนจาก /users/{uid}/classroom
        const userClassRef = collection(db, "users", user.uid, "classroom");
        const classSnap = await getDocs(userClassRef);
        console.log("User's classrooms:", classSnap.docs.map(doc => doc.id));
        
        if (classSnap.empty) {
          console.log("No classrooms found for user.");
          return;
        }

        const classList = classSnap.docs.map(doc => doc.id);

        // ดึงข้อมูลห้องเรียนจาก /classroom/{cid} และเข้าถึงข้อมูล info
        const enrichedClasses = await Promise.all(
          classList.map(async (cid) => {
            const classRef = doc(db, "classroom", cid);
            const classSnap = await getDoc(classRef);

            if (classSnap.exists() && classSnap.data().info) {
              return { cid, ...classSnap.data().info }; // ดึงข้อมูลจาก info object
            }
            return null;
          })
        );

        // กรองค่าที่เป็น null ออก
        setClasses(enrichedClasses.filter(cls => cls !== null));
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };

    fetchClasses();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Classes</Text>

      {classes.length === 0 ? (
        <Text>No classes available.</Text>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.cid}
          renderItem={({ item }) => (
            <View style={styles.classItem}>
              <Text style={styles.classTitle}>{item.name || "Unknown Class"}</Text>
              <Text style={styles.classInfo}>Code: {item.code || "No Code"}</Text>
              <Text style={styles.classInfo}>Room: {item.room || "No Room"}</Text>
              {item.photo && <Image source={{ uri: item.photo }} style={styles.classImage} />}
              <Button title="Check In" onPress={() => navigation.navigate("CheckInScreen", { cid: item.cid })} />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  classItem: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ddd",
  },
  classTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  classInfo: {
    fontSize: 14,
    marginVertical: 5,
  },
  classImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 10,
  },
});

export default ClassroomsScreen;
