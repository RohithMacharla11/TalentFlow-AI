// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "talentflow-ai-18zyk",
  "appId": "1:140126170258:web:12daca9668778e0049ca4b",
  "storageBucket": "talentflow-ai-18zyk.firebasestorage.app",
  "apiKey": "AIzaSyBspNmMn_dhZcu7c3C2y0RIc9PRl6v2XXk",
  "authDomain": "talentflow-ai-18zyk.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "140126170258"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

export { db };
