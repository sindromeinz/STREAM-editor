// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB7uYdTIQUEcID5of-yxnhWzRJaboec_Ho",
  authDomain: "projegt-stream.firebaseapp.com",
  databaseURL: "https://projegt-stream-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "projegt-stream",
  storageBucket: "projegt-stream.appspot.com",
  messagingSenderId: "345589851312",
  appId: "1:345589851312:web:561a5861bb869665598775",
  measurementId: "G-WQ7DQHQ84J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, database, ref, set, get, onValue };