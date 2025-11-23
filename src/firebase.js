// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOsE04GG63WyH-OwEjLIk3xexWO5Jz6T8",
  authDomain: "wichtelingo.firebaseapp.com",
  projectId: "wichtelingo",
  storageBucket: "wichtelingo.firebasestorage.app",
  messagingSenderId: "140074215720",
  appId: "1:140074215720:web:100b80aa3891b8c51b081d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore Datenbank
export const db = getFirestore(app);