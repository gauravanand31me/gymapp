// api/apiService.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const BASE_URL = 'https://e4d1-2401-4900-62a8-3413-15e6-4cb6-cd57-d10d.ngrok-free.app/user/api'; // Change to HTTP for testing

// Function to handle login
export const loginUser = async (phoneNumber) => {
  try {
    console.log(`${BASE_URL}/auth/login`);
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: phoneNumber,
    });
    console.log("Response Data", response.data);
    return response.data; // Return the data on success
  } catch (error) {
    console.error('API call error:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
};



export const registerUser = async (fullName, phoneNumber) => {
  try {
    console.log(`${BASE_URL}/auth/login`);
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      full_name: fullName,
      mobile_number: phoneNumber
    });
    console.log("Response Data", response.data);
    return response.data; // Return the data on success
  } catch (error) {
    console.error('API call error:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
};


// Function to handle OTP verification
export const verifyOtp = async (mobileNumber, otp) => {
    try {
      console.log(`${BASE_URL}/auth/verify-otp`);
      const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
        mobile_number: mobileNumber,
        otp: otp,
      });
      console.log("OTP Verification Response Data", response.data);
      return response.data; // Return the data on success
    } catch (error) {
      console.error('OTP Verification API call error:', error);
      throw error; // Rethrow the error for handling in the calling function
    }
  };


  export const fetchAllGyms = async (latitude = 12.9716, longitude = 77.5946,  searchText='', limit = 9, page = 1) => {
    try {
  
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await axios.get(
        `${BASE_URL}/gym/get?lat=${latitude}&long=${longitude}&limit=${limit}&page=${page}&search=${searchText}`,
        { headers: { Authorization: `Bearer ${userToken}` } } // Add token if required
      );
      
      console.log("Response data strattus", response.data);
      if (response.data.status) {
        return response.data.gyms;
      }
    } catch (error) {
      console.error('Error fetching gyms:', error)

    }
  };
  

  export const fetchIndividualGymData = async (gym_id) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await fetch(`${BASE_URL}/gym/get/${gym_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`, // Include the bearer token
        },
      });

      const data = await response.json();
      console.log("Data received", data);
      if (data?.status) {
        return data?.results[0];
      } else {
        console.error('Error fetching gym data:', data);
      }
    } catch (error) {
      console.error('Error fetching gyms:', error);
    }
  };


  export const fetchAllNearByUser = async (searchText = '') => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const endpoint = searchText
      ? `${BASE_URL}/users/search/${searchText}`
      : `${BASE_URL}/users/nearby-users?lat=12.9716&long=77.5946`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`, // Include the bearer token
        },
      });
      const data = await response.json();
      console.log()
      const formattedBuddies = data.map(user => ({
        id: user.id,
        name: user.full_name,
        username: user.username,
        status: user.is_selected ? 'Available' : 'Unavailable',
        image: user.profile_pic || 'https://via.placeholder.com/50', // Use a placeholder if no image
        inGym: user.is_selected,
        invited: user.friendRequestStatus,
      }));
      return formattedBuddies;
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    }
  };

  export const userDetails = async () => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await fetch(`${BASE_URL}/users/get`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`, // Include the bearer token
        },
      });
    
      const data = await response.json();
      console.log("Data received", data);
      return data.loggedInUser;
    
    } catch (error) {
      console.error('Error fetching user data:', error);
     
    }
  }



  export const addFriend = async (userId) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await axios.post(
        `${BASE_URL}/friends/add`,
        { userId: userId },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  };



  export const createBooking = async (slotDetails) => {
   
    try {
   
        const [month, day, year] = slotDetails.date.split('/'); // Split by '/' 

// Create a new date object in the format YYYY-MM-DD
        const parsedDate = new Date(`${year}-${month}-${day}`);
        const bookingDate = parsedDate.toISOString(); // Convert to ISO format
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await axios.post(`${BASE_URL}/booking/create`, {
        slotId: slotDetails.slotId, // slot ID
        gymId: slotDetails.gymId,   // gym ID
        bookingDate: bookingDate, // current date
        subscriptionType: "daily", // subscription type
        subscriptionId: slotDetails.subscriptionId,         // subscription ID
        paymentId: slotDetails?.paymentId || Date.now.toString(),              // razorpay payment ID
      },{
        headers: {
          Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
        },
      });
      
      // Handle response
      console.log("Response Data received", response.data);
      console.log("Response Status", response.status);
      if (response.status === 200 || response.status === 201) {
       
        return response.data;
      } else {
      
        return false;
      }
    } catch (error) {
      console.log("Error is", error);
      return false;
    }
  };



  export const fetchAllBookings = async () => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await fetch(`${BASE_URL}/booking/get`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`, // Include the bearer token
        },
      }); // Your API endpoint
      const data = await response.json();

    

      return data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };



  export const fetchAllNotifications = async () => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await axios.get(`${BASE_URL}/notifications/get`, {
        headers: {
          Authorization: `Bearer ${userToken}`, // Make sure to replace <your_token> with the actual token
        },
      });
      return response.data
    } catch (error) {
      console.log("Error", error.response.data.message);
      console.log('Failed to load notifications');
      return error.response.data;
    }
  };


  export const acceptFriendRequest = async (requestId) => {
    try {
        const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
        const response = await axios.post(`${BASE_URL}/friends/accept`, {
            requestId: requestId,
        }, {
          headers: {
            Authorization: `Bearer ${userToken}`, // Make sure to replace <your_token> with the actual token
          },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Error accepting request');
    }
};

export const rejectFriendRequest = async (requestId) => {
    try {
        const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
        const response = await axios.post(`${BASE_URL}/friends/reject`, {
            requestId: requestId,
        }, {
          headers: {
            Authorization: `Bearer ${userToken}`, // Make sure to replace <your_token> with the actual token
          },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || 'Error rejecting request');
    }
};


export const fetchFriends = async () => {
  const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
  const response = await axios.get(`${BASE_URL}/friends/get`, {
    headers: {
      Authorization: `Bearer ${userToken}`, // Make sure to replace <your_token> with the actual token
    }});
  const data = await response.data;
  return data;
};


export const inviteBuddyRequest = async (bookingId, toUserId) => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.post(`${BASE_URL}/buddy/send`, {
      toUserId,
      bookingId,
  }, {
    headers: {
      Authorization: `Bearer ${userToken}`, // Make sure to replace <your_token> with the actual token
    },
  });
    return response.data
  } catch (error) {
    console.error('Error inviting buddy:', error);
    Alert.alert('Error', 'An error occurred while sending the invitation.');
  }
};

export const uploadProfileImage = async (imageUri) => {
 
  const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed

  // Convert image URI to a base64 string (optional, depends on your API design)
  const base64Image = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Prepare form data for the POST request
  const formData = new FormData();
  formData.append('profileImage', {
    uri: imageUri,
    name: 'profile.jpg', // Adjust as necessary
    type: 'image/jpeg', // Adjust based on your image type
  });

  try {
    const response = await axios.post(`${BASE_URL}/users/uploadProfileImage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        "Authorization": `Bearer ${userToken}`, // Make sure to replace <your_token> with the actual token
      },
    });

    // Handle the response
    console.log("Profile imahe request received", response.data);
    if (response.status === 200) {
      console.log('Profile image uploaded successfully:', response.data);
      return response.data; // Return the response if needed
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error; // Rethrow to handle in the calling function
  }
};






export const uploadImages = async (imageUri) => {
 
  const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed

  // Convert image URI to a base64 string (optional, depends on your API design)
  const base64Image = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Prepare form data for the POST request
  const formData = new FormData();
  formData.append('postImage', {
    uri: imageUri,
    name: 'profile.jpg', // Adjust as necessary
    type: 'image/jpeg', // Adjust based on your image type
  });

  try {
    const response = await axios.post(`${BASE_URL}/users/uploadImage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        "Authorization": `Bearer ${userToken}`, // Make sure to replace <your_token> with the actual token
      },
    });

    // Handle the response
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error; // Rethrow to handle in the calling function
  }
};

export const getUserImage = async (userId, page = 1) => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.get(`${BASE_URL}/users/getImage/${userId}`, {
        "params": { page },
        headers: {"Authorization": `Bearer ${userToken}`}, // Make sure to replace <your_token> with the actual token
    });
    return response.data; // Returns the data from the response
} catch (error) {
    console.error('Error fetching user images:', error);
    throw error; // Rethrow the error for further handling
}
}


export const createOrder = async (amount) => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.post(`${BASE_URL}/booking/initiate`, {
      amount: amount, // Send the amount to your backend (e.g., 500 for INR 500)
    },{
      headers: {
        Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
      },
    });
    
    return response.data; // This should include the Razorpay order_id, amount, currency, etc.
  } catch (error) {
    console.log('Error creating order:', error);
    throw error; // Handle error accordingly
  }
};