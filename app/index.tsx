import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/(app)/home");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [user, loading]);

  return (
    <View className="flex-1 items-center justify-center bg-primary-600">
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}
