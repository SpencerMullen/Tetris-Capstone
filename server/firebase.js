// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyB8AnM1TOBiIco8O2AuyHgAYyA4CRQuH58",
    authDomain: "tetris-capstone.firebaseapp.com",
    databaseURL: "https://tetris-capstone.firebaseio.com",
    projectId: "tetris-capstone",
    storageBucket: "tetris-capstone.appspot.com",
    messagingSenderId: "645263414065",
    appId: "1:645263414065:web:1cef601e00f539f2d31610"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// // Create Test User
// firebase.auth().createUserWithEmailAndPassword("miguelaroberts09@gmail.com", "password123").catch(function(error) {
//     // Handle Errors here.
//     var errorCode = error.code;
//     var errorMessage = error.message;
//     // ...
//   });
firebase.auth().signInWithEmailAndPassword("miguelaroberts09@gmail.com", "password123").catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
});