import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { DayEntry } from '@/lib/types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function CalendarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState('');
  const [entries, setEntries] = useState<Record<string, DayEntry>>({});

  useEffect(() => {
    if (currentMonth) {
      loadMonthEntries(currentMonth);
    }
  }, [currentMonth]);

  const loadMonthEntries = async (month: string) => {
    if (!user) return;

    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

    try {
      const q = query(
        collection(db, 'entries'),
        where('userId', '==', user.uid),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0])
      );

      const querySnapshot = await getDocs(q);
      const monthEntries: Record<string, DayEntry> = {};
      const marked: any = {};

      querySnapshot.forEach((doc) => {
        const entry = { id: doc.id, ...doc.data() } as DayEntry;
        monthEntries[entry.date] = entry;
        marked[entry.date] = {
          marked: true,
          dotColor: '#9333ea',
          selected: entry.date === selectedDate,
          selectedColor: '#9333ea',
        };
      });

      setEntries(monthEntries);
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    router.push({
      pathname: '/(app)/day-entry',
      params: { date: day.dateString },
    });
  };

  const handleMonthChange = (month: any) => {
    const monthString = `${month.year}-${String(month.month).padStart(2, '0')}`;
    setCurrentMonth(monthString);
  };

  const generatePDF = async () => {
    if (Object.keys(entries).length === 0) {
      Alert.alert('No Data', 'No entries for this month to generate PDF');
      return;
    }

    const [year, month] = currentMonth.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });

    let html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #9333ea; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #9333ea; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Planner - ${monthName} ${year}</h1>
          <table>
            <tr>
              <th>Date</th>
              <th>Names</th>
              <th>Location</th>
              <th>Work Hours</th>
            </tr>
    `;

    Object.values(entries)
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((entry) => {
        const date = new Date(entry.date).toLocaleDateString();
        const names = entry.names.join(', ');
        const hours = `${entry.workHours.start} - ${entry.workHours.end} (${entry.workHours.total}h)`;

        html += `
          <tr>
            <td>${date}</td>
            <td>${names}</td>
            <td>${entry.location}</td>
            <td>${hours}</td>
          </tr>
        `;
      });

    html += `
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-background-light">
      <ScrollView>
        <View className="p-4">
          <Calendar
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#9333ea',
              selectedDayBackgroundColor: '#9333ea',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#9333ea',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#9333ea',
              selectedDotColor: '#ffffff',
              arrowColor: '#9333ea',
              monthTextColor: '#9333ea',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />

          {selectedDate && entries[selectedDate] && (
            <View className="bg-white rounded-2xl p-6 mt-4 shadow-md">
              <Text className="text-xl font-bold text-gray-800 mb-4">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>

              <View className="mb-3">
                <Text className="text-gray-600 font-semibold mb-1">Names:</Text>
                <Text className="text-gray-800">
                  {entries[selectedDate].names.join(', ')}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-gray-600 font-semibold mb-1">Location:</Text>
                <Text className="text-gray-800">{entries[selectedDate].location}</Text>
              </View>

              <View>
                <Text className="text-gray-600 font-semibold mb-1">Work Hours:</Text>
                <Text className="text-gray-800">
                  {entries[selectedDate].workHours.start} - {entries[selectedDate].workHours.end}
                  {' '}({entries[selectedDate].workHours.total} hours)
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            className="bg-primary-600 rounded-xl py-4 mt-6"
            onPress={generatePDF}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Generate PDF for {currentMonth}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
