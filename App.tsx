
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, ClipboardList, Users, BookOpen, UserCircle, Menu, RefreshCw, 
  LogIn, Save, User as UserIcon, X, LogOut, ChevronLeft, Shield, 
  Smartphone, Mail, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Bell, Info, Wrench, AlertOctagon, HeartHandshake, Loader2, Github, Phone, Play, Pause, Download, Zap, Check
} from 'lucide-react';
import { Tab, UserProfile, AppNotification } from './types';
import { MOCK_USER, COMMON_SYMPTOMS, GENERAL_WELLNESS_TIPS } from './constants';
import { fetchUserProfile, saveUserProfile, checkForAppUpdates, subscribeToNotifications, subscribeToSystemStatus, hasLoggedToday } from './api';
import Dashboard from './components/Dashboard';
import SymptomTracker from './components/SymptomTracker';
import Community from './components/Community';
import Library from './components/Library';
import AdminPanel from './components/AdminPanel';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
} from './firebase';

// Current App Version
const APP_VERSION = "1.3.2";

// --- Extracted Components to prevent re-renders ---

// 1. Profile Component
const Profile = ({ 
    user, 
    userId, 
    isAdminOrDev, 
    isEditingProfile, 
    setIsEditingProfile, 
    onSave, 
    setActiveTab 
}: any) => {
    // Local state for form to avoid parent re-renders on keystrokes
    const [localForm, setLocalForm] = useState<UserProfile>(user);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLocalForm(user);
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        await onSave(localForm);
        setLoading(false);
    };

    return (
    <div className="pb-24 px-4 py-6 w-full max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 text-center mb-6 relative">
         <div className="absolute top-4 left-4 text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded border dir-ltr" dir="ltr">
            ID: {userId?.substring(0,6)}...
         </div>
         
         {!isEditingProfile ? (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-pink-100 rounded-full mb-4 flex items-center justify-center text-primary text-4xl font-bold overflow-hidden border-4 border-white shadow-md">
                 {/* Only First Letter Logic */}
                 {user.name ? (
                    <span className="text-5xl">{user.name.charAt(0)}</span>
                 ) : (
                    <span>?</span>
                 )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  {user.name || "کاربر جدید"}
                  {isAdminOrDev && <Shield size={18} className="text-blue-500" />}
              </h2>
              
              <div className="flex flex-col items-center gap-1 mb-4">
                  <span className="text-gray-500 text-sm">{user.age ? `${user.age} ساله` : "سن نامشخص"}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'developer' ? 'bg-purple-100 text-purple-700' : user.role === 'super_admin' ? 'bg-red-100 text-red-700' : user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role === 'user' ? 'کاربر عادی' : user.role === 'subscriber' ? 'اشتراک ویژه' : user.role === 'admin' ? 'ادمین' : user.role === 'developer' ? 'برنامه‌نویس' : 'مدیر کل'}
                  </span>
              </div>

               {/* Dominant Symptoms Display */}
               <div className="w-full border-t border-gray-100 pt-3 mb-4">
                  <span className="text-xs font-bold text-gray-500 block mb-2">علائم غالب من</span>
                  <div className="flex flex-wrap gap-2 justify-center">
                      {user.dominantSymptoms?.length > 0 ? user.dominantSymptoms.map((s: string) => (
                          <span key={s} className="px-3 py-1 bg-pink-50 text-pink-700 text-xs rounded-full border border-pink-100">{s}</span>
                      )) : <span className="text-gray-400 text-sm">موردی ثبت نشده</span>}
                  </div>
               </div>
              
              <div className="flex gap-2 mt-2 justify-center">
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="text-primary text-sm font-bold border border-primary px-6 py-2 rounded-full hover:bg-pink-50 transition-colors"
                >
                  ویرایش پروفایل
                </button>
                {isAdminOrDev && (
                    <button 
                        onClick={() => setActiveTab(Tab.ADMIN)}
                        className="bg-primary text-white text-sm font-bold px-6 py-2 rounded-full hover:bg-pink-700 transition-colors flex items-center gap-1"
                    >
                        <Shield size={14} /> مدیریت
                    </button>
                )}
              </div>
            </div>
         ) : (
            <div className="space-y-4 text-right max-w-md mx-auto">
               <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                   <Info size={16} className="flex-shrink-0" />
                   لطفا اطلاعات خود را کامل کنید تا تجربه بهتری داشته باشید.
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نام نمایشی</label>
                  <input 
                    type="text" 
                    value={localForm.name} 
                    onChange={e => setLocalForm({...localForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  />
               </div>
               <div className="flex gap-3">
                   <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1">سن</label>
                      <input 
                        type="number" 
                        value={localForm.age} 
                        onChange={e => setLocalForm({...localForm, age: Number(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                      />
                   </div>
                   <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1">وزن (کیلوگرم)</label>
                      <input 
                        type="number" 
                        value={localForm.weight} 
                        onChange={e => setLocalForm({...localForm, weight: Number(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                      />
                   </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">وضعیت پریود</label>
                  <select 
                     value={localForm.periodStatus}
                     onChange={e => setLocalForm({...localForm, periodStatus: e.target.value as any})}
                     className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                  >
                     <option value="منظم">منظم</option>
                     <option value="نامنظم">نامنظم</option>
                     <option value="قطع شده (یائسه)">قطع شده (یائسه)</option>
                  </select>
               </div>

               {/* Dominant Symptoms Selection */}
               <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">علائم غالب (انتخاب کنید)</label>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_SYMPTOMS.map((s: string) => {
                            const isSelected = localForm.dominantSymptoms?.includes(s);
                            return (
                                <button
                                    key={s}
                                    onClick={() => {
                                        const current = localForm.dominantSymptoms || [];
                                        if (current.includes(s)) {
                                            setLocalForm({...localForm, dominantSymptoms: current.filter((i:string) => i !== s)});
                                        } else {
                                            setLocalForm({...localForm, dominantSymptoms: [...current, s]});
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1.5 ${
                                        isSelected 
                                        ? 'bg-primary text-white border-primary shadow-md ring-1 ring-pink-300' 
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50 hover:text-primary hover:bg-pink-50'
                                    }`}
                                >
                                    {isSelected && <Check size={12} className="text-white" />}
                                    {s}
                                </button>
                            );
                        })}
                    </div>
               </div>
               
               <div className="flex gap-2 pt-4">
                 <button 
                   onClick={handleSave}
                   disabled={loading}
                   className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm flex justify-center items-center gap-2 shadow-lg shadow-pink-200 hover:bg-pink-700 transition-colors active:scale-95"
                 >
                   {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                   ذخیره
                 </button>
                 {user.name && user.name !== "کاربر جدید" && (
                    <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                    انصراف
                    </button>
                 )}
               </div>
            </div>
         )}
      </div>
    </div>
    );
};

// 2. Global Audio Player Component
const GlobalAudioPlayer = ({ currentAudio, onClose, isPlaying, onTogglePlay }: { currentAudio: any, onClose: () => void, isPlaying: boolean, onTogglePlay: () => void }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Play fail", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentAudio]);

    const changeSpeed = () => {
        const newRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : playbackRate === 2 ? 0.5 : 1;
        if (audioRef.current) {
            audioRef.current.playbackRate = newRate;
            setPlaybackRate(newRate);
        }
    };

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-auto max-w-sm">
            <div className="bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-white/20">
                <button onClick={onTogglePlay} className="p-1 hover:text-pink-400 transition-colors">
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
                
                <div className="flex flex-col min-w-[120px] max-w-[200px]">
                    <span className="text-xs font-bold truncate">{currentAudio.title}</span>
                    <span className="text-[10px] text-gray-400 truncate">{currentAudio.author}</span>
                </div>

                <button onClick={changeSpeed} className="text-xs font-mono font-bold w-8 hover:text-pink-400">
                    {playbackRate}x
                </button>

                <a href={currentAudio.url} download target="_blank" rel="noreferrer" className="hover:text-pink-400">
                    <Download size={18} />
                </a>

                <button onClick={onClose} className="text-gray-500 hover:text-white border-r border-gray-700 pr-2 mr-1">
                    <X size={16} />
                </button>

                <audio 
                    ref={audioRef} 
                    src={currentAudio.url} 
                    onEnded={() => onTogglePlay()} // Call pause when ended
                    className="hidden" 
                />
            </div>
        </div>
    );
};

// 3. Update Banner Component
const UpdateBanner = ({ version, onUpdate }: { version: string, onUpdate: () => void }) => (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-down sticky top-0 z-[70]">
        <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-300 animate-pulse" />
            <div className="text-sm font-bold">نسخه جدید در دسترس است ({version})</div>
        </div>
        <button 
            onClick={onUpdate}
            className="bg-white text-purple-700 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-2"
        >
            <RefreshCw size={14} />
            بروزرسانی و پاکسازی
        </button>
    </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // System State
  const [isGlobalMaintenance, setIsGlobalMaintenance] = useState(false);
  const [isSystemLoading, setIsSystemLoading] = useState(true); // Prevent flashing
  const [availableUpdate, setAvailableUpdate] = useState<string | null>(null);

  // --- Auth State ---
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone'); // Tab switcher
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login'); // Logic switcher
  
  const [identifier, setIdentifier] = useState(''); // Phone number or Email address
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Audio Player State
  const [currentAudio, setCurrentAudio] = useState<{url: string, title: string, author: string} | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    // Maintenance Listener
    const sysUnsub = subscribeToSystemStatus((status) => {
        setIsGlobalMaintenance(status);
        setIsSystemLoading(false); // Valid status received
    });

    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
        setIsAuthenticated(true);
        // Pass email to check for developer role
        loadUserData(currentUser.uid, currentUser.email);
        
        // Subscribe to notifications
        const notifUnsub = subscribeToNotifications(currentUser.uid, (notifs) => {
            setNotifications(prev => {
                // Merge local generated notifications with server ones if needed, 
                // but here we just replace for simplicity, the daily logic adds to local state below
                return notifs;
            });
            // Update badge
            const lastRead = localStorage.getItem('last_read_notif_time');
            if (lastRead) {
                const count = notifs.filter(n => new Date(n.date).getTime() > parseInt(lastRead)).length;
                setUnreadCount(count);
            } else {
                setUnreadCount(notifs.length);
            }
        });
        
        // Check Daily Status on Load
        checkDailyStatus(currentUser.uid);
        
        return () => notifUnsub();

      } else {
        setUserId(null);
        setIsAuthenticated(false);
        setUser(MOCK_USER);
      }
    });

    // Auto Update Checker (Every 30 seconds for smoother check)
    const updateInterval = setInterval(async () => {
        const newVersion = await checkForAppUpdates(APP_VERSION);
        if (newVersion) {
             setAvailableUpdate(newVersion);
        }
    }, 30000);

    return () => {
        unsubscribe();
        sysUnsub();
        clearInterval(updateInterval);
    }
  }, []);

  const loadUserData = async (id: string, email: string | null) => {
    setLoading(true);
    let userData = await fetchUserProfile(id);
    
    // Auto-assign developer role
    if (email === 'developer@app.com' && userData.role !== 'developer') {
        userData = { ...userData, role: 'developer' };
        await saveUserProfile(id, userData);
    }

    // Role Immunity Logic for Ban
    const isImmune = userData.role === 'developer' || userData.role === 'super_admin';
    
    if (userData.isBanned && !isImmune) {
      // Don't sign out immediately, let the UI render the banned screen
    }
    
    setUser(userData);
    
    // Check if new user (First time login / incomplete profile)
    if (userData.age === 0 || !userData.name || userData.name === "کاربر جدید") {
        setActiveTab(Tab.PROFILE);
        setIsEditingProfile(true);
    }
    
    setLoading(false);
  };

  const checkDailyStatus = async (uid: string) => {
      // Logic: If user hasn't logged today, add a local notification.
      // If they HAVE logged, add a "Good job" local notification.
      const logged = await hasLoggedToday(uid);
      const todayStr = new Date().toLocaleDateString('fa-IR');
      
      const newNotif: AppNotification = {
          id: `daily_${new Date().toISOString().split('T')[0]}`,
          title: logged ? "وضعیت ثبت شده ✅" : "یادآوری روزانه 📝",
          message: logged 
            ? `آفرین! وضعیت امروزت رو ثبت کردی. ${GENERAL_WELLNESS_TIPS[Math.floor(Math.random() * GENERAL_WELLNESS_TIPS.length)]}`
            : "هنوز وضعیت امروزت رو ثبت نکردی. همین الان اقدام کن تا نمودارهات دقیق‌تر باشن.",
          type: logged ? 'success' : 'warning',
          target: uid,
          date: new Date().toISOString()
      };

      // We add this to state locally (it won't be in firebase, just for this session)
      setNotifications(prev => {
          // Prevent duplicate daily notifs
          const exists = prev.find(n => n.id === newNotif.id);
          if (exists) return prev;
          return [newNotif, ...prev];
      });
      
      if (!logged) setUnreadCount(prev => prev + 1);
  };

  const handlePerformUpdate = async () => {
      if (window.confirm("برنامه بروزرسانی خواهد شد. آیا ادامه می‌دهید؟")) {
          // 1. Clear Service Workers
          if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const registration of registrations) {
                  await registration.unregister();
              }
          }
          // 2. Clear Caches (Files)
          if ('caches' in window) {
              const keys = await caches.keys();
              await Promise.all(keys.map(key => caches.delete(key)));
          }
          // 3. Clear LocalStorage keys related to versioning if exists (Safe)
          // We generally keep user settings, but cache keys should go
          
          // 4. Force Reload
          window.location.reload();
      }
  };

  const handleOpenNotifications = () => {
      setShowNotifications(!showNotifications);
      if (!showNotifications) {
          // Mark as read when opening
          setUnreadCount(0);
          localStorage.setItem('last_read_notif_time', new Date().getTime().toString());
      }
  };

  // --- Auth Logic Helpers ---
  const getFormattedEmail = () => {
    if (authMethod === 'email') {
        return identifier.trim();
    } else {
        const digits = identifier.replace(/\D/g, ''); 
        const cleanPhone = digits.startsWith('0') ? digits.substring(1) : digits;
        return `${cleanPhone}@menopause-app.local`;
    }
  };

  const handleAuthError = (error: any) => {
    console.error("Auth Error:", error.code);
    let message = "خطایی رخ داده است.";
    
    switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            message = "اطلاعات ورود (نام کاربری یا رمز عبور) اشتباه است.";
            break;
        case 'auth/email-already-in-use':
            message = "این شماره یا ایمیل قبلاً ثبت شده است.";
            break;
        case 'auth/invalid-email':
            message = "فرمت ایمیل یا شماره موبایل صحیح نیست.";
            break;
        case 'auth/weak-password':
            message = "رمز عبور باید حداقل ۶ کاراکتر باشد.";
            break;
        case 'auth/too-many-requests':
            message = "تعداد تلاش‌های ناموفق زیاد است. لطفا چند دقیقه دیگر تلاش کنید.";
            break;
        case 'auth/network-request-failed':
            message = "خطای اتصال به اینترنت. لطفا اتصال خود را بررسی کنید.";
            break;
    }
    setAuthError(message);
  };

  const handleAuthAction = async () => {
      setAuthError(null);
      if (!identifier || !password) {
          setAuthError("لطفا نام کاربری و رمز عبور را وارد کنید.");
          return;
      }
      setAuthLoading(true);
      const email = getFormattedEmail();
      try {
          if (authMode === 'login') {
              await signInWithEmailAndPassword(auth, email, password);
          } else {
              await createUserWithEmailAndPassword(auth, email, password);
          }
      } catch (error: any) {
          handleAuthError(error);
      } finally {
          setAuthLoading(false);
      }
  };

  const handleGuestLogin = async () => {
      setAuthLoading(true);
      try {
          await signInAnonymously(auth);
      } catch (error: any) {
          handleAuthError(error);
      } finally {
          setAuthLoading(false);
      }
  };

  const handleSaveProfile = async (newProfile: UserProfile) => {
    if (!userId) return;
    const success = await saveUserProfile(userId, newProfile);
    if (success) {
      setUser(newProfile);
      setIsEditingProfile(false);
    } else {
      alert("خطا در ذخیره پروفایل");
    }
  };

  const handleLogout = () => {
    if(window.confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
       signOut(auth);
       setIsSidebarOpen(false);
       setIdentifier('');
       setPassword('');
       setAuthError(null);
       setCurrentAudio(null);
       setIsAudioPlaying(false);
    }
  };

  const navigateFromSidebar = (tab: Tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const handlePlayAudio = (url: string, title: string, author: string) => {
      setCurrentAudio({ url, title, author });
      setIsAudioPlaying(true);
  };

  const handlePauseAudio = () => {
      setIsAudioPlaying(false);
  };

  const isAdminOrDev = ['admin', 'super_admin', 'developer'].includes(user.role);
  const isImmune = user.role === 'developer' || user.role === 'super_admin';

  // --- LOADING SCREEN (PREVENTS FLASH) ---
  if (isSystemLoading || (isAuthenticated && loading)) {
      return (
          <div className="min-h-screen bg-pink-50 flex items-center justify-center">
              <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-primary font-bold">در حال بارگذاری...</p>
              </div>
          </div>
      );
  }

  // --- MAINTENANCE & BAN CHECKS ---
  
  if (isAuthenticated && user.isBanned && !isImmune) {
      return (
          <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-b-4 border-red-500">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                      <Lock size={40} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">حساب مسدود شده</h1>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                      دسترسی شما به اپلیکیشن محدود شده است. اگر فکر می‌کنید اشتباهی رخ داده، با پشتیبانی تماس بگیرید.
                  </p>
                  <div className="bg-gray-100 p-3 rounded-lg mb-6">
                      <span className="text-xs text-gray-500 block mb-1">شناسه کاربری شما:</span>
                      <code className="text-sm font-mono font-bold select-all dir-ltr block">{userId}</code>
                  </div>
                  <button onClick={() => signOut(auth)} className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors">
                      خروج از حساب
                  </button>
              </div>
          </div>
      );
  }

  const isUserForcedMaintenance = user.maintenanceStatus === 'enabled';
  const isUserExemptMaintenance = user.maintenanceStatus === 'disabled';
  
  const showMaintenanceScreen = !isImmune && (
      isUserForcedMaintenance || 
      (isGlobalMaintenance && !isUserExemptMaintenance)
  );

  if (isAuthenticated && showMaintenanceScreen) {
      return (
          <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-b-4 border-amber-400">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                      <Wrench size={40} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">در حال بروزرسانی</h1>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                      سامانه در حال تعمیر و ارتقا می‌باشد. لطفا شکیبا باشید. به زودی برمی‌گردیم.
                  </p>
                  {isUserForcedMaintenance && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mb-4">
                          وضعیت حساب شما در حالت تعمیر اختصاصی قرار دارد.
                      </p>
                  )}
                  <button onClick={() => window.location.reload()} className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                      <RefreshCw size={18} /> تلاش مجدد
                  </button>
                  <button onClick={() => signOut(auth)} className="w-full text-gray-400 text-sm mt-4 hover:text-gray-600">
                      خروج موقت
                  </button>
              </div>
          </div>
      );
  }

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
        
        {/* Right Side - Image & Branding (Desktop Only) */}
        <div className="hidden lg:flex w-1/2 relative bg-primary items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop" 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-60 mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
            </div>
            
            <div className="relative z-10 text-white p-12 max-w-lg text-center backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 shadow-2xl">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/50 mx-auto mb-6 shadow-inner">
                    <HeartHandshake size={48} className="text-white" />
                </div>
                <h2 className="text-4xl font-extrabold mb-4 drop-shadow-md">همدم یائسگی</h2>
                <p className="text-lg text-white/90 leading-relaxed font-light mb-6">
                    "مسیر سلامتی شما در دستان امن ما. همراهی مطمئن برای روزهای تغییر."
                </p>
                <div className="flex gap-4 justify-center text-sm text-white/70">
                    <span className="flex items-center gap-1"><CheckCircle size={14}/> امنیت کامل</span>
                    <span className="flex items-center gap-1"><CheckCircle size={14}/> مشاوره هوشمند</span>
                    <span className="flex items-center gap-1"><CheckCircle size={14}/> جامعه پویا</span>
                </div>
            </div>
        </div>

        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-pink-50/30">
            <div className="w-full max-w-md">
                
                {/* Mobile Header (Only visible on small screens) */}
                <div className="lg:hidden text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-pink-200">
                        <HeartHandshake size={32} className="text-white -rotate-3" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">همدم یائسگی</h1>
                    <p className="text-gray-500 text-sm">ورود امن به حساب کاربری</p>
                </div>

                {/* Desktop Form Header */}
                <div className="hidden lg:block mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">خوش آمدید 👋</h1>
                    <p className="text-gray-500">لطفا برای ادامه وارد حساب کاربری خود شوید.</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    
                    {/* Auth Tabs */}
                    <div className="flex bg-gray-50 p-1 m-2 rounded-2xl">
                        <button 
                            onClick={() => { setAuthMethod('phone'); setIdentifier(''); setAuthError(null); }}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all shadow-sm ${authMethod === 'phone' ? 'bg-white text-primary shadow' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Smartphone size={18} /> شماره موبایل
                            </div>
                        </button>
                        <button 
                            onClick={() => { setAuthMethod('email'); setIdentifier(''); setAuthError(null); }}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all shadow-sm ${authMethod === 'email' ? 'bg-white text-primary shadow' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Mail size={18} /> ایمیل
                            </div>
                        </button>
                    </div>

                    <div className="p-6 md:p-8 space-y-5">
                        {/* Error Box */}
                        {authError && (
                            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-xl text-xs text-red-700 flex items-center gap-3 animate-fade-in">
                                <AlertTriangle size={20} className="flex-shrink-0" />
                                <span>{authError}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 mr-1">
                                    {authMethod === 'phone' ? 'شماره موبایل' : 'آدرس ایمیل'}
                                </label>
                                <div className="relative group">
                                    <input 
                                        type={authMethod === 'phone' ? 'tel' : 'email'}
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder={authMethod === 'phone' ? 'مثلا: 09121234567' : 'example@gmail.com'}
                                        className="w-full pl-4 pr-11 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-left font-medium dir-ltr"
                                        dir="ltr"
                                    />
                                    <div className="absolute right-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors">
                                        {authMethod === 'phone' ? <Smartphone size={20} /> : <Mail size={20} />}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2 mr-1">رمز عبور</label>
                                <div className="relative group">
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-11 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-left font-medium dir-ltr"
                                        dir="ltr"
                                    />
                                    <div className="absolute right-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleAuthAction}
                            disabled={authLoading}
                            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-pink-200 hover:shadow-xl hover:bg-pink-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {authLoading ? <RefreshCw className="animate-spin" /> : (authMode === 'login' ? <LogIn size={20} /> : <CheckCircle size={20} />)}
                            {authMode === 'login' ? 'ورود به حساب' : 'ثبت نام رایگان'}
                        </button>

                        <div className="pt-2 text-center">
                            <p className="text-xs text-gray-500 mb-3">
                                {authMode === 'login' ? 'هنوز حساب ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
                                <button 
                                    onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(null); }}
                                    className="font-bold text-primary hover:underline mx-1 text-sm"
                                >
                                    {authMode === 'login' ? 'ایجاد حساب' : 'ورود'}
                                </button>
                            </p>
                            
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] uppercase tracking-wider">یا ورود سریع</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <button 
                                onClick={handleGuestLogin}
                                disabled={authLoading}
                                className="w-full bg-white text-gray-700 py-3 rounded-2xl font-bold border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors flex items-center justify-center gap-2 text-sm mt-2"
                            >
                                <UserIcon size={18} />
                                ادامه به عنوان مهمان
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-400 text-xs">نسخه برنامه: {APP_VERSION}</p>
                    {/* Developer Signature - Login Screen */}
                    <div className="flex justify-center gap-4 mt-4">
                        <a href="https://github.com/MrV006" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-800 transition-colors" title="GitHub">
                            <Github size={18} />
                        </a>
                        <a href="tel:09902076468" className="text-gray-300 hover:text-primary transition-colors" title="Contact Developer">
                            <Phone size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 font-sans text-gray-800 w-full mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Update Banner */}
      {availableUpdate && (
          <UpdateBanner version={availableUpdate} onUpdate={handlePerformUpdate} />
      )}

      {/* Global Audio Player */}
      {currentAudio && (
        <GlobalAudioPlayer 
            currentAudio={currentAudio} 
            onClose={() => { setCurrentAudio(null); setIsAudioPlaying(false); }} 
            isPlaying={isAudioPlaying}
            onTogglePlay={() => setIsAudioPlaying(!isAudioPlaying)}
        />
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <div className={`fixed inset-y-0 right-0 w-[280px] bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="bg-primary p-6 text-white relative overflow-hidden">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/50 overflow-hidden text-2xl font-bold">
               {/* Sidebar Avatar - First Letter */}
               {user.name ? (
                  <span>{user.name.charAt(0)}</span>
               ) : (
                  <UserIcon size={28} className="text-white" />
               )}
            </div>
            <div>
              <p className="font-bold text-lg">{user.name || "کاربر مهمان"}</p>
              <p className="text-xs text-white/70 font-mono tracking-wider">{userId?.substring(0, 10)}...</p>
            </div>
          </div>
        </div>

        {/* Sidebar Links */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <nav className="space-y-1">
             {[
               { tab: Tab.DASHBOARD, label: 'خانه', icon: <Home size={20} /> },
               { tab: Tab.TRACKER, label: 'ثبت علائم', icon: <ClipboardList size={20} /> },
               { tab: Tab.COMMUNITY, label: 'تالار گفتگو', icon: <Users size={20} /> },
               { tab: Tab.LIBRARY, label: 'کتابخانه', icon: <BookOpen size={20} /> },
               { tab: Tab.PROFILE, label: 'پروفایل من', icon: <UserCircle size={20} /> },
             ].map((item) => (
               <button
                 key={item.tab}
                 onClick={() => navigateFromSidebar(item.tab)}
                 className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${activeTab === item.tab ? 'bg-pink-50 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
               >
                 <div className="flex items-center gap-3">
                   {item.icon}
                   <span>{item.label}</span>
                 </div>
                 {activeTab === item.tab && <ChevronLeft size={16} />}
               </button>
             ))}

            {/* Admin Link */}
            {isAdminOrDev && (
                <button
                    onClick={() => navigateFromSidebar(Tab.ADMIN)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors mt-2 border-t border-gray-100 ${activeTab === Tab.ADMIN ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center gap-3">
                    <Shield size={20} />
                    <span>پنل مدیریت</span>
                    </div>
                    {activeTab === Tab.ADMIN && <ChevronLeft size={16} />}
                </button>
            )}

          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
           >
             <LogOut size={20} />
             <span>خروج از حساب</span>
           </button>
           <div className="text-center mt-4">
                <p className="text-[10px] text-gray-400">نسخه {APP_VERSION}</p>
                {/* Developer Signature - Sidebar */}
                <div className="flex justify-center gap-3 mt-2">
                    <a href="https://github.com/MrV006" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gray-800 transition-colors" title="GitHub">
                        <Github size={14} />
                    </a>
                    <a href="tel:09902076468" className="text-gray-300 hover:text-primary transition-colors" title="Contact Developer">
                        <Phone size={14} />
                    </a>
                </div>
           </div>
        </div>
      </div>

      {/* Header (FIXED) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm flex justify-between items-center w-full px-4 py-3 h-[72px]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="bg-primary/10 p-2 rounded-full text-primary hover:bg-primary/20 transition-colors active:scale-95"
          >
            <Menu size={20} />
          </button>
          <h1 
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            className="font-bold text-lg text-primary cursor-pointer select-none hover:opacity-80 transition-opacity"
          >
            همدم یائسگی
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
                <button onClick={handleOpenNotifications} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                    <Bell size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-white">
                            {unreadCount}
                        </span>
                    )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                    <div className="absolute top-12 left-0 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-left">
                        <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-600">اعلان‌ها</span>
                            <button onClick={() => setShowNotifications(false)}><X size={16} className="text-gray-400"/></button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-400 text-xs">
                                    پیام جدیدی نیست
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div 
                                        key={n.id} 
                                        className={`p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors relative ${n.type === 'alert' ? 'bg-red-50' : n.type === 'warning' ? 'bg-yellow-50' : n.type === 'success' ? 'bg-green-50' : ''}`}
                                        onClick={() => {
                                            if(n.title.includes("یادآوری")) {
                                                setShowNotifications(false);
                                                setActiveTab(Tab.TRACKER);
                                            }
                                        }}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'alert' ? 'bg-red-500' : n.type === 'warning' ? 'bg-yellow-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-800">{n.title}</h4>
                                                <p className="text-[11px] text-gray-600 mt-1 leading-tight">{n.message}</p>
                                                <span className="text-[9px] text-gray-400 block mt-2">
                                                    {new Date(n.date).toLocaleDateString('fa-IR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Icon */}
            <div 
            onClick={() => setActiveTab(Tab.PROFILE)}
            className="cursor-pointer"
            >
            {user.name ? (
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-pink-200 text-primary flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                </div>
            ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <UserIcon size={20} className="text-gray-400"/>
                </div>
            )}
            </div>
        </div>
      </header>

      {/* Main Content Area - Added top padding for fixed header */}
      <main className="min-h-[calc(100vh-140px)] w-full max-w-7xl mx-auto pt-20">
        {activeTab === Tab.DASHBOARD && <Dashboard changeTab={setActiveTab} userId={userId!} user={user} />}
        {activeTab === Tab.TRACKER && <SymptomTracker userId={userId!} />}
        {activeTab === Tab.COMMUNITY && <Community currentUserRole={user.role} currentUserId={userId!} />}
        {activeTab === Tab.LIBRARY && <Library onPlayAudio={handlePlayAudio} onPauseAudio={handlePauseAudio} currentAudioUrl={currentAudio?.url || null} isPlaying={isAudioPlaying} />}
        {activeTab === Tab.PROFILE && (
            <Profile 
                user={user} 
                userId={userId} 
                isAdminOrDev={isAdminOrDev} 
                isEditingProfile={isEditingProfile} 
                setIsEditingProfile={setIsEditingProfile}
                onSave={handleSaveProfile}
                setActiveTab={setActiveTab}
            />
        )}
        {activeTab === Tab.ADMIN && isAdminOrDev && <AdminPanel currentUserRole={user.role} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-6 py-3 flex justify-center pointer-events-none">
        <div className="bg-white border border-gray-200 px-6 py-3 rounded-full shadow-2xl flex justify-between items-center gap-8 pointer-events-auto max-w-lg w-full mb-4">
            <button 
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.DASHBOARD ? 'text-primary' : 'text-gray-400'}`}
            >
            <Home size={24} strokeWidth={activeTab === Tab.DASHBOARD ? 2.5 : 2} />
            <span className="text-xs">خانه</span>
            </button>
            
            <button 
            onClick={() => setActiveTab(Tab.TRACKER)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.TRACKER ? 'text-primary' : 'text-gray-400'}`}
            >
            <ClipboardList size={24} strokeWidth={activeTab === Tab.TRACKER ? 2.5 : 2} />
            <span className="text-xs">ثبت علائم</span>
            </button>

            <button 
            onClick={() => setActiveTab(Tab.COMMUNITY)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.COMMUNITY ? 'text-primary' : 'text-gray-400'}`}
            >
            <Users size={24} strokeWidth={activeTab === Tab.COMMUNITY ? 2.5 : 2} />
            <span className="text-xs">گفتگو</span>
            </button>

            <button 
            onClick={() => setActiveTab(Tab.LIBRARY)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.LIBRARY ? 'text-primary' : 'text-gray-400'}`}
            >
            <BookOpen size={24} strokeWidth={activeTab === Tab.LIBRARY ? 2.5 : 2} />
            <span className="text-xs">کتابخانه</span>
            </button>

            <button 
            onClick={() => setActiveTab(Tab.PROFILE)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.PROFILE ? 'text-primary' : 'text-gray-400'}`}
            >
            <UserCircle size={24} strokeWidth={activeTab === Tab.PROFILE ? 2.5 : 2} />
            <span className="text-xs">پروفایل</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
