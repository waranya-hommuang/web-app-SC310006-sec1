import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, getDoc, doc } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyD6TZt5-9BpoYA31Qv1R7uXq8qwr5pIdq8",
    authDomain: "web-and-mobile-app-629ee.firebaseapp.com",
    projectId: "web-and-mobile-app-629ee",
    storageBucket: "web-and-mobile-app-629ee.firebasestorage.app",
    messagingSenderId: "696041821628",
    appId: "1:696041821628:web:4bc24c13691924baeb07b9",
    measurementId: "G-9XBBRVXV67"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, setDoc, getDoc, doc };