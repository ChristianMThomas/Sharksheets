import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          router.replace('/(app)/home');
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
        });
    }
  }, [response]);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace('/(app)/home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        'Configuration Required',
        'Please add your Google Web Client ID to the .env file. Check the README for instructions.',
      );
      return;
    }
    promptAsync();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-primary-600 to-primary-800"
    >
      <View className="flex-1 justify-center px-6">
        <View className="bg-white rounded-3xl p-8 shadow-lg">
          <Text className="text-4xl font-bold text-primary-700 text-center mb-2">
            SharkSheets
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Your Personal Planner
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4 mb-4"
            onPress={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="border-2 border-primary-600 rounded-xl py-4 mb-4"
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text className="text-primary-600 text-center font-semibold text-lg">
              Sign in with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={loading}
          >
            <Text className="text-gray-600 text-center">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text className="text-primary-600 font-semibold">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
