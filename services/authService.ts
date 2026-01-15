import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../config/firebase";

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};
