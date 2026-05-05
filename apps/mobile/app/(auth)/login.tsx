import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { signIn } from "../../src/lib/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      Alert.alert("Erreur", e instanceof Error ? e.message : "Connexion échouée");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.inner}>
        <Text style={s.logo}>Vidaris</Text>
        <Text style={s.subtitle}>Suivi d'études prépa</Text>

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

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Se connecter</Text>}
        </TouchableOpacity>

        <Link href="/(auth)/signup" style={s.link}>
          <Text style={s.link}>Pas encore de compte ? S'inscrire</Text>
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
