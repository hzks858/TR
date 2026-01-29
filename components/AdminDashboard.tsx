
import React from 'react';
import { KPI } from '../types';

const AdminDashboard: React.FC = () => {
  const kpis: KPI[] = [
    { label: '总完成率', value: '98.2%', trend: '+1.2%', progress: 98.2 },
    { label: 'SOP 更新 (30天)', value: '142', trend: '高优先级', footer: '2024年9月30日之前到期' },
    { label: '逾期任务', value: '12', trend: '需要处理', footer: '涉及 3 个部门' },
    { label: '活跃用户', value: '1,405', trend: '稳定', footer: '过去 24 小时内登录' },
  ];

  const heatmapData = [
    { dept: '质量保证 (QA)', values: [0, 2, 0, 12, 0] },
    { dept: '研发 (R&D)', values: [24, 0, 4, 1, 8] },
    { dept: '生产部', values: [0, 42, 14, 28, 0] },
    { dept: '物流部', values: [0, 3, 1, 0, 0] },
  ];

  const categories = ['GCP', 'GMP 基础', '安全', 'SOP 规范', 'IT/系统'];

  const getHeatColor = (val: number) => {
    if (val === 0) return 'bg-gray-100 text-gray-400';
    if (val < 10) return 'bg-[#135bec]/10 text-[#135bec]';
    if (val < 20) return 'bg-[#135bec]/30 text-[#135bec]';
    if (val < 30) return 'bg-[#135bec]/60 text-white';
    return 'bg-[#135bec] text-white';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-[#dbdfe6] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                idx === 2 ? 'bg-red-50 text-red-600' : idx === 1 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
              }`}>{kpi.trend}</span>
            </div>
            <p className={`text-3xl font-black ${idx === 2 ? 'text-red-500' : 'text-[#111318]'}`}>{kpi.value}</p>
            {kpi.progress ? (
              <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-[#135bec] h-full" style={{ width: `${kpi.progress}%` }}></div>
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 mt-2 font-medium">{kpi.footer}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* 全宽合规风险热力图 */}
        <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm flex flex-col">
          <div className="p-6 border-b border-[#f3f4f6] flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-[#111318]">合规风险热力图</h3>
              <p className="text-sm text-gray-500 mt-1">各部门各培训类别的逾期项目实时分布</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1"><span className="size-2 bg-gray-100 rounded"></span> 0</span>
                <span className="flex items-center gap-1"><span className="size-2 bg-[#135bec]/20 rounded"></span> &lt;10</span>
                <span className="flex items-center gap-1"><span className="size-2 bg-[#135bec] rounded"></span> 30+</span>
              </div>
              <button className="text-xs font-bold text-[#135bec] hover:underline">导出详情</button>
            </div>
          </div>
          <div className="p-10">
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-1"></div>
              {categories.map(c => (
                <div key={c} className="text-[10px] font-black text-gray-400 text-center uppercase tracking-widest">{c}</div>
              ))}
              
              {heatmapData.map((row, idx) => (
                <React.Fragment key={idx}>
                  <div className="text-xs font-bold flex items-center pr-4 whitespace-nowrap text-[#616f89]">{row.dept}</div>
                  {row.values.map((val, vIdx) => (
                    <div 
                      key={vIdx} 
                      className={`h-16 rounded-xl flex items-center justify-center text-sm font-bold transition-all hover:scale-[1.02] cursor-default border border-transparent hover:border-[#135bec]/30 ${getHeatColor(val)}`}
                    >
                      {val > 0 ? val : ''}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 双重验证请求表格 */}
      <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f3f4f6] flex justify-between items-center bg-gray-50/30">
          <div>
            <h3 className="font-bold text-lg text-[#111318]">双重验证请求</h3>
            <p className="text-xs text-gray-500 mt-1">等待第二次行政签名的外部培训记录 (符合 21 CFR Part 11 要求)</p>
          </div>
          <button className="flex items-center gap-2 bg-[#111318] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-sm">
            <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
            批量验证签名
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-[#dbdfe6]">
              <tr>
                <th className="px-6 py-5">员工信息</th>
                <th className="px-6 py-5">培训课题</th>
                <th className="px-6 py-5">完成日期</th>
                <th className="px-6 py-5">佐证文档</th>
                <th className="px-6 py-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {[
                { name: '张伟', id: 'EMP-9401', color: 'bg-blue-100 text-blue-700' },
                { name: '李华', id: 'EMP-9402', color: 'bg-purple-100 text-purple-700' },
                { name: '王强', id: 'EMP-9403', color: 'bg-amber-100 text-amber-700' }
              ].map((user, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-full flex items-center justify-center font-bold text-xs ${user.color} shadow-inner`}>
                        {user.name}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111318]">{user.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">工号: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-[#111318]">外部：高级 HPLC 校准与方法验证</p>
                    <p className="text-[10px] text-gray-400 italic mt-0.5">授课机构: 安捷伦科技 (Agilent Technologies)</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium font-mono">2024-08-22</td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1.5 text-[#135bec] hover:text-blue-800 text-xs font-bold transition-colors">
                      <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                      培训证书_0{i + 1}.pdf
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">拒绝</button>
                      <button className="px-4 py-1.5 bg-[#135bec] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700 transition-all">验证并签名</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
