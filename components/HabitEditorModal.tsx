import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, Switch, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Habit } from '../types';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../styles/theme';
import ColorPicker from './ColorPicker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HabitEditorModalProps {
  isVisible: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  onDelete: (habitId: string) => void; // Add this line
}

const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33F1', '#33FFF1', '#F1FF33'];

const HabitEditorModal: React.FC<HabitEditorModalProps> = ({ isVisible, habit, onClose, onSave, onDelete }) => {
  const [editedHabit, setEditedHabit] = useState<Habit | null>(habit);
  const [nameInputFocused, setNameInputFocused] = useState(false);
  const [descriptionInputFocused, setDescriptionInputFocused] = useState(false);
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const selectedColor = theme === 'light' ? '#A8D0F0' : '#3993dd';

  const [modalDimensions, setModalDimensions] = useState({ width: 0, height: 0 });

  const updateModalDimensions = () => {
    const { width, height } = Dimensions.get('window');
    setModalDimensions({
      width: width * 0.9,
      height: height * 0.9,
    });
  };

  useEffect(() => {
    updateModalDimensions();
    Dimensions.addEventListener('change', updateModalDimensions);
    return () => {
      Dimensions.removeEventListener('change', updateModalDimensions);
    };
  }, []);

  useEffect(() => {
    setEditedHabit(habit);
  }, [habit]);

  const handleSave = () => {
    if (editedHabit) {
      onSave(editedHabit);
    }
  };

  const handleDelete = () => {
    if (habit) {
      onDelete(habit.id);
      onClose();
    } else {
      // Removed addDebugMessage calls
    }
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
              editedHabit?.frequency === freq && { backgroundColor: selectedColor },
            ]}
            onPress={() => setEditedHabit({...editedHabit!, frequency: freq as Habit['frequency']})}
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
              editedHabit?.customDays.includes(day) && { backgroundColor: selectedColor },
            ]}
            onPress={() => {
              const updatedDays = editedHabit?.customDays.includes(day)
                ? editedHabit.customDays.filter(d => d !== day)
                : [...(editedHabit?.customDays || []), day];
              setEditedHabit({...editedHabit!, customDays: updatedDays});
            }}
          >
            <Text style={{ color: colors.text }}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderColorPicker = () => (
    <View style={styles.colorPickerContainer}>
      <Text style={[styles.label, { color: colors.text }]}>Select Color:</Text>
      <View style={styles.colorOptions}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorOption, 
              { backgroundColor: c }, 
              editedHabit?.color === c && styles.selectedColor
            ]}
            onPress={() => setEditedHabit({...editedHabit!, color: c})}
          />
        ))}
      </View>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.secondary }]}
        placeholder="Custom color (hex)"
        placeholderTextColor={colors.text}
        value={editedHabit?.color}
        onChangeText={(text) => setEditedHabit({...editedHabit!, color: text})}
      />
    </View>
  );

  if (!editedHabit) return null;

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
            <View style={[
              styles.modalContainer, 
              { 
                backgroundColor: colors.background,
                width: modalDimensions.width,
                maxHeight: modalDimensions.height,
              }
            ]}>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Habit</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: colors.text, 
                      backgroundColor: theme === 'dark' ? '#1C1C1C' : colors.background,
                      borderColor: nameInputFocused ? '#3993dd' : 'transparent',
                      borderWidth: 1,
                    }
                  ]}
                  placeholder="Habit name"
                  placeholderTextColor={colors.placeholder}
                  value={editedHabit?.name}
                  onChangeText={(text) => setEditedHabit({...editedHabit!, name: text})}
                  onFocus={() => setNameInputFocused(true)}
                  onBlur={() => setNameInputFocused(false)}
                />
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: colors.text, 
                      backgroundColor: theme === 'dark' ? '#1C1C1C' : colors.background,
                      borderColor: descriptionInputFocused ? '#3993dd' : 'transparent',
                      borderWidth: 1,
                    }
                  ]}
                  placeholder="Habit description"
                  placeholderTextColor={colors.placeholder}
                  value={editedHabit?.description}
                  onChangeText={(text) => setEditedHabit({...editedHabit!, description: text})}
                  onFocus={() => setDescriptionInputFocused(true)}
                  onBlur={() => setDescriptionInputFocused(false)}
                />
                {renderFrequencyPicker()}
                {renderColorPicker()}
              </ScrollView>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.buttonText}>Delete Habit</Text>
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
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  buttonContainer: {
    marginTop: 10,
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
    borderWidth: 1, // Changed from 2 to 1
    borderColor: 'transparent',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
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
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HabitEditorModal;