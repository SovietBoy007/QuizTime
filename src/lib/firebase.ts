import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIktV6oIyEfxZS04QqSV8KEIbyAmDzWiw",
  authDomain: "quiztime-b875d.firebaseapp.com",
  projectId: "quiztime-b875d",
  storageBucket: "quiztime-b875d.firebasestorage.app",
  messagingSenderId: "1079285872202",
  appId: "1:1079285872202:web:aa7771fdd5131b2a9318b3",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
