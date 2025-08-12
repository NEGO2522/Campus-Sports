import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const isProfileComplete = async (userId) => {
  try {
    if (!userId) return false;
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    return !!userData.profileCompleted;
  } catch (error) {
    console.error('Error checking profile status:', error);
    return false;
  }
};
