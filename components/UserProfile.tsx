
import React, { useState, useRef, useMemo } from 'react';
import { UserAccount, WorkExperience, TransferRecord, HierarchyNode } from '../types';

interface Props {
  currentUser: UserAccount;
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserAccount>>;
  hierarchyData: Record<string, HierarchyNode[]>;
}

const UserProfile: React.FC<Props> = ({ currentUser, setUsers, setCurrentUser, hierarchyData }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 级联选择状态
  const [selectedTargetCompanyId, setSelectedTargetCompanyId] = useState('');
  const [selectedTargetDeptId, setSelectedTargetDeptId] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [newExp, setNewExp] = useState<WorkExperience>({
    company: '',
    position: '',
    period: '',
    description: ''
  });

  const [newTransfer, setNewTransfer] = useState<TransferRecord>({
    date: new Date().toISOString().split('T')[0],
    fromDept: currentUser.department,
    toDept: '',
    fromPos: currentUser.position,
    toPos: '',
    reason: '',
    approver: ''
  });
  
  const [contactInfo, setContactInfo] = useState({
    email: `${currentUser.username}@g-pharma.com`.toLowerCase(),
    phone: '+86 138 1234 5678',
    office: 'Building A, 3F'
  });

  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);

  // 组织架构计算属性
  const allCompanies = useMemo(() => hierarchyData['ORGANIZATION'] || [], [hierarchyData]);
  const availableDepts = useMemo(() => allCompanies.find(c => c.id === selectedTargetCompanyId)?.children || [], [allCompanies, selectedTargetCompanyId]);
  const availablePositions = useMemo(() => availableDepts.find(d => d.id === selectedTargetDeptId)?.children || [], [availableDepts, selectedTargetDeptId]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(prev => prev.map(u => u.id === currentUser.id ? currentUser : u));
    setMessage({ text: '个人基本资料已同步更新至合规记录', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCurrentUser(prev => ({ ...prev, avatar: result }));
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, avatar: result } : u));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.company || !newExp.position) return;
    
    const updatedExps = [...(currentUser.workExperience || []), newExp];
    setCurrentUser(prev => ({ ...prev, workExperience: updatedExps }));
    setIsExpModalOpen(false);
    setNewExp({ company: '', position: '', period: '', description: '' });
    setMessage({ text: '已添加新的工作经历', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteExperience = (index: number) => {
    const updatedExps = (currentUser.workExperience || []).filter((_, i) => i !== index);
    setCurrentUser(prev => ({ ...prev, workExperience: updatedExps }));
    setMessage({ text: '已移除工作经历记录', type: 'info' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransfer.toDept || !newTransfer.toPos || !newTransfer.approver) {
      setMessage({ text: '请选择完整的目标组织信息', type: 'error' });
      return;
    }

    const updatedTransfers = [...(currentUser.transferRecords || []), newTransfer];
    setCurrentUser(prev => ({ 
      ...prev, 
      transferRecords: updatedTransfers,
      department: newTransfer.toDept,
      position: newTransfer.toPos,
      company: allCompanies.find(c => c.id === selectedTargetCompanyId)?.name || prev.company
    }));
    
    setIsTransferModalOpen(false);
    setSelectedTargetCompanyId('');
    setSelectedTargetDeptId('');
    setMessage({ text: '调岗记录已保存，组织架构已同步更新', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.current !== currentUser.password) {
      setMessage({ text: '当前密码验证失败', type: 'error' });
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ text: '两次输入的新密码不一致', type: 'error' });
      return;
    }
    if (passwordForm.new.length < 6) {
      setMessage({ text: '新密码强度不足（需至少 6 位）', type: 'error' });
      return;
    }

    const updatedUser = { ...currentUser, password: passwordForm.new };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    
    setMessage({ text: '安全密码已重置，请使用新密码登录', type: 'success' });
    setIsChangingPassword(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#111318] tracking-tight">个人中心 (User Profile)</h1>
          <p className="text-gray-500 text-sm mt-1">管理您的合规账号身份、组织归属及安全设置。</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 shadow-sm fixed top-20 right-8 z-[60] ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 
          message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
          'bg-red-50 text-red-700 border border-red-100'
        }`}>
          <span className="material-symbols-outlined filled">
            {message.type === 'success' ? 'check_circle' : message.type === 'info' ? 'info' : 'error'}
          </span>
          <span className="text-sm font-bold">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100"><span className="material-symbols-outlined text-sm">close</span></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Identity Card */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-[#dbdfe6] p-8 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#135bec] to-blue-600 opacity-10"></div>
            
            <div className="relative inline-block group mb-6 mt-4">
              <img src={currentUser.avatar} className="size-32 rounded-3xl border-4 border-white shadow-xl object-cover bg-gray-100" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 size-10 bg-[#111318] text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer"
                title="更换头像"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </div>
            
            <h2 className="text-2xl font-black text-[#111318]">{currentUser.name}</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{currentUser.position}</p>
            
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase">EMP ID</span>
                <span className="text-sm font-mono font-bold text-[#135bec]">{currentUser.employeeId}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase">System Role</span>
                <span className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">{currentUser.role}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 shadow-sm">
             <div className="flex gap-4">
                <div className="size-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                   <span className="material-symbols-outlined">fingerprint</span>
                </div>
                <div>
                   <h4 className="text-sm font-black text-amber-900">电子签名状态</h4>
                   <p className="text-[10px] text-amber-700/80 leading-relaxed mt-1 font-bold">
                     您的数字身份已通过 GMP 验证。所有系统操作都将附带时间戳签名。
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Main Forms */}
        <div className="md:col-span-8 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-[#dbdfe6] shadow-sm overflow-hidden">
            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-[#111318] uppercase tracking-[0.2em]">档案详情</h3>
              <span className="text-[10px] font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">上次更新: {new Date().toLocaleDateString()}</span>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-10 space-y-12">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">显示姓名 (Display Name)</label>
                    <input 
                      type="text" required className="w-full h-14 px-6 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#111318] focus:ring-2 focus:ring-[#135bec] transition-all"
                      value={currentUser.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">系统账号 (Username)</label>
                    <input type="text" disabled className="w-full h-14 px-6 bg-gray-50/50 border-none rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed" value={currentUser.username} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">所属公司 (Company)</label>
                    <input type="text" disabled className="w-full h-14 px-6 bg-gray-50/50 border-none rounded-2xl text-sm font-bold text-gray-500 cursor-not-allowed" value={currentUser.company} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">所属部门 (Department)</label>
                    <input type="text" disabled className="w-full h-14 px-6 bg-gray-50/50 border-none rounded-2xl text-sm font-bold text-gray-500 cursor-not-allowed" value={currentUser.department} />
                  </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">联系方式 (Contact Info)</label>
                   <div className="grid grid-cols-3 gap-4">
                      <input 
                        type="email" placeholder="工作邮箱" className="col-span-2 w-full h-12 px-5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:border-[#135bec]"
                        value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})}
                      />
                      <input 
                        type="text" placeholder="办公电话" className="w-full h-12 px-5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:border-[#135bec]"
                        value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})}
                      />
                   </div>
                </div>
              </div>

              {/* Work Experience Sub-section */}
              <div className="pt-8 border-t border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-black text-[#135bec] uppercase tracking-widest flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">business_center</span>
                     外部工作经历 (Work Experience)
                   </h4>
                   <button 
                    type="button" 
                    onClick={() => setIsExpModalOpen(true)}
                    className="text-[10px] font-bold text-gray-400 hover:text-[#135bec] transition-colors"
                   >+ 添加经历</button>
                </div>
                <div className="space-y-4">
                  {currentUser.workExperience?.map((exp, idx) => (
                    <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-start group relative">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-[#111318]">{exp.company}</p>
                        <p className="text-xs font-bold text-gray-500">{exp.position} • <span className="font-mono">{exp.period}</span></p>
                        {exp.description && <p className="text-[11px] text-gray-400 mt-2 italic">{exp.description}</p>}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteExperience(idx)}
                        className="opacity-0 group-hover:opacity-100 size-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                  {(!currentUser.workExperience || currentUser.workExperience.length === 0) && (
                    <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                      <p className="text-xs text-gray-400 italic">暂无外部工作经历记录</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transfer Records Sub-section */}
              <div className="pt-8 border-t border-gray-100 space-y-6">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-[#135bec] uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">swap_horiz</span>
                      内部转/调岗记录 (Internal Transfers)
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => {
                        setNewTransfer({
                          ...newTransfer,
                          fromDept: currentUser.department,
                          fromPos: currentUser.position,
                          date: new Date().toISOString().split('T')[0]
                        });
                        setIsTransferModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-gray-400 hover:text-[#135bec] transition-colors"
                    >+ 录入调动</button>
                 </div>
                 <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                   {currentUser.transferRecords?.map((record, idx) => (
                     <div key={idx} className="relative">
                       <span className="absolute -left-[19px] top-1.5 size-2.5 rounded-full bg-white border-2 border-[#135bec] z-10"></span>
                       <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                         <div className="flex justify-between items-start">
                            <p className="text-[10px] font-black text-gray-400 font-mono">{record.date}</p>
                            <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase">生效</span>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">变动前</p>
                               <p className="text-xs font-bold text-gray-600">{record.fromDept}</p>
                               <p className="text-[10px] text-gray-400">{record.fromPos}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-[#135bec] uppercase tracking-widest mb-1">变动后</p>
                               <p className="text-xs font-black text-[#111318]">{record.toDept}</p>
                               <p className="text-[10px] font-bold text-[#111318]">{record.toPos}</p>
                            </div>
                         </div>
                         <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                            <p className="text-[10px] text-gray-400 italic">原因: {record.reason}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase">审核人: {record.approver}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                   {(!currentUser.transferRecords || currentUser.transferRecords.length === 0) && (
                     <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                       <p className="text-xs text-gray-400 italic">暂无内部调动记录</p>
                     </div>
                   )}
                 </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="submit" className="px-10 h-12 bg-[#111318] text-white text-xs font-black rounded-2xl shadow-xl hover:bg-gray-800 uppercase tracking-[0.2em] active:scale-95 transition-all">保存档案变更</button>
              </div>
            </form>
          </section>

          {/* Password Management */}
          <section className="bg-white rounded-[2.5rem] border border-[#dbdfe6] shadow-sm overflow-hidden">
            <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-[#111318] uppercase tracking-[0.2em]">安全凭证</h3>
              {!isChangingPassword && (
                <button 
                  onClick={() => setIsChangingPassword(true)}
                  className="text-[10px] font-black text-[#135bec] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                >修改登录密码</button>
              )}
            </div>
            <div className="p-8">
              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-in slide-in-from-top-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                     <p className="text-[10px] font-bold text-blue-700">为了保障账号安全，新密码必须包含至少 6 个字符。</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">当前密码</label>
                    <input 
                      type="password" required className="w-full h-14 px-6 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]"
                      value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">新密码</label>
                      <input 
                        type="password" required className="w-full h-14 px-6 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]"
                        value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">确认新密码</label>
                      <input 
                        type="password" required className="w-full h-14 px-6 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]"
                        value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-6">
                    <button type="button" onClick={() => setIsChangingPassword(false)} className="px-8 h-12 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">取消</button>
                    <button type="submit" className="px-10 h-12 bg-[#135bec] text-white text-xs font-black rounded-2xl shadow-xl hover:bg-blue-700 uppercase tracking-widest">确认更新</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-6 text-gray-400">
                  <div className="size-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                     <span className="material-symbols-outlined text-3xl">lock_clock</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111318]">账号当前处于受保护状态</p>
                    <p className="text-[10px] mt-1 font-medium">上次密码变更: 90 天前 • 强制过期: 30 天后</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Add Experience Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-black text-[#111318]">添加外部经历</h3>
              <button onClick={() => setIsExpModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddExperience} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">公司名称</label>
                  <input 
                    type="text" required className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-sm font-bold"
                    value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">任职岗位</label>
                  <input 
                    type="text" required className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-sm font-bold"
                    value={newExp.position} onChange={e => setNewExp({...newExp, position: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">在职期间 (例如 2018 - 2022)</label>
                  <input 
                    type="text" required className="w-full h-12 px-5 bg-gray-50 border-none rounded-xl text-sm font-mono font-bold"
                    value={newExp.period} onChange={e => setNewExp({...newExp, period: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">简要描述</label>
                  <textarea 
                    className="w-full h-24 px-5 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium resize-none"
                    value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsExpModalOpen(false)} className="flex-1 h-12 text-sm font-bold text-gray-500">取消</button>
                <button type="submit" className="flex-1 h-12 bg-[#135bec] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">确认添加</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transfer Modal (Updated with Hierarchical Selection) */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111318]/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                 <div className="size-12 rounded-2xl bg-[#135bec] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="material-symbols-outlined">account_tree</span>
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-[#111318]">内部调动申请 (受控录入)</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">数据关联: 机构组织层级映射</p>
                 </div>
              </div>
              <button onClick={() => { setIsTransferModalOpen(false); setSelectedTargetCompanyId(''); setSelectedTargetDeptId(''); }} className="size-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddTransfer} className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">生效日期 (Effective Date)</label>
                  <input 
                    type="date" required className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl text-sm font-bold"
                    value={newTransfer.date} onChange={e => setNewTransfer({...newTransfer, date: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">审核批准人 (Approver)</label>
                  <input 
                    type="text" required placeholder="例如: 某某副总裁" className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl text-sm font-bold"
                    value={newTransfer.approver} onChange={e => setNewTransfer({...newTransfer, approver: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 items-start">
                <div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-6 border border-gray-100 shadow-inner">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3">当前组织信息</p>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase">部门</p>
                      <p className="text-sm font-bold text-gray-600">{newTransfer.fromDept}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase">岗位</p>
                      <p className="text-sm font-bold text-gray-600">{newTransfer.fromPos}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-blue-50/50 rounded-[2.5rem] space-y-6 border border-blue-100 relative">
                  <p className="text-[10px] font-black text-[#135bec] uppercase tracking-widest border-b border-blue-100 pb-3">变动后目标组织 (必选)</p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[#135bec] uppercase">1. 目标公司实体 (L1)</label>
                      <select 
                        required className="w-full h-11 px-4 bg-white border border-blue-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#135bec]"
                        value={selectedTargetCompanyId}
                        onChange={(e) => {
                          setSelectedTargetCompanyId(e.target.value);
                          setSelectedTargetDeptId('');
                          setNewTransfer(prev => ({ ...prev, toDept: '', toPos: '' }));
                        }}
                      >
                        <option value="">请选择公司...</option>
                        {allCompanies.map(c => <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className={`text-[9px] font-black uppercase ${selectedTargetCompanyId ? 'text-[#135bec]' : 'text-gray-300'}`}>2. 目标部门 (L2)</label>
                      <select 
                        disabled={!selectedTargetCompanyId}
                        required className="w-full h-11 px-4 bg-white border border-blue-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#135bec] disabled:opacity-50"
                        value={selectedTargetDeptId}
                        onChange={(e) => {
                          const did = e.target.value;
                          setSelectedTargetDeptId(did);
                          const deptName = availableDepts.find(d => d.id === did)?.name || '';
                          setNewTransfer(prev => ({ ...prev, toDept: deptName, toPos: '' }));
                        }}
                      >
                        <option value="">请选择部门...</option>
                        {availableDepts.map(d => <option key={d.id} value={d.id}>[{d.code}] {d.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9px] font-black uppercase ${selectedTargetDeptId ? 'text-[#135bec]' : 'text-gray-300'}`}>3. 新任岗位 (L3)</label>
                      <select 
                        disabled={!selectedTargetDeptId}
                        required className="w-full h-11 px-4 bg-white border border-blue-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#135bec] disabled:opacity-50"
                        value={availablePositions.find(p => p.name === newTransfer.toPos)?.id || ''}
                        onChange={(e) => {
                          const pid = e.target.value;
                          const posName = availablePositions.find(p => p.id === pid)?.name || '';
                          setNewTransfer(prev => ({ ...prev, toPos: posName }));
                        }}
                      >
                        <option value="">请选择岗位...</option>
                        {availablePositions.map(p => <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">调岗事由说明 (Reason for Transfer)</label>
                <textarea 
                  required className="w-full h-24 px-6 py-5 bg-gray-50 border-none rounded-[2rem] text-sm font-bold resize-none shadow-inner focus:ring-2 focus:ring-[#135bec]"
                  placeholder="请输入调动原因，例如：业务部门扩建、职业路径优化..."
                  value={newTransfer.reason} onChange={e => setNewTransfer({...newTransfer, reason: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setIsTransferModalOpen(false); setSelectedTargetCompanyId(''); setSelectedTargetDeptId(''); }} className="flex-1 h-14 text-sm font-bold text-gray-500">放弃录入</button>
                <button type="submit" className="flex-1 h-14 bg-[#111318] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">确认发布并同步组织架构</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
