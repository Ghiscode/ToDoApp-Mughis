import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import noteService, { Note } from "../services/noteService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // Import Icon

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);

  // State untuk Mode Edit
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadNotes(currentUser.uid);
      } else {
        router.replace("/Auth-screen/Login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadNotes = async (userId: string) => {
    try {
      const data = await noteService.fetchNotes(userId);
      setNotes(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!inputText.trim()) {
      Alert.alert("Eits!", "Tugas tidak boleh kosong ya.");
      return;
    }

    try {
      if (editId) {
        // --- LOGIKA UPDATE (NOMOR 2) ---
        await noteService.updateNote(editId, { text: inputText });
        setEditId(null); // Keluar mode edit
        Alert.alert("Sukses", "Tugas berhasil diupdate!");
      } else {
        // --- LOGIKA CREATE ---
        await noteService.addNote(inputText, user.uid);
      }

      setInputText(""); // Kosongkan input
      loadNotes(user.uid); // Refresh data
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Konfirmasi", "Yakin mau hapus tugas ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await noteService.deleteNote(id);
          loadNotes(user.uid);
        },
      },
    ]);
  };

  // --- LOGIKA STATUS SELESAI (NOMOR 1) ---
  const handleToggleStatus = async (item: Note) => {
    try {
      const newStatus = !item.isComplete;
      // Update data lokal dulu biar responsif (optimistic update)
      const updatedNotes = notes.map((n) =>
        n.id === item.id ? { ...n, isComplete: newStatus } : n
      );
      setNotes(updatedNotes);

      // Update ke Firebase
      await noteService.updateNote(item.id, { isComplete: newStatus });
    } catch (error: any) {
      Alert.alert("Gagal update status", error.message);
      loadNotes(user.uid); // Rollback kalau gagal
    }
  };

  const handleEditMode = (item: Note) => {
    setEditId(item.id);
    setInputText(item.text); // Pindahkan teks ke kotak input atas
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/Auth-screen/Login");
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daftar Tugasku</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={
            editId ? "Update tugas..." : "Mau ngerjain apa hari ini?"
          }
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity
          style={[styles.addButton, editId ? styles.updateButton : null]}
          onPress={handleAddOrUpdate}
        >
          {/* Ganti Icon Plus jadi Save kalau lagi Edit */}
          <Ionicons name={editId ? "save" : "add"} size={24} color="white" />
        </TouchableOpacity>

        {/* Tombol X kecil untuk batal edit */}
        {editId && (
          <TouchableOpacity
            onPress={() => {
              setEditId(null);
              setInputText("");
            }}
            style={styles.cancelButton}
          >
            <Ionicons name="close" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, item.isComplete && styles.cardComplete]}>
            {/* NOMOR 1: CHECKBOX */}
            <TouchableOpacity
              onPress={() => handleToggleStatus(item)}
              style={styles.checkbox}
            >
              <Ionicons
                name={item.isComplete ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={item.isComplete ? "green" : "#888"}
              />
            </TouchableOpacity>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.todoText,
                  item.isComplete && styles.textComplete,
                ]}
              >
                {item.text}
              </Text>
              <Text style={styles.dateText}>
                {item.createdAt?.seconds
                  ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                  : "Baru saja"}
              </Text>
            </View>

            {/* NOMOR 2: TOMBOL EDIT */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleEditMode(item)}
                style={styles.iconButton}
              >
                <MaterialIcons name="edit" size={22} color="orange" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.iconButton}
              >
                <MaterialIcons name="delete" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#f8f9fa",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  logoutText: { color: "red", fontWeight: "bold" },

  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#6200EE",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  updateButton: { backgroundColor: "orange" }, // Warna beda pas edit
  cancelButton: { marginLeft: 10 },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardComplete: { backgroundColor: "#e8f5e9" }, // Warna hijau muda kalau selesai

  checkbox: { marginRight: 10 },
  textContainer: { flex: 1 },
  todoText: { fontSize: 16, color: "#333" },
  textComplete: { textDecorationLine: "line-through", color: "#888" }, // Coret teks
  dateText: { fontSize: 12, color: "#aaa", marginTop: 4 },

  actionButtons: { flexDirection: "row" },
  iconButton: { marginLeft: 10, padding: 5 },
});
