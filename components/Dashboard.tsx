import React from 'react';
import { Bean, BrewLog, BrewMethod } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Coffee, Star } from 'lucide-react';
import { CoffeeBeanIcon } from './CustomIcons';

interface DashboardProps {
  logs: BrewLog[];
  beans: Bean[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs, beans }) => {
  // Stats
  const totalBrews = logs.length;
  // Active beans are those with remaining weight > 0 and marked active
  const activeBeans = beans.filter(b => b.isActive && b.remainingWeight > 0).length;
  const avgRating = logs.length > 0 ? (logs.reduce((acc, log) => acc + log.rating, 0) / logs.length).toFixed(1) : '0';

  // Chart Data: Brews by Method
  const methodData = Object.values(BrewMethod).map(method => ({
    name: method,
    value: logs.filter(l => l.method === method).length
  })).filter(d => d.value > 0);

  // Chart Data: Ratings Distribution (1-10)
  const ratingData = Array.from({ length: 10 }, (_, i) => i + 1).map(score => ({
    name: `${score} 分`,
    count: logs.filter(l => Math.round(l.rating) === score).length
  }));

  const COLORS = ['#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#f59e0b'];

  return (
    <div className="space-y-4 md:space-y-6 pb-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-orange-100 text-orange-600 rounded-full">
            <Coffee className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-500 font-medium">总冲煮</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800">{totalBrews}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-amber-100 text-amber-600 rounded-full">
            <CoffeeBeanIcon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-500 font-medium">咖啡豆</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800">{activeBeans}</p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 col-span-2 md:col-span-1">
          <div className="p-2 md:p-3 bg-yellow-100 text-yellow-600 rounded-full">
            <Star className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-slate-500 font-medium">平均评分</p>
            <p className="text-xl md:text-2xl font-bold text-slate-800">{avgRating}<span className="text-xs md:text-sm text-slate-400 font-normal"> / 10</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4">冲煮方式分布</h3>
          {methodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">暂无数据</div>
          )}
           <div className="flex flex-wrap gap-2 justify-center mt-2">
              {methodData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1 text-[10px] md:text-xs text-slate-600">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                      {entry.name}
                  </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4">评分分布 (1-10)</h3>
           {logs.length > 0 ? (
             <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingData}>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-400">暂无数据</div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
