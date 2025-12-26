import React, { useState, useEffect } from 'react';
import { Play, FileText, Loader2, Pause, Volume2, ExternalLink } from 'lucide-react';
import { fetchLibraryContent } from '../api';
import { LibraryItem } from '../types';

const Library: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    const loadLibrary = async () => {
      setLoading(true);
      const data = await fetchLibraryContent();
      setItems(data);
      setLoading(false);
    };
    loadLibrary();
  }, []);

  const togglePlay = (id: number) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  return (
    <div className="pb-32 px-4 pt-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-pink-100">
        <h2 className="text-xl font-bold text-gray-800 mb-1">کتابخانه سلامت</h2>
        <p className="text-sm text-gray-500">پادکست‌ها و مقالات علمی برای آگاهی بیشتر</p>
      </div>

      <div className="">
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : items.length === 0 ? (
           <div className="text-center text-gray-400 py-10">
             محتوایی یافت نشد.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => (
                <div 
                    key={item.id} 
                    className={`bg-white p-4 rounded-xl shadow-sm border transition-all relative overflow-hidden group ${playingId === item.id ? 'border-primary ring-1 ring-primary' : 'border-gray-50 hover:border-pink-200 hover:shadow-md'}`}
                >
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => item.type === 'podcast' ? togglePlay(item.id) : window.open(item.url, '_blank')}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${playingId === item.id ? 'bg-primary text-white' : (item.type === 'podcast' ? 'bg-pink-100 text-primary group-hover:bg-pink-200' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200')}`}>
                            {item.type === 'podcast' ? (
                                playingId === item.id ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5"/>
                            ) : (
                                <FileText size={20} />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold text-sm mb-1 transition-colors ${playingId === item.id ? 'text-primary' : 'text-gray-800'}`}>{item.title}</h3>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{item.author}</span>
                                <span>{item.duration}</span>
                            </div>
                        </div>
                        {item.type === 'article' && <ExternalLink size={14} className="text-gray-400"/>}
                    </div>

                    {/* Real Audio Player */}
                    {item.type === 'podcast' && playingId === item.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                            {item.url ? (
                                <audio 
                                    controls 
                                    autoPlay 
                                    className="w-full h-8"
                                    src={item.url}
                                >
                                    مرورگر شما از پخش صدا پشتیبانی نمی‌کند.
                                </audio>
                            ) : (
                                <p className="text-xs text-red-500 text-center">لینک فایل صوتی موجود نیست.</p>
                            )}
                        </div>
                    )}
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;