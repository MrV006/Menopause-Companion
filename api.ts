
import { UserProfile, SymptomRecord, ForumPost, LibraryItem, DailyTip, UserRole, AppNotification, Reply, Report } from "./types";
import { MOCK_USER, MOCK_POSTS, DAILY_TIPS } from "./constants";
import { db, doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, deleteDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove, where } from "./firebase";

// Helper for error handling
const handleFirestoreError = (error: any, context: string) => {
    // Only log if it's NOT a connection/offline error to keep console clean for user
    if (error?.code !== 'unavailable' && error?.code !== 'failed-precondition') {
        console.error(`Error in ${context}:`, error);
    } else {
        // Silent fail for offline mode
        console.warn(`Offline: ${context}`);
    }
};

// --- User Profile ---
export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      // Update local backup
      localStorage.setItem(`user_profile_${userId}`, JSON.stringify(data));
      return data;
    } else {
      // Check local backup before returning default
       const cached = localStorage.getItem(`user_profile_${userId}`);
       if (cached) return JSON.parse(cached);

      const defaultProfile: UserProfile = { ...MOCK_USER, role: 'user', maintenanceStatus: 'system' };
      setDoc(userRef, defaultProfile).catch(() => {});
      return defaultProfile;
    }
  } catch (error: any) {
    handleFirestoreError(error, 'fetchUserProfile');
    
    // Try local backup on error
    const cached = localStorage.getItem(`user_profile_${userId}`);
    if (cached) return JSON.parse(cached);

    // Return mock user so app loads even if offline/blocked
    return MOCK_USER;
  }
};

export const saveUserProfile = async (userId: string, profile: UserProfile): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, profile, { merge: true });
    // Backup to localStorage
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profile));
    return true;
  } catch (error) {
    // Save to local even if firestore fails
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profile));
    handleFirestoreError(error, 'saveUserProfile');
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
    const id = new Date().getTime(); 
    await setDoc(doc(symptomsRef, id.toString()), { ...log, id });
    return true;
  } catch (error) {
    handleFirestoreError(error, 'saveSymptomLog');
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
    handleFirestoreError(error, 'fetchSymptomHistory');
    return [];
  }
};

export const hasLoggedToday = async (userId: string): Promise<boolean> => {
    try {
        const symptomsRef = collection(db, "users", userId, "symptoms");
        const today = new Date().toISOString().split('T')[0];
        const snapshot = await getDocs(symptomsRef);
        return snapshot.docs.some(doc => {
            const data = doc.data();
            return data.date.startsWith(today);
        });
    } catch (error) {
        return false;
    }
}

// --- Community (Forum) ---
export const fetchForumPosts = async (): Promise<ForumPost[]> => {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("id", "desc")); 
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => {
        const data = doc.data() as ForumPost;
        return {
            ...data,
            likedBy: data.likedBy || [],
            repliesList: data.repliesList || []
        };
    });
  } catch (error) {
    handleFirestoreError(error, 'fetchForumPosts');
    return [];
  }
};

export const createForumPost = async (post: Omit<ForumPost, 'id' | 'likes' | 'replies' | 'timestamp' | 'likedBy'>): Promise<boolean> => {
  try {
    const id = new Date().getTime();
    const newPost: ForumPost = {
      ...post,
      id,
      likes: 0,
      replies: 0,
      likedBy: [],
      repliesList: [],
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

export const toggleLikePost = async (postId: number, userId: string, isLiking: boolean): Promise<boolean> => {
    try {
        const postRef = doc(db, "posts", postId.toString());
        if (isLiking) {
            await updateDoc(postRef, { likedBy: arrayUnion(userId), likes: 1 });
        } else {
             await updateDoc(postRef, { likedBy: arrayRemove(userId) });
        }
        return true;
    } catch (error) { return false; }
}

export const addReplyToPost = async (postId: number, reply: Reply): Promise<boolean> => {
    try {
        const postRef = doc(db, "posts", postId.toString());
        await updateDoc(postRef, { repliesList: arrayUnion(reply), replies: 1 });
        return true;
    } catch (error) { return false; }
}

export const reportPost = async (report: Report): Promise<boolean> => {
    try {
        await setDoc(doc(db, "reports", report.id), report);
        return true;
    } catch (error) { return false; }
}

export const fetchReports = async (): Promise<Report[]> => {
    try {
        const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as Report);
    } catch (error) { return []; }
}

export const deleteReport = async (reportId: string): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, "reports", reportId));
        return true;
    } catch (error) { return false; }
}

// --- Library ---
export const fetchLibraryContent = async (): Promise<LibraryItem[]> => {
  try {
    const snapshot = await getDocs(collection(db, "library"));
    return snapshot.docs.map(doc => doc.data() as LibraryItem);
  } catch (error) { return []; }
};

export const addLibraryItem = async (item: Omit<LibraryItem, 'id'>): Promise<boolean> => {
  try {
    const id = new Date().getTime();
    await setDoc(doc(db, "library", id.toString()), { ...item, id });
    return true;
  } catch (error) { return false; }
};

export const deleteLibraryItem = async (itemId: number): Promise<boolean> => {
    try {
        await deleteDoc(doc(db, "library", itemId.toString()));
        return true;
    } catch (error) { return false; }
}

export const updateLibraryItem = async (itemId: number, item: Partial<LibraryItem>): Promise<boolean> => {
    try {
        await updateDoc(doc(db, "library", itemId.toString()), item);
        return true;
    } catch (error) { return false; }
}


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
  } catch (error) { return false; }
};

export const subscribeToNotifications = (userId: string, callback: (notifications: AppNotification[]) => void) => {
  const q = query(collection(db, "notifications"), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const allNotifications = snapshot.docs.map(doc => doc.data() as AppNotification);
    const userNotifications = allNotifications.filter(n => n.target === 'all' || n.target === userId);
    callback(userNotifications);
  }, (error) => {
      // Silent error for snapshot
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
  } catch (error) { return []; }
};

export const updateUserRole = async (targetUserId: string, newRole: UserRole): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", targetUserId);
    await updateDoc(userRef, { role: newRole });
    return true;
  } catch (error) { return false; }
};

export const banUser = async (targetUserId: string, isBanned: boolean): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", targetUserId);
    await updateDoc(userRef, { isBanned });
    return true;
  } catch (error) { return false; }
};

export const updateUserMaintenanceStatus = async (targetUserId: string, status: 'system' | 'enabled' | 'disabled'): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", targetUserId);
    await updateDoc(userRef, { maintenanceStatus: status });
    return true;
  } catch (error) { return false; }
};

export const checkForAppUpdates = async (currentVersion: string): Promise<string | null> => {
  try {
    const docRef = doc(db, "system", "metadata");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const serverVersion = docSnap.data().version;
      if (serverVersion && serverVersion !== currentVersion) return serverVersion;
    }
    return null;
  } catch (error) { return null; }
};

export const subscribeToSystemStatus = (callback: (isMaintenance: boolean) => void) => {
    const docRef = doc(db, "system", "metadata");
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data().maintenance === true);
        } else {
            callback(false);
        }
    }, () => callback(false));
};

export const wipeServerData = async (): Promise<boolean> => {
  console.warn("WIPING SERVER DATA REQUESTED");
  return true; 
};

export const toggleMaintenanceMode = async (enabled: boolean): Promise<boolean> => {
   try {
    const docRef = doc(db, "system", "metadata");
    await setDoc(docRef, { maintenance: enabled }, { merge: true });
    return true;
  } catch (error) { return false; }
};
