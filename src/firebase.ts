import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD2SLDZpkOpFJIv04TZJbBMKVgW-LREyV0',
  authDomain: 'nicaknots.firebaseapp.com',
  projectId: 'nicaknots',
  storageBucket: 'nicaknots.firebasestorage.app',
  messagingSenderId: '1078284167360',
  appId: '1:1078284167360:web:d1c17646c82c039e546525',
};

export const ADMIN_EMAIL = 'veronica.willnat@gmail.com';

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
