import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, TouchableWithoutFeedback, Dimensions, Alert } from 'react-native';
import { Habit } from '../types';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../styles/theme';
import ColorPicker from './ColorPicker';
import { v4 as uuidv4 } from 'uuid'; // Make sure to install this package

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddHabitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({ isVisible, onClose, onSave }) => {
  const [newHabit, setNewHabit] = useState<Habit>({
    id: '',
    name: '',
    description: '',
    frequency: 'daily',
    color: '#FF5733',
    customDays: [],
    completedDates: [] // Initialize this
  });
  const [customColor, setCustomColor] = useState('');

  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const selectedColor = theme === 'light' ? '#A8D0F0' : '#3993dd';

  const handleSave = () => {
    if (!newHabit.name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    const habitToSave = {
      ...newHabit,
      id: uuidv4(), // Generate a unique ID for the new habit
    };

    onSave(habitToSave);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setNewHabit({
      id: '',
      name: '',
      description: '',
      frequency: 'daily',
      color: '#FF5733',
      customDays: [],
      completedDates: [] // Initialize this
    });
    setCustomColor('');
  };

  const renderFrequencyPicker = () => {
    const frequencies = ['daily', 'every-other-day', 'weekly', 'custom'];
    return (
      <View>
        {frequencies.map((freq) => (
          <TouchableOpacity
            key={freq}
            style={[
              styles.frequencyOption,
              { backgroundColor: theme === 'dark' ? '#1C1C1C' : colors.secondary },
              newHabit.frequency === freq && { backgroundColor: selectedColor },
            ]}
            onPress={() => setNewHabit({...newHabit, frequency: freq as Habit['frequency']})}
          >
            <Text style={{ color: colors.text }}>{freq}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCustomDaysPicker = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return (
      <View style={styles.customDaysContainer}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayOption,
              { backgroundColor: theme === 'dark' ? '#1C1C1C' : colors.secondary },
              newHabit.customDays.includes(day) && { backgroundColor: selectedColor },
            ]}
            onPress={() => {
              const updatedDays = newHabit.customDays.includes(day)
                ? newHabit.customDays.filter(d => d !== day)
                : [...newHabit.customDays, day];
              setNewHabit({...newHabit, customDays: updatedDays});
            }}
          >
            <Text style={{ color: colors.text }}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleColorChange = (color: string) => {
    setNewHabit({...newHabit, color});
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Habit</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: theme === 'dark' ? '#1C1C1C' : '#F0F0F0' }]}
                  placeholder="Habit name"
                  placeholderTextColor={colors.placeholder}
                  value={newHabit.name}
                  onChangeText={(text) => setNewHabit({...newHabit, name: text})}
                />
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: theme === 'dark' ? '#1C1C1C' : '#F0F0F0' }]}
                  placeholder="Description"
                  placeholderTextColor={colors.placeholder}
                  value={newHabit.description}
                  onChangeText={(text) => setNewHabit({...newHabit, description: text})}
                />
                <Text style={[styles.label, { color: colors.text }]}>Frequency:</Text>
                {renderFrequencyPicker()}
                {newHabit.frequency === 'custom' && renderCustomDaysPicker()}
                <Text style={[styles.label, { color: colors.text }]}>Select Color:</Text>
                <ColorPicker
                  selectedColor={newHabit.color}
                  onColorChange={handleColorChange}
                />
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: theme === 'dark' ? '#1C1C1C' : '#F0F0F0' }]}
                  placeholder="Custom color (hex)"
                  placeholderTextColor={colors.placeholder}
                  value={customColor}
                  onChangeText={setCustomColor}
                  onBlur={() => {
                    if (/^#[0-9A-F]{6}$/i.test(customColor)) {
                      handleColorChange(customColor);
                    }
                  }}
                />
              </ScrollView>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>Add Habit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  scrollViewContent: {
    flexGrow: 1,
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
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
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
    fontWeight: 'bold'
  },
  frequencyOption: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  dayOption: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '13%',
    alignItems: 'center',
  },
  customDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  selectedDay: {
    backgroundColor: '#3993dd',
  },
});

export default AddHabitModal;