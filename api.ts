import { UserProfile, SymptomRecord, ForumPost, LibraryItem, DailyTip, UserRole, AppNotification } from "./types";
import { MOCK_USER, MOCK_POSTS, DAILY_TIPS } from "./constants";
import { db, doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, deleteDoc, updateDoc, onSnapshot } from "./firebase";

// --- User Profile ---
export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    } else {
      // Create default profile if not exists
      const defaultProfile: UserProfile = { ...MOCK_USER, role: 'user', maintenanceStatus: 'system' };
      // Don't await this, let it happen in background
      setDoc(userRef, defaultProfile);
      return defaultProfile;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return MOCK_USER;
  }
};

export const saveUserProfile = async (userId: string, profile: UserProfile): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, profile, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving profile:", error);
    return false;
  }
};

export const deleteUserAccount = async (userId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "users", userId));
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
};

// --- Symptom Tracker ---
export const saveSymptomLog = async (userId: string, log: Omit<SymptomRecord, 'id'>): Promise<boolean> => {
  try {
    const symptomsRef = collection(db, "users", userId, "symptoms");
    // Use timestamp as ID for sorting
    const id = new Date().getTime(); 
    await setDoc(doc(symptomsRef, id.toString()), { ...log, id });
    return true;
  } catch (error) {
    console.error("Error saving symptom:", error);
    return false;
  }
};

export const fetchSymptomHistory = async (userId: string): Promise<SymptomRecord[]> => {
  try {
    const symptomsRef = collection(db, "users", userId, "symptoms");
    const snapshot = await getDocs(symptomsRef);
    const data = snapshot.docs.map(doc => doc.data() as SymptomRecord);
    
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    return [];
  }
};

// --- Community (Forum) ---
export const fetchForumPosts = async (): Promise<ForumPost[]> => {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("id", "desc")); // Assuming 'id' is timestamp-based
    const snapshot = await getDocs(q);
    
    // Return empty array if no posts, do NOT fallback to mock data
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => doc.data() as ForumPost);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const createForumPost = async (post: Omit<ForumPost, 'id' | 'likes' | 'replies' | 'timestamp'>): Promise<boolean> => {
  try {
    const id = new Date().getTime();
    const newPost: ForumPost = {
      ...post,
      id,
      likes: 0,
      replies: 0,
      timestamp: new Date().toLocaleDateString('fa-IR'),
    };

    await setDoc(doc(db, "posts", id.toString()), newPost);
    return true;
  } catch (error) {
    console.error("Error creating post:", error);
    return false;
  }
};

export const deleteForumPost = async (postId: number): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "posts", postId.toString()));
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    return false;
  }
};

// --- Library ---
export const fetchLibraryContent = async (): Promise<LibraryItem[]> => {
  try {
    const snapshot = await getDocs(collection(db, "library"));
    return snapshot.docs.map(doc => doc.data() as LibraryItem);
  } catch (error) {
    return [];
  }
};

export const addLibraryItem = async (item: Omit<LibraryItem, 'id'>): Promise<boolean> => {
  try {
    const id = new Date().getTime();
    await setDoc(doc(db, "library", id.toString()), { ...item, id });
    return true;
  } catch (error) {
    return false;
  }
};

// --- Dashboard Tips ---
export const fetchDailyTips = async (): Promise<DailyTip[]> => {
  try {
    const snapshot = await getDocs(collection(db, "tips"));
    if (snapshot.empty) return DAILY_TIPS;
    return snapshot.docs.map(doc => doc.data() as DailyTip);
  } catch (error) {
    return DAILY_TIPS;
  }
};

// --- Notifications ---

export const sendNotification = async (notification: Omit<AppNotification, 'id'>): Promise<boolean> => {
  try {
    const id = new Date().getTime().toString();
    await setDoc(doc(db, "notifications", id), { ...notification, id });
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};

export const subscribeToNotifications = (userId: string, callback: (notifications: AppNotification[]) => void) => {
  const q = query(
    collection(db, "notifications"),
    orderBy("date", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const allNotifications = snapshot.docs.map(doc => doc.data() as AppNotification);
    
    // Filter: Show global notifications ('all') AND notifications specific to this user
    const userNotifications = allNotifications.filter(n => 
      n.target === 'all' || n.target === userId
    );
    
    callback(userNotifications);
  });
};

// --- Admin & System Functions ---

export const fetchAllUsers = async (): Promise<{id: string, profile: UserProfile}[]> => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      profile: doc.data() as UserProfile
    }));
  } catch (error) {
    return [];
  }
};

export const updateUserRole = async (targetUserId: string, newRole: UserRole): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", targetUserId);
    await updateDoc(userRef, { role: newRole });
    return true;
  } catch (error) {
    return false;
  }
};

export const banUser = async (targetUserId: string, isBanned: boolean): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", targetUserId);
    await updateDoc(userRef, { isBanned });
    return true;
  } catch (error) {
    return false;
  }
};

export const updateUserMaintenanceStatus = async (targetUserId: string, status: 'system' | 'enabled' | 'disabled'): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", targetUserId);
    await updateDoc(userRef, { maintenanceStatus: status });
    return true;
  } catch (error) {
    return false;
  }
};

export const sendGlobalNotification = async (message: string): Promise<boolean> => {
  // Deprecated in favor of sendNotification, keeping for backward compat if any
  return sendNotification({
    title: 'پیام سیستم',
    message,
    type: 'info',
    date: new Date().toISOString(),
    target: 'all'
  });
};

// --- System Maintenance ---

export const checkForAppUpdates = async (currentVersion: string): Promise<string | null> => {
  try {
    const docRef = doc(db, "system", "metadata");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const serverVersion = docSnap.data().version;
      if (serverVersion && serverVersion !== currentVersion) {
        return serverVersion;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const subscribeToSystemStatus = (callback: (isMaintenance: boolean) => void) => {
    const docRef = doc(db, "system", "metadata");
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data().maintenance === true);
        } else {
            callback(false);
        }
    });
};

export const wipeServerData = async (): Promise<boolean> => {
  // This is dangerous and should be handled by a Cloud Function in reality
  console.warn("WIPING SERVER DATA REQUESTED");
  // For safety in this code, we won't implement actual mass deletion here to avoid accidents
  // Real implementation would loop through collections and batch delete
  return true; 
};

export const toggleMaintenanceMode = async (enabled: boolean): Promise<boolean> => {
   try {
    const docRef = doc(db, "system", "metadata");
    await setDoc(docRef, { maintenance: enabled }, { merge: true });
    return true;
  } catch (error) {
    return false;
  }
};