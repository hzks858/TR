
import React, { useState, useEffect, useCallback } from 'react';
import { HierarchyNode } from '../types';

type Domain = 'ORGANIZATION' | 'COURSE' | 'STUDENT';

interface Props {
  data: Record<string, HierarchyNode[]>;
  setData: React.Dispatch<React.SetStateAction<Record<string, HierarchyNode[]>>>;
}

const HierarchyManager: React.FC<Props> = ({ data, setData }) => {
  const [activeDomain, setActiveDomain] = useState<Domain>('ORGANIZATION');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'SIBLING' | 'CHILD' | 'EDIT'>('SIBLING');
  const [targetNode, setTargetNode] = useState<HierarchyNode | null>(null);
  const [newName, setNewName] = useState('');

  // 核心逻辑：全局切换所有节点展开/折叠状态
  const toggleAllNodes = (isOpen: boolean) => {
    const processRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
      return nodes.map(node => ({
        ...node,
        isOpen: isOpen,
        children: node.children ? processRecursive(node.children) : []
      }));
    };

    const newData = processRecursive(data[activeDomain]);
    setData(prev => ({ ...prev, [activeDomain]: newData }));
  };

  // 核心逻辑：切换单个节点展开/折叠状态
  const toggleNodeOpen = (nodeId: string) => {
    const toggleRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children && node.children.length > 0) {
          return { ...node, children: toggleRecursive(node.children) };
        }
        return node;
      });
    };

    const newData = toggleRecursive(data[activeDomain]);
    setData(prev => ({ ...prev, [activeDomain]: newData }));
  };

  // 删除节点逻辑
  const handleConfirmDelete = useCallback((nodeToDelete: HierarchyNode) => {
    const isOrg = activeDomain === 'ORGANIZATION';
    const message = isOrg 
      ? `警告：删除 [${nodeToDelete.name}] 将同步移除【机构设置】中对应的实体。确定吗？` 
      : `确定要删除节点 [${nodeToDelete.code}] ${nodeToDelete.name} 及其所有下级子节点吗？`;
      
    if (!window.confirm(message)) return;

    const removeRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
      return nodes
        .filter(node => node.id !== nodeToDelete.id)
        .map(node => ({
          ...node,
          children: removeRecursive(node.children)
        }));
    };

    const newData = removeRecursive(data[activeDomain]);
    setData(prev => ({ ...prev, [activeDomain]: newData }));
    setSelectedNodeId(null);
  }, [data, activeDomain, setData]);

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        const findNode = (nodes: HierarchyNode[]): HierarchyNode | null => {
          for (const node of nodes) {
            if (node.id === selectedNodeId) return node;
            const found = findNode(node.children);
            if (found) return found;
          }
          return null;
        };
        const node = findNode(data[activeDomain]);
        if (node) handleConfirmDelete(node);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, data, activeDomain, isModalOpen, handleConfirmDelete]);

  const generateNextCode = (parentCode: string, existingSiblings: HierarchyNode[]) => {
    let maxNum = 0;
    existingSiblings.forEach(node => {
      const lastTwo = parseInt(node.code.slice(-2));
      if (!isNaN(lastTwo) && lastTwo > maxNum) maxNum = lastTwo;
    });
    if (maxNum >= 99) return null;
    const nextNum = (maxNum + 1).toString().padStart(2, '0');
    return parentCode + nextNum;
  };

  const handleSave = () => {
    if (!newName.trim()) return;
    const currentData = [...data[activeDomain]];
    if (modalMode === 'EDIT' && targetNode) {
      const renameRecursive = (nodes: HierarchyNode[]): HierarchyNode[] => {
        return nodes.map(node => {
          if (node.id === targetNode.id) return { ...node, name: newName };
          return { ...node, children: renameRecursive(node.children) };
        });
      };
      setData({ ...data, [activeDomain]: renameRecursive(currentData) });
    } else {
      let newNode: HierarchyNode = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        code: '',
        children: [],
        isOpen: true,
        isGxP: true
      };
      if (modalMode === 'SIBLING') {
        if (!targetNode) {
          const code = generateNextCode('', currentData);
          if (!code) return alert('层级已满');
          newNode.code = code;
          currentData.push(newNode);
        } else {
          const parentCode = targetNode.code.slice(0, -2);
          const findAndAdd = (nodes: HierarchyNode[]): boolean => {
            const index = nodes.findIndex(n => n.id === targetNode.id);
            if (index !== -1) {
              const code = generateNextCode(parentCode, nodes);
              if (!code) return false;
              newNode.code = code;
              nodes.push(newNode);
              return true;
            }
            for (const node of nodes) if (findAndAdd(node.children)) return true;
            return false;
          };
          if (!findAndAdd(currentData)) return alert('层级已满');
        }
      } else if (modalMode === 'CHILD' && targetNode) {
        const findAndAddChild = (nodes: HierarchyNode[]): boolean => {
          for (const node of nodes) {
            if (node.id === targetNode.id) {
              const code = generateNextCode(node.code, node.children);
              if (!code) return false;
              newNode.code = code;
              node.children.push(newNode);
              node.isOpen = true;
              return true;
            }
            if (findAndAddChild(node.children)) return true;
          }
          return false;
        };
        if (!findAndAddChild(currentData)) return alert('层级已满');
      }
      setData({ ...data, [activeDomain]: currentData });
    }
    setIsModalOpen(false);
    setNewName('');
    setTargetNode(null);
  };

  const openEditModal = (node: HierarchyNode) => {
    setModalMode('EDIT');
    setTargetNode(node);
    setNewName(node.name);
    setIsModalOpen(true);
  };

  const renderTree = (nodes: HierarchyNode[], level: number = 0) => {
    return nodes.map(node => {
      const isSelected = selectedNodeId === node.id;
      const hasChildren = node.children && node.children.length > 0;
      const isOpen = node.isOpen !== false;

      return (
        <div key={node.id} className="group">
          <div 
            onClick={() => setSelectedNodeId(node.id)}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all border cursor-pointer ${
              isSelected 
                ? 'bg-[#135bec]/5 border-[#135bec]/30 shadow-sm' 
                : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
            }`}
          >
            <div className="flex items-center" style={{ marginLeft: `${level * 40}px` }}>
              <div className="w-6 shrink-0 flex items-center justify-center">
                {hasChildren && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleNodeOpen(node.id); }}
                    className="size-6 flex items-center justify-center text-gray-400 hover:text-[#135bec] hover:bg-white rounded transition-all"
                  >
                    <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                      chevron_right
                    </span>
                  </button>
                )}
              </div>

              <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black mr-3 shadow-sm shrink-0 ${
                level === 0 ? 'bg-[#135bec] text-white' : 
                level === 1 ? 'bg-purple-500 text-white' : 
                'bg-emerald-500 text-white'
              }`}>
                L{level + 1}
              </div>
              <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 mr-4 border border-gray-200 shrink-0">
                {node.code}
              </div>
              <div className={`text-sm font-black truncate max-w-[200px] ${level === 0 ? 'text-[#111318]' : 'text-gray-600'}`}>
                {node.name}
              </div>
            </div>

            <div className={`flex gap-1 ml-auto transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button onClick={(e) => { e.stopPropagation(); setModalMode('SIBLING'); setTargetNode(node); setNewName(''); setIsModalOpen(true); }} className="px-2 py-1 text-[9px] font-black text-[#135bec] hover:bg-blue-50 rounded uppercase transition-colors">+ 同级</button>
              <button onClick={(e) => { e.stopPropagation(); setModalMode('CHILD'); setTargetNode(node); setNewName(''); setIsModalOpen(true); }} className="px-2 py-1 text-[9px] font-black text-emerald-600 hover:bg-emerald-50 rounded uppercase transition-colors">+ 下级</button>
              <button onClick={(e) => { e.stopPropagation(); openEditModal(node); }} className="px-2 py-1 text-[9px] font-black text-amber-600 hover:bg-amber-50 rounded uppercase transition-colors">编辑</button>
              <button onClick={(e) => { e.stopPropagation(); handleConfirmDelete(node); }} className="px-2 py-1 text-[9px] font-black text-red-400 hover:bg-red-50 rounded uppercase transition-colors">删除</button>
            </div>
          </div>
          {hasChildren && isOpen && (
            <div className="border-l-2 border-dashed border-gray-100 ml-12">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111318] tracking-tight">编码规则与分层管理</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">数据实时共享：【机构设置】中的实体与此处的 L1-L3 层级自动映射并双向同步。</p>
        </div>
        <button 
          onClick={() => { setModalMode('SIBLING'); setTargetNode(null); setNewName(''); setIsModalOpen(true); }}
          className="bg-[#135bec] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add_circle</span>
          创建一级根节点
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="space-y-2">
          {[
            { id: 'ORGANIZATION', label: '机构组织架构 (ORG)', icon: 'account_tree' },
            { id: 'COURSE', label: '合规课程级别 (CRS)', icon: 'layers' },
            { id: 'STUDENT', label: '学员档案层级 (STD)', icon: 'group' }
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => { setActiveDomain(d.id as Domain); setSelectedNodeId(null); }}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                activeDomain === d.id 
                  ? 'bg-white border-[#135bec] text-[#135bec] shadow-md ring-4 ring-blue-50/50' 
                  : 'bg-white border-transparent text-gray-400 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">{d.icon}</span>
                {d.label}
              </div>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          ))}
        </aside>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#dbdfe6] p-8 shadow-sm min-h-[600px] outline-none" tabIndex={0}>
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-5">
             <h3 className="text-sm font-black text-[#111318] uppercase tracking-widest">
               {activeDomain === 'ORGANIZATION' ? '机构组织' : activeDomain === 'COURSE' ? '合规课程' : '学员档案'} 可视化视图
             </h3>
             <div className="flex items-center gap-3">
                {/* 新增的折叠/展开全局按键 */}
                <div className="flex bg-gray-50 border border-gray-100 rounded-lg p-1">
                   <button 
                    onClick={() => toggleAllNodes(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-[#135bec] hover:bg-white hover:shadow-sm rounded-md transition-all uppercase tracking-tighter"
                   >
                     <span className="material-symbols-outlined text-sm">unfold_more</span>
                     全部展开
                   </button>
                   <div className="w-px h-4 bg-gray-200 my-auto"></div>
                   <button 
                    onClick={() => toggleAllNodes(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-gray-400 hover:bg-white hover:text-red-500 hover:shadow-sm rounded-md transition-all uppercase tracking-tighter"
                   >
                     <span className="material-symbols-outlined text-sm">unfold_less</span>
                     全部收起
                   </button>
                </div>
                <div className="w-px h-6 bg-gray-100 mx-1"></div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   <span className="material-symbols-outlined text-sm">info</span>
                   快捷键: [Del] 删除选中项
                </div>
             </div>
          </div>
          <div className="space-y-1">
            {renderTree(data[activeDomain])}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-black text-[#111318]">
                {modalMode === 'EDIT' ? '编辑节点' : '新增节点'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">层级显示名称</label>
                <input type="text" autoFocus className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 h-12 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">取消</button>
                <button onClick={handleSave} className="flex-1 h-12 bg-[#135bec] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">保存变更</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyManager;
