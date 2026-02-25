import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return isValidEmail(email) && password.trim().length >= 6 && !submitting;
  }, [email, password, submitting]);

  async function onLogin() {
    setError(null);
    setSubmitting(true);

    try {
      // TODO: Replace with your real auth call (Supabase/Firebase/your API).
      await new Promise((r) => setTimeout(r, 650));

      // Example: route to your app home after login
      router.replace("/(tabs)/home"); // change this later if you don’t use tabs
    } catch (e) {
      setError("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 px-6 pt-16">
        <Text className="text-3xl font-bold text-slate-900">Welcome back</Text>
        <Text className="mt-2 text-base text-slate-600">
          Log in to continue.
        </Text>

        <View className="mt-10 gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-700">Email</Text>
            <TextInput
              className="h-12 rounded-xl border border-slate-200 px-4 text-slate-900"
              placeholder="you@example.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-slate-700">Password</Text>
            <TextInput
              className="h-12 rounded-xl border border-slate-200 px-4 text-slate-900"
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Text className="text-xs text-slate-500">Min 6 characters.</Text>
          </View>

          {error ? (
            <Text className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </Text>
          ) : null}

          <Pressable
            className={`h-12 items-center justify-center rounded-xl ${
              canSubmit ? "bg-slate-900" : "bg-slate-300"
            }`}
            disabled={!canSubmit}
            onPress={onLogin}
          >
            <Text className="text-base font-semibold text-white">
              {submitting ? "Logging in..." : "Log in"}
            </Text>
          </Pressable>
          
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}