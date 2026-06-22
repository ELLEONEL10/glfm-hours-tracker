import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';

const USERS = 'users';
const ENTRIES = 'entries';

function requireDb() {
  if (!db) throw new Error('Firebase not configured');
}

// --- Users ---

export const createUserDoc = (uid, data) => {
  requireDb();
  return setDoc(doc(db, USERS, uid), {
    username: data.username,
    fullname: data.fullname,
    role: data.role,
    created: serverTimestamp(),
  });
};

export const getUsers = () => {
  requireDb();
  return getDocs(collection(db, USERS));
};

export const onUsersSnapshot = (cb) => {
  requireDb();
  return onSnapshot(collection(db, USERS), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const getUserDoc = (uid) => {
  requireDb();
  return getDoc(doc(db, USERS, uid));
};

export const deleteUserDoc = (uid) => {
  requireDb();
  return deleteDoc(doc(db, USERS, uid));
};

// --- Entries ---

export const createEntry = (data) => {
  requireDb();
  return addDoc(collection(db, ENTRIES), {
    ...data,
    created: serverTimestamp(),
  });
};

export const updateEntry = (id, data) => {
  requireDb();
  return updateDoc(doc(db, ENTRIES, id), data);
};

export const deleteEntryDoc = (id) => {
  requireDb();
  return deleteDoc(doc(db, ENTRIES, id));
};

export const onEntriesSnapshot = (cb) => {
  requireDb();
  return onSnapshot(collection(db, ENTRIES), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};
