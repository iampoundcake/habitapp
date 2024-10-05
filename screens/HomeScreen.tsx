import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Modal, Switch, ScrollView, Dimensions, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Habit } from '../types';
import HabitEditorModal from '../components/HabitEditorModal';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../styles/theme';
import AddHabitModal from '../components/AddHabitModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33F1', '#33FFF1', '#F1FF33'];

export default function HomeScreen({ navigation }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [color, setColor] = useState('#3b72e8');
  const [customColor, setCustomColor] = useState('');
  const [isEditorVisible, setIsEditorVisible] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    console.log("Habits state updated:", habits);
  }, [habits]);

  const loadHabits = async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('habits');
      console.log("Stored habits:", storedHabits);
      if (storedHabits) {
        const parsedHabits = JSON.parse(storedHabits);
        console.log("Parsed habits:", parsedHabits);
        setHabits(parsedHabits);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const handleAddHabit = (newHabit: Habit) => {
    setHabits(prevHabits => [...prevHabits, newHabit]);
    // Here you might want to save the updated habits to AsyncStorage or your backend
  };

  const editHabit = async () => {
    if (editingHabit && editingHabit.name.trim()) {
      const updatedHabits = habits.map(habit => 
        habit.id === editingHabit.id ? editingHabit : habit
      );
      setHabits(updatedHabits);
      try {
        await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
        setEditModalVisible(false);
        setEditingHabit(null);
      } catch (error) {
        console.error('Error updating habit:', error);
      }
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const updatedHabits = habits.filter(habit => habit.id !== habitId);
      setHabits(updatedHabits);
      await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const renderFrequencyPicker = (isEditing: boolean = false) => (
    <View>
      <Text>Frequency:</Text>
      {['daily', 'every-other-day', 'weekly', 'custom'].map((freq) => (
        <TouchableOpacity
          key={freq}
          style={[
            styles.frequencyOption, 
            (isEditing ? editingHabit?.frequency : frequency) === freq && styles.selectedFrequency
          ]}
          onPress={() => isEditing 
            ? setEditingHabit({...editingHabit!, frequency: freq as Habit['frequency']}) 
            : setFrequency(freq as Habit['frequency'])
          }
        >
          <Text>{freq}</Text>
        </TouchableOpacity>
      ))}
      {(isEditing ? editingHabit?.frequency : frequency) === 'custom' && (
        <View>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <View key={day} style={styles.customDayRow}>
              <Text>{day}</Text>
              <Switch
                value={isEditing 
                  ? editingHabit?.customDays?.includes(index) 
                  : customDays.includes(index)
                }
                onValueChange={(value) => {
                  if (isEditing) {
                    const newCustomDays = value
                      ? [...(editingHabit?.customDays || []), index]
                      : editingHabit?.customDays?.filter(d => d !== index) || [];
                    setEditingHabit({...editingHabit!, customDays: newCustomDays});
                  } else {
                    if (value) {
                      setCustomDays([...customDays, index]);
                    } else {
                      setCustomDays(customDays.filter((d) => d !== index));
                    }
                  }
                }}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderColorPicker = (isEditing: boolean = false) => (
    <View style={styles.colorPickerContainer}>
      <Text>Select Color:</Text>
      <View style={styles.colorOptions}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorOption, 
              { backgroundColor: c }, 
              (isEditing ? editingHabit?.color : color) === c && styles.selectedColor
            ]}
            onPress={() => isEditing 
              ? setEditingHabit({...editingHabit!, color: c}) 
              : setColor(c)
            }
          />
        ))}
      </View>
      <TextInput
        style={styles.customColorInput}
        placeholder="Custom color (hex)"
        value={isEditing ? editingHabit?.color : customColor}
        onChangeText={(text) => isEditing 
          ? setEditingHabit({...editingHabit!, color: text}) 
          : setCustomColor(text)
        }
        onSubmitEditing={() => {
          if (/^#[0-9A-F]{6}$/i.test(isEditing ? editingHabit!.color : customColor)) {
            if (isEditing) {
              setEditingHabit({...editingHabit!, color: editingHabit!.color});
            } else {
              setColor(customColor);
            }
          }
        }}
      />
    </View>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getFrequencyText = (habit: Habit) => {
    switch (habit.frequency) {
      case 'daily':
        return 'Daily';
      case 'every-other-day':
        return 'Every other day';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        return `Custom: ${habit.customDays?.map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ')}`;
      default:
        return '';
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditorVisible(true);
  };

  const handleSaveHabit = (updatedHabit: Habit) => {
    const updatedHabits = habits.map(habit => 
      habit.id === updatedHabit.id ? updatedHabit : habit
    );
    setHabits(updatedHabits);
    AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
    setIsEditorVisible(false);
    setEditingHabit(null);
  };

  const openEditor = (habit: Habit) => {
    console.log("Opening editor for habit:", habit);
    setEditingHabit(habit);
    setIsEditorVisible(true);
  };

  const renderHabitItem = ({ item }: { item: Habit }) => (
    <TouchableOpacity
      style={[
        styles.habitItem, 
        { backgroundColor: theme === 'light' ? '#ffffff' : '#1C1C1C' }
      ]}
      onPress={() => openEditor(item)}
    >
      <View style={[styles.habitColor, { backgroundColor: item.color }]} />
      <View style={styles.habitContent}>
        <Text style={[styles.habitName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.habitDescription, { color: colors.text }]}>{item.description}</Text>
        <Text style={[styles.habitFrequency, { color: colors.text }]}>
          {item.frequency}{item.frequency === 'custom' ? `: ${item.customDays?.map(day => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]).join(', ')}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Joe's Habit Tracker</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={theme === 'dark' ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.accent }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Habit</Text>
      </TouchableOpacity>
      <FlatList
        data={habits}
        renderItem={renderHabitItem}
        keyExtractor={(item) => item.id}
        key={habits.length} // This will force a re-render when the number of habits changes
      />
      <TouchableOpacity
        style={[styles.calendarButton, { backgroundColor: colors.accent }]}
        onPress={() => navigation.navigate('Calendar', { habits: habits })}
      >
        <Text style={styles.calendarButtonText}>Go to Calendar</Text>
      </TouchableOpacity>

      <AddHabitModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddHabit}
      />

      <HabitEditorModal
        isVisible={isEditorVisible}
        habit={editingHabit}
        onClose={() => setIsEditorVisible(false)}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#f5f3f4',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: '#353535',
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitItem: {
    flexDirection: 'row',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  habitColor: {
    width: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  habitContent: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  habitFrequency: {
    fontSize: 14,
    marginTop: 4,
  },
  calendarButton: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  calendarButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalView: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  scrollViewContent: {
    flexGrow: 1,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  frequencyOption: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedFrequency: {
    backgroundColor: '#3b72e8',
  },
  customDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  colorPickerContainer: {
    marginVertical: 10,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#000',
  },
  customColorInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.9,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },
  scrollView: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 10,
  },
});