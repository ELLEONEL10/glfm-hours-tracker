import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './config';

const emailDomain = import.meta.env.VITE_EMAIL_DOMAIN || '@glfm.app';
const toEmail = (username) => `${username}${emailDomain}`;

export const signIn = (username, password) => {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithEmailAndPassword(auth, toEmail(username), password);
};

export const signUp = (username, password) => {
  if (!auth) throw new Error('Firebase not configured');
  return createUserWithEmailAndPassword(auth, toEmail(username), password);
};

export const logOut = () => {
  if (!auth) return;
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const resetPassword = (username) => {
  if (!auth) throw new Error('Firebase not configured');
  return sendPasswordResetEmail(auth, toEmail(username));
};
