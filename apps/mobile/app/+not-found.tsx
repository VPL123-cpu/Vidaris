import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function NotFoundScreen() {
  return (
    <View style={s.container}>
      <Text style={s.text}>Page introuvable</Text>
      <Link href="/">
        <Text style={s.link}>Retour à l'accueil</Text>
      </Link>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1020", alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontSize: 18, marginBottom: 16 },
  link: { color: "#4a9eff", fontSize: 15 },
});
