import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons'; // Importing Ionicons for icons

const SlotSelectionScreen = ({ navigation, gym }) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(60); // Default duration
  const [selectedSlot, setSelectedSlot] = useState(null); // For storing selected slot
  const [isTimeDropdownVisible, setIsTimeDropdownVisible] = useState(false); // For showing/hiding time dropdown

  const durations = [60, 90, 120, 180];
  const availableSlots = gym.slots;

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleConfirm = () => {
    if (!selectedSlot) {
      Alert.alert("Please select a time.");
      return;
    }
    const slotDetails = {
      date: date.toLocaleDateString(),
      time: selectedSlot.startTime,
      duration: selectedDuration,
      gymName: gym.name,
      gymId: gym.id,
      price: selectedSlot.price,
      slotId: selectedSlot.id,
      capacity: selectedSlot.capacity,
      pricePerSlot: selectedSlot.price,
      subscriptionId: gym?.subscriptions[0].id
    };
    navigation.navigate('PaymentScreen', { slotDetails });
  };

  const buttonColor = '#28a745'; // Set uniform button color to green

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select a Slot</Text>

      {/* Date Picker */}
      <TouchableOpacity 
        onPress={() => setShowDatePicker(true)} 
        style={[styles.button, { backgroundColor: buttonColor }]}>
        <Icon name="calendar-outline" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>{`Date: ${date.toLocaleDateString()}`}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()} // Prevent past dates
        />
      )}

      {/* Time Selection */}
      <Text style={styles.timeTitle}>Select Available Time:</Text>
      <TouchableOpacity
        onPress={() => setIsTimeDropdownVisible(!isTimeDropdownVisible)}
        style={[styles.button, { backgroundColor: buttonColor }]}>
        <Icon name="time-outline" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>
          {selectedSlot ? selectedSlot.startTime : 'Select Time'}
        </Text>
      </TouchableOpacity>

      {isTimeDropdownVisible && (
        <View style={styles.timeDropdown}>
          {availableSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              onPress={() => {
                setSelectedSlot(slot);
                setIsTimeDropdownVisible(false); // Close dropdown on selection
              }}
              style={styles.timeOption}>
              <Text style={styles.timeOptionText}>
                {slot.startTime}
              </Text>
              <Text style={styles.slotDetailsText}>
                Capacity: {slot.capacity} | Price: ₹{slot.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Duration Selection */}
      <Text style={styles.durationTitle}>Select Duration:</Text>
      <View style={styles.durationsContainer}>
        {durations.map((duration) => (
          <TouchableOpacity
            key={duration}
            onPress={() => setSelectedDuration(duration)}
            style={[
              styles.durationButton,
              selectedDuration === duration && styles.selectedDurationButton
            ]}>
            <Text style={[styles.durationText, { color: selectedDuration === duration ? '#fff' : '#333' }]}>
              {duration} mn
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.selectedDuration}>{`Selected Duration: ${selectedDuration} mn`}</Text>

      {/* Confirm Button */}
      <TouchableOpacity onPress={handleConfirm} style={[styles.button, { backgroundColor: buttonColor }]}>
        <Text style={styles.buttonText}>Confirm Slot</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Allow scrolling
    padding: 20,
    backgroundColor: '#f8f9fa', // Light grey background for a modern look
  },
  title: {
    fontSize: 28,
    color: '#333', // Dark text for better readability
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Roboto', // Consistent font
    fontWeight: 'bold', // Make title bold
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3, // Shadow for the button
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginLeft: 10, // Spacing between icon and text
    fontFamily: 'Roboto', // Consistent font
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  timeTitle: {
    color: '#333',
    fontSize: 20, // Slightly larger for emphasis
    marginVertical: 10,
    textAlign: 'center',
    fontWeight: '600', // Semi-bold for better visibility
  },
  timeDropdown: {
    backgroundColor: '#ffffff', // White background for dropdown
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#28a745', // Border color matching button color
    padding: 10,
    elevation: 2, // Slight elevation for dropdown
  },
  timeOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd', // Light grey border for options
  },
  timeOptionText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500', // Semi-bold for better visibility
  },
  slotDetailsText: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  durationTitle: {
    color: '#333',
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600', // Semi-bold for better visibility
  },
  durationsContainer: {
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around', // Space out duration buttons
  },
  durationButton: {
    width: 70, // Fixed width for uniformity
    padding: 10,
    borderWidth: 2,
    borderColor: '#28a745', // Green border color
    borderRadius: 10,
    marginHorizontal: 5, // Spacing between buttons
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // White background for buttons
  },
  selectedDurationButton: {
    backgroundColor: '#28a745', // Green background for selected button
  },
  durationText: {
    fontSize: 16,
  },
  selectedDuration: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default SlotSelectionScreen;
