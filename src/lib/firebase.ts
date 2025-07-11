import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtgaSSPdaw5inAhiiVsmo9qMeoUauO6rY",
  authDomain: "doyzetest.firebaseapp.com",
  databaseURL: "https://doyzetest-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "doyzetest",
  storageBucket: "doyzetest.firebasestorage.app",
  messagingSenderId: "682905004511",
  appId: "1:682905004511:web:c5a738e30c5fc5dc37fc6a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);