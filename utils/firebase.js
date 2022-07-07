// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBKIVFBS8HQWfTFiNnQk9TL8_EYC8l8Vms",
  authDomain: "caffe-cacf0.firebaseapp.com",
  projectId: "caffe-cacf0",
  storageBucket: "caffe-cacf0.appspot.com",
  messagingSenderId: "936238373670",
  appId: "1:936238373670:web:1da65e06addbff84753fe7",
  measurementId: "G-FX77QBNNSE"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export default app