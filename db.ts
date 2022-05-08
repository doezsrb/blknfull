import firebase from 'firebase';
const firebaseConfig = {
    apiKey: "AIzaSyD21QZgnE5ta7hzEU4oHIhhu9hFXvM7TUI",
    authDomain: "balkan-dating.firebaseapp.com",
    projectId: "balkan-dating",
    storageBucket: "balkan-dating.appspot.com",
    messagingSenderId: "1076018454998",
    databaseURL:"https://balkan-dating-default-rtdb.europe-west1.firebasedatabase.app/",
    appId: "1:1076018454998:web:45b8129108a8151c750477",
    measurementId: "G-Y3DDJRB0W9"
  };


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
 }else {
    firebase.app(); 
 }
 const database = firebase.database();
export default database;