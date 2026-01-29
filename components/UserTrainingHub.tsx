
import React, { useMemo } from 'react';
import { Task, Cert } from '../types';

const UserTrainingHub: React.FC = () => {
  const tasks: Task[] = [
    { id: '1', code: 'SOP-001', title: 'A 级区域无菌工艺操作', version: 'v3.2', progress: 60, status: 'overdue', isMandatory: true },
    { id: '2', code: 'QA-POL-04', title: '数据完整性与 ALCOA+ 原则', version: 'v1.0', progress: 0, status: 'pending', dueDate: '剩余 4 天', isMandatory: true },
    { id: '3', code: 'SOP-089', title: '应急泄漏处理方案', version: 'v2.1', progress: 100, status: 'ready' },
    { id: '4', code: 'SOP-LOG-01', title: '冷链物流偏差处理程序', version: 'v1.1', progress: 20, status: 'pending', isMandatory: false },
  ];

  const certs: Cert[] = [
    { id: 'c1', name: 'GMP 基础二级认证', certId: 'CERT-8829-X', expiryDate: '2024-12-12', remainingDays: 14, status: 'expiring' },
    { id: 'c2', name: '生物工艺卫生管理', certId: 'CERT-1102-B', expiryDate: '2025-08-20', remainingDays: 260, status: 'active' },
    { id: 'c3', name: '冷链物流规范', certId: 'CERT-4491-L', expiryDate: '2025-05-05', remainingDays: 153, status: 'active' },
  ];

  const getStatusText = (status: string) => {
    switch(status) {
      case 'overdue': return '逾期';
      case 'pending': return '待办';
      case 'ready': return '可考核';
      case 'completed': return '已完成';
      default: return status;
    }
  };

  // Dashboard calculations
  const urgentTasks = useMemo(() => tasks.filter(t => t.status === 'overdue' || t.isMandatory), [tasks]);
  const expiringCerts = useMemo(() => certs.filter(c => c.status === 'expiring'), [certs]);
  const readyToAssess = useMemo(() => tasks.filter(t => t.status === 'ready'), [tasks]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header with Welcome and Global Status */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Compliance Status: Valid</span>
          </div>
          <h1 className="text-[#111318] text-4xl font-black tracking-tight">下午好, Alex Johnson</h1>
          <p className="text-[#616f89] text-base font-medium">您的合规培训进度已完成 <span className="text-[#135bec] font-black">84%</span>。目前有 3 项关键更新待处理。</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white border border-[#dbdfe6] p-4 rounded-xl flex items-center gap-4 min-w-[140px] shadow-sm hover:shadow-md transition-shadow">
            <div className="size-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined font-bold">priority_high</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">急需处理</p>
              <p className="text-xl font-black text-[#111318]">{urgentTasks.length}</p>
            </div>
          </div>
          <div className="bg-white border border-[#dbdfe6] p-4 rounded-xl flex items-center gap-4 min-w-[140px] shadow-sm hover:shadow-md transition-shadow">
            <div className="size-10 rounded-lg bg-[#135bec]/10 text-[#135bec] flex items-center justify-center">
              <span className="material-symbols-outlined font-bold">assignment_turned_in</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">已获证书</p>
              <p className="text-xl font-black text-[#111318]">{certs.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Content Area: My Learning */}
        <div className="xl:col-span-8 space-y-8">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#111318] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#135bec]">school</span>
                当前培训课程
              </h2>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#135bec] hover:border-[#135bec] transition-all">全部记录</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task) => (
                <div key={task.id} className={`bg-white border-t-4 ${
                  task.status === 'overdue' ? 'border-red-500' : task.status === 'ready' ? 'border-green-500' : 'border-[#135bec]'
                } border border-[#dbdfe6] rounded-xl p-6 flex flex-col justify-between hover:shadow-xl transition-all group translate-y-0 hover:-translate-y-1`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                        task.status === 'overdue' ? 'bg-red-50 text-red-600' : task.status === 'ready' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-[#135bec]'
                      }`}>
                        {task.dueDate || getStatusText(task.status)}
                      </span>
                      {task.isMandatory && (
                        <span className="material-symbols-outlined text-amber-500 text-lg" title="Mandatory SOP">verified</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-[#616f89] font-black font-mono tracking-widest">{task.code} • {task.version}</p>
                      {/* Fixed: Property 'text' does not exist on type 'Task', using 'title' instead */}
                      <h3 className="text-lg font-black text-[#111318] leading-tight mt-1 group-hover:text-[#135bec] transition-colors">{task.title}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>学习进度</span>
                        <span className="text-[#111318]">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${task.progress === 100 ? 'bg-green-500' : 'bg-[#135bec]'}`} 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button className="flex-1 bg-[#111318] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-lg hover:bg-gray-800 transition-all shadow-md active:scale-95">
                      {task.progress === 100 ? '复习模块' : '继续学习'}
                    </button>
                    {task.status === 'ready' ? (
                      <button className="flex-1 bg-white border-2 border-[#135bec] text-[#135bec] text-[10px] font-black uppercase tracking-widest py-3 rounded-lg hover:bg-blue-50 transition-all shadow-sm active:scale-95">
                        开始考核
                      </button>
                    ) : (
                      <div className="flex-1 bg-gray-50 border border-gray-100 text-gray-300 text-[10px] font-black uppercase tracking-widest py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        锁定中
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-[#111318] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#135bec]">workspace_premium</span>
              合规资质矩阵
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certs.map((cert) => (
                <div key={cert.id} className="bg-white p-5 rounded-xl border border-[#dbdfe6] flex items-center gap-5 hover:border-[#135bec] transition-all group shadow-sm">
                  <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                    cert.status === 'expiring' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-blue-50 border-blue-100 text-[#135bec]'
                  }`}>
                    <span className="material-symbols-outlined text-2xl font-bold">verified_user</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black text-[#111318] truncate group-hover:text-[#135bec] transition-colors">{cert.name}</h4>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{cert.certId}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div className={`h-full ${cert.status === 'expiring' ? 'bg-orange-500' : 'bg-[#135bec]'}`} style={{ width: cert.status === 'expiring' ? '20%' : '100%' }}></div>
                      </div>
                      <span className={`text-[9px] font-black uppercase shrink-0 ${cert.status === 'expiring' ? 'text-orange-600' : 'text-green-600'}`}>
                        {cert.status === 'expiring' ? `${cert.remainingDays}D 剩余` : '有效'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Action Sidebar: Simplified Training Dashboard */}
        <aside className="xl:col-span-4 space-y-6">
          <div className="bg-[#111318] text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 size-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -left-4 bottom-10 size-24 bg-[#135bec]/20 rounded-full blur-2xl"></div>
            
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">dashboard</span>
              合规仪表板 (简讯)
            </h3>

            <div className="space-y-6 relative z-10">
              {/* Urgent Items */}
              {urgentTasks.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-sm">notification_important</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">必须完成的任务</span>
                  </div>
                  {urgentTasks.slice(0, 2).map(task => (
                    <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors cursor-pointer group">
                      <div className="flex justify-between mb-1">
                        <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">{task.code}</span>
                        <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter">强制执行</span>
                      </div>
                      {/* Fixed: Property 'text' does not exist on type 'Task', using 'title' instead */}
                      <p className="text-xs font-bold leading-tight group-hover:text-blue-400 transition-colors">{task.title}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Ready Assessments */}
              {readyToAssess.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500 text-sm">quiz</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">待办考核</span>
                  </div>
                  {readyToAssess.map(task => (
                    <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                      <div>
                        {/* Fixed: Property 'text' does not exist on type 'Task', using 'title' instead */}
                        <p className="text-xs font-bold">{task.title}</p>
                        <p className="text-[9px] text-gray-500 font-medium mt-0.5">模块学习已 100% 完成</p>
                      </div>
                      <span className="material-symbols-outlined text-white/40 group-hover:text-white transition-all group-hover:translate-x-1">chevron_right</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Expiring Badges */}
              {expiringCerts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500 text-sm">alarm</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">资质即将过期</span>
                  </div>
                  {expiringCerts.map(cert => (
                    <div key={cert.id} className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                        <span className="material-symbols-outlined text-sm">priority_high</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-orange-500 truncate">{cert.name}</p>
                        <p className="text-[9px] text-gray-500 font-medium">将于 {cert.remainingDays} 天后失效</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {urgentTasks.length === 0 && readyToAssess.length === 0 && expiringCerts.length === 0 && (
                <div className="py-10 text-center space-y-3">
                  <span className="material-symbols-outlined text-green-500 text-4xl">verified</span>
                  <p className="text-xs font-bold text-gray-400">目前暂无紧急待办项</p>
                </div>
              )}
            </div>

            <button className="w-full mt-10 py-3 bg-[#135bec] hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              同步合规数据
            </button>
          </div>

          <div className="bg-white border border-[#dbdfe6] rounded-2xl p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">学习成就</h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative size-12 flex items-center justify-center shrink-0">
                <svg className="size-full -rotate-90">
                  <circle cx="24" cy="24" r="20" className="stroke-gray-100 fill-none" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" className="stroke-[#135bec] fill-none" strokeWidth="4" strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - 0.75)}`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[10px] font-black text-[#135bec]">75%</span>
              </div>
              <div>
                <p className="text-xs font-black text-[#111318]">本季合规分</p>
                <p className="text-[10px] text-gray-400 font-medium">排名超过全院 92% 的员工</p>
              </div>
            </div>
            <button className="w-full py-2.5 bg-gray-50 text-gray-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
              查看年度积分详情
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UserTrainingHub;
