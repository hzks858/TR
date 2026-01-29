
import React, { useState } from 'react';

interface Position {
  id: string;
  name: string;
  code: string;
  riskLevel: 'High' | 'Medium' | 'Low';
}

interface Department {
  id: string;
  name: string;
  code: string;
  manager: string;
  isGxP: boolean;
  positions: Position[];
  isOpen?: boolean;
}

interface Company {
  id: string;
  name: string;
  code: string;
  address: string;
  manager?: string;
  departments: Department[];
  isOpen?: boolean;
}

const INITIAL_COMPANIES: Company[] = [
  {
    id: 'C1',
    name: '金辉制药有限公司 (G-Pharma Ltd.)',
    code: 'GP-GROUP-01',
    address: '高新技术产业开发区生物医药园区 A1 栋',
    manager: '王利民',
    isOpen: true,
    departments: [
      {
        id: 'D1',
        name: '质量保证部 (QA)',
        code: 'DEPT-QA',
        manager: '张利民',
        isGxP: true,
        isOpen: true,
        positions: [
          { id: 'P1', name: 'QA 经理', code: 'POS-QA-MGR', riskLevel: 'High' },
          { id: 'P2', name: '验证工程师', code: 'POS-QA-VAL', riskLevel: 'High' },
          { id: 'P3', name: '文档专员', code: 'POS-QA-DOC', riskLevel: 'Medium' }
        ]
      },
      {
        id: 'D2',
        name: '质量控制部 (QC)',
        code: 'DEPT-QC',
        manager: '李晓华',
        isGxP: true,
        isOpen: false,
        positions: [
          { id: 'P4', name: '分析化验员', code: 'POS-QC-LAB', riskLevel: 'High' },
          { id: 'P5', name: 'QC 组长', code: 'POS-QC-LD', riskLevel: 'High' }
        ]
      }
    ]
  }
];

const OrgSettings: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [isAddPosModalOpen, setIsAddPosModalOpen] = useState(false);
  
  const [targetCompanyId, setTargetCompanyId] = useState<string | null>(null);
  const [targetDeptId, setTargetDeptId] = useState<string | null>(null);

  // Form States
  const [newCompany, setNewCompany] = useState({ name: '', code: '', address: '', manager: '' });
  const [newDept, setNewDept] = useState({ name: '', code: '', manager: '', isGxP: true });
  const [newPos, setNewPos] = useState({ name: '', code: '', riskLevel: 'Medium' as Position['riskLevel'] });

  const toggleCompany = (companyId: string) => {
    setCompanies(companies.map(c => 
      c.id === companyId ? { ...c, isOpen: !c.isOpen } : c
    ));
  };

  const toggleDept = (companyId: string, deptId: string) => {
    setCompanies(companies.map(c => 
      c.id === companyId ? {
        ...c,
        departments: c.departments.map(d => 
          d.id === deptId ? { ...d, isOpen: !d.isOpen } : d
        )
      } : c
    ));
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const companyToAdd: Company = {
      id: `C${Math.random().toString(36).substr(2, 4)}`,
      ...newCompany,
      departments: [],
      isOpen: true
    };
    setCompanies([...companies, companyToAdd]);
    setIsAddCompanyModalOpen(false);
    setNewCompany({ name: '', code: '', address: '', manager: '' });
  };

  const openAddDeptModal = (companyId: string) => {
    setTargetCompanyId(companyId);
    setIsAddDeptModalOpen(true);
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompanyId) return;

    const deptToAdd: Department = {
      id: `D${Math.random().toString(36).substr(2, 4)}`,
      ...newDept,
      positions: [],
      isOpen: true
    };

    setCompanies(companies.map(c => 
      c.id === targetCompanyId ? { ...c, departments: [...c.departments, deptToAdd] } : c
    ));

    setIsAddDeptModalOpen(false);
    setNewDept({ name: '', code: '', manager: '', isGxP: true });
    setTargetCompanyId(null);
  };

  const openAddPosModal = (companyId: string, deptId: string) => {
    setTargetCompanyId(companyId);
    setTargetDeptId(deptId);
    setIsAddPosModalOpen(true);
  };

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompanyId || !targetDeptId) return;

    const posToAdd: Position = {
      id: `P${Math.random().toString(36).substr(2, 4)}`,
      ...newPos
    };

    setCompanies(companies.map(c => 
      c.id === targetCompanyId ? {
        ...c,
        departments: c.departments.map(d => 
          d.id === targetDeptId ? { ...d, positions: [...d.positions, posToAdd], isOpen: true } : d
        )
      } : c
    ));

    setIsAddPosModalOpen(false);
    setNewPos({ name: '', code: '', riskLevel: 'Medium' });
    setTargetCompanyId(null);
    setTargetDeptId(null);
  };

  const getRiskBadge = (level: string) => {
    switch(level) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#111318]">机构与人员设置</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">配置多级组织架构，为自动化培训矩阵提供全集团层级支撑。</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddCompanyModalOpen(true)}
            className="flex items-center gap-2 h-11 px-6 bg-[#135bec] text-white text-xs font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[18px]">domain_add</span>
            新增公司实体
          </button>
        </div>
      </div>

      {/* Company Management Table Section */}
      <div className="bg-white rounded-2xl border border-[#dbdfe6] shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-[#111318] uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400">corporate_fare</span>
            公司实体概览
          </h2>
          <span className="text-[10px] font-bold text-gray-400">共计 {companies.length} 个实体</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">公司全称 / 编码</th>
                <th className="px-6 py-4">负责人</th>
                <th className="px-6 py-4">部门数量</th>
                <th className="px-6 py-4">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {companies.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#111318]">{c.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">{c.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-gray-600">{c.manager || '--'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-[#135bec] bg-blue-50 px-2 py-0.5 rounded-full">{c.departments.length}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleCompany(c.id)}
                      className="text-[#135bec] text-xs font-bold hover:underline flex items-center gap-1"
                    >
                      {c.isOpen ? '收起详情' : '管理架构'}
                      <span className="material-symbols-outlined text-sm">{c.isOpen ? 'expand_less' : 'expand_more'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Hierarchy & Drilldown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {companies.filter(c => c.isOpen).map((company) => (
            <div key={company.id} className="animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-[#135bec] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">schema</span>
                  </div>
                  <h3 className="font-black text-[#111318]">{company.name} 组织架构</h3>
                </div>
                <button 
                  onClick={() => openAddDeptModal(company.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#dbdfe6] rounded-lg text-[10px] font-black text-[#135bec] hover:bg-[#135bec] hover:text-white transition-all uppercase"
                >
                  <span className="material-symbols-outlined text-sm">add_business</span>
                  新增部门
                </button>
              </div>

              <div className="space-y-4">
                {company.departments.length > 0 ? company.departments.map((dept) => (
                  <div key={dept.id} className="bg-white rounded-xl border border-[#dbdfe6] overflow-hidden shadow-sm">
                    {/* Dept Header */}
                    <div 
                      onClick={() => toggleDept(company.id, dept.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`material-symbols-outlined transition-transform duration-300 ${dept.isOpen ? 'rotate-90' : ''} text-gray-400`}>
                          chevron_right
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#111318]">{dept.name}</span>
                            {dept.isGxP && (
                              <span className="text-[9px] font-black bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100 uppercase">GxP</span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">代码: {dept.code} • 负责人: {dept.manager}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openAddPosModal(company.id, dept.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-[#135bec] bg-blue-50 hover:bg-[#135bec] hover:text-white rounded-lg transition-all border border-blue-100 uppercase tracking-widest"
                      >
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        添加岗位
                      </button>
                    </div>

                    {/* Positions Table */}
                    {dept.isOpen && (
                      <div className="bg-gray-50/30 border-t border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <tr>
                              <th className="px-6 py-3 pl-14">岗位名称 / 编码</th>
                              <th className="px-6 py-3">风险等级</th>
                              <th className="px-6 py-3 text-right">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {dept.positions.length > 0 ? dept.positions.map((pos) => (
                              <tr key={pos.id} className="hover:bg-white transition-colors group">
                                <td className="px-6 py-3 pl-14">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#111318]">{pos.name}</span>
                                    <span className="text-[9px] font-mono text-gray-400">{pos.code}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${getRiskBadge(pos.riskLevel)}`}>
                                    {pos.riskLevel}
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1 hover:text-[#135bec]"><span className="material-symbols-outlined text-lg">edit</span></button>
                                    <button className="p-1 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                                  </div>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={3} className="px-14 py-8 text-center text-xs text-gray-400 italic">暂无岗位信息</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium">该实体下尚未配置任何部门</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side Info Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#dbdfe6] p-6 shadow-sm">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">集团组织统计</h4>
            <div className="space-y-5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">总公司数</span>
                <span className="font-black text-lg text-[#135bec]">{companies.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-gray-50 pt-4">
                <span className="text-gray-500 font-medium">活跃部门</span>
                <span className="font-black text-lg text-[#111318]">{companies.reduce((acc, c) => acc + c.departments.length, 0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-gray-50 pt-4">
                <span className="text-gray-500 font-medium">受控岗位</span>
                <span className="font-black text-lg text-[#111318]">{companies.reduce((acc, c) => acc + c.departments.reduce((dacc, d) => dacc + d.positions.length, 0), 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex gap-4">
            <span className="material-symbols-outlined text-amber-600">info</span>
            <div>
              <h4 className="text-sm font-bold text-[#111318]">合规建议</h4>
              <p className="text-xs text-amber-700 leading-relaxed mt-1">
                根据 21 CFR Part 11，组织架构的任何变更（包括公司实体新增、岗位风险等级调整）都会产生审计追踪。请确保所有操作符合变更控制 (Change Control) 流程。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Company Modal */}
      {isAddCompanyModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-[#111318]">新增公司实体</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">符合合规要求的组织建模</p>
              </div>
              <button onClick={() => setIsAddCompanyModalOpen(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddCompany} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">公司法定名称</label>
                <input type="text" required placeholder="例如: 金辉制药有限公司" className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">实体编码</label>
                  <input type="text" required placeholder="GP-SHA-002" className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-mono" value={newCompany.code} onChange={e => setNewCompany({...newCompany, code: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">负责人/法人</label>
                  <input type="text" required placeholder="姓名" className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold" value={newCompany.manager} onChange={e => setNewCompany({...newCompany, manager: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">详细地址</label>
                <textarea required rows={2} placeholder="请输入完整注册地址" className="w-full p-4 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#135bec]" value={newCompany.address} onChange={e => setNewCompany({...newCompany, address: e.target.value})} />
              </div>
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddCompanyModalOpen(false)} className="px-6 h-12 text-sm font-bold text-gray-500">取消</button>
                <button type="submit" className="px-10 h-12 bg-[#135bec] text-white text-sm font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest">确认创建</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-[#111318]">创建新部门</h3>
              <button onClick={() => setIsAddDeptModalOpen(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddDept} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">部门名称</label>
                <input type="text" required className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">部门编码</label>
                  <input type="text" required className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-mono" value={newDept.code} onChange={e => setNewDept({...newDept, code: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">负责人</label>
                  <input type="text" required className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold" value={newDept.manager} onChange={e => setNewDept({...newDept, manager: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                 <span className="text-xs font-bold text-purple-700">GxP 敏感部门 (QA/QC/PROD)</span>
                 <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500 size-5" checked={newDept.isGxP} onChange={e => setNewDept({...newDept, isGxP: e.target.checked})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAddDeptModalOpen(false)} className="px-6 h-12 text-sm font-bold text-gray-500">取消</button>
                <button type="submit" className="px-10 h-12 bg-[#135bec] text-white text-sm font-black rounded-xl uppercase tracking-widest">确认创建</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Position Modal */}
      {isAddPosModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-[#111318]">新增岗位</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">所属: {companies.find(c => c.id === targetCompanyId)?.departments.find(d => d.id === targetDeptId)?.name}</p>
              </div>
              <button onClick={() => setIsAddPosModalOpen(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddPosition} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">岗位名称</label>
                <input type="text" required placeholder="例如: 无菌操作员" className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]" value={newPos.name} onChange={e => setNewPos({...newPos, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">岗位编码</label>
                  <input type="text" required placeholder="POS-XX" className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-mono" value={newPos.code} onChange={e => setNewPos({...newPos, code: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">合规风险等级</label>
                  <select 
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]"
                    value={newPos.riskLevel}
                    onChange={e => setNewPos({...newPos, riskLevel: e.target.value as Position['riskLevel']})}
                  >
                    <option value="Low">低风险 (Low)</option>
                    <option value="Medium">中风险 (Medium)</option>
                    <option value="High">高风险 (High)</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600">warning</span>
                <p className="text-[10px] text-red-700 leading-relaxed font-medium">
                  **风险等级提示**: High Risk 岗位将自动关联年度强制性实操考核。请在保存前确认岗位职责描述已符合岗位说明书 (JD)。
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAddPosModalOpen(false)} className="px-6 h-12 text-sm font-bold text-gray-500">取消</button>
                <button type="submit" className="px-10 h-12 bg-[#135bec] text-white text-sm font-black rounded-xl uppercase tracking-widest">保存岗位</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgSettings;
