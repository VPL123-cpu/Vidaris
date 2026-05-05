import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { signUp } from "../../src/lib/auth";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
      Alert.alert("Compte créé", "Vérifie ton email pour confirmer ton compte.");
      router.replace("/(auth)/login");
    } catch (e: unknown) {
      Alert.alert("Erreur", e instanceof Error ? e.message : "Inscription échouée");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.inner}>
        <Text style={s.logo}>Vidaris</Text>
        <Text style={s.subtitle}>Créer un compte</Text>

        <TextInput
          style={s.input}
          placeholder="Prénom (optionnel)"
          placeholderTextColor="#4a5568"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={s.input}
          placeholder="Email"
          placeholderTextColor="#4a5568"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={s.input}
          placeholder="Mot de passe"
          placeholderTextColor="#4a5568"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={s.btn} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>S'inscrire</Text>}
        </TouchableOpacity>

        <Link href="/(auth)/login" style={s.link}>
          <Text style={s.link}>Déjà un compte ? Se connecter</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1020" },
  inner: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { fontSize: 36, fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#4a9eff", textAlign: "center", marginBottom: 40 },
  input: {
    backgroundColor: "#111827", borderWidth: 1, borderColor: "#1e2d45",
    borderRadius: 12, padding: 16, color: "#fff", fontSize: 15, marginBottom: 12,
  },
  btn: {
    backgroundColor: "#4a9eff", borderRadius: 12, padding: 16,
    alignItems: "center", marginTop: 8,
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  link: { color: "#4a9eff", textAlign: "center", marginTop: 20, fontSize: 14 },
});
