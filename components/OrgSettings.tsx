
import React, { useState } from 'react';
import { HierarchyNode } from '../types';

interface Props {
  hierarchyData: Record<string, HierarchyNode[]>;
  setHierarchyData: React.Dispatch<React.SetStateAction<Record<string, HierarchyNode[]>>>;
}

const OrgSettings: React.FC<Props> = ({ hierarchyData, setHierarchyData }) => {
  const companies = hierarchyData['ORGANIZATION'] || [];

  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'COMPANY' | 'DEPT' | 'POS'>('COMPANY');
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    manager: '',
    address: '',
    isGxP: true,
    riskLevel: 'Medium' as 'High' | 'Medium' | 'Low'
  });

  // 核心工具：生成下一个编码
  const generateNextCode = (parentCode: string, existingSiblings: HierarchyNode[]) => {
    let maxNum = 0;
    existingSiblings.forEach(node => {
      const lastTwo = parseInt(node.code.slice(-2));
      if (!isNaN(lastTwo) && lastTwo > maxNum) maxNum = lastTwo;
    });
    if (maxNum >= 99) return null;
    return parentCode + (maxNum + 1).toString().padStart(2, '0');
  };

  const updateHierarchy = (newData: HierarchyNode[]) => {
    setHierarchyData(prev => ({ ...prev, ORGANIZATION: newData }));
  };

  const toggleOpen = (id: string) => {
    const toggleRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
      return nodes.map(node => {
        if (node.id === id) return { ...node, isOpen: !node.isOpen };
        return { ...node, children: toggleRecursive(node.children) };
      });
    };
    updateHierarchy(toggleRecursive(companies));
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`确定要移除 [${name}] 吗？\n该操作将同步更新编码规则并被审计日志记录。`)) return;
    const deleteRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
      return nodes
        .filter(n => n.id !== id)
        .map(n => ({ ...n, children: deleteRecursive(n.children) }));
    };
    updateHierarchy(deleteRecursive(companies));
  };

  const handleOpenAdd = (type: 'COMPANY' | 'DEPT' | 'POS', parentId: string | null = null, parentCode: string = '') => {
    setModalType(type);
    setModalMode('ADD');
    setTargetParentId(parentId);
    
    // 自动寻找当前层级的下一个编码
    let siblings: HierarchyNode[] = [];
    if (type === 'COMPANY') siblings = companies;
    else {
      const findSiblings = (nodes: HierarchyNode[]): HierarchyNode[] | null => {
        for (const n of nodes) {
          if (n.id === parentId) return n.children;
          const found = findSiblings(n.children);
          if (found) return found;
        }
        return null;
      };
      siblings = findSiblings(companies) || [];
    }

    setFormData({
      name: '',
      code: generateNextCode(parentCode, siblings) || '',
      manager: '',
      address: '',
      isGxP: true,
      riskLevel: 'Medium'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (node: HierarchyNode) => {
    setModalMode('EDIT');
    setTargetNodeId(node.id);
    setFormData({
      name: node.name,
      code: node.code,
      manager: node.manager || '',
      address: node.address || '',
      isGxP: node.isGxP ?? true,
      riskLevel: node.riskLevel || 'Medium'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'ADD') {
      const newNode: HierarchyNode = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        code: formData.code,
        children: [],
        manager: formData.manager,
        address: formData.address,
        isGxP: formData.isGxP,
        riskLevel: formData.riskLevel,
        isOpen: true
      };

      if (modalType === 'COMPANY') {
        updateHierarchy([...companies, newNode]);
      } else {
        const addRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
          return nodes.map(n => {
            if (n.id === targetParentId) return { ...n, children: [...n.children, newNode], isOpen: true };
            return { ...n, children: addRecursive(n.children) };
          });
        };
        updateHierarchy(addRecursive(companies));
      }
    } else {
      const editRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
        return nodes.map(n => {
          if (n.id === targetNodeId) return { ...n, ...formData };
          return { ...n, children: editRecursive(n.children) };
        });
      };
      updateHierarchy(editRecursive(companies));
    }
    setIsModalOpen(false);
  };

  const getRiskBadge = (level?: string) => {
    switch(level) {
      case 'High': return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#111318]">机构与人员设置</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">数据中心化设计：此处的任何修改将同步更新【编码规则】并全局实时生效。</p>
        </div>
        <button 
          onClick={() => handleOpenAdd('COMPANY')}
          className="flex items-center gap-2 h-11 px-6 bg-[#135bec] text-white text-xs font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[18px]">domain_add</span>
          新增顶级公司实体 (L1)
        </button>
      </div>

      <div className="space-y-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white rounded-2xl border border-[#dbdfe6] shadow-sm overflow-hidden">
            {/* 公司层级 L1 */}
            <div className="px-8 py-6 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black bg-[#135bec] text-white px-2 py-0.5 rounded font-mono">{company.code}</span>
                <div>
                   <h3 className="text-lg font-black text-[#111318]">{company.name}</h3>
                   <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">L1 根实体 • 负责人: {company.manager || '未指定'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={() => handleOpenAdd('DEPT', company.id, company.code)} className="h-9 px-4 bg-white border border-[#dbdfe6] rounded-lg text-[10px] font-black text-[#135bec] uppercase hover:bg-[#135bec] hover:text-white transition-all">添加部门 (L2)</button>
                 <button onClick={() => handleOpenEdit(company)} className="size-9 flex items-center justify-center text-gray-400 hover:text-[#135bec]"><span className="material-symbols-outlined text-lg">edit</span></button>
                 <button onClick={() => handleDelete(company.id, company.name)} className="size-9 flex items-center justify-center text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                 <button onClick={() => toggleOpen(company.id)} className="size-9 flex items-center justify-center text-gray-400">
                    <span className={`material-symbols-outlined transition-transform ${company.isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                 </button>
              </div>
            </div>

            {company.isOpen && (
              <div className="divide-y divide-gray-50 border-t border-gray-100">
                {company.children.length > 0 ? company.children.map((dept) => (
                  <div key={dept.id} className="bg-white">
                    {/* 部门层级 L2 */}
                    <div className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                       <div className="flex items-center gap-4 pl-8">
                          <span className="text-[10px] font-black bg-purple-500 text-white px-2 py-0.5 rounded font-mono">{dept.code}</span>
                          <div>
                            <p className="text-sm font-bold text-[#111318]">{dept.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">L2 部门 • 经理: {dept.manager || '未指定'}</p>
                          </div>
                          {dept.isGxP && <span className="text-[8px] font-black px-1.5 py-0.5 bg-blue-50 text-[#135bec] border border-blue-100 rounded uppercase">GxP 相关</span>}
                       </div>
                       <div className="flex items-center gap-3">
                          <button onClick={() => handleOpenAdd('POS', dept.id, dept.code)} className="h-8 px-3 bg-white border border-[#dbdfe6] rounded-lg text-[9px] font-black text-[#135bec] uppercase hover:bg-[#135bec] hover:text-white transition-all">添加岗位 (L3)</button>
                          <button onClick={() => handleOpenEdit(dept)} className="size-8 flex items-center justify-center text-gray-400 hover:text-[#135bec]"><span className="material-symbols-outlined text-base">edit</span></button>
                          <button onClick={() => handleDelete(dept.id, dept.name)} className="size-8 flex items-center justify-center text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-base">delete</span></button>
                          <button onClick={() => toggleOpen(dept.id)} className="size-8 flex items-center justify-center text-gray-400">
                             <span className={`material-symbols-outlined transition-transform text-sm ${dept.isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                          </button>
                       </div>
                    </div>

                    {/* 岗位层级 L3 */}
                    {dept.isOpen && (
                      <div className="bg-gray-50/20 border-t border-gray-50">
                        <table className="w-full text-left">
                           <thead className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                              <tr>
                                 <th className="px-8 py-3 pl-24">岗位名称 / 层级编码 (L3)</th>
                                 <th className="px-6 py-3">风险等级</th>
                                 <th className="px-6 py-3 text-right">操作</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {dept.children.map((pos) => (
                                <tr key={pos.id} className="hover:bg-white group">
                                   <td className="px-8 py-4 pl-24">
                                      <div className="flex items-center gap-3">
                                         <span className="text-[10px] font-mono text-gray-400">[{pos.code}]</span>
                                         <span className="text-xs font-bold text-gray-700">{pos.name}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4">
                                      <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${getRiskBadge(pos.riskLevel)}`}>
                                        {pos.riskLevel || 'Medium'}
                                      </span>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-2">
                                         <button onClick={() => handleOpenEdit(pos)} className="size-8 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-gray-400 hover:text-[#135bec]"><span className="material-symbols-outlined text-base">edit</span></button>
                                         <button onClick={() => handleDelete(pos.id, pos.name)} className="size-8 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-base">delete</span></button>
                                      </div>
                                   </td>
                                </tr>
                              ))}
                              {dept.children.length === 0 && (
                                <tr>
                                  <td colSpan={3} className="px-8 py-6 pl-24 text-[10px] text-gray-400 italic">暂无岗位信息</td>
                                </tr>
                              )}
                           </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="px-8 py-10 text-center text-gray-400 italic text-sm">暂无下属部门</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 统一编辑/新增弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-black text-[#111318]">
                {modalMode === 'ADD' ? `新增${modalType === 'COMPANY' ? '公司' : modalType === 'DEPT' ? '部门' : '岗位'}` : '编辑详细信息'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">显示名称</label>
                  <input type="text" required className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-sm font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">层级编码 (同步更新)</label>
                  <input type="text" readOnly className="w-full h-12 px-5 bg-gray-100 border-none rounded-xl text-sm font-mono font-bold text-gray-400" value={formData.code} />
                </div>
                {modalType !== 'POS' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">负责人/经理</label>
                    <input type="text" className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-sm font-bold" value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">风险等级</label>
                    <select className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-sm font-bold" value={formData.riskLevel} onChange={e => setFormData({...formData, riskLevel: e.target.value as any})}>
                      <option value="High">High (高风险/GxP 关键)</option>
                      <option value="Medium">Medium (中风险)</option>
                      <option value="Low">Low (低风险)</option>
                    </select>
                  </div>
                )}
              </div>

              {modalType === 'COMPANY' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">办公地址</label>
                  <input type="text" className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-sm font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              )}

              {modalType === 'DEPT' && (
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer">
                  <input type="checkbox" className="rounded text-[#135bec] focus:ring-[#135bec]" checked={formData.isGxP} onChange={e => setFormData({...formData, isGxP: e.target.checked})} />
                  <span className="text-xs font-bold text-gray-600">该部门涉及 GxP 活动 (受合规审查)</span>
                </label>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 text-sm font-bold text-gray-500">取消</button>
                <button type="submit" className="flex-1 h-12 bg-[#135bec] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">保存变更</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgSettings;
