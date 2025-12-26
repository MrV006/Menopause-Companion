import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";

// کانفیگ اختصاصی پروژه شما
const firebaseConfig = {
  apiKey: "AIzaSyDnW1VLGpEWUsy_QwnzzRhan_UhdHJcrlE",
  authDomain: "menopause-companion-276f1.firebaseapp.com",
  databaseURL: "https://menopause-companion-276f1-default-rtdb.firebaseio.com",
  projectId: "menopause-companion-276f1",
  storageBucket: "menopause-companion-276f1.firebasestorage.app",
  messagingSenderId: "36387994210",
  appId: "1:36387994210:web:23040223f96337ef10ef3b",
  measurementId: "G-EBB7Q82HPF"
};

// راه‌اندازی فایربیس
const app = initializeApp(firebaseConfig);

// راه‌اندازی آنالیتیکس (با مدیریت خطا برای محیط‌های خاص)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.log("Firebase Analytics failed to load:", e);
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// خروجی گرفتن از توابع مورد نیاز برای استفاده در سایر فایل‌ها
export { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, deleteDoc, onSnapshot
};