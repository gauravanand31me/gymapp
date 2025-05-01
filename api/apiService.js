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
      
      const storedToken = await AsyncStorage.getItem('expoPushToken');
        console.log('Stored token:', storedToken);
    
      
      const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
        mobile_number: mobileNumber,
        otp: otp,
        expoPushToken: storedToken
      });
      console.log("OTP Verification Response Data", response.data);
      return response.data; // Return the data on success
    } catch (error) {
      console.error('OTP Verification API call error:', error);
      throw error; // Rethrow the error for handling in the calling function
    }
  };


  export const storePushToken = async () => {
    const storedToken = await AsyncStorage.getItem('expoPushToken');
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.put(`${BASE_URL}/gym/store`, {
     expoPushToken: storedToken
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    if (response.data.status) {
      return response.data.status;
    }

  }


  
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


  export const getToken = async () => {
    const userToken = await AsyncStorage.getItem('authToken');
    return userToken;
  }
  

 

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
      const endpoint = `${BASE_URL}/users/search/${searchText}`
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`, // Include the bearer token
        },
      });
      const data = await response.json();
      console.log("Data received", data);
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


  export const deletePost = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken');
  
      const response = await fetch(`${BASE_URL}/users/feed/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("Delete response received", response);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete post');
      }
  
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Error deleting post:', error.message);
      return { success: false, message: error.message };
    }
  };



  export const getPostById = async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken');
  
      const response = await fetch(`${BASE_URL}/users/feed/${postId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch post');
      }
  
      return { success: true, post: data };
    } catch (error) {
      console.error('Error fetching post:', error.message);
      return { success: false, message: error.message };
    }
  };



  export const fetchUserReels = async (queryParams) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken');
      const { page, limit, userId, reelId } = queryParams; // 👈 also accept userId and reelId
     
      let endpoint = `${BASE_URL}/users/reel?offset=${page * limit}&limit=${limit}`;
  
      if (userId) {
        endpoint += `&userId=${userId}`; // 👈 append userId if available
      }
      if (reelId) {
        endpoint += `&reelId=${reelId}`; // 👈 append reelId if available
      }
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      
  
      if (response.ok && data.reels) {
        return data.reels.map(item => ({
          id: item.id,
          userId: item.userId,
          videoUrl: item.videoUrl,
          thumbnailUrl: item.thumbnailUrl || '',
          title: item.title || '',
          description: item.description || '',
          postType: item.postType,
          timestamp: item.timestamp,
          likeCount: item.like_count || 0,
          commentCount: item.comment_count || 0,
          shareCount: item.share_count || 0,
          canDelete: item.canDelete || false,
          canReport: item.canReport || false,
          user: {
            id: item.user?.id || '',
            name: item.user?.full_name || 'Unknown',
            profilePic: item.user?.profile_pic || 'https://via.placeholder.com/50'
          }
        }));
      } else {
        return [];
      }
  
    } catch (error) {
      console.error('Error fetching user reels:', error);
      return [];
    }
  };
  

  export const deleteReel = async (reelId) => {
    
    try {
      const userToken = await AsyncStorage.getItem('authToken');
  
      const response = await fetch(`${BASE_URL}/users/reel/${reelId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("Respon se received", response);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: data.message || 'Reel deleted successfully' };
      } else {
        throw new Error(data.message || 'Failed to delete reel');
      }
    } catch (error) {
     
      console.error('Error deleting reel:', error.message);
      return { success: false, message: error.message };
    }
  };


  export const fetchUserFeed = async (page = 0, limit = 10) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken');
  
      const endpoint = `${BASE_URL}/users/feed?offset=${page * limit}&limit=${limit}`;
  
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
  
      
      
      if (response.ok && data.feed) {
        return data.feed.map(item => ({
          id: item.id,
          canDelete: item.canDelete,
          canReport: item.canReport,
          type: item.activityType,
          title: item.title,
          postType: item.postType,
          description: item.description,
          imageUrl: item.imageUrl,
          timestamp: item.timestamp,
          userId: item.userId,
          likeCount: item.likeCount || item.like_count || 0,       // ✅ Added like count
          commentCount: item.commentCount || item.comment_count || 0, // ✅ Added comment count
          userLiked: item.userLiked || false, // ✅ Shows if current user has liked
          user: {
            id: item.user?.id,
            name: item.user?.full_name,
            profilePic: item.user?.profile_pic || 'https://via.placeholder.com/50'
          },
          gym: item.gym,
          userReaction: item.userReaction || null,
          reactionsBreakdown: item.reactionsBreakdown || []
        }));
      } else {
        return [];
      }

    } catch (error) {
      console.error('Error fetching user feed:', error);
      return [];
    }
  };




  
  export const fetchMyFeed = async (page = 0, limit = 10) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken');
  
      const endpoint = `${BASE_URL}/users/my-feed?offset=${page * limit}&limit=${limit}`;
  
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      const data = await response.json();
  
      
      
      if (response.ok && data.feed) {
        return data.feed.map(item => ({
          id: item.id,
          canDelete: item.canDelete,
          canReport: item.canReport,
          type: item.activityType,
          title: item.title,
          postType: item.postType,
          description: item.description,
          imageUrl: item.imageUrl,
          timestamp: item.timestamp,
          userId: item.userId,
          likeCount: item.likeCount || item.like_count || 0,       // ✅ Added like count
          commentCount: item.commentCount || item.comment_count || 0, // ✅ Added comment count
          userLiked: item.userLiked || false, // ✅ Shows if current user has liked
          user: {
            id: item.user?.id,
            name: item.user?.full_name,
            profilePic: item.user?.profile_pic || 'https://via.placeholder.com/50'
          },
          gym: item.gym,
          userReaction: item.userReaction || null,
          reactionsBreakdown: item.reactionsBreakdown || []
        }));
      } else {
        return [];
      }

    } catch (error) {
      console.error('Error fetching user feed:', error);
      return [];
    }
  };



  export const uploadReelVideo = async (videoUri, { title = '', description = '', postType = 'public' }, onProgress) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken');
  
      const formData = new FormData();
      const fileExtension = videoUri.split('.').pop();
  
      formData.append('video', {
        uri: videoUri,
        name: `reel-upload.${fileExtension}`,
        type: `video/${fileExtension}`,
      });

      // 👇 Add title, description, postType
      formData.append('title', title);
      formData.append('description', description);
      formData.append('postType', postType);
  
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/users/reel/upload`); // your reels upload endpoint
  
        xhr.setRequestHeader('Authorization', `Bearer ${userToken}`);
  
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && typeof onProgress === 'function') {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
  
        xhr.onload = () => {
          try {
            console.log("XHR raw response:", xhr.responseText); // 🛠 Important: always log this
            const responseData = JSON.parse(xhr.responseText);
            
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(responseData);
            } else {
              reject(new Error(responseData.message || 'Upload failed'));
            }
          } catch (err) {
            console.log("JSON Parse Error:", err);
            console.log("Server raw response:", xhr.responseText); // 🛠 Log the real server reply
            reject(new Error('Invalid JSON response: ' + xhr.responseText)); // optional: pass it forward
          }
        };
  
        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };
  
        xhr.send(formData);
      });
    } catch (err) {
      console.error('Token or upload error:', err);
      throw err;
    }
  };

  


  export const uploadFeedAnswer = async (formData, onProgress) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken');
  
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/users/feed/upload`);
  
        xhr.setRequestHeader('Authorization', `Bearer ${userToken}`);
  
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && typeof onProgress === 'function') {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
  
        xhr.onload = () => {
          try {
            const responseData = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(responseData);
            } else {
              reject(new Error(responseData.message || 'Upload failed'));
            }
          } catch (err) {
            reject(new Error('Invalid JSON response'));
          }
        };
  
        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };
  
        xhr.send(formData);
      });
    } catch (err) {
      console.error('Token or upload error:', err);
      throw err;
    }
};


export const fetchComments = async (postId) => {
  const token = await AsyncStorage.getItem('authToken');
  const res = await fetch(`${BASE_URL}/users/feed/comment/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// Add a comment to a post
export const addComment = async (postId, commentText) => {
  const token = await AsyncStorage.getItem('authToken');
  const res = await fetch(`${BASE_URL}/users/feed/comment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postId, commentText }),
  });
  return res.json();
};


export const deleteComment = async (commentId) => {
  try {
    const userToken = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}/users/feed/comment/${commentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to delete comment');

    return true;
  } catch (err) {
    console.error('Error deleting comment:', err);
    return false;
  }
};




export const reactToPost = async (postId, reactionType) => {
  try {
    console.log("postId", postId);
    console.log("reactTionType", reactionType);
    const userToken = await AsyncStorage.getItem('authToken');

    const response = await fetch(`${BASE_URL}/users/feed/react`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
       'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        reactionType
      }),
    });

    const data = await response.json();
    console.log("data is", data);
    return data;
  } catch (e) {
    console.error("Error received", error);
  }
}


  export const getLeaderBoard = async () => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const endpoint = `${BASE_URL}/users/leaderboard`
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`, // Include the bearer token
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error received", error);
    }
  }

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
      
      return data.loggedInUser;
    
    } catch (error) {
      // console.error('Error fetching user data:', error);
     
    }
  }



  export const addFriend = async (userId) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await axios.post(
        `${BASE_URL}/friends/add`,
        { userId: userId,  },
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

  export const createBookingUrl = (bookingId) => {
    const updatedBaseUrl = BASE_URL.replace('user', 'gym');
    return `${updatedBaseUrl}/booking/verify?bookingId=${bookingId}`;
  };

  export const declineBuddyRequest = async (requestId) => {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.delete(`${BASE_URL}/booking/deleteBuddyRequest/${requestId}`,{
      headers: {
        Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
      },
    });
    return response.data;
  }

  export const createBooking = async (slotDetails) => {

    
   
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
        subscriptionType: slotDetails?.type?.replace(/\s+/g, '') || slotDetails?.bookingType?.replace(/\s+/g, ''), // subscription type
        subscriptionId: slotDetails.subscriptionId || slotDetails.bookingSubscriptionId,         // subscription ID
        paymentId: slotDetails?.paymentId || Date.now.toString(),              // razorpay payment ID
        duration: slotDetails?.duration || slotDetails.bookingDuration,
        price: slotDetails.price * (slotDetails.duration / 60) || slotDetails.subscriptionPrice,
        requestId: slotDetails.requestId,
        discountedPrice: slotDetails.discountedPrice,
        couponApplied: slotDetails.couponCode
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



  export const fetchAllBookings = async (selectedTab) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await fetch(`${BASE_URL}/booking/get?selectedTab=${selectedTab}`, {
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
        gymId: booking.gymId,
        paymentStatus: booking.isPaid == true ? "Paid" : "Not Paid",
        duration: booking.duration,
        bookingRating: booking.rating,
        type: booking.type,
        discountedPrice: booking.discountedPrice
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



  export const fetchIndividualFriendRequest = async (requestId) => {
    try {
      const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
      const response = await axios.get(`${BASE_URL}/friends/getindv?requestId=${requestId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`, // Make sure to replace <your_token> with the actual token
        },
      });
      console.log("Friend Request data rfeceived0", response.data);
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
  console.log("Friends data received", data);
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


export const createOrder = async (amount, bookingId, requestId) => {
 
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.post(`${BASE_URL}/booking/initiate`, {
      amount: amount, // Send the amount to your backend (e.g., 500 for INR 500)
      bookingId,
      requestId
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
    console.log('Error fetching booking:', error);
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


export const getAllCouponCode = async (gym_id="") => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.get(`${BASE_URL}/booking/coupons?gym_id=${gym_id}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
      }
    });
    console.log("Response Data received", response.data);
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

export const updateName = async (name) => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.put(`${BASE_URL}/users/update-fullname`, { full_name: name,  }, {
      headers: {
        Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching visited gyms:', error);
    throw error;
  }
}


export const rateBooking = async (bookingId, gymId, rating, description) => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.post(`${BASE_URL}/rating/post`, {
      bookingId, // Send the amount to your backend (e.g., 500 for INR 500)
      gymId,
      rating,
      description
      }, {
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


export const deleteProfileImage = async () => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.put(`${BASE_URL}/users/delete-profileimage`, {}, {
      headers: {
        Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching visited gyms:', error);
    throw error;
  }
}



export const fetchUserRatings = async (gymId) => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.get(`${BASE_URL}/rating/gym/${gymId}`, {}, {
      headers: {
        Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching visited gyms:', error);
    throw error;
  }
}





export const deleteUserAccount = async () => {
  try {
    const userToken = await AsyncStorage.getItem('authToken'); // Fetch token if needed
    const response = await axios.delete(`${BASE_URL}/users/deleteaccount`,  {
      headers: {
        Authorization: `Bearer ${userToken}`,  // Add the Bearer token here
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleteing user account:', error);
    throw error;
  }
}


