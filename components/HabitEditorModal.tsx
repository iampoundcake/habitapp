import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, Switch } from 'react-native';
import { Habit } from '../types';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../styles/theme';

interface HabitEditorModalProps {
  isVisible: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  onDelete: (habitId: number) => void;
}

const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33F1', '#33FFF1', '#F1FF33'];

const HabitEditorModal: React.FC<HabitEditorModalProps> = ({ isVisible, habit, onClose, onSave, onDelete }) => {
  const [editedHabit, setEditedHabit] = useState<Habit | null>(habit);
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    setEditedHabit(habit);
  }, [habit]);

  const handleSave = () => {
    if (editedHabit) {
      onSave(editedHabit);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
          if (editedHabit) {
            onDelete(editedHabit.id);
          }
        }}
      ]
    );
  };

  const renderFrequencyPicker = () => (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>Frequency:</Text>
      {['daily', 'every-other-day', 'weekly', 'custom'].map((freq) => (
        <TouchableOpacity
          key={freq}
          style={[
            styles.frequencyOption, 
            editedHabit?.frequency === freq && styles.selectedFrequency,
            { backgroundColor: colors.secondary }
          ]}
          onPress={() => setEditedHabit({...editedHabit!, frequency: freq as Habit['frequency']})}
        >
          <Text style={{ color: colors.text }}>{freq}</Text>
        </TouchableOpacity>
      ))}
      {editedHabit?.frequency === 'custom' && (
        <View>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <View key={day} style={styles.customDayRow}>
              <Text style={{ color: colors.text }}>{day}</Text>
              <Switch
                value={editedHabit?.customDays?.includes(index)}
                onValueChange={(value) => {
                  const newCustomDays = value
                    ? [...(editedHabit?.customDays || []), index]
                    : editedHabit?.customDays?.filter(d => d !== index) || [];
                  setEditedHabit({...editedHabit!, customDays: newCustomDays});
                }}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );

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
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            className="scrollView"
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Habit</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.secondary }]}
              placeholder="Habit name"
              placeholderTextColor={colors.text}
              value={editedHabit.name}
              onChangeText={(text) => setEditedHabit({...editedHabit, name: text})}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.secondary }]}
              placeholder="Habit description"
              placeholderTextColor={colors.text}
              value={editedHabit.description}
              onChangeText={(text) => setEditedHabit({...editedHabit, description: text})}
            />
            {renderFrequencyPicker()}
            {renderColorPicker()}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.buttonText}>Delete Habit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
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
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
  },
  scrollView: {
    maxHeight: '80%',
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
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
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
  selectedFrequency: {
    backgroundColor: '#3c6e71',
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
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
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
  },
});

export default HabitEditorModal;