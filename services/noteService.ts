import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Note {
  id: string;
  text: string;
  userId: string;
  createdAt: any;
  isComplete?: boolean; // Tambahan field baru
}

const addNote = async (text: string, userId: string) => {
  if (!text.trim()) return;
  try {
    await addDoc(collection(db, "notes"), {
      text,
      userId, // Pastikan 'd' kecil
      isComplete: false, // Default tugas belum selesai
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

const fetchNotes = async (userId: string) => {
  try {
    const q = query(
      collection(db, "notes"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Note)
    );
  } catch (error) {
    throw error;
  }
};

const deleteNote = async (noteId: string) => {
  try {
    await deleteDoc(doc(db, "notes", noteId));
  } catch (error) {
    throw error;
  }
};

// --- FITUR BARU: UPDATE STATUS & TEKS ---
const updateNote = async (noteId: string, updates: Partial<Note>) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, updates);
  } catch (error) {
    throw error;
  }
};

export default { addNote, fetchNotes, deleteNote, updateNote };
