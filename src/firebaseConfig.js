import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCCZqHudnhfoO8zWxuYusxkH0kutSuC7lc",
  authDomain: "descent-a60f2.firebaseapp.com",
  projectId: "descent-a60f2",
  storageBucket: "descent-a60f2.appspot.com",
  messagingSenderId: "965184225429",
  appId: "1:965184225429:web:9054a69214752774901b9c"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;