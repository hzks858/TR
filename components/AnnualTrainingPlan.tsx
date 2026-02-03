
import React, { useState, useMemo } from 'react';
import { PlanItem, Course, HierarchyNode } from '../types';

type PlanLevel = 'COMPANY' | 'DEPARTMENT' | 'POSITION';

interface Props {
  plans: PlanItem[];
  setPlans: React.Dispatch<React.SetStateAction<PlanItem[]>>;
  courses: Course[];
  hierarchyData: Record<string, HierarchyNode[]>;
}

const PRIORITIES = [
  { value: 'HIGH', label: '高优先级', color: 'text-red-600 bg-red-50 border-red-100' },
  { value: 'MEDIUM', label: '中优先级', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { value: 'LOW', label: '低优先级', color: 'text-gray-500 bg-gray-50 border-gray-100' },
];

const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => 2026 + i);

const AnnualTrainingPlan: React.FC<Props> = ({ plans, setPlans, courses, hierarchyData }) => {
  const [activeLevel, setActiveLevel] = useState<PlanLevel>('COMPANY');
  const [filterYear, setFilterYear] = useState(2026);
  const [filterCompanyId, setFilterCompanyId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const orgHierarchy = hierarchyData['ORGANIZATION'] || [];
  const courseHierarchy = hierarchyData['COURSE'] || [];

  const [formData, setFormData] = useState<Omit<PlanItem, 'id' | 'progress'>>({
    targetCompanyIds: [],
    targetDepartmentIds: [],
    targetPositionIds: [],
    courseIds: [],
    trainingTypes: ['ONLINE'],
    title: '',
    code: '',
    year: 2026,
    month: 1,
    targetDescription: '',
    owner: '',
    level: 'COMPANY',
    status: 'planned',
    priority: 'MEDIUM'
  });

  const filteredPlans = plans.filter(p => 
    p.year === filterYear && 
    p.level === activeLevel && 
    (filterCompanyId === 'ALL' || p.targetCompanyIds.includes(filterCompanyId))
  );

  const toggleMultiSelect = (key: keyof Omit<PlanItem, 'id' | 'progress'>, id: string) => {
    setFormData(prev => {
      const current = prev[key] as string[];
      const next = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
      return { ...prev, [key]: next };
    });
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlanId) {
      setPlans(prev => prev.map(p => p.id === editingPlanId ? { ...p, ...formData } : p));
    } else {
      setPlans(prev => [...prev, { ...formData, id: Math.random().toString(36).substr(2, 9), progress: 0 }]);
    }
    setIsModalOpen(false);
  };

  // 递归渲染机构选择树
  const renderOrgTree = (nodes: HierarchyNode[], level: number = 0) => nodes.map(node => {
    const idKey = level === 0 ? 'targetCompanyIds' : level === 1 ? 'targetDepartmentIds' : 'targetPositionIds';
    const isChecked = (formData[idKey] as string[]).includes(node.id);
    return (
      <div key={node.id} className="select-none">
        <div className="flex items-center gap-2 py-1.5 hover:bg-white/60 rounded-lg group">
          <div style={{ width: `${level * 20}px` }} className="shrink-0 flex justify-end">
             {level > 0 && <span className="border-l-2 border-b-2 border-gray-200 w-3 h-2 -translate-y-1.5 rounded-bl-sm"></span>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isChecked} onChange={() => toggleMultiSelect(idKey, node.id)} className="size-4 rounded border-gray-300 text-[#135bec]" />
            <span className={`text-xs font-bold ${isChecked ? 'text-[#111318]' : 'text-gray-500'}`}>{node.name}</span>
          </label>
        </div>
        {node.children && renderOrgTree(node.children, level + 1)}
      </div>
    );
  });

  // 递归渲染课程编码规则树
  const renderCourseRuleTree = (nodes: HierarchyNode[], level: number = 0) => nodes.map(node => {
    const matchedCourses = courses.filter(c => c.hierarchyIds.includes(node.id) && c.status === 'active');
    return (
      <div key={node.id} className="space-y-1">
        <div className="flex items-center gap-2 py-2 border-b border-gray-50 mt-2">
          <div style={{ width: `${level * 16}px` }}></div>
          <span className="material-symbols-outlined text-[14px] text-gray-300">folder_open</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{node.name}</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 ml-4 py-1">
          {matchedCourses.map(c => (
            <label key={c.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${formData.courseIds.includes(c.id) ? 'bg-[#135bec]/5 border-[#135bec]/30' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
              <input type="checkbox" checked={formData.courseIds.includes(c.id)} onChange={() => toggleMultiSelect('courseIds', c.id)} className="size-4 rounded border-gray-300 text-[#135bec]" />
              <div className="min-w-0">
                <p className="text-xs font-black text-[#111318] truncate">{c.name}</p>
                <p className="text-[9px] font-mono text-gray-400 uppercase">{c.code}</p>
              </div>
            </label>
          ))}
        </div>
        {node.children && renderCourseRuleTree(node.children, level + 1)}
      </div>
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#111318]">年度培训计划 (GAMP)</h1>
          <p className="text-gray-500 text-sm mt-1">分层管理数据关联：同步【机构设置】与【编码规则】的多选映射。</p>
        </div>
        <button onClick={() => { setEditingPlanId(null); setFormData({ ...formData, year: filterYear }); setIsModalOpen(true); }} className="h-11 px-6 bg-[#135bec] text-white text-xs font-black rounded-xl shadow-lg uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span> 录入新计划
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#dbdfe6] shadow-sm flex gap-6 items-center">
         <div className="space-y-1.5 min-w-[150px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">年份筛选</label>
            <select className="w-full h-10 px-4 bg-gray-50 border-none rounded-xl text-xs font-bold" value={filterYear} onChange={e => setFilterYear(parseInt(e.target.value))}>
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y} 年度</option>)}
            </select>
         </div>
         <div className="space-y-1.5 min-w-[200px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">机构实体 (L1)</label>
            <select className="w-full h-10 px-4 bg-gray-50 border-none rounded-xl text-xs font-bold" value={filterCompanyId} onChange={e => setFilterCompanyId(e.target.value)}>
               <option value="ALL">全部实体</option>
               {orgHierarchy.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
         </div>
      </div>

      <div className="flex bg-white p-1 rounded-2xl border border-[#dbdfe6] w-full max-w-sm shadow-sm">
        {(['COMPANY', 'DEPARTMENT', 'POSITION'] as PlanLevel[]).map(level => (
          <button key={level} onClick={() => setActiveLevel(level)} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${activeLevel === level ? 'bg-[#135bec] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            {level === 'COMPANY' ? '公司级' : level === 'DEPARTMENT' ? '部门级' : '岗位级'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#dbdfe6] shadow-sm overflow-hidden min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-8 py-4">周期 / 计划代码</th>
              <th className="px-8 py-4">计划课题</th>
              <th className="px-8 py-4">关联课程</th>
              <th className="px-8 py-4">优先级</th>
              <th className="px-8 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPlans.map(plan => (
              <tr key={plan.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-8 py-5">
                  <p className="text-sm font-black text-[#111318]">{plan.year}年 {plan.month}月</p>
                  <p className="text-[10px] font-mono text-gray-400">{plan.code}</p>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-[#111318]">{plan.title}</p>
                </td>
                <td className="px-8 py-5">
                   <span className="px-2 py-0.5 bg-blue-50 text-[#135bec] text-[10px] font-black rounded-full border border-blue-100">
                     {plan.courseIds.length} 门受控课程
                   </span>
                </td>
                <td className="px-8 py-5">
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${PRIORITIES.find(p => p.value === plan.priority)?.color}`}>
                     {PRIORITIES.find(p => p.value === plan.priority)?.label}
                   </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditingPlanId(plan.id); setFormData(plan); setIsModalOpen(true); }} className="size-8 flex items-center justify-center text-gray-400 hover:text-[#135bec]"><span className="material-symbols-outlined text-lg">edit</span></button>
                    <button onClick={() => setPlans(prev => prev.filter(p => p.id !== plan.id))} className="size-8 flex items-center justify-center text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111318]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <h3 className="text-xl font-black text-[#111318]">{editingPlanId ? '修订年度合规计划' : '新增年度培训计划'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-transform active:scale-90"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSavePlan} className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-[#135bec] uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-sm">assignment</span> 1. 计划基础属性</label>
                    <div className="space-y-4">
                      <input type="text" required placeholder="课题名称" className="w-full h-12 px-5 bg-gray-50 border-none rounded-2xl text-sm font-black" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" required placeholder="计划代码" className="w-full h-12 px-5 bg-gray-50 border-none rounded-2xl text-sm font-mono font-bold" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                        <select className="w-full h-12 px-5 bg-gray-50 border-none rounded-2xl text-sm font-bold" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <label className="text-[11px] font-black text-[#135bec] uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-sm">schedule</span> 2. 时间与责任人</label>
                    <div className="grid grid-cols-2 gap-4">
                      <select className="h-12 px-5 bg-gray-50 border-none rounded-2xl text-sm font-bold" value={formData.month} onChange={e => setFormData({...formData, month: parseInt(e.target.value)})}>
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{m} 月份执行</option>)}
                      </select>
                      <select className="h-12 px-5 bg-gray-50 border-none rounded-2xl text-sm font-bold" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}>
                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y} 学年度</option>)}
                      </select>
                      <input type="text" required placeholder="计划责任人" className="col-span-2 h-12 px-5 bg-gray-50 border-none rounded-2xl text-sm font-bold" value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <label className="text-[11px] font-black text-[#135bec] uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-sm">account_tree</span> 3. 目标受众映射 (分层数据多选)</label>
                      <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 h-80 overflow-y-auto custom-scrollbar">
                         {renderOrgTree(orgHierarchy)}
                      </div>
                   </div>
                   <div className="space-y-6">
                      <label className="text-[11px] font-black text-[#135bec] uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-sm">rule</span> 4. 编码规则关联课程 (L1-L3 多选)</label>
                      <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 h-80 overflow-y-auto custom-scrollbar">
                         {renderCourseRuleTree(courseHierarchy)}
                      </div>
                   </div>
                </div>
              </div>
              <div className="px-10 py-8 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                 <button type="submit" className="px-12 h-12 bg-[#135bec] text-white text-xs font-black rounded-xl shadow-xl shadow-blue-500/20 uppercase tracking-[0.1em] active:scale-95 transition-all">发布年度合规计划</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualTrainingPlan;
