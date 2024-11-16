import { initializeApp } from
"firebase/app";
import { getAnalytics } from "firebase/analytics"; 
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
//https://firebase.google.com/docs/web/setup#tavailable-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurement]d is optional
const firebaseConfig = {
apiKey: "AIzaSyBzSstU9WZo3h1MTOnSpSrvfkwoHE4zkYo", 
authDomain: "it33-system.firebaseapp.com", 
projectId: "it33-system",
storageBucket: "it33-system.firebasestorage.app" ,
messagingSenderId: "969902558297",
appId: "1:969902558297 :web: fb273f76efa24838823548", 
measurementId: "G-3XXE679W96",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics (app);
export const firestore = getFirestore(app);