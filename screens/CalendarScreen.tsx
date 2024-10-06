import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit } from '../types';
import { Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../styles/theme';

// You can customize the locale if needed
LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
LocaleConfig.defaultLocale = 'en';

export default function CalendarScreen({ route }) {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  console.log("CalendarScreen rendered", route.params);
  const [habits, setHabits] = useState<Habit[]>(route.params?.habits || []);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    try {
      generateMarkedDates();
    } catch (error) {
      console.error('Error in generateMarkedDates:', error);
      Alert.alert('Error', 'There was an issue generating the calendar data.');
    }
  }, [habits]);

  const generateMarkedDates = () => {
    const marked = {};
    habits.forEach(habit => {
      if (!habit) {
        console.error("Encountered null or undefined habit in generateMarkedDates");
        return;
      }
      const dates = getHabitDates(habit);
      dates.forEach(date => {
        if (!marked[date]) {
          marked[date] = { dots: [] };
        }
        marked[date].dots.push({
          color: habit.completedDates && habit.completedDates.includes(date) ? habit.color : 'grey',
          key: habit.id.toString()
        });
      });
    });
    setMarkedDates(marked);
  };

  const getHabitDates = (habit: Habit) => {
    try {
      const dates = [];
      const start = new Date(habit.startDate || new Date());
      const end = habit.endDate ? new Date(habit.endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // Default to one year from now if no end date

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        const day = d.getDay();
        if (
          habit.frequency === 'daily' ||
          (habit.frequency === 'every-other-day' && d.getDate() % 2 === 0) ||
          (habit.frequency === 'weekly' && day === 1) || // Assuming weekly is every Monday
          (habit.frequency === 'custom' && habit.customDays?.includes(day))
        ) {
          dates.push(dateString);
        }
      }

      return dates;
    } catch (error) {
      console.error('Error in getHabitDates for habit:', habit.name, error);
      return [];
    }
  };

  const getHabitsForDate = (date: string) => {
    try {
      console.log("Getting habits for date:", date);
      console.log("Current habits:", habits);
      
      if (!Array.isArray(habits)) {
        console.error("Habits is not an array:", habits);
        return [];
      }

      return habits.filter(habit => {
        if (!habit) {
          console.error("Encountered null or undefined habit");
          return false;
        }
        const habitDates = getHabitDates(habit);
        console.log("Habit dates for", habit.name, ":", habitDates);
        return habitDates.includes(date);
      });
    } catch (error) {
      console.error('Error in getHabitsForDate:', error);
      Alert.alert('Error', 'There was an issue loading habits for this date.');
      return [];
    }
  };

  const toggleHabitCompletion = async (habit: Habit, date: string) => {
    const updatedHabits = habits.map(h => {
      if (h.id === habit.id) {
        const completedDates = h.completedDates || [];
        const updatedCompletedDates = completedDates.includes(date)
          ? completedDates.filter(d => d !== date)
          : [...completedDates, date];
        return { ...h, completedDates: updatedCompletedDates };
      }
      return h;
    });

    setHabits(updatedHabits);

    try {
      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
      // Update navigation params if necessary
    } catch (error) {
      console.error('Error updating habit completion:', error);
    }
  };

  const CustomDay = ({ date, state, marking }) => {
    const isSelected = date.dateString === selectedDate;
    return (
      <TouchableOpacity
        style={[
          styles.dayContainer,
          isSelected && styles.selectedDay,
          state === 'disabled' && styles.disabledDay,
          { backgroundColor: isSelected ? colors.accent : colors.background }
        ]}
        onPress={() => setSelectedDate(date.dateString)}
      >
        <Text style={[
          styles.dayText,
          isSelected && styles.selectedDayText,
          state === 'disabled' && styles.disabledDayText,
          { color: colors.text }
        ]}>
          {date.day}
        </Text>
        {marking?.dots && (
          <View style={styles.dotsContainer}>
            {marking.dots.map((dot, index) => (
              <View key={index} style={[styles.dot, { backgroundColor: dot.color }]} />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Habit Calendar</Text>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        enableSwipeMonths={true}
        renderArrow={(direction) => (
          <Text style={[styles.arrow, { color: colors.text }]}>{direction === 'left' ? '←' : '→'}</Text>
        )}
        monthFormat={'MMMM yyyy'}
        dayComponent={CustomDay}
        theme={{
          calendarBackground: colors.background,
          textSectionTitleColor: colors.text,
          monthTextColor: colors.text,
          textMonthFontSize: 18,
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayHeaderFontSize: 14,
          textDayFontColor: colors.text,
          todayTextColor: colors.accent,
        }}
      />
      {selectedDate && (
        <View style={styles.habitsContainer}>
          <Text style={[styles.dateTitle, { color: colors.text }]}>{selectedDate}</Text>
          <ErrorBoundary fallback={<Text style={{ color: colors.text }}>Error loading habits for this date.</Text>}>
            <FlatList
              data={getHabitsForDate(selectedDate)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={[
                  styles.habitItem,
                  { 
                    borderLeftColor: item.color,
                    borderLeftWidth: 5,
                    backgroundColor: theme === 'dark' ? '#1C1C1C' : '#f5f3f4'
                  }
                ]}>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.habitDescription, { color: colors.text }]}>{item.description}</Text>
                  </View>
                  <Switch
                    value={(item.completedDates || []).includes(selectedDate)}
                    onValueChange={() => toggleHabitCompletion(item, selectedDate)}
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={(item.completedDates || []).includes(selectedDate) ? "#f5dd4b" : "#f4f3f4"}
                  />
                </View>
              )}
              ListEmptyComponent={<Text style={{ color: colors.text }}>No habits scheduled for this date.</Text>}
            />
          </ErrorBoundary>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  habitsContainer: {
    marginTop: 20,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitDescription: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 24,
  },
  dayContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#F0F0F0',
  },
  disabledDay: {
    opacity: 0.4,
  },
  dayText: {
    textAlign: 'center',
  },
  selectedDayText: {
    fontWeight: 'bold',
  },
  disabledDayText: {
    color: '#d9e1e8',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
});

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}