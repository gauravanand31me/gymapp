// api/apiService.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const BASE_URL = 'https://yupluck.com/user/api'; // Change to HTTP for testing

// Function to handle login
export const loginUser = async (phoneNumber) => {
  try {
    console.log(`${BASE_URL}/auth/login`);
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: phoneNumber,
    });
    console.log("response.data", response.data);
    return {
      status: true,
      data: response.data
     } // Return the data on success
  } catch (error) {
    return {
      status: false,
      message: error?.response?.data?.message
     } // Return the data on success
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
      console.log("SearchText received", searchText);
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
    console.log("Search Text received", searchText);
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const endpoint = `${BASE_URL}/users/search/${searchText}`
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`, // Include the bearer token
        },
      });
      const data = await response.json();
      
      if(!data.message) {
        const formattedBuddies = data?.map(user => ({
          id: user.id,
          name: user.full_name,
          username: user.username,
          status: user.is_selected ? 'Available' : 'Unavailable',
          image: user.profile_pic || 'https://via.placeholder.com/50', // Use a placeholder if no image
          inGym: user.is_selected,
          invited: user.friendRequestStatus,
        }));
        return formattedBuddies;
      } else {
        return [];
      }
      
    } catch (error) {
      
    }
  };

  export const userDetails = async (userId="") => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await fetch(`${BASE_URL}/users/get?id=${userId}`, {
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

  export const createBookingUrl = (bookingId)  => {
    return `${BASE_URL}/booking/verify?bookingId=${bookingId}`;
  }

  export const createBooking = async (slotDetails) => {

    console.log("slotDetails", slotDetails);
   
    try {
      let year, month, day;
      if (slotDetails.bookingDate) {
         [year, month, day] = slotDetails.bookingDate.split('-'); // Split by '-'
      } else {
         [day, month, year] = slotDetails.date.split('/'); // Split by '/'
      }
       

// Create a new date object in the format YYYY-MM-DD
        const parsedDate = new Date(`${year}-${month}-${day}`);
 
        const bookingDate = parsedDate.toISOString(); // Convert to ISO format
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await axios.post(`${BASE_URL}/booking/create`, {
        slotId: slotDetails.slotId || slotDetails.bookingSlotId, // slot ID
        gymId: slotDetails.gymId,   // gym ID
        bookingDate: bookingDate, // current date
        subscriptionType: "daily", // subscription type
        subscriptionId: slotDetails.subscriptionId || slotDetails.bookingSubscriptionId,         // subscription ID
        paymentId: slotDetails?.paymentId || Date.now.toString(),              // razorpay payment ID
        duration: slotDetails?.duration || slotDetails.bookingDuration,
        price: slotDetails.price * (slotDetails.duration / 60) || slotDetails.subscriptionPrice,
        requestId: slotDetails.requestId
      },{
        headers: {
          Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
        },
      });
      
      // Handle response
      
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
      
      // Assuming data.Booking contains the bookings
      return data.Booking.map(booking => ({
        id: booking.id, // Assuming bookingId is unique
        gymName: booking.gymName,
        location: booking.gymLocation, // Assuming you have this in your API response
        rating: booking.gymRating,
        reviews: booking.gymReviews, // Ensure this is returned from the API
        invites: booking.invitedBuddyCount,
        date: booking.bookingDate,
        time: booking.slotStartTime, // Assuming this is your time format
        imageUrl: booking.gymImage, // Add the gym image here
        bookingId: booking.bookingId,
        price: booking.subscriptionPrice, // Assuming you have this in your API response
        visited: booking.visited,
        create: booking.create,
        gymId: booking.gymId
      }));
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

  export const markAllNotificationsAsRead = async () => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await axios.post(`${BASE_URL}/notifications/mark-all-read`, {}, {
        headers: {
          Authorization: `Bearer ${userToken}`, // Add token to the request
        },
      });
      return response.data;
    } catch (error) {
      console.log('Error marking notifications as read:', error.response.data.message);
    }
  };
  


  // Add this function in your apiService.js or similar file



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


export const fetchBuddyInvites = async (bookingId) => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    console.log("bookingId Received", bookingId);
    const response = await axios.get(`${BASE_URL}/buddy/get?bookingId=${bookingId}`, {
    headers: {
      Authorization: `Bearer ${userToken}`, // Make sure to replace <your_token> with the actual token
    },
  });
    return response.data
  } catch (error) {
    console.error('Error fetching buddy:', error);
    Alert.alert('Error', 'An error occurred while sending the invitation.');
  }
}

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

export const acceptBuddyRequest = async (requestId) => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.get(`${BASE_URL}/booking/indv?requestId=${requestId}` ,{
      headers: {
        Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
      },
    });
    
    return response.data; // This should include the Razorpay order_id, amount, currency, etc.
  } catch (error) {
    console.log('Error creating order:', error);
    throw error; // Handle error accordingly
  }
}


export const getVisitedGyms = async (userId="") => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.get(`${BASE_URL}/booking/visited-gyms?id=${userId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching visited gyms:', error);
    throw error;
  }
};


export const getVisitedBuddies = async (userId="") => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.get(`${BASE_URL}/booking/workout-buddies?id=${userId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching visited gyms:', error);
    throw error;
  }
};


