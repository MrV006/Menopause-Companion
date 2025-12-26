import React, { useState, useEffect } from 'react';
import { EMPTY_CHART_DATA, MRS_QUESTIONS } from '../constants';
import { fetchDailyTips, fetchSymptomHistory } from '../api';
import ChartsSection from './ChartsSection';
import { Bell, Droplets, Moon, Pill, Plus, Loader2, Activity, BookOpen, Users, ChevronLeft } from 'lucide-react';
import { Tab, DailyTip, ChartDataPoint, UserProfile } from '../types';

interface DashboardProps {
  changeTab: (tab: Tab) => void;
  userId: string;
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ changeTab, userId, user }) => {
  const [reminders, setReminders] = useState({
    water: false,
    sleep: false,
    pills: false
  });
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(EMPTY_CHART_DATA);
  const [loading, setLoading] = useState(true);

  // Load reminders state from localStorage (persists for the current day)
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const savedReminders = localStorage.getItem(`reminders_${userId}_${today}`);
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, [userId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // 1. دریافت نکته روز
      const tips = await fetchDailyTips();
      if (tips && tips.length > 0) {
        const random = tips[Math.floor(Math.random() * tips.length)];
        setDailyTip(random);
      }

      // 2. دریافت و پردازش داده‌های نمودار کاربر خاص
      const symptoms = await fetchSymptomHistory(userId);
      
      if (symptoms.length > 0) {
        const processedData: ChartDataPoint[] = symptoms.map(record => {
          let somatic = 0, psychological = 0, urogenital = 0;
          
          if (record.scores) {
            Object.entries(record.scores).forEach(([qId, score]) => {
              const q = MRS_QUESTIONS.find(q => q.id === Number(qId));
              if (q) {
                if (q.category === 'somatic') somatic += score;
                if (q.category === 'psychological') psychological += score;
                if (q.category === 'urogenital') urogenital += score;
              }
            });
          }
          
          const total = somatic + psychological + urogenital;
          const dateObj = new Date(record.date);
          const name = new Intl.DateTimeFormat('fa-IR', { month: 'long', day: 'numeric' }).format(dateObj);
          
          return { name, total, somatic, psychological, urogenital };
        });
        
        // نمایش ۱۰ رکورد آخر
        setChartData(processedData.slice(-10));
      } else {
        // اگر داده‌ای نبود، نمودار خالی بماند
        setChartData(EMPTY_CHART_DATA);
      }

      setLoading(false);
    };
    loadData();
  }, [userId]);

  const toggleReminder = (key: keyof typeof reminders) => {
    const newState = { ...reminders, [key]: !reminders[key] };
    setReminders(newState);
    
    // Save to localStorage
    const today = new Date().toLocaleDateString('en-CA');
    localStorage.setItem(`reminders_${userId}_${today}`, JSON.stringify(newState));
  };

  return (
    <div className="px-4 py-6 pb-32 space-y-6 animate-fade-in">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* 1. Health Status Card (Profile Info) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 flex flex-col gap-4 md:col-span-1 lg:col-span-1">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Activity size={18} className="text-primary"/>
                    وضعیت سلامت من
                </h2>
                <button onClick={() => changeTab(Tab.PROFILE)} className="text-xs text-primary font-bold hover:underline">ویرایش</button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col justify-center">
                    <span className="block text-xs text-gray-500 mb-1">سن</span>
                    <span className="font-bold text-gray-800 text-lg">{user.age ? `${user.age}` : '-'} <span className="text-[10px] font-normal">سال</span></span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col justify-center">
                    <span className="block text-xs text-gray-500 mb-1">وزن</span>
                    <span className="font-bold text-gray-800 text-lg">{user.weight ? `${user.weight}` : '-'} <span className="text-[10px] font-normal">kg</span></span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col justify-center">
                    <span className="block text-xs text-gray-500 mb-1">وضعیت</span>
                    <span className="font-bold text-gray-800 text-xs sm:text-xs leading-tight">{user.periodStatus || '-'}</span>
                </div>
            </div>
            {user.dominantSymptoms && user.dominantSymptoms.length > 0 ? (
                <div className="border-t border-gray-50 pt-3">
                    <span className="block text-xs text-gray-500 mb-2">علائم غالب:</span>
                    <div className="flex flex-wrap gap-1">
                        {user.dominantSymptoms.map(s => (
                            <span key={s} className="px-2 py-1 bg-pink-50 text-pink-700 text-[10px] font-bold rounded-md border border-pink-100">{s}</span>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center text-xs text-gray-400 py-1">
                    علائم غالب ثبت نشده است
                </div>
            )}
        </div>
        
        {/* 4. Daily Tip / Health Message */}
        <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden min-h-[140px] flex items-center md:col-span-1 lg:col-span-2 xl:col-span-1 transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-10 -translate-y-10"></div>
            <div className="relative z-10 w-full">
            {loading ? (
                <div className="flex justify-center w-full">
                <Loader2 className="animate-spin text-white/50" />
                </div>
            ) : dailyTip ? (
                <>
                <div className="flex items-center gap-2 mb-2 opacity-90">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm">{dailyTip.title}</span>
                </div>
                <p className="font-medium text-lg leading-relaxed">
                    "{dailyTip.content}"
                </p>
                </>
            ) : (
                <p className="text-center text-white/80">نکته‌ای برای نمایش وجود ندارد.</p>
            )}
            </div>
        </div>

        {/* 5. Reminders Widget */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell size={18} className="text-accent" />
            یادآوری‌های روزانه
            </h3>
            <div className="grid grid-cols-3 gap-3 h-[calc(100%-2rem)]">
            <button 
                onClick={() => toggleReminder('water')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95 ${reminders.water ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-inner' : 'bg-gray-50 border-gray-100 text-gray-400 grayscale hover:bg-gray-100'}`}
            >
                <Droplets size={24} className="mb-2" />
                <span className="text-xs font-medium">آب</span>
                {reminders.water && <span className="text-[10px] mt-1">انجام شد</span>}
            </button>
            
            <button 
                onClick={() => toggleReminder('sleep')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95 ${reminders.sleep ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-inner' : 'bg-gray-50 border-gray-100 text-gray-400 grayscale hover:bg-gray-100'}`}
            >
                <Moon size={24} className="mb-2" />
                <span className="text-xs font-medium">خواب</span>
                {reminders.sleep && <span className="text-[10px] mt-1">انجام شد</span>}
            </button>

            <button 
                onClick={() => toggleReminder('pills')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95 ${reminders.pills ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-inner' : 'bg-gray-50 border-gray-100 text-gray-400 grayscale hover:bg-gray-100'}`}
            >
                <Pill size={24} className="mb-2" />
                <span className="text-xs font-medium">دارو</span>
                {reminders.pills && <span className="text-[10px] mt-1">انجام شد</span>}
            </button>
            </div>
        </div>

        {/* 2. Quick Log Button */}
        <button 
            onClick={() => changeTab(Tab.TRACKER)}
            className="w-full bg-white border-2 border-dashed border-primary/30 p-4 rounded-2xl flex items-center justify-center gap-3 text-primary font-bold hover:bg-pink-50 transition-colors group md:col-span-2 lg:col-span-2 xl:col-span-1 h-full min-h-[140px] shadow-sm hover:shadow-md"
        >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <Plus size={28} />
            </div>
            <div className="text-right">
                <span className="block text-lg">ثبت علائم سریع</span>
                <span className="text-xs text-gray-500 font-normal">حال امروزت چطوره؟</span>
            </div>
        </button>

        {/* 3. Shortcuts (Library & Community) */}
        <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-1">
            <button onClick={() => changeTab(Tab.LIBRARY)} className="bg-blue-50 hover:bg-blue-100 transition-colors p-4 rounded-2xl border border-blue-100 flex flex-col items-center justify-center gap-2 text-blue-800">
                <BookOpen size={24} />
                <span className="text-xs font-bold">کتابخانه</span>
            </button>
            <button onClick={() => changeTab(Tab.COMMUNITY)} className="bg-purple-50 hover:bg-purple-100 transition-colors p-4 rounded-2xl border border-purple-100 flex flex-col items-center justify-center gap-2 text-purple-800">
                <Users size={24} />
                <span className="text-xs font-bold">تالار گفتگو</span>
            </button>
        </div>

        {/* 1. Main Charts */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4">
            <ChartsSection data={chartData} />
        </div>

      </div>

    </div>
  );
};

export default Dashboard;