import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, getDoc, doc } from 'firebase/firestore';
import { getDatabase, ref, set, update, onValue } from "firebase/database";
import { firebaseConfig } from "./firebaseConfig";
// Initialize Firebase only if not already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig); // Initialize only if no Firebase app exists
} else {
  app = getApp(); // Use the already initialized Firebase app
}
const auth = getAuth(app);
const db = getFirestore(app);
export const rtdb = getDatabase(app);

console.log("Firebase app initialized:", app);
console.log("Database reference:", db);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, setDoc, getDoc, doc,ref, set, update, onValue };