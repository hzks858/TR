
import React, { useState, useMemo } from 'react';

interface TrainingRecord {
  id: string;
  studentName: string;
  studentId: string;
  courseName: string;
  courseCode: string;
  completionDate: string;
  score: number;
  status: 'passed' | 'failed' | 'pending';
  department: string;
  company: string;
  position: string;
}

const MOCK_RECORDS: TrainingRecord[] = [
  { id: '1', studentName: '王小华', studentId: 'EMP-001', courseName: '生产线自动灭菌规程', courseCode: 'SOP-PRO-001', completionDate: '2024-03-20', score: 95, status: 'passed', department: '生产部', company: '金辉制药', position: '操作工' },
  { id: '2', studentName: '张大利', studentId: 'EMP-002', courseName: 'HPLC 样品制备指南', courseCode: 'SOP-QC-005', completionDate: '2024-03-18', score: 88, status: 'passed', department: '质量控制部 (QC)', company: '金辉制药', position: '化验员' },
  { id: '3', studentName: '李思思', studentId: 'EMP-003', courseName: 'ALCOA+ 数据完整性核心', courseCode: 'QA-DI-102', completionDate: '2024-03-15', score: 58, status: 'failed', department: '质量保证部 (QA)', company: '金辉制药', position: '审计员' },
  { id: '4', studentName: '赵铁柱', studentId: 'EMP-004', courseName: '洁净区行为规范', courseCode: 'SOP-PRO-022', completionDate: '2024-03-12', score: 92, status: 'passed', department: '生产部', company: '金辉制药', position: '车间主任' },
  { id: '5', studentName: '王小华', studentId: 'EMP-001', courseName: '21 CFR Part 11 解读', courseCode: 'QA-DI-105', completionDate: '2024-03-10', score: 100, status: 'passed', department: '生产部', company: '金辉制药', position: '操作工' },
  { id: '6', studentName: '孙悟空', studentId: 'EMP-005', courseName: '冷链偏差处理 SOP', courseCode: 'SOP-LOG-22', completionDate: '2024-03-08', score: 85, status: 'passed', department: '物流部', company: '金辉制药', position: '主管' },
  { id: '7', studentName: '张大利', studentId: 'EMP-002', courseName: '洁净区行为规范', courseCode: 'SOP-PRO-022', completionDate: '2024-03-05', score: 45, status: 'failed', department: '质量控制部 (QC)', company: '金辉制药', position: '化验员' },
  { id: '8', studentName: '陈皮皮', studentId: 'EMP-006', courseName: '物料分类标签规范', courseCode: 'SOP-LOG-05', completionDate: '2024-03-01', score: 98, status: 'passed', department: '物流部', company: '金辉制药', position: '仓管员' },
  { id: '9', studentName: '马冬梅', studentId: 'EMP-007', courseName: '实验室玻璃器皿清洗', courseCode: 'SOP-QC-010', completionDate: '2024-02-28', score: 72, status: 'passed', department: '质量控制部 (QC)', company: '金辉制药', position: '初级分析员' },
  { id: '10', studentName: '刘星', studentId: 'EMP-008', courseName: '偏差与 CAPA 管理准则', courseCode: 'POL-QA-01', completionDate: '2024-02-25', score: 32, status: 'failed', department: '质量保证部 (QA)', company: '金辉制药', position: 'QA 专员' },
  // Fix: Renamed 'code' to 'courseCode' on line 29 to correctly map to the TrainingRecord interface
  { id: '11', studentName: '夏洛', studentId: 'EMP-009', courseName: 'GMP 基础通识认证', courseCode: 'GEN-GMP-01', completionDate: '2024-02-20', score: 86, status: 'passed', department: '生产部', company: '金辉制药', position: '包装工' },
  { id: '12', studentName: '周树人', studentId: 'EMP-010', courseName: '21 CFR Part 11 解读', courseCode: 'QA-DI-105', completionDate: '2024-02-15', score: 91, status: 'passed', department: '研发中心', company: '金辉制药', position: '研究员' },
  { id: '13', studentName: '鲁迅', studentId: 'EMP-011', courseName: '实验室玻璃器皿清洗', courseCode: 'SOP-QC-010', completionDate: '2024-02-10', score: 88, status: 'passed', department: '质量控制部 (QC)', company: '金辉制药', position: '化验员' },
  { id: '14', studentName: '胡适', studentId: 'EMP-012', courseName: '洁净区行为规范', courseCode: 'SOP-PRO-022', completionDate: '2024-02-05', score: 65, status: 'failed', department: '物流部', company: '金辉制药', position: '主管' },
  // Fix: Renamed 'code' to 'courseCode' on line 33 to correctly map to the TrainingRecord interface
  { id: '15', studentName: '郁达夫', studentId: 'EMP-013', courseName: 'GMP 基础通识认证', courseCode: 'GEN-GMP-01', completionDate: '2024-02-01', score: 100, status: 'passed', department: '生产部', company: '金辉制药', position: '高级操作工' },
];

const HEATMAP_DEPT = ['质量保证 (QA)', '研发中心 (R&D)', '生产制造中心', '物流储运部', '系统管理部'];
const HEATMAP_CAT = ['GMP 法规', '无菌工艺', '数据完整性', 'SOP 规程', 'IT 系统安全'];
const HEATMAP_DATA = [
  [0, 2, 8, 12, 0],   // QA: SOP 规程较多逾期
  [14, 0, 24, 1, 8],  // R&D: 数据完整性是重灾区
  [0, 42, 4, 28, 0],  // 生产: 无菌工艺压力最大
  [0, 3, 1, 0, 5],    // 物流: 相对稳定
  [0, 0, 0, 5, 2]     // IT: 状态良好
];

const DataSummary: React.FC = () => {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const companies = useMemo(() => Array.from(new Set(MOCK_RECORDS.map(r => r.company))), []);
  const departments = useMemo(() => Array.from(new Set(MOCK_RECORDS.map(r => r.department))), []);
  const positions = useMemo(() => Array.from(new Set(MOCK_RECORDS.map(r => r.position))), []);
  const students = useMemo(() => Array.from(new Set(MOCK_RECORDS.map(r => r.studentName))), []);
  const courses = useMemo(() => Array.from(new Set(MOCK_RECORDS.map(r => r.courseName))), []);

  const filteredRecords = useMemo(() => {
    return MOCK_RECORDS.filter(record => {
      const companyMatch = selectedCompanies.length === 0 || selectedCompanies.includes(record.company);
      const departmentMatch = selectedDepartments.length === 0 || selectedDepartments.includes(record.department);
      const positionMatch = selectedPositions.length === 0 || selectedPositions.includes(record.position);
      const studentMatch = selectedStudents.length === 0 || selectedStudents.includes(record.studentName);
      const courseMatch = selectedCourses.length === 0 || selectedCourses.includes(record.courseName);
      const dateMatch = (!startDate || record.completionDate >= startDate) && (!endDate || record.completionDate <= endDate);
      return companyMatch && departmentMatch && positionMatch && studentMatch && courseMatch && dateMatch;
    });
  }, [selectedCompanies, selectedDepartments, selectedPositions, selectedStudents, selectedCourses, startDate, endDate]);

  const kpis = [
    { label: '季度合规达成度', value: '98.5%', trend: '+0.5%', color: 'text-[#135bec]', icon: 'gavel' },
    { label: 'SOP 培训覆盖率', value: '100%', trend: '持平', color: 'text-green-600', icon: 'verified' },
    { label: '拦截违规操作项', value: '08', trend: '-2', color: 'text-red-500', icon: 'report_problem' },
    { label: '外部审计就绪分', value: 'Ready', trend: 'A+', color: 'text-purple-600', icon: 'fact_check' },
  ];

  const getHeatColor = (val: number) => {
    if (val === 0) return 'bg-gray-50 text-gray-300';
    if (val < 10) return 'bg-blue-50 text-[#135bec]';
    if (val < 20) return 'bg-blue-200 text-[#135bec]';
    if (val < 30) return 'bg-blue-500 text-white';
    return 'bg-blue-800 text-white';
  };

  const toggleSelection = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-end gap-6 no-print">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-[#111318]">合规数据智能汇总</h1>
          <p className="text-[#616f89] text-sm font-black flex items-center gap-2 uppercase tracking-widest">
             <span className="size-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></span>
             实时同步状态：符合 21 CFR Part 11 受控环境 (2024-03-21)
          </p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => window.location.reload()} className="h-12 px-5 bg-white border border-gray-200 text-[#111318] rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
             <span className="material-symbols-outlined text-lg">refresh</span>
             刷新看板
           </button>
           <button onClick={handlePrint} className="h-12 px-8 bg-[#111318] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2">
             <span className="material-symbols-outlined text-xl font-bold">print</span>
             打印合规报告
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2.5rem] border border-[#dbdfe6] shadow-sm hover:shadow-2xl transition-all group cursor-default">
            <div className="flex justify-between items-start mb-8">
               <div className="size-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#135bec] group-hover:text-white transition-all shadow-inner">
                  <span className="material-symbols-outlined text-3xl">{kpi.icon}</span>
               </div>
               <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${idx === 2 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                 {kpi.trend}
               </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
            <p className={`text-4xl font-black tracking-tighter ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         <aside className="lg:col-span-3 space-y-6 no-print">
            <div className="bg-white rounded-[2.5rem] border border-[#dbdfe6] p-8 shadow-sm space-y-10">
               <div className="flex items-center justify-between border-b border-gray-50 pb-5">
                  <h3 className="text-xs font-black text-[#111318] uppercase tracking-[0.2em]">深度多维过滤</h3>
                  <button onClick={() => {
                    setSelectedCompanies([]); setSelectedDepartments([]); setSelectedPositions([]);
                    setSelectedStudents([]); setSelectedCourses([]); setStartDate(''); setEndDate('');
                  }} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline transition-all">Reset</button>
               </div>
               
               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">部门架构 (L2)</label>
                     <div className="max-h-52 overflow-y-auto space-y-1.5 custom-scrollbar pr-3">
                        {departments.map(d => (
                           <label key={d} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedDepartments.includes(d) ? 'bg-[#135bec]/5 border-[#135bec]/30' : 'hover:bg-gray-50 border-transparent'}`}>
                              <input type="checkbox" className="size-4 rounded border-gray-300 text-[#135bec] focus:ring-[#135bec]" checked={selectedDepartments.includes(d)} onChange={() => toggleSelection(selectedDepartments, setSelectedDepartments, d)} />
                              <span className={`text-xs font-black truncate ${selectedDepartments.includes(d) ? 'text-[#111318]' : 'text-gray-500'}`}>{d}</span>
                           </label>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">受控课程类别</label>
                     <div className="max-h-52 overflow-y-auto space-y-1.5 custom-scrollbar pr-3">
                        {courses.map(c => (
                           <label key={c} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedCourses.includes(c) ? 'bg-[#135bec]/5 border-[#135bec]/30' : 'hover:bg-gray-50 border-transparent'}`}>
                              <input type="checkbox" className="size-4 rounded border-gray-300 text-[#135bec] focus:ring-[#135bec]" checked={selectedCourses.includes(c)} onChange={() => toggleSelection(selectedCourses, setSelectedCourses, c)} />
                              <span className={`text-xs font-black truncate ${selectedCourses.includes(c) ? 'text-[#111318]' : 'text-gray-500'}`}>{c}</span>
                           </label>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">时间截点</label>
                     <div className="space-y-3">
                        <input type="date" className="w-full h-12 px-5 bg-gray-50 border-none rounded-2xl text-xs font-black focus:ring-2 focus:ring-[#135bec]" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <input type="date" className="w-full h-12 px-5 bg-gray-50 border-none rounded-2xl text-xs font-black focus:ring-2 focus:ring-[#135bec]" value={endDate} onChange={e => setEndDate(e.target.value)} />
                     </div>
                  </div>
               </div>
            </div>
         </aside>

         <div className="lg:col-span-9 space-y-8">
            <div className="bg-white rounded-[3rem] border border-[#dbdfe6] shadow-sm overflow-hidden no-print">
               <div className="px-12 py-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                  <div>
                    <h3 className="text-sm font-black text-[#111318] uppercase tracking-[0.2em]">合规风险分布矩阵 (逾期/偏差热力)</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest italic">基于 GAMP 5 系统一致性审计挖掘</p>
                  </div>
                  <div className="flex gap-4 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                     <span className="flex items-center gap-2"><span className="size-3 bg-gray-100 rounded-md"></span> 0</span>
                     <span className="flex items-center gap-2"><span className="size-3 bg-blue-200 rounded-md"></span> &lt;10</span>
                     <span className="flex items-center gap-2"><span className="size-3 bg-blue-800 rounded-md"></span> 30+</span>
                  </div>
               </div>
               <div className="p-12">
                  <div className="grid grid-cols-6 gap-4">
                     <div className="col-span-1"></div>
                     {HEATMAP_CAT.map(c => (
                        <div key={c} className="text-[10px] font-black text-gray-400 text-center uppercase tracking-widest mb-6">{c}</div>
                     ))}
                     
                     {HEATMAP_DEPT.map((dept, idx) => (
                        <React.Fragment key={idx}>
                           <div className="text-[11px] font-black text-gray-500 flex items-center pr-8 leading-tight h-16">{dept}</div>
                           {HEATMAP_DATA[idx].map((val, vIdx) => (
                              <div 
                                 key={vIdx} 
                                 className={`h-16 rounded-[1.5rem] flex items-center justify-center text-xs font-black transition-all hover:scale-105 cursor-pointer shadow-sm border border-transparent hover:border-[#135bec]/30 ${getHeatColor(val)}`}
                              >
                                 {val > 0 ? val : ''}
                              </div>
                           ))}
                        </React.Fragment>
                     ))}
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-[#dbdfe6] shadow-sm overflow-hidden">
               <div className="px-12 py-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                  <h3 className="text-sm font-black text-[#111318] uppercase tracking-[0.2em]">审计详情记录 (Audit Trace View)</h3>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white border border-gray-100 px-4 py-2 rounded-full">匹配结果: {filteredRecords.length} 项</span>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                           <th className="px-12 py-6">学员身份 / 组织归属</th>
                           <th className="px-10 py-6">受控课程 / 编码</th>
                           <th className="px-10 py-6">完成日期</th>
                           <th className="px-10 py-6">最终得分</th>
                           <th className="px-12 py-6 text-right">合规确认</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {filteredRecords.map((r) => (
                           <tr key={r.id} className="hover:bg-gray-50/80 transition-all group">
                              <td className="px-12 py-8">
                                 <p className="text-sm font-black text-[#111318]">{r.studentName}</p>
                                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1.5">{r.department} • {r.position}</p>
                              </td>
                              <td className="px-10 py-8">
                                 <p className="text-sm font-bold text-[#111318] group-hover:text-[#135bec] transition-colors">{r.courseName}</p>
                                 <p className="text-[10px] text-gray-400 font-mono tracking-[0.1em] mt-1.5">{r.courseCode || 'GEN-TR-001'}</p>
                              </td>
                              <td className="px-10 py-8 text-[11px] font-mono font-black text-gray-500">{r.completionDate}</td>
                              <td className="px-10 py-8">
                                 <span className={`text-sm font-black ${r.status === 'passed' ? 'text-green-600' : 'text-red-500'}`}>{r.score}</span>
                              </td>
                              <td className="px-12 py-8 text-right">
                                 <span className={`inline-flex items-center gap-2 text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm border ${
                                    r.status === 'passed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                 }`}>
                                    {r.status === 'passed' ? 'COMPLIANT' : 'NON-COMPLIANT'}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="p-12 bg-gray-50/50 border-t border-gray-100 text-[11px] text-gray-400 italic font-medium flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                  * 本报表数据已通过系统电子记录一致性校验，电子签名符合 FDA 21 CFR Part 11。任何修改均记录于审计日志中。
               </div>
            </div>
         </div>
      </div>

      <style>{`
        @media print {
          body { background-color: white !important; }
          .no-print { display: none !important; }
          main { padding: 0 !important; }
          .rounded-[3rem], .rounded-[2.5rem] { border-radius: 0 !important; border: 1px solid #eee !important; box-shadow: none !important; }
          header, aside, footer { display: none !important; }
          .lg\\:ml-64 { margin-left: 0 !important; }
          table { font-size: 9px; border-collapse: collapse; width: 100%; }
          .p-12 { padding: 20px !important; }
          .lg\\:col-span-9 { width: 100% !important; grid-column: span 12 / span 12 !important; }
        }
      `}</style>
    </div>
  );
};

export default DataSummary;
