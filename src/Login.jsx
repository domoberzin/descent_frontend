import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import { API_URL } from './config';
import firebase from './firebaseConfig';

const Login = ({ isModalOpen, toggleModal, user, setUser }) => {
  const modalRef = useRef(null);

  const fetchUserData = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ "idToken": token }),
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData);
        // Handle the user data (e.g., store it in state or context)
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        toggleModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isModalOpen, toggleModal]);

  useEffect(() => {
    const checkAndFetchUserData = async () => {
      if (user) {
        const token = await user.getIdToken();
        const existingToken = Cookies.get('authToken');
        if (token !== existingToken) {
          Cookies.set('authToken', token, { expires: 7 });
          fetchUserData(token);
        }
      } else {
        Cookies.remove('authToken');
      }
    };

    checkAndFetchUserData();
  }, [user, fetchUserData]);

  const signIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        console.log('Sign-in successful', result.user);
        setUser(result.user);
        toggleModal();
      })
      .catch((error) => {
        console.error('Sign-in error', error);
      });
  };

  const handleSignOut = () => {
    firebase.auth().signOut().then(() => {
      console.log('Signed out successfully');
      setUser(null);
      toggleModal();
    }).catch((error) => {
      console.error('Sign out error', error);
    });
  };

  if (!isModalOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div ref={modalRef} className="relative bg-white dark:bg-gray-800 w-full max-w-md mx-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {user ? 'User Profile' : 'Sign In'}
          </h3>
          <button 
            type="button" 
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={toggleModal}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className="p-6">
          {user ? (
            <div>
              <p>Welcome, {user.displayName}!</p>
              <p>Email: {user.email}</p>
              <button 
                onClick={handleSignOut}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="px-4 py-2 border flex gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150"
            >
              <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
              <span>Login with Google</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default Login;