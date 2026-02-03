
import React, { useMemo } from 'react';
import { PlanItem, UserAccount, Cert, Task, Course } from '../types';

interface Props {
  plans: PlanItem[];
  setPlans: React.Dispatch<React.SetStateAction<PlanItem[]>>;
  currentUser: UserAccount;
  courses: Course[];
}

const COMPANY_ID_MAP: Record<string, string> = { 'C1': '金辉制药 (总仓)', 'C2': '金辉研发中心 (上海)', 'C3': '金辉生物制剂工厂' };
const DEPT_ID_MAP: Record<string, string> = { 'D1': '质量保证部 (QA)', 'D2': '质量控制部 (QC)', 'D3': '生产部', 'D4': '工程部', 'D5': '物料部' };
const POS_ID_MAP: Record<string, string> = { 'P1': '首席合规官', 'P2': 'QA 组长', 'P3': 'QC 组长', 'P4': '化验员', 'P5': '生产操作工' };

const UserTrainingHub: React.FC<Props> = ({ plans, setPlans, currentUser, courses }) => {
  // 核心逻辑：从年度计划中解构出具体的课程任务，并映射各个课程的独立进度
  const tasks: Task[] = useMemo(() => {
    const matchedPlans = plans.filter(plan => {
      const companyMatch = plan.targetCompanyIds.length === 0 || plan.targetCompanyIds.some(id => COMPANY_ID_MAP[id] === currentUser.company);
      const deptMatch = plan.targetDepartmentIds.length === 0 || plan.targetDepartmentIds.some(id => DEPT_ID_MAP[id] === currentUser.department);
      const posMatch = plan.targetPositionIds.length === 0 || plan.targetPositionIds.some(id => POS_ID_MAP[id] === currentUser.position);
      return companyMatch && deptMatch && posMatch;
    });

    const destructuredTasks: Task[] = [];
    matchedPlans.forEach(plan => {
      (plan.courseIds || []).forEach(courseId => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
          const courseProgress = plan.courseProgress?.[courseId] || 0;
          destructuredTasks.push({
            id: `${plan.id}-${course.id}`,
            planId: plan.id,
            code: course.code,
            title: course.name,
            version: course.version,
            progress: courseProgress,
            status: courseProgress >= 100 ? 'completed' : 'pending',
            dueDate: `${plan.year}-${plan.month.toString().padStart(2, '0')}-28`,
            priority: plan.priority
          });
        }
      });
    });

    return destructuredTasks;
  }, [plans, currentUser, courses]);

  // 处理学习进度更新并同步至计划总体进度
  const handleSimulateLearn = (planId: string, courseId: string) => {
    setPlans(prevPlans => prevPlans.map(plan => {
      if (plan.id !== planId) return plan;

      const currentProgressMap = plan.courseProgress || {};
      const currentCourseProgress = currentProgressMap[courseId] || 0;
      const nextCourseProgress = Math.min(100, currentCourseProgress + 10);

      const nextProgressMap = {
        ...currentProgressMap,
        [courseId]: nextCourseProgress
      };

      // 计算计划的总体进度：所有关联课程进度的平均值
      const totalCourseCount = plan.courseIds.length;
      const totalProgressSum = plan.courseIds.reduce((sum, cid) => sum + (nextProgressMap[cid] || 0), 0);
      const overallPlanProgress = Math.round(totalProgressSum / totalCourseCount);

      return {
        ...plan,
        courseProgress: nextProgressMap,
        progress: overallPlanProgress,
        status: overallPlanProgress >= 100 ? 'completed' : 'in-progress'
      };
    }));
  };

  const certs: Cert[] = [
    { id: 'c1', name: 'GMP 基础二级认证', certId: 'CERT-8829-X', expiryDate: '2024-12-12', remainingDays: 14, status: 'expiring' },
  ];

  const getPriorityStyle = (priority?: string) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-50 text-red-600 border-red-100';
      case 'MEDIUM': return 'bg-blue-50 text-[#135bec] border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const urgentTasks = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'completed');

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">认证环境: 已通过 GAMP 5 验证</span>
          </div>
          <h1 className="text-[#111318] text-4xl font-black tracking-tight">你好, {currentUser.name}</h1>
          <p className="text-[#616f89] text-base font-medium">您的年度计划任务已解析为 <span className="text-[#135bec] font-black">{tasks.length}</span> 项具体合规课程。</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white border border-[#dbdfe6] p-4 rounded-xl flex items-center gap-4 min-w-[140px] shadow-sm">
            <div className="size-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><span className="material-symbols-outlined font-bold">priority_high</span></div>
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">高优先级课程</p>
              <p className="text-xl font-black text-[#111318]">{urgentTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-8 space-y-8">
          <section className="space-y-6">
            <h2 className="text-xl font-black text-[#111318] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#135bec]">school</span>
              解构出的课程清单
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task) => (
                <div key={task.id} className={`bg-white border-t-4 border-[#135bec] border border-[#dbdfe6] rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl transition-all group ${task.status === 'completed' ? 'border-[#22c55e]' : ''}`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${getPriorityStyle(task.priority)}`}>
                        {task.priority === 'HIGH' ? '紧急' : '普通'}
                      </span>
                      <span className="text-[8px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase">截止: {task.dueDate}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#616f89] font-black font-mono tracking-widest">{task.code} • {task.version}</p>
                      <h3 className="text-lg font-black text-[#111318] leading-tight mt-1 group-hover:text-[#135bec] transition-colors">{task.title}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>当前学习进度</span>
                        <span className="font-mono text-[#111318]">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#135bec] transition-all duration-500 ease-out" style={{ width: `${task.progress}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    {task.status === 'completed' ? (
                       <div className="flex-1 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center gap-2 border border-green-100 animate-in fade-in">
                          <span className="material-symbols-outlined text-sm">verified</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">已完成合规要求</span>
                       </div>
                    ) : (
                      <button 
                        onClick={() => handleSimulateLearn(task.planId!, task.code.includes('PRO') ? 'c1' : 'c2')}
                        className="flex-1 bg-[#111318] text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-gray-800 transition-all active:scale-95"
                      >
                        继续学习 (模拟进度)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="xl:col-span-4 space-y-6">
           <div className="bg-[#111318] text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">合规看板</h3>
              <div className="space-y-8">
                 <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-gray-500 uppercase font-black">年度任务完成概览</p>
                    <div className="flex items-center gap-4">
                       <p className="text-4xl font-black text-[#135bec]">{(tasks.filter(t => t.status === 'completed').length / (tasks.length || 1) * 100).toFixed(0)}%</p>
                       <div className="flex-1 h-1 bg-white/10 rounded-full">
                          <div className="h-full bg-[#135bec] transition-all duration-700" style={{ width: `${(tasks.filter(t => t.status === 'completed').length / (tasks.length || 1) * 100)}%` }}></div>
                       </div>
                    </div>
                 </div>
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#135bec]">fingerprint</span>
                    <p className="text-[10px] text-gray-300 leading-tight">您的电子签名已通过验证，可以随时进行合规确认。</p>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default UserTrainingHub;
