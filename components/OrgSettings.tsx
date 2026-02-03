
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
    
    // 简单的自动编码逻辑（后缀+1）
    let nextCode = parentCode;
    const parentNodes = parentId === null ? companies : findNodeById(companies, parentId)?.children || [];
    const maxSuffix = parentNodes.reduce((max, node) => {
      const suffix = parseInt(node.code.slice(-2));
      return suffix > max ? suffix : max;
    }, 0);
    nextCode += (maxSuffix + 1).toString().padStart(2, '0');

    setFormData({
      name: '',
      code: nextCode, 
      manager: '',
      address: '',
      isGxP: true,
      riskLevel: 'Medium'
    });
    setIsModalOpen(true);
  };

  const findNodeById = (nodes: HierarchyNode[], id: string): HierarchyNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
    return null;
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
        isOpen: true,
        manager: formData.manager,
        address: formData.address,
        isGxP: formData.isGxP,
        riskLevel: formData.riskLevel
      };

      if (targetParentId === null) {
        updateHierarchy([...companies, newNode]);
      } else {
        const addRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
          return nodes.map(node => {
            if (node.id === targetParentId) {
              return { ...node, children: [...node.children, newNode], isOpen: true };
            }
            return { ...node, children: addRecursive(node.children) };
          });
        };
        updateHierarchy(addRecursive(companies));
      }
    } else if (modalMode === 'EDIT' && targetNodeId) {
      const editRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
        return nodes.map(node => {
          if (node.id === targetNodeId) {
            return { ...node, ...formData };
          }
          return { ...node, children: editRecursive(node.children) };
        });
      };
      updateHierarchy(editRecursive(companies));
    }

    setIsModalOpen(false);
  };

  const getRiskBadge = (level?: string) => {
    switch(level) {
      case 'High': return 'bg-red-50 text-red-500 border-red-100';
      case 'Medium': return 'bg-amber-50 text-amber-500 border-amber-100';
      default: return 'bg-blue-50 text-blue-500 border-blue-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 页面标题区 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#111318]">机构与人员设置</h1>
          <p className="text-[#616f89] text-sm mt-2 font-medium">数据中心化设计：此处的任何修改将同步更新【编码规则】并全局实时生效。</p>
        </div>
        <button 
          onClick={() => handleOpenAdd('COMPANY')}
          className="flex items-center gap-2 h-14 px-8 bg-[#135bec] text-white text-xs font-black rounded-xl shadow-[0_10px_30px_rgba(19,91,236,0.3)] hover:bg-[#104cc5] transition-all uppercase tracking-[0.1em]"
        >
          <span className="material-symbols-outlined text-[20px] font-bold">add_box</span>
          新增顶级公司实体 (L1)
        </button>
      </div>

      <div className="space-y-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white rounded-2xl border border-[#dbdfe6] shadow-sm overflow-hidden">
            {/* L1: 公司节点 */}
            <div className="px-8 py-7 bg-white flex items-center justify-between">
              <div className="flex items-center gap-5">
                <span className="text-[12px] font-black bg-[#135bec] text-white px-3 py-1.5 rounded-md font-mono min-w-[36px] text-center shadow-sm">
                  {company.code}
                </span>
                <div>
                   <h3 className="text-xl font-black text-[#111318] leading-tight">{company.name}</h3>
                   <p className="text-[11px] text-[#616f89] font-bold uppercase mt-1 tracking-tight">
                     L1 根实体 • 负责人: {company.manager || '未指定'}
                   </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => handleOpenAdd('DEPT', company.id, company.code)} className="h-10 px-5 bg-white border border-[#dbdfe6] rounded-xl text-[11px] font-black text-[#135bec] uppercase hover:bg-gray-50 transition-all tracking-wider shadow-sm">添加部门 (L2)</button>
                 <button onClick={() => handleOpenEdit(company)} className="size-10 flex items-center justify-center text-[#616f89] hover:bg-gray-100 rounded-xl transition-colors"><span className="material-symbols-outlined text-xl">edit</span></button>
                 <button onClick={() => toggleOpen(company.id)} className="size-10 flex items-center justify-center text-[#616f89] hover:bg-gray-100 rounded-xl transition-colors">
                    <span className={`material-symbols-outlined transition-transform duration-300 text-2xl ${company.isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                 </button>
              </div>
            </div>

            {company.isOpen && (
              <div className="divide-y divide-gray-50 border-t border-gray-100">
                {company.children.length > 0 ? company.children.map((dept) => (
                  <div key={dept.id} className="bg-white">
                    {/* L2: 部门节点 */}
                    <div className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/40 transition-colors pl-20">
                       <div className="flex items-center gap-5">
                          <span className="text-[11px] font-black bg-[#a855f7] text-white px-2.5 py-1 rounded-md font-mono min-w-[42px] text-center shadow-sm">{dept.code}</span>
                          <div>
                            <p className="text-base font-black text-[#111318]">{dept.name}</p>
                            <p className="text-[10px] text-[#616f89] font-bold uppercase tracking-tight">L2 部门 • 经理: {dept.manager || '未指定'}</p>
                          </div>
                          {dept.isGxP && (
                            <span className="text-[9px] font-black px-2.5 py-1 bg-[#eff6ff] text-[#135bec] border border-[#dbeafe] rounded-md uppercase tracking-wider ml-4">
                              GXP 相关
                            </span>
                          )}
                       </div>
                       <div className="flex items-center gap-4">
                          <button onClick={() => handleOpenAdd('POS', dept.id, dept.code)} className="h-9 px-4 bg-white border border-[#dbdfe6] rounded-xl text-[10px] font-black text-[#135bec] uppercase hover:bg-gray-50 transition-all tracking-wider shadow-sm">添加岗位 (L3)</button>
                          <button onClick={() => handleOpenEdit(dept)} className="size-9 flex items-center justify-center text-[#616f89] hover:bg-gray-100 rounded-xl transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                          <button onClick={() => handleDelete(dept.id, dept.name)} className="size-9 flex items-center justify-center text-[#616f89] hover:bg-gray-100 rounded-xl transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                          <button onClick={() => toggleOpen(dept.id)} className="size-9 flex items-center justify-center text-[#616f89] hover:bg-gray-100 rounded-xl transition-colors">
                             <span className={`material-symbols-outlined transition-transform duration-300 text-xl ${dept.isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                          </button>
                       </div>
                    </div>

                    {/* L3: 岗位列表表格 */}
                    {dept.isOpen && (
                      <div className="bg-white border-t border-gray-50 pb-6">
                        <table className="w-full text-left">
                           <thead className="text-[11px] font-black text-[#94a3b8] uppercase tracking-[0.1em]">
                              <tr>
                                 <th className="px-8 py-5 pl-32 font-black">岗位名称 / 层级编码 (L3)</th>
                                 <th className="px-6 py-5 font-black">风险等级</th>
                                 <th className="px-8 py-5 text-right font-black">操作</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {dept.children.map((pos) => (
                                <tr key={pos.id} className="hover:bg-[#f8fafc]/50 group transition-colors">
                                   <td className="px-8 py-4 pl-32">
                                      <div className="flex items-center gap-3">
                                         <span className="text-[12px] font-mono text-[#94a3b8] font-bold">[{pos.code}]</span>
                                         <span className="text-sm font-black text-[#1e293b]">{pos.name}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4">
                                      <span className={`px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${getRiskBadge(pos.riskLevel)}`}>
                                        {(pos.riskLevel || 'Medium').toUpperCase()}
                                      </span>
                                   </td>
                                   <td className="px-8 py-4 text-right">
                                      <div className="flex justify-end gap-3">
                                         <button onClick={() => handleOpenEdit(pos)} className="size-8 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-[#616f89] hover:text-[#135bec] hover:bg-blue-50 rounded-lg"><span className="material-symbols-outlined text-lg">edit</span></button>
                                         <button onClick={() => handleDelete(pos.id, pos.name)} className="size-8 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-[#616f89] hover:text-red-500 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-lg">delete</span></button>
                                      </div>
                                   </td>
                                </tr>
                              ))}
                              {dept.children.length === 0 && (
                                <tr>
                                  <td colSpan={3} className="px-8 py-8 pl-32 text-xs text-[#94a3b8] italic font-medium">暂无岗位信息，请点击上方按钮添加。</td>
                                </tr>
                              )}
                           </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="px-8 py-16 text-center text-[#94a3b8] font-medium text-sm bg-gray-50/20">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">account_tree</span>
                    该机构下暂无下属部门
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 编辑/新增弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#111318]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-black text-[#111318]">
                {modalMode === 'ADD' ? `新增${modalType === 'COMPANY' ? '公司' : modalType === 'DEPT' ? '部门' : '岗位'}` : '编辑层级信息'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#616f89] hover:text-[#111318] transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-[#616f89] uppercase tracking-[0.2em]">显示名称</label>
                  <input type="text" required className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#135bec]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-1">
                  <label className="text-[10px] font-black text-[#616f89] uppercase tracking-[0.2em]">层级编码</label>
                  <input type="text" required disabled className="w-full h-14 px-6 bg-gray-100 border-none rounded-2xl text-sm font-mono font-black text-gray-400" value={formData.code} />
                </div>
                <div className="space-y-2 col-span-1">
                  <label className="text-[10px] font-black text-[#616f89] uppercase tracking-[0.2em]">负责人/经理</label>
                  <input type="text" className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#135bec]" value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} />
                </div>
                {modalType === 'COMPANY' && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-[#616f89] uppercase tracking-[0.2em]">注册地址</label>
                    <input type="text" className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#135bec]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                )}
                {modalType === 'POS' && (
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-[#616f89] uppercase tracking-[0.2em]">风险分级 (L3 专用)</label>
                    <select className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#135bec]" value={formData.riskLevel} onChange={e => setFormData({...formData, riskLevel: e.target.value as any})}>
                      <option value="High">高风险 (HIGH)</option>
                      <option value="Medium">中风险 (MEDIUM)</option>
                      <option value="Low">低风险 (LOW)</option>
                    </select>
                  </div>
                )}
                <div className="col-span-2 pt-2">
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.isGxP} onChange={e => setFormData({...formData, isGxP: e.target.checked})} className="size-5 rounded border-gray-300 text-[#135bec]" />
                      <span className="text-xs font-black text-[#111318]">该节点属于 GxP 相关（启用严格审计追踪）</span>
                   </label>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 text-sm font-black text-[#616f89]">取消操作</button>
                <button type="submit" className="flex-1 h-14 bg-[#135bec] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[0_10px_30px_rgba(19,91,236,0.3)] active:scale-95 transition-all">保存变更</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgSettings;
