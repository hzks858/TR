
import React, { useState } from 'react';

interface AdminStaff {
  id: string;
  name: string;
  role: 'IT_ADMIN' | 'TRAINING_SPECIALIST';
  username: string;
  permissions: string[];
  lastLogin: string;
  status: 'active' | 'locked';
  reviewDate: string; // 合规复核日期
}

const INITIAL_ADMIN_STAFF: AdminStaff[] = [
  { 
    id: 'ADM-01', 
    name: '张技术', 
    role: 'IT_ADMIN', 
    username: 'it_admin_01', 
    permissions: ['系统配置', '数据库管理', '审计日志下载'], 
    lastLogin: '2024-03-20 09:00',
    status: 'active',
    reviewDate: '2024-01-10'
  },
  { 
    id: 'ADM-02', 
    name: '李专员', 
    role: 'TRAINING_SPECIALIST', 
    username: 'training_spec_li', 
    permissions: ['课程发布', '批量学员导入', '成绩审计'], 
    lastLogin: '2024-03-19 15:45',
    status: 'active',
    reviewDate: '2024-02-15'
  },
];

const SystemManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'admin_staff' | 'license'>('admin_staff');
  const [adminStaff, setAdminStaff] = useState<AdminStaff[]>(INITIAL_ADMIN_STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<AdminStaff, 'id' | 'lastLogin' | 'status' | 'reviewDate' | 'permissions'>>({
    name: '',
    role: 'TRAINING_SPECIALIST',
    username: '',
  });

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStatus = (id: string) => {
    setAdminStaff(prev => prev.map(staff => {
      if (staff.id === id) {
        const isNowLocked = staff.status === 'active';
        const newStatus = isNowLocked ? 'locked' : 'active';
        showToast(
          isNowLocked ? `管理员 [${staff.name}] 账号已锁定` : `管理员 [${staff.name}] 账号已激活`, 
          isNowLocked ? 'warning' : 'success'
        );
        return { ...staff, status: newStatus as 'active' | 'locked' };
      }
      return staff;
    }));
  };

  const handleResetSecurity = (id: string, name: string) => {
    if (window.confirm(`确认执行敏感操作：重置管理员 [${name}] 的二级安全授权码？\n此操作将被记录在 Part 11 审计追踪中。`)) {
      showToast(`已成功重置 ${name} 的二级安全码，同步邮件已发送至合规信箱`, 'info');
    }
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username) return;

    const nextIdNum = adminStaff.length + 1;
    const newStaff: AdminStaff = {
      id: `ADM-${nextIdNum.toString().padStart(2, '0')}`,
      ...formData,
      permissions: formData.role === 'IT_ADMIN' 
        ? ['系统配置', '数据库管理', '审计日志下载'] 
        : ['课程发布', '批量学员导入', '成绩审计'],
      lastLogin: '-',
      status: 'active',
      reviewDate: new Date().toISOString().split('T')[0]
    };

    setAdminStaff(prev => [newStaff, ...prev]);
    setIsModalOpen(false);
    setFormData({ name: '', role: 'TRAINING_SPECIALIST', username: '' });
    showToast(`新管理员账号 [${newStaff.name}] 已成功录入`);
  };

  const systemStatus = [
    { label: '核心服务', value: '运行中', status: 'online' },
    { label: '数据库 (PostgreSQL)', value: '已连接 (延迟: 4ms)', status: 'online' },
    { label: '存储 (S3 Bucket)', value: '14.2 GB / 100 GB', status: 'online' },
    { label: '合规验证引擎', value: 'Part 11 模式开启', status: 'online' },
  ];

  const configParams = [
    { key: 'passing_score', label: '及格分数线', value: '80', desc: '考核通过的最低分数要求' },
    { key: 'auto_suspend_days', label: '账号自动锁定周期', value: '90', desc: '无活动后自动冻结账号的天数' },
    { key: 'session_timeout', label: '会话超时 (分钟)', value: '30', desc: '自动注销时间间隔' },
    { key: 'audit_retention_years', label: '审计日志保存年限', value: '7', desc: '符合监管要求的最小保存期' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Dynamic Toast Feedback */}
      {toast && (
        <div className={`fixed top-20 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-300 border backdrop-blur-md ${
          toast.type === 'success' ? 'bg-[#135bec] border-blue-400 text-white' : 
          toast.type === 'warning' ? 'bg-amber-600 border-amber-400 text-white' : 
          'bg-gray-900 border-gray-700 text-white'
        }`}>
          <span className="material-symbols-outlined text-2xl">
            {toast.type === 'success' ? 'verified' : toast.type === 'warning' ? 'lock_reset' : 'info'}
          </span>
          <div>
            <p className="text-sm font-black tracking-tight">{toast.message}</p>
            <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">操作已记录至审计日志</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#111318]">软件系统配置</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">控制软件底层合规参数、管理员权限及系统授权。</p>
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-2xl border border-[#dbdfe6] w-full max-w-2xl shadow-sm overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('status')} className={`flex-1 min-w-[100px] py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'status' ? 'bg-[#111318] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>运行状态</button>
        <button onClick={() => setActiveTab('config')} className={`flex-1 min-w-[100px] py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'config' ? 'bg-[#111318] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>合规参数</button>
        <button onClick={() => setActiveTab('admin_staff')} className={`flex-1 min-w-[100px] py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'admin_staff' ? 'bg-[#135bec] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>管理人员</button>
        <button onClick={() => setActiveTab('license')} className={`flex-1 min-w-[100px] py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'license' ? 'bg-[#111318] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>许可证</button>
      </div>

      {activeTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStatus.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#dbdfe6] shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{item.label}</p>
              <div className="flex items-center gap-3">
                <span className="size-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-sm font-black text-[#111318]">{item.value}</p>
              </div>
            </div>
          ))}
          <div className="md:col-span-2 lg:col-span-4 bg-[#111318] rounded-2xl p-8 text-white relative overflow-hidden">
             <div className="absolute right-0 top-0 size-48 bg-[#135bec]/20 rounded-full blur-3xl"></div>
             <div className="flex items-center gap-6">
                <div className="size-16 rounded-2xl bg-[#135bec] flex items-center justify-center text-white shadow-lg">
                   <span className="material-symbols-outlined text-3xl">verified</span>
                </div>
                <div>
                   <h3 className="text-xl font-bold">合规验证摘要</h3>
                   <p className="text-gray-400 text-sm mt-1">系统已通过验证的软件版本: <span className="text-white font-mono">v4.2.0-LTS-VALIDATED</span></p>
                </div>
                <button className="ml-auto px-6 py-3 bg-white text-[#111318] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">查看验证包</button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white rounded-2xl border border-[#dbdfe6] shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-black text-[#111318] uppercase tracking-widest">全局参数配置</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {configParams.map((param) => (
              <div key={param.key} className="p-8 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-black text-[#111318]">{param.label}</p>
                  <p className="text-xs text-gray-500">{param.desc}</p>
                  <p className="text-[10px] text-gray-300 font-mono">Key: {param.key}</p>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    type="text" 
                    className="w-24 h-10 px-4 bg-gray-100 border-none rounded-lg text-center font-black text-[#135bec]"
                    defaultValue={param.value}
                  />
                  <button className="size-10 flex items-center justify-center text-gray-400 hover:text-[#135bec] transition-colors">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
             <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest">恢复默认</button>
             <button onClick={() => showToast('核心参数已保存并触发全网同步')} className="px-10 py-2.5 bg-[#135bec] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-transform active:scale-95">应用并保存配置</button>
          </div>
        </div>
      )}

      {activeTab === 'admin_staff' && (
        <div className="bg-white rounded-3xl border border-[#dbdfe6] shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-[#111318] uppercase tracking-[0.2em]">系统管理人员列表</h3>
              <p className="text-[10px] text-gray-400 font-medium mt-1 italic">仅用于 IT 系统运维及培训专员的权限分级管理</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#135bec] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              新增管理账号
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-10 py-6">管理员身份 / 工号</th>
                  <th className="px-8 py-6">系统角色</th>
                  <th className="px-8 py-6">核心权限集</th>
                  <th className="px-8 py-6">最近合规复核</th>
                  <th className="px-10 py-6 text-right">操作控制</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {adminStaff.map(staff => (
                  <tr key={staff.id} className={`hover:bg-gray-50/50 transition-colors ${staff.status === 'locked' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="size-11 rounded-2xl bg-[#111318] text-white flex items-center justify-center font-black border border-gray-100 shadow-sm uppercase text-xs">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#111318]">{staff.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono tracking-tighter">UID: {staff.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-tighter border ${
                        staff.role === 'IT_ADMIN' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {staff.role === 'IT_ADMIN' ? 'IT 系统管理员' : '培训业务专员'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {staff.permissions.map((p, i) => (
                          <span key={i} className="text-[8px] font-black bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100 uppercase">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-bold text-[#111318]">{staff.reviewDate}</p>
                      <p className={`text-[9px] font-black uppercase mt-1 ${staff.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                        状态: {staff.status === 'active' ? '正常' : '锁定'}
                      </p>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 pointer-events-auto">
                        <button 
                          onClick={() => handleToggleStatus(staff.id)}
                          className={`size-10 flex items-center justify-center rounded-2xl transition-all border shadow-sm active:scale-90 ${staff.status === 'active' ? 'text-gray-400 hover:text-[#135bec] bg-white border-gray-100' : 'text-amber-600 bg-amber-50 border-amber-200'}`} 
                          title={staff.status === 'active' ? '锁定该管理员账号' : '立即激活账号'}
                        >
                          <span className="material-symbols-outlined text-lg">{staff.status === 'active' ? 'admin_panel_settings' : 'lock_open'}</span>
                        </button>
                        <button 
                          onClick={() => handleResetSecurity(staff.id, staff.name)}
                          className="size-10 flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all border border-gray-100 bg-white shadow-sm active:scale-90" 
                          title="重置二级合规验证码"
                        >
                          <span className="material-symbols-outlined text-lg">vpn_key</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-amber-50/50 border-t border-amber-100">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-amber-600 text-xl">security</span>
              <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                <span className="font-black uppercase mr-2 tracking-[0.1em] border-b border-amber-300">安全准则:</span> 
                根据 GMP 信息系统管理准则，IT 管理员账号不应用于日常培训考核操作，培训专员账号不应具备审计追踪日志的物理删除权限。所有管理员账户的增删改查必须由 QA 复核签名。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#111318]/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-sm font-black text-[#111318] uppercase tracking-[0.2em]">录入系统管理账户</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-transform active:scale-90">
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             <form onSubmit={handleAddAdmin} className="p-10 space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">管理员姓名</label>
                   <input 
                     required type="text" className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#135bec] transition-all"
                     value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">登录识别号 (Username)</label>
                   <input 
                     required type="text" className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl text-sm font-mono font-black focus:ring-2 focus:ring-[#135bec] transition-all"
                     value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">预设系统角色</label>
                   <select 
                     className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-[#135bec] transition-all"
                     value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}
                   >
                     <option value="TRAINING_SPECIALIST">培训业务专员</option>
                     <option value="IT_ADMIN">IT 系统管理员</option>
                   </select>
                </div>
                <div className="pt-6 flex gap-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 text-sm font-bold text-gray-400">取消</button>
                   <button type="submit" className="flex-1 h-14 bg-[#135bec] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">确认并授权发布</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemManagement;
