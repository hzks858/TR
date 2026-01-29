
import React, { useState } from 'react';

type PlanLevel = 'COMPANY' | 'DEPARTMENT' | 'POSITION';

interface PlanItem {
  id: string;
  targetCompanyIds: string[];
  targetDepartmentIds: string[];
  targetPositionIds: string[];
  trainingTypes: string[];
  year: number;
  month: number;
  title: string;
  code: string;
  targetDescription: string;
  level: PlanLevel;
  status: 'planned' | 'in-progress' | 'completed';
  owner: string;
  progress: number;
}

const COMPANIES = [
  { id: 'C1', name: '金辉制药 (总仓)' },
  { id: 'C2', name: '金辉研发中心 (上海)' },
  { id: 'C3', name: '金辉生物制剂工厂' },
];

const DEPARTMENTS = [
  { id: 'D1', name: '质量保证部 (QA)' },
  { id: 'D2', name: '质量控制部 (QC)' },
  { id: 'D3', name: '生产部' },
  { id: 'D4', name: '工程部' },
  { id: 'D5', name: '物料部' },
];

const POSITIONS = [
  { id: 'P1', name: 'QA 经理' },
  { id: 'P2', name: 'QA 专员' },
  { id: 'P3', name: 'QC 组长' },
  { id: 'P4', name: '化验员' },
  { id: 'P5', name: '生产操作工' },
];

const TRAINING_TYPES = [
  { id: 'SELF', name: '自学' },
  { id: 'ONLINE', name: '线上' },
  { id: 'ONSITE', name: '现场培训' },
  { id: 'EXTERNAL', name: '外部培训' },
  { id: 'GUEST', name: '外聘讲师' },
];

// Updated range: 2026 - 2036
const PLAN_YEAR_START = 2026;
const PLAN_YEAR_END = 2036;
const YEAR_OPTIONS = Array.from(
  { length: PLAN_YEAR_END - PLAN_YEAR_START + 1 },
  (_, i) => PLAN_YEAR_START + i
);

const INITIAL_PLANS: PlanItem[] = [
  { 
    id: 'P101', 
    targetCompanyIds: ['C1', 'C2', 'C3'], 
    targetDepartmentIds: [], 
    targetPositionIds: [],
    trainingTypes: ['ONLINE', 'SELF'],
    year: 2026,
    month: 1, 
    title: '2026 年度 GMP 法律法规全集团贯宣', 
    code: 'TR-GRP-001', 
    targetDescription: '全集团所有员工', 
    level: 'COMPANY', 
    status: 'completed', 
    owner: '集团 QA 总监', 
    progress: 100 
  },
  { 
    id: 'P102', 
    targetCompanyIds: ['C1'], 
    targetDepartmentIds: ['D1', 'D2'], 
    targetPositionIds: ['P1', 'P3'],
    trainingTypes: ['ONSITE', 'GUEST'],
    year: 2026,
    month: 6, 
    title: '数据完整性 (ALCOA+) 高级研修班', 
    code: 'TR-C1-002', 
    targetDescription: 'QA/QC 核心管理岗', 
    level: 'DEPARTMENT', 
    status: 'in-progress', 
    owner: '合规部经理', 
    progress: 45 
  },
];

const AnnualTrainingPlan: React.FC = () => {
  const [plans, setPlans] = useState<PlanItem[]>(INITIAL_PLANS);
  const [activeLevel, setActiveLevel] = useState<PlanLevel>('COMPANY');
  const [filterCompanyId, setFilterCompanyId] = useState(COMPANIES[0].id);
  const [filterYear, setFilterYear] = useState(PLAN_YEAR_START);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    targetCompanyIds: [COMPANIES[0].id],
    targetDepartmentIds: [] as string[],
    targetPositionIds: [] as string[],
    trainingTypes: [] as string[],
    title: '',
    code: '',
    year: PLAN_YEAR_START,
    month: 1,
    targetDescription: '',
    owner: '',
    level: 'COMPANY' as PlanLevel
  });

  const filteredPlans = plans.filter(p => 
    p.level === activeLevel && 
    p.targetCompanyIds.includes(filterCompanyId) &&
    p.year === filterYear
  );

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: PlanItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      status: 'planned',
      progress: 0
    };
    setPlans(prev => [...prev, newItem]);
    setIsModalOpen(false);
    // Reset form
    setFormData({ 
      ...formData, 
      title: '', 
      code: '', 
      year: PLAN_YEAR_START,
      month: 1, 
      targetDescription: '', 
      owner: '', 
      targetDepartmentIds: [], 
      targetPositionIds: [],
      trainingTypes: []
    });
  };

  const toggleMultiSelect = (key: 'targetCompanyIds' | 'targetDepartmentIds' | 'targetPositionIds' | 'trainingTypes', id: string) => {
    setFormData(prev => {
      const current = prev[key];
      const next = current.includes(id) 
        ? current.filter(item => item !== id)
        : [...current, id];
      return { ...prev, [key]: next };
    });
  };

  const getStatusStyle = (status: PlanItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-100';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'planned': return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#111318]">年度培训计划</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">制定全集团、多实体、跨年度（2026-2036）的 GMP 培训体系。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">计划年份</span>
            <select 
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="h-10 px-4 bg-white border border-[#dbdfe6] rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#135bec] transition-all"
            >
              {YEAR_OPTIONS.map(y => (
                <option key={y} value={y}>{y} 年度</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">公司视图</span>
            <select 
              value={filterCompanyId}
              onChange={(e) => setFilterCompanyId(e.target.value)}
              className="h-10 px-4 bg-white border border-[#dbdfe6] rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#135bec] transition-all"
            >
              {COMPANIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end h-10 mt-auto">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 h-full px-5 bg-[#135bec] text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              新增计划项
            </button>
          </div>
        </div>
      </div>

      {/* Level Tabs */}
      <div className="flex bg-white p-1 rounded-xl border border-[#dbdfe6] w-full max-w-md shadow-sm">
        {(['COMPANY', 'DEPARTMENT', 'POSITION'] as PlanLevel[]).map((level) => (
          <button
            key={level}
            onClick={() => setActiveLevel(level)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeLevel === level 
                ? 'bg-[#135bec] text-white shadow-sm' 
                : 'text-gray-500 hover:text-[#111318] hover:bg-gray-50'
            }`}
          >
            {level === 'COMPANY' ? '公司级' : level === 'DEPARTMENT' ? '部门级' : '岗位级'}
          </button>
        ))}
      </div>

      {/* Timeline View */}
      <div className="bg-white rounded-xl border border-[#dbdfe6] p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
            <span className="text-[#135bec]">{filterYear} 年度</span> 执行概览 - {COMPANIES.find(c => c.id === filterCompanyId)?.name}
          </h3>
          <div className="grid grid-cols-12 gap-2">
            {months.map(m => {
              const plansInMonth = filteredPlans.filter(p => p.month === m);
              return (
                <div key={m} className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-tighter">{m}月</div>
                  <div className="h-28 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 p-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                    {plansInMonth.map(p => (
                      <div key={p.id} title={p.title} className="text-[8px] p-1.5 bg-white border border-gray-100 rounded shadow-xs truncate font-bold text-[#135bec] hover:border-[#135bec] transition-all cursor-default">
                        {p.code}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">时间 / 代码</th>
              <th className="px-6 py-4">培训课题 / 类型</th>
              <th className="px-6 py-4">目标实体 / 受众</th>
              <th className="px-6 py-4">负责人</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPlans.length > 0 ? filteredPlans.sort((a,b) => a.month - b.month).map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-[#111318]">{plan.year}年 {plan.month}月</span>
                    <span className="text-[10px] font-mono font-bold text-gray-400">{plan.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm font-bold text-[#111318] group-hover:text-[#135bec] transition-colors">{plan.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200 uppercase tracking-tight">Level: {plan.level}</span>
                      {plan.trainingTypes?.map(tid => (
                        <span key={tid} className="text-[8px] font-black px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-100 uppercase tracking-tighter">
                          {TRAINING_TYPES.find(t => t.id === tid)?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap gap-1">
                      {plan.targetCompanyIds.map(cid => (
                        <span key={cid} className="text-[8px] font-black bg-blue-50 text-[#135bec] px-1 py-0.5 rounded border border-blue-100">
                          {COMPANIES.find(c => c.id === cid)?.name.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium italic">{plan.targetDescription}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200">
                      {plan.owner.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-gray-700">{plan.owner}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${getStatusStyle(plan.status)}`}>
                    {plan.status === 'completed' ? '已完成' : plan.status === 'in-progress' ? '执行中' : '计划中'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-gray-400 hover:text-[#135bec] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                  <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic text-sm">暂无符合条件的年度计划</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-black text-[#111318]">制定年度计划项</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">支持公司、部门、岗位的多维度联合靶向</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreatePlan} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              {/* Target Multi-Selection Grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Companies Multi-Select */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">corporate_fare</span>
                    目标公司 (多选)
                  </label>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {COMPANIES.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleMultiSelect('targetCompanyIds', c.id)}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                          formData.targetCompanyIds.includes(c.id)
                            ? 'bg-[#135bec] text-white border-[#135bec] shadow-sm shadow-blue-500/30'
                            : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Departments Multi-Select */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">account_tree</span>
                    目标部门 (多选)
                  </label>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {DEPARTMENTS.map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleMultiSelect('targetDepartmentIds', d.id)}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                          formData.targetDepartmentIds.includes(d.id)
                            ? 'bg-[#135bec] text-white border-[#135bec] shadow-sm shadow-blue-500/30'
                            : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Positions Multi-Select */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">engineering</span>
                    针对岗位 (多选)
                  </label>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {POSITIONS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleMultiSelect('targetPositionIds', p.id)}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                          formData.targetPositionIds.includes(p.id)
                            ? 'bg-[#135bec] text-white border-[#135bec] shadow-sm shadow-blue-500/30'
                            : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Training Type Multi-Select */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">school</span>
                  培训类型 (多选)
                </label>
                <div className="flex flex-wrap gap-3">
                  {TRAINING_TYPES.map(type => {
                    const isSelected = formData.trainingTypes.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleMultiSelect('trainingTypes', type.id)}
                        className={`px-6 h-11 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-4 ring-purple-100'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{isSelected ? 'check_circle' : 'add_circle'}</span>
                        {type.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Info Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-8 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">培训课题名称</label>
                  <input 
                    type="text" required placeholder="例如: 无菌区域环境监控规范"
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]"
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">计划代码</label>
                    <input 
                      type="text" required placeholder="TR-2026-XX"
                      className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#135bec]"
                      value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">年份 (2026-2036)</label>
                    <select 
                      className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec] transition-all"
                      value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                    >
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y} 年</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">执行月份</label>
                    <select 
                      className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec] transition-all"
                      value={formData.month} onChange={e => setFormData({...formData, month: parseInt(e.target.value)})}
                    >
                      {months.map(m => <option key={m} value={m}>{m} 月</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">计划层级</label>
                  <div className="flex gap-2">
                    {(['COMPANY', 'DEPARTMENT', 'POSITION'] as PlanLevel[]).map(l => (
                      <button
                        key={l} type="button" onClick={() => setFormData({...formData, level: l})}
                        className={`flex-1 h-11 rounded-xl text-[10px] font-black uppercase transition-all border ${
                          formData.level === l ? 'bg-[#111318] text-white border-[#111318]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {l === 'COMPANY' ? '公司' : l === 'DEPARTMENT' ? '部门' : '岗位'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">指定负责人</label>
                  <input 
                    type="text" required placeholder="例如: 张三 (质量总监)"
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]"
                    value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">受众范围详细描述</label>
                  <input 
                    type="text" required placeholder="例如: 仅限从事灭菌岗位的 QA 与生产人员"
                    className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#135bec]"
                    value={formData.targetDescription} onChange={e => setFormData({...formData, targetDescription: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 pb-4 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 h-12 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">取消</button>
                <button type="submit" className="px-10 h-12 bg-[#135bec] text-white text-sm font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest active:scale-95">发布年度计划项</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnualTrainingPlan;
