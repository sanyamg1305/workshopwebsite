import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGgauANtmh1mYr6HjfylKPW_fynS4zPtQ",
  authDomain: "tjworkshop-d4b02.firebaseapp.com",
  projectId: "tjworkshop-d4b02",
  storageBucket: "tjworkshop-d4b02.firebasestorage.app",
  messagingSenderId: "1044750018713",
  appId: "1:1044750018713:web:940ec39bcfb4a9695b7008"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
