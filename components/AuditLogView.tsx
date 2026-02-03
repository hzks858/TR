
import React, { useState, useMemo } from 'react';
import { AuditRecord } from '../types';

const MOCK_AUDIT_LOGS: AuditRecord[] = [
  { id: '1', timestamp: '2024-03-20 10:30:15', actorName: 'Alex Johnson', actorId: 'EMP-9401', action: 'RESET_PASSWORD', module: 'USER', details: '重置了学员 Sarah Miller 的登录密码', ip: '192.168.1.105', severity: 'warning' },
  { id: '2', timestamp: '2024-03-20 09:15:22', actorName: 'Sarah Miller', actorId: 'EMP-9402', action: 'UPDATE_COURSE', module: 'COURSE', details: '更新了课程 [SOP-PRO-001] 的培训教材', ip: '192.168.1.108', severity: 'info' },
  { id: '3', timestamp: '2024-03-19 14:20:05', actorName: 'System', actorId: 'SYS-001', action: 'AUTO_ARCHIVE', module: 'SYSTEM', details: '系统自动归档 2023 年度培训记录', ip: '127.0.0.1', severity: 'info' },
  { id: '4', timestamp: '2024-03-19 11:00:45', actorName: 'Alex Johnson', actorId: 'EMP-9401', action: 'SUSPEND_ACCOUNT', module: 'USER', details: '锁定了异常登录账号 [Michael Chen]', ip: '192.168.1.105', severity: 'danger' },
];

const AuditLogView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(log => {
      const searchStr = `${log.actorName} ${log.actorId} ${log.details} ${log.action}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
      return matchesSearch && matchesModule && matchesSeverity;
    });
  }, [searchTerm, moduleFilter, severityFilter]);

  const severityColors = {
    info: 'bg-blue-50 text-blue-600 border-blue-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#111318]">合规审计追踪</h1>
          <p className="text-gray-500 text-sm mt-1">系统所有关键操作的不可篡改记录，符合 21 CFR Part 11 要求。</p>
        </div>
        <button className="flex items-center gap-2 h-11 px-6 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-all uppercase tracking-widest shadow-sm">
          <span className="material-symbols-outlined text-lg">download</span>
          导出审计报告 (PDF)
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#dbdfe6] shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input 
              type="text" 
              placeholder="模糊搜索操作员、内容、工号..."
              className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#135bec] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="h-10 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="ALL">所有模块</option>
            <option value="USER">用户管理</option>
            <option value="COURSE">课程目录</option>
            <option value="SYSTEM">系统后台</option>
          </select>
          <select 
            className="h-10 px-4 bg-white border border-gray-200 rounded-xl text-xs font-bold"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="ALL">所有级别</option>
            <option value="info">常规通知</option>
            <option value="warning">安全警告</option>
            <option value="danger">高风险操作</option>
          </select>
          {(searchTerm || moduleFilter !== 'ALL' || severityFilter !== 'ALL') && (
            <button 
              onClick={() => { setSearchTerm(''); setModuleFilter('ALL'); setSeverityFilter('ALL'); }}
              className="text-xs font-bold text-red-500 hover:underline"
            >
              清空过滤器
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">时间戳 / IP</th>
                <th className="px-6 py-4">操作员</th>
                <th className="px-6 py-4">模块 / 动作</th>
                <th className="px-6 py-4">详情描述</th>
                <th className="px-6 py-4">风险分级</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-[#111318]">{log.timestamp}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{log.ip}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-[#111318]">{log.actorName}</p>
                    <p className="text-[10px] text-[#135bec] font-bold tracking-widest">{log.actorId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded mr-2 uppercase">{log.module}</span>
                    <span className="text-xs font-mono font-bold text-gray-600">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-600 leading-relaxed max-w-md">{log.details}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${severityColors[log.severity as keyof typeof severityColors]}`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="py-20 text-center text-gray-400 italic text-sm">未搜索到符合条件的审计记录</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogView;
