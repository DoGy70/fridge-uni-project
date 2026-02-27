import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "http://172.20.10.4:8080";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/mobile/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await SecureStore.setItemAsync("access_token", data.access_token);
        await SecureStore.setItemAsync("refresh_token", data.refresh_token)
        onLogin();
      } else {
        setError(data.message || "Login failed");
      }
    } catch (e) {
      const error = e as Error
      console.log(error)
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">

          {/* Logo */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-[#ff7828] items-center justify-center mb-5 rounded-2xl shadow-md">
              <Text className="text-white text-2xl font-bold">F</Text>
            </View>
            <Text className="text-3xl font-bold text-black tracking-tight">Frigidwatch</Text>
            <Text className="text-sm text-black/40 mt-1">Monitoring Control System</Text>
          </View>

          {/* Form */}
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
            <View className="mb-4">
              <Text className="text-xs text-black/50 font-medium mb-2 tracking-wide">Email</Text>
              <TextInput
                className="bg-black/5 rounded-xl px-4 py-3 text-black text-sm"
                placeholder="operator@domain.com"
                placeholderTextColor="rgba(0,0,0,0.2)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs text-black/50 font-medium mb-2 tracking-wide">Password</Text>
              <TextInput
                className="bg-black/5 rounded-xl px-4 py-3 text-black text-sm"
                placeholder="••••••••••••"
                placeholderTextColor="rgba(0,0,0,0.2)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-500 text-xs">{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              className="bg-[#ff7828] rounded-xl py-3.5 items-center mt-2"
              onPress={handleLogin}
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-sm">Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text className="text-center text-black/20 text-xs mt-6">Secure · Encrypted</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}