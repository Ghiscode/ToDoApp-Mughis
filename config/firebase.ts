import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA5XNOH5lC3QzITqNEEsUWwd29FzP29JLg",
  authDomain: "todoapp-mughis.firebaseapp.com",
  projectId: "todoapp-mughis",
  storageBucket: "todoapp-mughis.firebasestorage.app",
  messagingSenderId: "882553086106",
  appId: "1:882553086106:web:3a47238d6791bcee1aff23"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);