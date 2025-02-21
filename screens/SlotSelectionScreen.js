import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Calendar, ChevronLeft } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import BookingUnavailable from '../components/BookingUnavailable'

export default function Component({ navigation, route }) {
  const { gym } = route.params
  console.log("GYm Details is", gym);
  const [date, setDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const subscriptions = ['Daily', 'Monthly', 'Yearly']
  const [selectedSubscription, setSelectedSubscription] = useState('Daily')

  const durations = [60, 90, 120, 180]
  const availableSlots = gym?.slots?.sort((a, b) => {
    const timeA = new Date(`1970-01-01T${a.startTime}`)
    const timeB = new Date(`1970-01-01T${b.startTime}`)
    return timeA - timeB
  })

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date
    setShowDatePicker(false)
    setDate(currentDate)
  }

  const formatDate = (date) => {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`
  }

  const isPastSlot = (slotTime) => {
    const selectedDate = new Date(date)
    const currentDate = new Date()
    if (selectedDate.toDateString() !== currentDate.toDateString()) return false
    const slotDateTime = new Date(`${selectedDate.toDateString()} ${slotTime}`)
    return slotDateTime < currentDate
  }

  const handleConfirm = () => {
    if (!selectedSlot && selectedSubscription== "Daily") {
      Alert.alert("Please select a time slot.")
      return
    }
    const slotDetails = {
      date: formatDate(date),
      time: selectedSlot?.startTime,
      duration: selectedDuration,
      gymName: gym.name,
      gymId: gym.id,
      price: gym?.subscriptions[0][selectedSubscription.toLowerCase()],
      slotId: selectedSlot?.id,
      pricePerSlot: gym?.subscriptions[0][selectedSubscription.toLowerCase()],
      subscriptionId: gym?.subscriptions[0]?.id,
      type: selectedSubscription
    }
    navigation.navigate('PaymentScreen', { slotDetails })
  }

  const formatTime = (timeString) => {
    return timeString.replace(':00', '')
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* StatusBar Configuration */}
      <StatusBar
        barStyle="dark-content" // Use 'light-content' for white text on dark background
        backgroundColor="#f5f5f5" // Ensure this matches the container's background
        translucent={false} // Use translucent if you want to overlay content under the status bar
      />
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.background}
      >

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#FFFFFF" size={24} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.gymName}>{gym.name}</Text>
          <Text style={styles.title}>Select a Slot</Text>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Calendar color="#4CAF50" size={24} />
            <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}


          <Text style={styles.sectionTitle}>Subscription Type:</Text>
          <View style={styles.subscriptionContainer}>
            {subscriptions.map((sub) => (
              <TouchableOpacity
                key={sub}
                onPress={() => setSelectedSubscription(sub)}
                style={[styles.subscriptionButton, selectedSubscription === sub && styles.selectedSubscriptionButton]}
              >
                <Text style={[styles.subscriptionButtonText, selectedSubscription === sub && styles.selectedSubscriptionButtonText]}>
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedSubscription == "Daily" && <><Text style={styles.sectionTitle}>Available Time Slots:</Text>
            {!availableSlots && <BookingUnavailable navigation={navigation} route={route} gym={gym} />}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlotContainer}>

              {availableSlots?.map((slot) => {
                const pastSlot = isPastSlot(slot.startTime)
                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => !pastSlot && setSelectedSlot(slot)}
                    style={[
                      styles.timeSlot,
                      pastSlot && styles.disabledTimeSlot,
                      selectedSlot?.id === slot.id && styles.selectedTimeSlot
                    ]}
                    disabled={pastSlot}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      pastSlot && styles.disabledText,
                      selectedSlot?.id === slot.id && styles.selectedTimeSlotText
                    ]}>
                      {formatTime(slot.startTime)}
                    </Text>
                    <Text style={[
                      styles.priceText,
                      pastSlot && styles.disabledText,
                      selectedSlot?.id === slot.id && styles.selectedTimeSlotText
                    ]}>
                      ₹{slot.price}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            <Text style={styles.sectionTitle}>Select Duration:</Text>
            <View style={styles.durationContainer}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  onPress={() => setSelectedDuration(duration)}
                  style={[
                    styles.durationButton,
                    selectedDuration === duration && styles.selectedDurationButton
                  ]}
                >
                  <Text style={[
                    styles.durationButtonText,
                    selectedDuration === duration && styles.selectedDurationButtonText
                  ]}>
                    {duration} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View> </>}

          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm Slot</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20, // Added to move the button down
  },
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  gymName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  dateButtonText: {
    marginLeft: 12,
    fontSize: 18,
    color: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingVertical: 4,
  },
  timeSlot: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    height: 80,
  },
  selectedTimeSlot: {
    backgroundColor: '#2E7D32',
  },
  disabledTimeSlot: {
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  selectedTimeSlotText: {
    color: '#FFFFFF',
  },
  priceText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  disabledText: {
    color: '#A0AEC0',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  durationButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
  },
  selectedDurationButton: {
    backgroundColor: '#2E7D32',
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  selectedDurationButtonText: {
    color: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscriptionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  subscriptionButton: { padding: 12, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', width: '30%' },
  selectedSubscriptionButton: { backgroundColor: '#2E7D32' },
  subscriptionButtonText: { fontSize: 16, fontWeight: '600', color: '#4CAF50' },
  selectedSubscriptionButtonText: { color: '#FFFFFF' },
})