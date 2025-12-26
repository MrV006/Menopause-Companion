import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ChartDataPoint } from '../types';

interface ChartsSectionProps {
  data: ChartDataPoint[];
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');

  // Determine severity color based on total score of the last entry
  const lastEntry = data[data.length - 1];
  const severityColor = 
    lastEntry.total < 10 ? 'text-green-600' : 
    lastEntry.total < 20 ? 'text-yellow-600' : 'text-red-600';
    
  const severityText = 
    lastEntry.total < 10 ? 'خفیف (سبز)' : 
    lastEntry.total < 20 ? 'متوسط (زرد)' : 'شدید (قرمز)';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">روند علائم</h2>
          <p className={`text-sm font-medium ${severityColor}`}>
            وضعیت فعلی: {severityText}
          </p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'weekly' ? 'bg-white shadow text-primary font-bold' : 'text-gray-500'}`}
          >
            هفتگی
          </button>
          <button 
             onClick={() => setViewMode('monthly')}
            className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'monthly' ? 'bg-white shadow text-primary font-bold' : 'text-gray-500'}`}
          >
            ماهانه
          </button>
        </div>
      </div>

      <div className="h-64 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#be185d" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#be185d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#9ca3af" />
            <YAxis tick={{fontSize: 12}} stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="total" stroke="#be185d" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="امتیاز کل" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 text-right">تفکیک علائم (ماه گذشته)</h3>
        <div className="h-48 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{fontSize: 10}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Bar dataKey="somatic" name="جسمانی" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="psychological" name="روانی" fill="#be185d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="urogenital" name="جنسی/ادراری" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;