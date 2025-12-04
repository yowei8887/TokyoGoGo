import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 使用你提供的 Config 設定
const firebaseConfig = {
  apiKey: "AIzaSyB7rI2VYLeuZSQueOr7-dqJOJEEAoNWH6M",
  authDomain: "py2025tokyogogo.firebaseapp.com",
  projectId: "py2025tokyogogo",
  storageBucket: "py2025tokyogogo.firebasestorage.app",
  messagingSenderId: "771950676966",
  appId: "1:771950676966:web:e09570a59eb5c535e52427",
  measurementId: "G-ZJM9J8QGM6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };