import React, { useState } from 'react';
import { MRS_QUESTIONS } from '../constants';
import { Check, Save, Loader2, Sparkles } from 'lucide-react';
import { saveSymptomLog } from '../api';

interface SymptomTrackerProps {
  userId: string;
}

const SymptomTracker: React.FC<SymptomTrackerProps> = ({ userId }) => {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScoreChange = (id: number, val: number) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    const today = new Date().toISOString();
    const success = await saveSymptomLog(userId, {
      date: today,
      scores,
      note
    });

    setIsSubmitting(false);

    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      // Reset form
      setScores({});
      setNote("");
    } else {
      alert("خطا در ذخیره اطلاعات. لطفا دوباره تلاش کنید.");
    }
  };

  const getLabel = (val: number) => {
    if (val === 0) return "ندارم";
    if (val === 1) return "خفیف";
    if (val === 2) return "متوسط";
    if (val === 3) return "شدید";
    return "خیلی شدید";
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in pt-20 max-w-lg mx-auto">
        <div className="bg-green-100 p-6 rounded-full mb-6 shadow-lg shadow-green-100 animate-bounce">
          <Check size={48} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">عالی بود!</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
            اطلاعات امروزت ثبت شد. همین که به فکر سلامتیت هستی، بزرگترین قدمه.
        </p>
        
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-100 relative overflow-hidden">
          <Sparkles className="absolute top-2 right-2 text-yellow-400 opacity-50" size={20} />
          <p className="text-primary font-bold text-lg italic mb-2">"تو قوی‌تر از چیزی هستی که فکر می‌کنی."</p>
          <span className="text-xs text-gray-500">ادامه بده، ما کنارتیم. ❤️</span>
        </div>

        <button 
          onClick={() => setSaved(false)}
          className="mt-10 text-gray-400 text-sm hover:text-gray-600 underline"
        >
          بازگشت به فرم
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-6 px-4 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-pink-100 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-1">ثبت علائم امروز</h2>
        <p className="text-sm text-gray-500">به خودت امتیاز بده (۰ = عالی، ۴ = بد)</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {MRS_QUESTIONS.map((q) => (
          <div key={q.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex flex-col justify-between transition-colors hover:border-pink-100">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-700 text-sm">{q.text}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                  scores[q.id] === undefined ? 'bg-gray-100 text-gray-500' :
                  scores[q.id] === 0 ? 'bg-green-100 text-green-700' :
                  scores[q.id] < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
                {scores[q.id] !== undefined ? getLabel(scores[q.id]) : 'انتخاب نشده'}
              </span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="4" 
              step="1"
              value={scores[q.id] || 0}
              onChange={(e) => handleScoreChange(q.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary mb-2"
            />
            <div className="flex justify-between text-xl px-1 select-none">
              <span onClick={() => handleScoreChange(q.id, 0)} className={`cursor-pointer transition-transform hover:scale-125 ${scores[q.id] === 0 ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>😊</span>
              <span onClick={() => handleScoreChange(q.id, 1)} className={`cursor-pointer transition-transform hover:scale-125 ${scores[q.id] === 1 ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>🙂</span>
              <span onClick={() => handleScoreChange(q.id, 2)} className={`cursor-pointer transition-transform hover:scale-125 ${scores[q.id] === 2 ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>😐</span>
              <span onClick={() => handleScoreChange(q.id, 3)} className={`cursor-pointer transition-transform hover:scale-125 ${scores[q.id] === 3 ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>😣</span>
              <span onClick={() => handleScoreChange(q.id, 4)} className={`cursor-pointer transition-transform hover:scale-125 ${scores[q.id] === 4 ? 'opacity-100 scale-110' : 'opacity-40 grayscale'}`}>😫</span>
            </div>
          </div>
        ))}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">یادداشت روزانه</label>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="هر نکته‌ای که می‌خواهی بنویسی..."
            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm h-24 resize-none"
          />
        </div>
      </div>

      <div className="fixed bottom-24 left-0 right-0 px-6 max-w-md mx-auto z-10 pointer-events-none">
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className={`w-full bg-primary text-white py-4 rounded-xl shadow-lg shadow-pink-200 font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform pointer-events-auto ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:bg-pink-700'}`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Save size={20} />}
            {isSubmitting ? 'در حال ذخیره...' : 'ثبت نهایی'}
          </button>
      </div>
    </div>
  );
};

export default SymptomTracker;