// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC58Xg0LWO82PgA1fKh3eMBXTkyghSAM4Q",
  authDomain: "qr-questions-hedy.firebaseapp.com",
  projectId: "qr-questions-hedy",
  storageBucket: "qr-questions-hedy.firebasestorage.app",
  messagingSenderId: "300575828112",
  appId: "1:300575828112:web:9e6adc0bdd06e2cdaa9015",
  measurementId: "G-SHVKZQTTJD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);