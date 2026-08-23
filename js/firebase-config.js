/**
 * ============================================================
 * CSA — FIREBASE CONFIG
 * ============================================================
 * Replace the values below with your own Firebase project config.
 * Find these in: Firebase Console → Project Settings → General → Your apps
 *
 * Firestore collections used:
 *   officers    { name, role, email, photoURL, order }
 *   events      { title, description, date (Timestamp), time, location, category, imageURL }
 *   gallery     { title, category, imageURL, createdAt (Timestamp) }
 *   meetings    { number, title, date (Timestamp), slidesEmbedURL, slides: [] }
 * ============================================================
 */

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const db      = firebase.firestore();
const storage = firebase.storage();

// Expose globally so page scripts can use them
window.db      = db;
window.storage = storage;
