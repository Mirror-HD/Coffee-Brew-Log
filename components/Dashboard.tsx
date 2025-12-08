import React from 'react';
import { Bean, BrewLog, BrewMethod } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Coffee, Clock, Calendar } from 'lucide-react';
import { CoffeeBeanIcon } from './CustomIcons';

interface DashboardProps {
  logs: BrewLog[];
  beans: Bean[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs, beans }) => {
  const totalBrews = logs.length;
  const activeBeans = beans.filter(b => b.isActive && b.remainingWeight > 0).length;
  const totalBeans = beans.length;
  
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const lastBean = lastLog ? beans.find(b => b.id === lastLog.beanId) : null;

  const methodData = Object.values(BrewMethod).map(method => ({
    name: method,
    value: logs.filter(l => l.method === method).length
  })).filter(d => d.value > 0);

  const COLORS = ['#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#f59e0b'];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isEspresso = (method?: string) => method === BrewMethod.ESPRESSO;

  return (
    <div className="flex flex-col gap-3 h-full pb-2">
      <style>{`
        .recharts-wrapper { outline: none !important; }
        .recharts-surface:focus { outline: none !important; }
        *:focus { outline: none !important; } 
      `}</style>

      {/* Top Stats - Compact */}
      <div className="grid grid-cols-2 gap-3 h-20 md:h-24 shrink-0">
        <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
            <Coffee size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">冲煮次数</p>
            <p className="text-xl font-bold text-slate-800 leading-none mt-1">{totalBrews}</p>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
            <CoffeeBeanIcon size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">咖啡豆 (在喝/累计)</p>
            <div className="flex items-baseline gap-1 mt-1">
                <p className="text-xl font-bold text-slate-800 leading-none">{activeBeans}</p>
                <span className="text-xs text-slate-400 font-semibold">/ {totalBeans}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1 min-h-0">
        
        {/* Last Brew - Takes more space on desktop */}
        <div className="md:col-span-3 bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
             <Clock size={14}/> 上一次冲煮
          </h3>
          
          {lastLog ? (
            <div className="flex-1 flex flex-col justify-between gap-2">
              <div>
                 <div className="flex justify-between items-start mb-1">
                    <h4 className="text-lg font-bold text-slate-800 line-clamp-1">{lastBean?.name || '未知咖啡豆'}</h4>
                    <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full whitespace-nowrap">{lastLog.method}</span>
                 </div>
                 <div className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                    <Calendar size={10}/>
                    {new Date(lastLog.date).toLocaleString()}
                 </div>

                 <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                        <div className="text-[10px] text-slate-400 mb-1">{isEspresso(lastLog.method) ? '粉液' : '粉水'}</div>
                        <div className="font-bold text-slate-700 text-sm">{lastLog.doseIn}/{lastLog.yieldOut}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                        <div className="text-[10px] text-slate-400 mb-1">时间</div>
                        <div className="font-bold text-slate-700 text-sm">{formatTime(lastLog.timeSeconds)}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                        <div className="text-[10px] text-slate-400 mb-1">水温</div>
                        <div className="font-bold text-slate-700 text-sm">{lastLog.temperature}°</div>
                    </div>
                 </div>
              </div>

              <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-100 mt-2 flex-1 min-h-[60px] flex flex-col justify-center">
                 {lastLog.rating !== undefined && (
                    <div className="flex items-center gap-1 mb-1">
                         <div className="flex">
                            {Array.from({length: 5}).map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full mr-0.5 ${i < Math.round(lastLog.rating! / 2) ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-amber-700 ml-1">{lastLog.rating}分</span>
                    </div>
                 )}
                 <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                   {lastLog.notes ? `"${lastLog.notes}"` : '暂无风味描述'}
                 </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
               <Coffee size={32} />
               <p className="text-sm">暂无记录</p>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">分布</h3>
          {methodData.length > 0 ? (
            <>
                <div className="flex-1 min-h-[120px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={methodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={true}
                        >
                        {methodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', padding: '8px' }} 
                            itemStyle={{color: '#334155'}} 
                        />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2 overflow-y-auto max-h-[60px]">
                    {methodData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                            <span className="truncate max-w-[80px]">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 text-sm">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;