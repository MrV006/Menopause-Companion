
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
  onSnapshot,
  arrayUnion,
  arrayRemove,
  where,
  initializeFirestore,
  persistentLocalCache,
  CACHE_SIZE_UNLIMITED
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

// راه‌اندازی دیتابیس به صورت مستقیم (بدون پروکسی)
// استفاده از کش آفلاین برای تجربه کاربری بهتر هنگام قطعی اینترنت
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: undefined, 
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

// راه‌اندازی آنالیتیکس
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.log("Analytics disabled:", e);
}

export const auth = getAuth(app);

export { 
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, deleteDoc, onSnapshot,
  arrayUnion, arrayRemove, where
};
