import React, { useState, useEffect } from 'react';
import { Bean, BrewLog, BrewMethod, BeanOwner } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Coffee, Clock, Calendar, Timer, CheckCircle } from 'lucide-react';
import { CoffeeBeanIcon } from './CustomIcons';

const ColdBrewDashboardTimer: React.FC<{ startDate: number }> = ({ startDate }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calcElapsed = () => Math.floor((Date.now() - startDate) / 1000);
    setElapsed(calcElapsed());

    const interval = setInterval(() => {
      setElapsed(calcElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  if (elapsed < 0) return <span>等待开始</span>;

  const days = Math.floor(elapsed / 86400);
  const hours = Math.floor((elapsed % 86400) / 3600);

  let timeStr = '';
  if (days > 0) {
    timeStr += `${days}天`;
  }
  timeStr += `${hours}小时`;

  return <span>{timeStr}</span>;
};


interface DashboardProps {
  logs: BrewLog[];
  beans: Bean[];
  onUpdateLog?: (log: BrewLog) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, beans, onUpdateLog }) => {
  const totalBrews = logs.length;
  // Active beans: Must be marked active AND (have weight remaining OR be a club bean which has unlimited/0 weight)
  const activeBeans = beans.filter(b => b.isActive && (b.remainingWeight > 0 || b.owner === BeanOwner.CLUB)).length;
  const totalBeans = beans.length;
  
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const lastBean = lastLog ? beans.find(b => b.id === lastLog.beanId) : null;

  const methodData = Object.values(BrewMethod).map(method => ({
    name: method,
    value: logs.filter(l => l.method === method).length
  })).filter(d => d.value > 0);

  const COLORS = ['#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#f59e0b'];

  const formatTime = (seconds: number, method?: BrewMethod) => {
    if (method === BrewMethod.COLD_BREW) {
        if (seconds === 0) return '萃取中';
        const totalHours = Math.floor(seconds / 3600);
        if (totalHours >= 24) {
            const days = Math.floor(totalHours / 24);
            const hours = totalHours % 24;
            return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
        }
        return `${Math.max(1, totalHours)}h`;
    }

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isEspresso = (method?: string) => method === BrewMethod.ESPRESSO;

  const activeColdBrews = logs.filter(l => l.method === BrewMethod.COLD_BREW && l.timeSeconds === 0);

  return (
    <div className="flex flex-col gap-3 md:gap-4 h-auto md:h-full pb-2 pt-1 sm:pt-0">
      <style>{`
        .recharts-wrapper { outline: none !important; }
        .recharts-surface:focus { outline: none !important; }
        *:focus { outline: none !important; } 
      `}</style>

      {/* Top Stats */}
      <div className="grid grid-cols-12 gap-3 md:gap-4 h-20 sm:h-24 shrink-0">
        <div className="col-span-5 sm:col-span-4 md:col-span-3 bg-white p-3 sm:p-4 md:p-5 rounded-2xl border border-slate-100 flex items-center gap-2.5 sm:gap-3 md:gap-4 shadow-sm">
          <div className="p-1.5 sm:p-2.5 bg-orange-100 text-orange-600 rounded-xl shrink-0">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold tracking-wide whitespace-nowrap">冲煮次数</p>
            <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-800 leading-none mt-1 sm:mt-1.5">{totalBrews}</p>
          </div>
        </div>
        
        <div className="col-span-7 sm:col-span-8 md:col-span-9 bg-white p-3 sm:p-4 md:p-5 rounded-2xl border border-slate-100 flex items-center gap-2.5 sm:gap-3 md:gap-4 shadow-sm">
          <div className="p-1.5 sm:p-2.5 bg-amber-100 text-amber-600 rounded-xl shrink-0">
            <CoffeeBeanIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold tracking-wide whitespace-nowrap">咖啡豆 (在喝/累计)</p>
            <div className="flex items-baseline gap-1 mt-1 sm:mt-1.5">
                <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-800 leading-none">{activeBeans}</p>
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold">/ {totalBeans}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 md:gap-4 flex-1 min-h-0">
        
        {/* Last Brew - Takes more space on desktop */}
        <div className="sm:col-span-9 bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
             <Clock size={16} className="text-slate-400"/> 上一次冲煮
          </h3>
          
          {lastLog ? (
            <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-4 min-h-0">
              <div>
                 <div className="flex justify-between items-start mb-1 sm:mb-1.5">
                    <h4 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 line-clamp-1">{lastBean?.name || '未知咖啡豆'}</h4>
                    <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 ${
                      lastLog.method === BrewMethod.COLD_BREW && lastLog.timeSeconds === 0
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {lastLog.method === BrewMethod.COLD_BREW && lastLog.timeSeconds === 0 && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      )}
                      {lastLog.method === BrewMethod.COLD_BREW && lastLog.timeSeconds === 0 ? '冷萃中' : lastLog.method}
                    </span>
                 </div>
                 <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mb-3 sm:mb-4">
                    <Calendar size={12} className="text-slate-300"/>
                    {new Date(lastLog.date).toLocaleString()}
                 </div>

                 <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-slate-50/60 p-2 sm:p-3 rounded-xl text-center border border-slate-100/80">
                        <div className="text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">{isEspresso(lastLog.method) ? '粉液' : '粉水'}</div>
                        <div className="font-extrabold text-slate-700 text-sm sm:text-base">{lastLog.doseIn}g / {lastLog.yieldOut}g</div>
                    </div>
                    <div className="bg-slate-50/60 p-2 sm:p-3 rounded-xl text-center border border-slate-100/80">
                        <div className="text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">时间</div>
                        <div className="font-extrabold text-slate-700 text-sm sm:text-base">
                            {lastLog.method === BrewMethod.COLD_BREW && lastLog.timeSeconds === 0 ? (
                                <ColdBrewDashboardTimer startDate={lastLog.date} />
                            ) : (
                                formatTime(lastLog.timeSeconds, lastLog.method)
                            )}
                        </div>
                    </div>
                    <div className="bg-slate-50/60 p-2 sm:p-3 rounded-xl text-center border border-slate-100/80">
                        <div className="text-[10px] sm:text-xs text-slate-400 mb-1 font-medium">水温</div>
                        <div className="font-extrabold text-slate-700 text-sm sm:text-base">{lastLog.method === BrewMethod.COLD_BREW ? '-' : `${lastLog.temperature}°C`}</div>
                    </div>
                 </div>
              </div>

              <div className="h-12 sm:h-14 mt-3">
                {lastLog.method === BrewMethod.COLD_BREW && lastLog.timeSeconds === 0 ? (
                  onUpdateLog && (
                    <button
                      onClick={() => {
                        const now = Date.now();
                        const diffSeconds = Math.floor((now - lastLog.date) / 1000);
                        onUpdateLog({ ...lastLog, timeSeconds: Math.max(1, diffSeconds) });
                      }}
                      className="w-full h-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle size={14} />
                      结束冷萃
                    </button>
                  )
                ) : (
                  <div className="bg-amber-50/60 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-amber-100/50 h-full flex flex-col justify-center">
                     <p className="text-xs sm:text-sm text-amber-900/80 italic leading-relaxed line-clamp-2">
                       {lastLog.notes ? `"${lastLog.notes}"` : '暂无风味描述'}
                     </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 py-6">
               <Coffee size={36} />
               <p className="text-sm">暂无冲煮记录</p>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="sm:col-span-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">分布</h3>
          {methodData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between min-h-0">
                <div className="flex-1 min-h-[100px] sm:min-h-[120px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={methodData}
                        cx="50%"
                        cy="45%"
                        innerRadius={32}
                        outerRadius={46}
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
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', padding: '6px 10px' }} 
                            itemStyle={{color: '#334155'}} 
                        />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center mt-2 overflow-y-auto max-h-[44px] sm:max-h-[52px]">
                    {methodData.map((entry, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-600 font-medium">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                            <span className="truncate max-w-[65px] sm:max-w-[80px]">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 text-sm py-6">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;