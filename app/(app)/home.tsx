import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView className="flex-1 bg-background-light">
      <View className="px-6 py-8">
        <View className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 mb-8 shadow-lg">
          <Text className="text-white text-3xl font-bold mb-2">
            Welcome Back!
          </Text>
          <Text className="text-primary-100 text-lg">
            {user?.email || 'Planner User'}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            Quick Actions
          </Text>

          <TouchableOpacity
            className="bg-white rounded-2xl p-6 mb-4 shadow-md border-l-4 border-primary-600"
            onPress={() => router.push('/(app)/calendar')}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-semibold text-gray-800 mb-1">
                  View Calendar
                </Text>
                <Text className="text-gray-600">
                  Access your monthly planner
                </Text>
              </View>
              <Text className="text-4xl">📅</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-2xl p-6 mb-4 shadow-md border-l-4 border-accent-pink"
            onPress={() => {
              const today = new Date().toISOString().split('T')[0];
              router.push({
                pathname: '/(app)/day-entry',
                params: { date: today },
              });
            }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-semibold text-gray-800 mb-1">
                  Add Today's Entry
                </Text>
                <Text className="text-gray-600">
                  Quick add for today
                </Text>
              </View>
              <Text className="text-4xl">✏️</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            Features
          </Text>

          <View className="bg-white rounded-2xl p-6 mb-4">
            <View className="flex-row items-start mb-4">
              <Text className="text-2xl mr-3">📝</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800 mb-1">
                  Easy Input
                </Text>
                <Text className="text-gray-600">
                  Track names, locations, and working hours for each day
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-4">
              <Text className="text-2xl mr-3">📊</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800 mb-1">
                  Monthly View
                </Text>
                <Text className="text-gray-600">
                  Navigate through months and view your schedule at a glance
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">📄</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800 mb-1">
                  PDF Export
                </Text>
                <Text className="text-gray-600">
                  Generate and share your planner as a PDF
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-red-500 rounded-xl py-4 mt-4"
          onPress={handleSignOut}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
