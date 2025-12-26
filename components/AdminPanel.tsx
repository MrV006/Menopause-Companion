import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { fetchAllUsers, updateUserRole, banUser, sendNotification, addLibraryItem, wipeServerData, toggleMaintenanceMode, deleteUserAccount, saveUserProfile, updateUserMaintenanceStatus } from '../api';
import { Users, Shield, Bell, Plus, Trash2, Key, Search, Loader2, Save, Server, Wrench, X, Eye, Send, Lock, Unlock, AlertOctagon, Link as LinkIcon } from 'lucide-react';
import { MOCK_USER } from '../constants';

interface AdminPanelProps {
  currentUserRole: UserRole;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUserRole }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'create_user' | 'content' | 'notify' | 'system'>('users');
  const [users, setUsers] = useState<{id: string, profile: UserProfile}[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, profile: UserProfile} | null>(null);
  
  // Library Form State
  const [libTitle, setLibTitle] = useState('');
  const [libAuthor, setLibAuthor] = useState('');
  const [libType, setLibType] = useState<'podcast' | 'article'>('article');
  const [libDuration, setLibDuration] = useState('');
  const [libUrl, setLibUrl] = useState(''); // New state for URL

  // Notification State
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const [notifyType, setNotifyType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');
  const [notifyTarget, setNotifyTarget] = useState('all');

  // Create User State
  const [newUser, setNewUser] = useState({
    name: '',
    role: 'user' as UserRole,
    id_prefix: 'User_'
  });

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'notify') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleRoleChange = async (targetId: string, newRole: UserRole) => {
    if (currentUserRole !== 'super_admin' && currentUserRole !== 'developer') {
        if (newRole === 'admin' || newRole === 'super_admin' || newRole === 'developer') {
            alert("شما دسترسی لازم برای ارتقا به این سطح را ندارید.");
            return;
        }
    }
    const success = await updateUserRole(targetId, newRole);
    if (success) {
      setUsers(users.map(u => u.id === targetId ? { ...u, profile: { ...u.profile, role: newRole } } : u));
    }
  };

  const handleBanToggle = async (targetId: string, currentStatus: boolean, role: UserRole) => {
    if (role === 'developer' || role === 'super_admin') {
        alert("امکان مسدود کردن مدیران ارشد وجود ندارد.");
        return;
    }
    const success = await banUser(targetId, !currentStatus);
    if (success) {
      setUsers(users.map(u => u.id === targetId ? { ...u, profile: { ...u.profile, isBanned: !currentStatus } } : u));
      if (selectedUser?.id === targetId) {
          setSelectedUser(prev => prev ? { ...prev, profile: { ...prev.profile, isBanned: !currentStatus } } : null);
      }
    }
  };

  const handleMaintenanceStatusChange = async (targetId: string, status: 'system' | 'enabled' | 'disabled', role: UserRole) => {
     if (role === 'developer' || role === 'super_admin') {
        alert("امکان تغییر وضعیت تعمیر برای مدیران ارشد وجود ندارد.");
        return;
    }
     const success = await updateUserMaintenanceStatus(targetId, status);
     if (success) {
        setUsers(users.map(u => u.id === targetId ? { ...u, profile: { ...u.profile, maintenanceStatus: status } } : u));
         if (selectedUser?.id === targetId) {
          setSelectedUser(prev => prev ? { ...prev, profile: { ...prev.profile, maintenanceStatus: status } } : null);
        }
     }
  };

  const handleDeleteUser = async (userId: string, role: UserRole) => {
      if (role === 'developer' || role === 'super_admin') {
          alert("حذف مدیران ارشد مجاز نیست.");
          return;
      }
      if (!confirm("آیا مطمئن هستید؟ این عملیات غیرقابل بازگشت است.")) return;
      const success = await deleteUserAccount(userId);
      if (success || true) { // Mocking success
          setUsers(users.filter(u => u.id !== userId));
          setSelectedUser(null);
      }
  };

  const handleCreateUser = async () => {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newId = `${newUser.id_prefix}${randomSuffix}`;
      const newProfile: UserProfile = {
          ...MOCK_USER,
          name: newUser.name || `کاربر جدید ${randomSuffix}`,
          role: newUser.role
      };
      
      const success = await saveUserProfile(newId, newProfile);
      if (success) {
          alert(`کاربر با شناسه ${newId} ایجاد شد.`);
          setNewUser({ name: '', role: 'user', id_prefix: 'User_' });
          setActiveTab('users');
      }
  };

  const handleWipeData = async () => {
      if (confirm("هشدار: تمام پست‌ها و اطلاعات دیتابیس (بجز کاربران) پاک خواهد شد. ادامه می‌دهید؟")) {
          const success = await wipeServerData();
          if (success) alert("پاکسازی سرور انجام شد.");
      }
  };

  const handleAddLibrary = async () => {
    if (!libTitle || !libUrl) {
      alert("عنوان و لینک الزامی هستند");
      return;
    }

    const success = await addLibraryItem({
        title: libTitle,
        author: libAuthor,
        type: libType,
        duration: libDuration,
        url: libUrl
    });
    if (success) {
        alert("محتوا اضافه شد");
        setLibTitle(''); setLibAuthor(''); setLibDuration(''); setLibUrl('');
    }
  };

  const handleSendNotification = async () => {
      if (!notifyTitle || !notifyMsg) {
          alert("لطفا عنوان و متن پیام را وارد کنید.");
          return;
      }

      if (confirm(`آیا از ارسال این پیام به ${notifyTarget === 'all' ? 'همه کاربران' : 'کاربر انتخاب شده'} اطمینان دارید؟`)) {
          const success = await sendNotification({
              title: notifyTitle,
              message: notifyMsg,
              type: notifyType,
              target: notifyTarget,
              date: new Date().toISOString()
          });
          
          if (success) {
              alert(`اعلان ارسال شد.`);
              setNotifyTitle('');
              setNotifyMsg('');
          }
      }
  };

  const roleLabels: Record<string, string> = {
      'user': 'کاربر عادی',
      'subscriber': 'مشترک ویژه',
      'admin': 'ادمین',
      'super_admin': 'مدیر کل',
      'developer': 'برنامه‌نویس'
  };

  const isSuperUser = currentUserRole === 'developer' || currentUserRole === 'super_admin';
  const isTargetImmune = (role: UserRole) => role === 'developer' || role === 'super_admin';

  return (
    <div className="pb-24 px-4 py-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-primary" />
            پنل مدیریت
        </h2>
        <p className="text-xs text-gray-500 mt-1">
            سطح دسترسی شما: <span className="font-bold text-primary">{roleLabels[currentUserRole]}</span>
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'bg-white text-gray-600 border'}`}>کاربران</button>
        <button onClick={() => setActiveTab('create_user')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'create_user' ? 'bg-primary text-white' : 'bg-white text-gray-600 border'}`}>ساخت کاربر</button>
        <button onClick={() => setActiveTab('content')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'content' ? 'bg-primary text-white' : 'bg-white text-gray-600 border'}`}>محتوا</button>
        <button onClick={() => setActiveTab('notify')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'notify' ? 'bg-primary text-white' : 'bg-white text-gray-600 border'}`}>اعلان</button>
        {isSuperUser && <button onClick={() => setActiveTab('system')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'system' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200'}`}>سیستم</button>}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : users.map(u => (
                <div key={u.id} className={`bg-white p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${u.profile.isBanned ? 'border-red-300 bg-red-50' : 'border-gray-100'} ${u.profile.maintenanceStatus === 'enabled' ? 'border-orange-300 bg-orange-50' : ''}`} onClick={() => setSelectedUser(u)}>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800">{u.profile.name}</h3>
                                {u.profile.isBanned && <Lock size={14} className="text-red-500" />}
                                {u.profile.maintenanceStatus === 'enabled' && <Wrench size={14} className="text-orange-500" />}
                            </div>
                            <span className="text-xs text-gray-400 font-mono block mt-1 dir-ltr text-left" dir="ltr">{u.id}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full ${u.profile.role === 'developer' ? 'bg-purple-100 text-purple-700' : u.profile.role === 'super_admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {roleLabels[u.profile.role]}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Create User Tab */}
      {activeTab === 'create_user' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4">ایجاد کاربر جدید</h3>
              <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">نام کاربر</label>
                    <input className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="مثلا: مریم رضایی" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">نقش</label>
                    <select className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                        <option value="user">کاربر عادی</option>
                        <option value="subscriber">مشترک</option>
                        <option value="admin">ادمین</option>
                        {isSuperUser && <option value="super_admin">مدیر کل</option>}
                    </select>
                  </div>
                  <button onClick={handleCreateUser} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold mt-2">ایجاد کاربر</button>
              </div>
          </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4">افزودن به کتابخانه</h3>
              <div className="space-y-3">
                  <input placeholder="عنوان محتوا" className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm" value={libTitle} onChange={e => setLibTitle(e.target.value)} />
                  <input placeholder="نویسنده / گوینده" className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm" value={libAuthor} onChange={e => setLibAuthor(e.target.value)} />
                  <div className="relative">
                      <input placeholder="لینک فایل صوتی / مقاله" className="w-full border border-gray-300 bg-white text-gray-900 p-2 pl-8 rounded-lg text-sm dir-ltr" dir="ltr" value={libUrl} onChange={e => setLibUrl(e.target.value)} />
                      <LinkIcon size={16} className="absolute left-2 top-2.5 text-gray-400" />
                  </div>
                  <input placeholder="مدت زمان (مثلا: ۱۵ دقیقه)" className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm" value={libDuration} onChange={e => setLibDuration(e.target.value)} />
                  <select className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm" value={libType} onChange={e => setLibType(e.target.value as any)}>
                      <option value="article">مقاله</option>
                      <option value="podcast">پادکست</option>
                  </select>
                  <button onClick={handleAddLibrary} className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4"><Plus size={18} /> افزودن محتوا</button>
              </div>
          </div>
      )}

      {/* Notify Tab */}
      {activeTab === 'notify' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4">ارسال اعلان (Notification)</h3>
              <div className="space-y-4">
                  <div>
                      <label className="text-xs text-gray-500 block mb-1">عنوان پیام</label>
                      <input 
                        className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm" 
                        value={notifyTitle} 
                        onChange={e => setNotifyTitle(e.target.value)} 
                        placeholder="مثلا: بروزرسانی جدید" 
                      />
                  </div>
                  <div>
                      <label className="text-xs text-gray-500 block mb-1">متن پیام</label>
                      <textarea 
                        className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm h-24" 
                        value={notifyMsg} 
                        onChange={e => setNotifyMsg(e.target.value)} 
                        placeholder="متن پیام را بنویسید..." 
                      />
                  </div>
                  
                  <div className="flex gap-2">
                      <div className="flex-1">
                          <label className="text-xs text-gray-500 block mb-1">نوع پیام</label>
                          <select 
                            className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm"
                            value={notifyType}
                            onChange={e => setNotifyType(e.target.value as any)}
                          >
                              <option value="info">اطلاع‌رسانی (آبی)</option>
                              <option value="warning">هشدار (زرد)</option>
                              <option value="success">موفقیت (سبز)</option>
                              <option value="alert">فوری (قرمز)</option>
                          </select>
                      </div>
                      <div className="flex-1">
                          <label className="text-xs text-gray-500 block mb-1">گیرنده</label>
                          <select 
                            className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm"
                            value={notifyTarget}
                            onChange={e => setNotifyTarget(e.target.value)}
                          >
                              <option value="all">همه کاربران</option>
                              {users.map(u => (
                                  <option key={u.id} value={u.id}>{u.profile.name} ({u.id.substring(0,5)}...)</option>
                              ))}
                          </select>
                      </div>
                  </div>

                  <button onClick={handleSendNotification} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2">
                      <Send size={18} /> ارسال پیام
                  </button>
              </div>
          </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && isSuperUser && (
          <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100">
                  <h3 className="font-bold text-red-600 mb-2 flex items-center gap-2"><Server size={18}/> منطقه خطر</h3>
                  <p className="text-xs text-gray-500 mb-4">عملیات‌های زیر روی کل سرور تاثیر می‌گذارد.</p>
                  
                  <button onClick={handleWipeData} className="w-full border-2 border-red-500 text-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors mb-3">
                      <Trash2 size={18} /> پاکسازی کامل سرور (بجز کاربران)
                  </button>

                  <button onClick={() => toggleMaintenanceMode(true)} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                      <Wrench size={18} /> فعال‌سازی حالت تعمیر و نگهداری (همه کاربران)
                  </button>
                  <button onClick={() => toggleMaintenanceMode(false)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2">
                      <CheckCircle size={18} /> غیرفعال‌سازی حالت تعمیر و نگهداری
                  </button>
              </div>
          </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto">
                  <div className="bg-primary p-4 flex justify-between items-center text-white">
                      <h3 className="font-bold">جزئیات کاربر</h3>
                      <button onClick={() => setSelectedUser(null)}><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                      <div className="text-center mb-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-2 overflow-hidden">
                             <img src={`https://ui-avatars.com/api/?name=${selectedUser.profile.name}`} className="w-full h-full"/>
                          </div>
                          <h2 className="font-bold text-xl">{selectedUser.profile.name}</h2>
                          <div className="bg-gray-100 rounded-md p-2 mt-2 inline-block max-w-full">
                             <p className="text-gray-600 text-[10px] font-mono break-all select-all dir-ltr" dir="ltr">{selectedUser.id}</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="block text-xs text-gray-400">نقش</span>
                              <span className="font-bold">{roleLabels[selectedUser.profile.role]}</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="block text-xs text-gray-400">سن / وزن</span>
                              <span className="font-bold">{selectedUser.profile.age} سال / {selectedUser.profile.weight} kg</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                              <span className="block text-xs text-gray-400">وضعیت پریود</span>
                              <span className="font-bold">{selectedUser.profile.periodStatus}</span>
                          </div>
                      </div>

                      <div className="border-t pt-4">
                          <h4 className="font-bold text-sm mb-3 text-gray-700">مدیریت دسترسی و امنیت</h4>
                          
                          <div className="space-y-3">
                              {/* Role Selector */}
                              <div>
                                  <label className="text-xs text-gray-500 mb-1 block">نقش کاربر</label>
                                  <select 
                                    value={selectedUser.profile.role}
                                    onChange={(e) => handleRoleChange(selectedUser.id, e.target.value as UserRole)}
                                    className="w-full border border-gray-300 bg-white text-gray-900 p-2 rounded-lg text-sm"
                                    disabled={currentUserRole === 'admin' && (selectedUser.profile.role === 'super_admin' || selectedUser.profile.role === 'developer')}
                                  >
                                        <option value="user">کاربر عادی</option>
                                        <option value="subscriber">مشترک</option>
                                        <option value="admin">ادمین</option>
                                        {isSuperUser && <option value="super_admin">مدیر کل</option>}
                                        {isSuperUser && <option value="developer">برنامه‌نویس</option>}
                                  </select>
                              </div>

                              {/* Maintenance Mode Toggle */}
                              <div>
                                  <label className="text-xs text-gray-500 mb-1 block">وضعیت تعمیر و نگهداری</label>
                                  <div className="flex bg-gray-100 p-1 rounded-lg">
                                      <button 
                                        onClick={() => handleMaintenanceStatusChange(selectedUser.id, 'system', selectedUser.profile.role)}
                                        className={`flex-1 py-2 text-xs rounded-md transition-colors ${!selectedUser.profile.maintenanceStatus || selectedUser.profile.maintenanceStatus === 'system' ? 'bg-white shadow text-primary font-bold' : 'text-gray-500'}`}
                                        disabled={isTargetImmune(selectedUser.profile.role)}
                                      >
                                          سیستمی
                                      </button>
                                      <button 
                                        onClick={() => handleMaintenanceStatusChange(selectedUser.id, 'enabled', selectedUser.profile.role)}
                                        className={`flex-1 py-2 text-xs rounded-md transition-colors ${selectedUser.profile.maintenanceStatus === 'enabled' ? 'bg-orange-100 text-orange-700 font-bold border border-orange-200' : 'text-gray-500'}`}
                                        disabled={isTargetImmune(selectedUser.profile.role)}
                                      >
                                          فعال (قفل)
                                      </button>
                                      <button 
                                        onClick={() => handleMaintenanceStatusChange(selectedUser.id, 'disabled', selectedUser.profile.role)}
                                        className={`flex-1 py-2 text-xs rounded-md transition-colors ${selectedUser.profile.maintenanceStatus === 'disabled' ? 'bg-green-100 text-green-700 font-bold border border-green-200' : 'text-gray-500'}`}
                                        disabled={isTargetImmune(selectedUser.profile.role)}
                                      >
                                          معاف (باز)
                                      </button>
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                      {selectedUser.profile.maintenanceStatus === 'enabled' ? 'این کاربر حتی اگر سیستم باز باشد، قفل است.' : 
                                       selectedUser.profile.maintenanceStatus === 'disabled' ? 'این کاربر حتی در زمان تعمیرات سیستم، دسترسی دارد.' : 
                                       'تابع تنظیمات کلی سیستم است.'}
                                  </p>
                              </div>
                              
                              <div className="flex gap-2 mt-4 pt-2 border-t">
                                  <button 
                                    onClick={() => handleBanToggle(selectedUser.id, selectedUser.profile.isBanned || false, selectedUser.profile.role)}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${selectedUser.profile.isBanned ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} disabled:opacity-50`}
                                    disabled={isTargetImmune(selectedUser.profile.role)}
                                  >
                                    {selectedUser.profile.isBanned ? <Unlock size={16}/> : <Lock size={16}/>}
                                    {selectedUser.profile.isBanned ? 'رفع مسدودیت' : 'مسدود کردن'}
                                  </button>
                                  
                                  {isSuperUser && (
                                      <button 
                                        onClick={() => handleDeleteUser(selectedUser.id, selectedUser.profile.role)}
                                        className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                                        disabled={isTargetImmune(selectedUser.profile.role)}
                                      >
                                          <Trash2 size={16} /> حذف حساب
                                      </button>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
// Helper icon
const CheckCircle: React.FC<{size: number}> = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

export default AdminPanel;