// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6TZt5-9BpoYA31Qv1R7uXq8qwr5pIdq8",
  authDomain: "web-and-mobile-app-629ee.firebaseapp.com",
  projectId: "web-and-mobile-app-629ee",
  storageBucket: "web-and-mobile-app-629ee.firebasestorage.app",
  messagingSenderId: "696041821628",
  appId: "1:696041821628:web:4bc24c13691924baeb07b9",
  measurementId: "G-9XBBRVXV67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();

// ฟังก์ชัน Login
export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        });
      }
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };
  
  // ฟังก์ชัน Logout
  export const logout = async () => {
    await signOut(auth);
  };
  
  // ฟังก์ชันอัปเดตข้อมูลผู้ใช้
  export const updateUserProfile = async (uid, newData) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, newData);
  };
  
export default app;