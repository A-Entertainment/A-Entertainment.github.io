
/* =========================================================
   A - ENTERTAINMENT
   FIREBASE CONFIGURATION
========================================================= */

/*
   IMPORTANT:
   Replace these values with the configuration
   from your Firebase project.

   Firebase Console:
   Project Settings
   → Your apps
   → Web app
   → Firebase SDK snippet
*/

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyCPbhkaHenNHV1vfGrEkHH61FodLd-7LCs",
    authDomain: "a---entertainment.firebaseapp.com",
    projectId: "a---entertainment",
    storageBucket: "a---entertainment.firebasestorage.app",
    messagingSenderId: "670035608618",
    appId: "1:670035608618:web:da57aecae3c6c25fc72f53"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);


/* =========================================================
   SERVICES
========================================================= */

const auth =
    getAuth(app);

const db =
    getFirestore(app);


/* =========================================================
   EXPORT
========================================================= */

export {
    app,
    auth,
    db
};
