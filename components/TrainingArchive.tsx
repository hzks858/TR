
import React from 'react';

const TrainingArchive: React.FC = () => {
  const records = [
    { name: '2023 年度 GMP 合规培训', id: 'COURSE-2023-01', type: '线上', duration: '45 分钟', date: '2023-10-15', score: '98/100', status: 'valid' },
    { name: '变更控制研讨会', id: 'SEMINAR-2023-05', type: '研讨会', duration: '3 小时', date: '2023-09-13', score: '92/100', status: 'valid' },
    { name: '偏差与 CAPA 指南', id: 'COURSE-2023-08', type: '线上', duration: '120 分钟', date: '2023-08-05', score: '55/100', status: 'failed' },
    { name: '实验室仪器验证实操', id: 'OJT-2022-12', type: '实操 (OJT)', duration: '8 小时', date: '2022-12-21', score: '100/100', status: 'expired' },
  ];

  const handleDownload = (recordName: string) => {
    // In a real app, this would trigger a file download logic
    alert(`正在生成并下载: ${recordName} 的合规报告 PDF...`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-[#111318] text-3xl font-black tracking-tight">个人培训档案 (TPF)</h1>
          <p className="text-[#616f89] text-base">用于审计验证的完整历史记录和资质状态。</p>
        </div>
        <button className="flex items-center gap-2 px-6 h-12 bg-[#135bec] text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all">
          <span className="material-symbols-outlined text-xl">download</span>
          下载完整 TPF (PDF)
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#dbdfe6]">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <img src="https://picsum.photos/seed/alex-profile/140/140" alt="Profile" className="size-36 rounded-xl border-4 border-[#f6f6f8] shadow-inner object-cover" />
          <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h2 className="text-2xl font-bold text-[#111318]">Alex Johnson</h2>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                状态：完全合格
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-500 justify-center md:justify-start">
                <span className="material-symbols-outlined text-lg">badge</span>
                <span className="text-sm font-medium">职务：<span className="text-[#111318]">质量保证 (QA) 专员</span></span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 justify-center md:justify-start">
                <span className="material-symbols-outlined text-lg">corporate_fare</span>
                <span className="text-sm font-medium">部门：<span className="text-[#111318]">质量管理部</span></span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 justify-center md:justify-start">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
                <span className="text-sm font-medium">入职日期：<span className="text-[#111318]">2021-03-15</span></span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 justify-center md:justify-start">
                <span className="material-symbols-outlined text-lg">history_edu</span>
                <span className="text-sm font-medium">最后更新：<span className="text-[#111318]">2023-10-20</span></span>
              </div>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-gray-50 text-[#111318] border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-100">更新个人资料</button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#111318]">历史记录</h2>
          <div className="flex gap-2">
            <select className="bg-white border-[#dbdfe6] rounded-lg text-sm font-bold px-4 py-2 focus:ring-[#135bec] focus:border-[#135bec]">
              <option>2023 学年度</option>
              <option>2022 学年度</option>
            </select>
            <select className="bg-white border-[#dbdfe6] rounded-lg text-sm font-bold px-4 py-2 focus:ring-[#135bec] focus:border-[#135bec]">
              <option>所有培训类型</option>
              <option>线上培训</option>
              <option>实操 (OJT)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#dbdfe6] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-[#dbdfe6]">
              <tr>
                <th className="px-6 py-4">课程名称</th>
                <th className="px-6 py-4">类型</th>
                <th className="px-6 py-4">用时/时长</th>
                <th className="px-6 py-4">考核日期</th>
                <th className="px-6 py-4">得分</th>
                <th className="px-6 py-4">到期日</th>
                <th className="px-6 py-4 text-center">状态</th>
                <th className="px-6 py-4 text-right">报告</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {records.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#111318]">{r.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">ID: {r.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">{r.type}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">{r.duration}</td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">{r.date}</td>
                  <td className={`px-6 py-4 text-sm font-black ${r.status === 'failed' ? 'text-red-500' : 'text-green-600'}`}>{r.score}</td>
                  <td className={`px-6 py-4 text-xs font-bold ${r.status === 'expired' ? 'text-amber-500 italic' : 'text-gray-400'}`}>
                    {r.status === 'expired' ? '已过期 (2023-12-20)' : '2024-10-15'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`material-symbols-outlined ${
                      r.status === 'valid' ? 'text-green-500' : r.status === 'failed' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {r.status === 'valid' ? 'check_circle' : r.status === 'failed' ? 'error' : 'warning'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDownload(r.name)}
                      className="p-2 text-[#135bec] hover:bg-blue-50 rounded-lg transition-all group-hover:scale-110"
                      title="下载单项合规报告"
                    >
                      <span className="material-symbols-outlined text-xl">file_download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-[#f3f4f6] flex items-center justify-between text-xs font-medium text-gray-400">
            <p>显示 1-4 条，共 12 条记录</p>
            <div className="flex gap-2">
              <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30" disabled>上一页</button>
              <button className="size-6 bg-[#135bec] text-white rounded font-bold">1</button>
              <button className="size-6 border border-gray-200 rounded hover:bg-gray-50 font-bold">2</button>
              <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">下一页</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#135bec]/5 border border-[#135bec]/10 p-6 rounded-xl flex items-start gap-4">
        <span className="material-symbols-outlined text-[#135bec] text-3xl">gavel</span>
        <div>
          <h4 className="text-sm font-bold text-[#111318]">审计合规说明</h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            个人培训档案 (TPF) 的维护符合 21 CFR Part 11 和 EU GMP Annex 11 对电子记录的要求。
            所有导出的 PDF 报告均包含高完整性的数字签名和时间戳，可用于监管部门提报。
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrainingArchive;
