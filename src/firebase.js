import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAGuNnArTYBtLzyvnHu4dPBN5EsiVmQez0",
  authDomain: "poblacioncityview26.firebaseapp.com",
  projectId: "poblacioncityview26",
  storageBucket: "poblacioncityview26.firebasestorage.app",
  messagingSenderId: "536458142854",
  appId: "1:536458142854:web:5e39bcfdf9de408dd71d07",
  measurementId: "G-73V2YLMQ1M"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
