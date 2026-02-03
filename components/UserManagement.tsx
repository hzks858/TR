
import React, { useState, useMemo, useRef } from 'react';
import { Role, UserAccount, DigitalCert } from '../types';

interface Props {
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
}

interface TraineeImportFailedItem {
  row: number;
  name: string;
  reason: string;
  field: string;
}

interface TraineeImportResult {
  total: number;
  success: number;
  failed: number;
  duplicate: number;
  failedItems: TraineeImportFailedItem[];
}

const COMPANIES = ['金辉制药 (总仓)', '金辉研发中心 (上海)', '金辉生物制剂工厂'];
const DEPARTMENTS = ['质量保证部 (QA)', '质量控制部 (QC)', '生产部 (L1)', '研发部 (R&D)', '物流部', '系统管理部'];
const POSITIONS = ['首席合规官', 'QA 经理', 'QA 专员', 'QC 组长', '分析化验员', '灌装岗操作工'];

const UserManagement: React.FC<Props> = ({ users, setUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  
  // 过滤状态
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'active' | 'suspended' | 'ALL'>('ALL');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isImportReportOpen, setIsImportReportOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [importResult, setImportResult] = useState<TraineeImportResult | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'loading' } | null>(null);

  // 新增学员表单状态
  const initialNewUserState: Omit<UserAccount, 'id' | 'lastLogin' | 'status'> = {
    name: '',
    username: '',
    password: 'Password123!',
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    role: Role.EMPLOYEE,
    company: COMPANIES[0],
    department: DEPARTMENTS[0],
    position: POSITIONS[2],
    avatar: `https://picsum.photos/seed/${Math.random()}/80/80`,
  };
  const [newUserForm, setNewUserForm] = useState(initialNewUserState);

  const showToast = (message: string, type: 'success' | 'info' | 'loading' = 'success') => {
    setToast({ message, type });
    if (type !== 'loading') {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const searchTarget = `${u.name} ${u.employeeId} ${u.username}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      const matchesCompany = companyFilter === 'ALL' || u.company === companyFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesCompany;
    });
  }, [users, searchTerm, roleFilter, statusFilter, companyFilter]);

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
    showToast("用户状态已更新");
  };

  const openVault = (user: UserAccount) => {
    setSelectedUser(user);
    setIsVaultOpen(true);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserAccount = {
      ...newUserForm,
      id: Math.random().toString(36).substr(2, 9),
      status: 'active',
      lastLogin: '-',
    };
    setUsers(prev => [newUser, ...prev]);
    setIsModalOpen(false);
    setNewUserForm(initialNewUserState);
    showToast(`新学员 [${newUser.name}] 录入成功，已生成合规档案。`);
  };

  const handleDownloadTemplate = () => {
    const headers = "姓名,用户名,工号,角色(EMPLOYEE/QA_OFFICER/SYSTEM_ADMIN),公司,部门,岗位\n";
    const exampleRow = "王小明,wangxm,EMP-8801,EMPLOYEE,金辉制药 (总仓),质量保证部 (QA),QA 专员\n";
    const csvContent = "\uFEFF" + headers + exampleRow;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "G_Train_Trainee_Import_Template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("下载模版成功，请按格式填写信息", "info");
  };

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast("正在执行全量数据合规核验...", "loading");

    // 深度模拟批量导入后的合规反馈报告
    setTimeout(() => {
      const result: TraineeImportResult = {
        total: 15,
        success: 10,
        failed: 3,
        duplicate: 2,
        failedItems: [
          { row: 4, name: '陈*海', field: '工号 (EMP ID)', reason: '工号 [EMP-102] 已由现有学员 张利民 (QA) 占用。' },
          { row: 7, name: '张*涵', field: '所属部门', reason: '部门 [临床医学部] 不在受控机构列表中，请先在【机构设置】中创建。' },
          { row: 11, name: 'L* Smith', field: '角色权限', reason: '角色字段 [ADMIN] 为无效值，预期为 EMPLOYEE / QA_OFFICER / SYSTEM_ADMIN。' },
          { row: 13, name: '重复数据 A', field: '全局唯一性', reason: '检测到与文件中第 2 行记录完全重复。' }
        ]
      };

      const newMockUsers: UserAccount[] = Array.from({ length: 10 }).map((_, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: `新录入学员 ${String.fromCharCode(65 + i)}`,
        username: `import_${Math.random().toString(36).substr(2, 4)}`,
        password: 'Password123!',
        employeeId: `EMP-NEW-${100 + i}`,
        role: Role.EMPLOYEE,
        company: COMPANIES[0],
        department: DEPARTMENTS[2],
        position: POSITIONS[4],
        avatar: `https://picsum.photos/seed/batch${i}/80/80`,
        status: 'active',
        lastLogin: '-'
      }));

      setUsers(prev => [...newMockUsers, ...prev]);
      setImportResult(result);
      setIsImportReportOpen(true);
      setToast(null);
      if (importFileInputRef.current) importFileInputRef.current.value = '';
    }, 2000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUserForm(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const timestamp = new Date().toLocaleString('zh-CN', { hour12: false });
        const updatedUser: UserAccount = {
          ...selectedUser,
          digitalSignature: base64String,
          signatureTimestamp: timestamp
        };
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
        setSelectedUser(updatedUser);
        showToast("电子签名已采集并存证", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setCompanyFilter('ALL');
  };

  const hasActiveFilters = searchTerm !== '' || roleFilter !== 'ALL' || statusFilter !== 'ALL' || companyFilter !== 'ALL';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-20">
      {toast && (
        <div className={`fixed top-20 right-8 z-[120] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
          toast.type === 'loading' ? 'bg-[#111318] text-white' : 'bg-[#135bec] text-white'
        }`}>
          {toast.type === 'loading' ? (
            <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-xl">info</span>
          )}
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#111318]">学员个人档案管理</h1>
          <p className="text-gray-500 text-sm mt-1">集成数字签名追踪与受控证书保险库的 GxP 管理系统。</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 h-11 px-5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-all uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            下载模版
          </button>
          
          <input 
            type="file" 
            ref={importFileInputRef} 
            className="hidden" 
            accept=".csv" 
            onChange={handleBulkImport} 
          />
          <button 
            onClick={() => importFileInputRef.current?.click()}
            className="flex items-center gap-2 h-11 px-5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-all uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            批量导入
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 h-11 px-6 bg-[#135bec] text-white text-xs font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            录入新学员
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#dbdfe6] shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
              <input 
                type="text" 
                placeholder="搜索姓名、用户名、工号或合规编号..."
                className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#135bec] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <select 
                  className="h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-[#135bec]"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                >
                  <option value="ALL">所有角色</option>
                  <option value={Role.EMPLOYEE}>普通学员</option>
                  <option value={Role.QA_OFFICER}>合规审计员</option>
                  <option value={Role.SYSTEM_ADMIN}>系统管理员</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <select 
                  className="h-11 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-[#135bec]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="ALL">所有状态</option>
                  <option value="active">正常激活</option>
                  <option value="suspended">已冻结</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button 
                  onClick={resetAllFilters}
                  className="h-11 px-4 text-xs font-black text-red-500 uppercase hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">filter_list_off</span>
                  重置筛选
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-5">学员基本信息</th>
                <th className="px-6 py-5">系统角色</th>
                <th className="px-6 py-5">组织结构</th>
                <th className="px-6 py-5 text-center">数字签名</th>
                <th className="px-6 py-5 text-center">证书</th>
                <th className="px-6 py-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors group ${user.status === 'suspended' ? 'opacity-70 grayscale bg-gray-50/20' : ''}`}>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <img src={user.avatar} className="size-11 rounded-xl border border-gray-200 shadow-sm object-cover" />
                      <div>
                        <p className="text-sm font-black text-[#111318]">{user.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono tracking-tighter">
                          ID: {user.employeeId} • @{user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${
                      user.role === Role.SYSTEM_ADMIN ? 'bg-red-50 text-red-600 border-red-100' :
                      user.role === Role.QA_OFFICER ? 'bg-purple-50 text-purple-600 border-purple-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {user.role === Role.SYSTEM_ADMIN ? '系统管理员' : 
                       user.role === Role.QA_OFFICER ? '审计员' : '学员'}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-xs font-bold text-gray-700">{user.company}</p>
                    <p className="text-[10px] text-gray-400">{user.department}</p>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`material-symbols-outlined text-xl ${user.digitalSignature ? 'text-green-500' : 'text-gray-300'}`}>
                      {user.digitalSignature ? 'verified_user' : 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-xs font-black bg-blue-50 text-[#135bec] px-2 py-1 rounded-lg border border-blue-100">
                      {(user.certificates?.length || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openVault(user)} className="px-4 py-2 bg-[#111318] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#135bec] transition-all">
                        保险库
                      </button>
                      <button onClick={() => handleToggleStatus(user.id)} className={`p-2 transition-colors ${user.status === 'active' ? 'text-gray-400 hover:text-red-500' : 'text-green-500 hover:text-green-600'}`}>
                        <span className="material-symbols-outlined text-xl">{user.status === 'active' ? 'block' : 'check_circle'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic text-sm">
                    未找到匹配筛选条件的学员记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 导入结果详细反馈报告 */}
      {isImportReportOpen && importResult && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#111318]/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[85vh]">
            <header className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-[#135bec] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                     <span className="material-symbols-outlined">analytics</span>
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-[#111318]">学员档案导入 integrity 报告</h3>
                     <p className="text-[10px] text-gray-400 font-black uppercase mt-1 tracking-widest">
                        合规准入扫描完成 • 21 CFR Part 11 数据审计就绪
                     </p>
                  </div>
               </div>
               <button onClick={() => setIsImportReportOpen(false)} className="size-10 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-transform active:scale-90">
                  <span className="material-symbols-outlined">close</span>
               </button>
            </header>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
               {/* 核心统计看板 */}
               <div className="grid grid-cols-4 gap-6">
                  <div className="p-7 rounded-[2rem] bg-gray-50 border border-gray-100 text-center">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">文件总记录</p>
                     <p className="text-4xl font-black text-[#111318]">{importResult.total}</p>
                  </div>
                  <div className="p-7 rounded-[2rem] bg-green-50 border border-green-100 text-center">
                     <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">核验通过</p>
                     <p className="text-4xl font-black text-green-600">{importResult.success}</p>
                  </div>
                  <div className="p-7 rounded-[2rem] bg-red-50 border border-red-100 text-center">
                     <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">拦截异常</p>
                     <p className="text-4xl font-black text-red-600">{importResult.failed}</p>
                  </div>
                  <div className="p-7 rounded-[2rem] bg-amber-50 border border-amber-100 text-center">
                     <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">重复项</p>
                     <p className="text-4xl font-black text-amber-600">{importResult.duplicate}</p>
                  </div>
               </div>

               {/* 异常拦截明细清单 */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-red-500">report</span>
                       <h4 className="text-sm font-black text-[#111318] uppercase tracking-widest">异常拦截明细 (需修正后重新导入)</h4>
                    </div>
                    <button className="text-[10px] font-black text-[#135bec] uppercase border-b border-[#135bec]">导出异常记录 .csv</button>
                  </div>
                  
                  <div className="space-y-4">
                     {importResult.failedItems.map((item, idx) => (
                       <div key={idx} className="p-6 bg-red-50/30 rounded-2xl border border-red-100 flex items-start gap-6 animate-in slide-in-from-left-4" style={{ animationDelay: `${idx * 80}ms` }}>
                          <div className="size-10 rounded-xl bg-white text-red-600 flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-sm">
                             行 {item.row}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-black text-[#111318]">{item.name}</span>
                                <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded border border-red-100 text-red-400 uppercase tracking-widest">
                                   冲突字段: {item.field}
                                </span>
                             </div>
                             <p className="text-[11px] font-medium text-red-800 leading-relaxed bg-white/50 p-2 rounded-lg">
                                <b>核验反馈:</b> {item.reason}
                             </p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               {/* 合规合规认证声明 */}
               <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-5">
                  <div className="size-12 rounded-2xl bg-[#135bec] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">合规存证说明 (Audit Trail)</h5>
                    <p className="text-[10px] text-blue-700/80 font-bold leading-relaxed">
                       系统已根据【机构设置】及【系统管理】中的准入规则完成对文件的解析。所有通过核验的学员已自动生成加密的初始培训档案，并同步触发了“首次登录强制修改密码”流程。
                       本次批量录入的所有元数据（含文件哈希值、操作员签名）已存入不可篡改的审计追踪数据库中，审计编号: <span className="font-mono text-blue-900">AUDIT-IMP-{Date.now()}</span>。
                    </p>
                  </div>
               </div>
            </div>

            <footer className="px-10 py-8 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-4">
               <button 
                  onClick={() => setIsImportReportOpen(false)}
                  className="px-12 h-12 bg-[#111318] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-gray-800 active:scale-95 transition-all"
               >
                  确认报告并结束
               </button>
            </footer>
          </div>
        </div>
      )}

      {/* 录入新学员弹窗保持不变... */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#111318]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-[#135bec] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#111318]">录入新学员记录</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">合规档案采集 • 21 CFR Part 11 已就绪</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-full hover:bg-gray-100 text-gray-400 transition-all flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                  <div className="text-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="relative inline-block mb-4">
                      <img 
                        src={newUserForm.avatar} 
                        className="size-24 rounded-full border-4 border-white shadow-lg object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => avatarInputRef.current?.click()}
                      />
                      <input 
                        type="file" 
                        ref={avatarInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleAvatarUpload} 
                      />
                      <button 
                        type="button" 
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-0 right-0 size-8 bg-[#135bec] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                      </button>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">学员身份照片</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">姓名 (实名)</label>
                      <input required type="text" className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">受控工号 (EMP ID)</label>
                      <input required type="text" className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-[#135bec]" value={newUserForm.employeeId} onChange={e => setNewUserForm({...newUserForm, employeeId: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">登录账户名</label>
                      <input required type="text" className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold" value={newUserForm.username} onChange={e => setNewUserForm({...newUserForm, username: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">初始密码</label>
                      <input required type="password" disabled className="w-full h-11 px-4 bg-gray-100 border-none rounded-xl text-sm font-bold text-gray-400" value={newUserForm.password} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">系统角色</label>
                      <select className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold" value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value as any})}>
                        <option value={Role.EMPLOYEE}>普通学员 (Employee)</option>
                        <option value={Role.QA_OFFICER}>合规审计员 (QA Officer)</option>
                        <option value={Role.SYSTEM_ADMIN}>系统管理员 (Admin)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">所属公司实体</label>
                      <select className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold" value={newUserForm.company} onChange={e => setNewUserForm({...newUserForm, company: e.target.value})}>
                        {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">所属部门</label>
                      <select className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold" value={newUserForm.department} onChange={e => setNewUserForm({...newUserForm, department: e.target.value})}>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">岗位职级</label>
                      <select className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold" value={newUserForm.position} onChange={e => setNewUserForm({...newUserForm, position: e.target.value})}>
                        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-10 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="flex gap-4">
                      <span className="material-symbols-outlined text-amber-600">info</span>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        <b>合规提示：</b> 录入此记录后，系统将自动生成审计追踪记录。新学员首次登录后将被强制要求重置密码并签署电子签名确认协议。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12 flex justify-end gap-4 border-t border-gray-100 pt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 h-12 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">放弃录入</button>
                <button type="submit" className="px-16 h-12 bg-[#135bec] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all">创建合规档案并发布</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 保险库视图保持不变... */}
      {isVaultOpen && selectedUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#111318]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
             <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="size-14 rounded-2xl bg-[#135bec] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">security</span>
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-[#111318] tracking-tight">{selectedUser.name} 的保险库</h3>
                      <p className="text-[10px] text-gray-400 font-black uppercase mt-1">工号: {selectedUser.employeeId} • 用户名: {selectedUser.username}</p>
                   </div>
                </div>
                <button onClick={() => setIsVaultOpen(false)} className="size-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             <div className="flex-1 flex overflow-hidden">
                <aside className="w-80 border-r border-gray-100 p-8 space-y-8 bg-gray-50/30">
                   <section>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">电子签名</h4>
                      <input type="file" ref={signatureInputRef} className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                      <div onClick={() => signatureInputRef.current?.click()} className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 aspect-video flex flex-col items-center justify-center relative cursor-pointer hover:border-[#135bec] transition-all">
                         {selectedUser.digitalSignature ? (
                           <img src={selectedUser.digitalSignature} className="max-w-full h-auto" />
                         ) : (
                           <div className="text-center opacity-40">
                              <span className="material-symbols-outlined text-3xl">draw</span>
                              <p className="text-[9px] font-black uppercase mt-1">上传手写签名</p>
                           </div>
                         )}
                      </div>
                      {selectedUser.signatureTimestamp && (
                        <p className="mt-3 text-[10px] text-gray-400 font-mono text-center">采集于: {selectedUser.signatureTimestamp}</p>
                      )}
                   </section>
                   <section className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">资质证书汇总</h4>
                      <div className="space-y-2">
                         {selectedUser.certificates?.map((cert, idx) => (
                           <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                              <span className="material-symbols-outlined text-[#135bec]">verified</span>
                              <div className="min-w-0">
                                 <p className="text-[11px] font-bold text-gray-700 truncate">{cert.name}</p>
                                 <p className="text-[9px] text-gray-400 uppercase">有效期至: {cert.expiryDate}</p>
                              </div>
                           </div>
                         ))}
                         {(!selectedUser.certificates || selectedUser.certificates.length === 0) && (
                           <p className="text-[10px] text-gray-400 italic">暂无受控证书记录</p>
                         )}
                      </div>
                   </section>
                </aside>
                <main className="flex-1 p-10 bg-[#f8fafc] overflow-y-auto custom-scrollbar">
                   <div className="flex flex-col items-center justify-center h-full gap-4">
                      <span className="material-symbols-outlined text-6xl text-gray-200">folder_zip</span>
                      <p className="text-sm font-bold text-gray-400">合规档案保险库</p>
                      <p className="max-w-sm text-center text-xs text-gray-400 leading-relaxed">
                        该区域包含学员所有加密的培训记录、原始试卷快照及审计轨迹。符合 FDA 21 CFR Part 11 及 EU GMP Annex 11 标准。
                      </p>
                      <button className="mt-6 px-6 py-2.5 bg-white border border-gray-200 text-[#111318] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all">
                        下载完整加密报告 (.zip)
                      </button>
                   </div>
                </main>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
