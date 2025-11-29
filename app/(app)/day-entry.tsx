import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { DayEntry } from '@/lib/types';

export default function DayEntryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { date } = useLocalSearchParams();
  const [names, setNames] = useState<string[]>(['']);
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);

  useEffect(() => {
    loadEntry();
  }, [date]);

  const loadEntry = async () => {
    if (!user || !date) return;

    try {
      const entryRef = doc(db, 'entries', `${user.uid}_${date}`);
      const entryDoc = await getDoc(entryRef);

      if (entryDoc.exists()) {
        const entry = entryDoc.data() as DayEntry;
        setNames(entry.names);
        setLocation(entry.location);
        setStartTime(entry.workHours.start);
        setEndTime(entry.workHours.end);
        setExistingEntryId(entryDoc.id);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  };

  const addNameField = () => {
    setNames([...names, '']);
  };

  const removeNameField = (index: number) => {
    const newNames = names.filter((_, i) => i !== index);
    setNames(newNames.length > 0 ? newNames : ['']);
  };

  const updateName = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const diff = endMinutes - startMinutes;
    return Math.round((diff / 60) * 100) / 100;
  };

  const validateInput = () => {
    const filteredNames = names.filter((name) => name.trim() !== '');

    if (filteredNames.length === 0) {
      Alert.alert('Error', 'Please add at least one name');
      return false;
    }

    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return false;
    }

    if (!startTime || !endTime) {
      Alert.alert('Error', 'Please enter both start and end times');
      return false;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Alert.alert('Error', 'Please enter valid times in HH:MM format (e.g., 09:00)');
      return false;
    }

    if (calculateHours() <= 0) {
      Alert.alert('Error', 'End time must be after start time');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateInput() || !user || !date) return;

    setLoading(true);
    try {
      const filteredNames = names.filter((name) => name.trim() !== '');
      const totalHours = calculateHours();

      const entryData: Omit<DayEntry, 'id'> = {
        date: date as string,
        names: filteredNames,
        location: location.trim(),
        workHours: {
          start: startTime,
          end: endTime,
          total: totalHours,
        },
        userId: user.uid,
        createdAt: existingEntryId ? (await getDoc(doc(db, 'entries', existingEntryId))).data()?.createdAt : new Date(),
        updatedAt: new Date(),
      };

      const entryRef = doc(db, 'entries', `${user.uid}_${date}`);
      await setDoc(entryRef, entryData);

      Alert.alert('Success', 'Entry saved successfully');
      router.back();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingEntryId) return;

    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteDoc(doc(db, 'entries', existingEntryId));
              Alert.alert('Success', 'Entry deleted');
              router.back();
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background-light"
    >
      <ScrollView className="flex-1 p-6">
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-md">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {date ? new Date(date as string).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : 'New Entry'}
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-6 mb-6 shadow-md">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Names</Text>
          {names.map((name, index) => (
            <View key={index} className="flex-row mb-3">
              <TextInput
                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-gray-900 mr-2"
                placeholder={`Name ${index + 1}`}
                value={name}
                onChangeText={(value) => updateName(index, value)}
              />
              {names.length > 1 && (
                <TouchableOpacity
                  className="bg-red-500 rounded-xl px-4 justify-center"
                  onPress={() => removeNameField(index)}
                >
                  <Text className="text-white font-semibold">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            className="bg-primary-100 rounded-xl py-3 mt-2"
            onPress={addNameField}
          >
            <Text className="text-primary-700 text-center font-semibold">
              + Add Another Name
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-2xl p-6 mb-6 shadow-md">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Location</Text>
          <TextInput
            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
            placeholder="Work site or location"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View className="bg-white rounded-2xl p-6 mb-6 shadow-md">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Work Hours</Text>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Start Time</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
              placeholder="HH:MM (e.g., 09:00)"
              value={startTime}
              onChangeText={setStartTime}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">End Time</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
              placeholder="HH:MM (e.g., 17:00)"
              value={endTime}
              onChangeText={setEndTime}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {startTime && endTime && calculateHours() > 0 && (
            <View className="bg-primary-50 rounded-xl p-4">
              <Text className="text-primary-700 font-semibold">
                Total Hours: {calculateHours()} hours
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 mb-4"
          onPress={handleSave}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? 'Saving...' : 'Save Entry'}
          </Text>
        </TouchableOpacity>

        {existingEntryId && (
          <TouchableOpacity
            className="bg-red-500 rounded-xl py-4 mb-4"
            onPress={handleDelete}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Delete Entry
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
