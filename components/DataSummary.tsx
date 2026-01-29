
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
  { id: '1', studentName: 'Alex Johnson', studentId: 'EMP-001', courseName: '生产线灭菌规程', courseCode: 'SOP-PRO-001', completionDate: '2023-12-15', score: 95, status: 'passed', department: '生产部', company: '金辉制药', position: '灌装岗操作工' },
  { id: '2', studentName: 'Sarah Smith', studentId: 'EMP-002', courseName: 'HPLC 样品制备指南', courseCode: 'SOP-QC-005', completionDate: '2024-01-10', score: 88, status: 'passed', department: '质量控制部 (QC)', company: '金辉制药', position: '分析化验员' },
  { id: '3', studentName: 'Michael Brown', studentId: 'EMP-003', courseName: '数据完整性政策', courseCode: 'POL-QA-10', completionDate: '2024-02-05', score: 58, status: 'failed', department: '质量保证部 (QA)', company: '金辉制药', position: 'QA 专员' },
  { id: '4', studentName: 'Emily Davis', studentId: 'EMP-004', courseName: '生产线灭菌规程', courseCode: 'SOP-PRO-001', completionDate: '2024-02-12', score: 92, status: 'passed', department: '生产部', company: '金辉制药', position: '车间主任' },
  { id: '5', studentName: 'Alex Johnson', studentId: 'EMP-001', courseName: '数据完整性政策', courseCode: 'POL-QA-10', completionDate: '2024-02-18', score: 100, status: 'passed', department: '生产部', company: '金辉制药', position: '灌装岗操作工' },
  { id: '6', studentName: 'John Wilson', studentId: 'EMP-005', courseName: '冷链物流偏差处理', courseCode: 'SOP-LOG-22', completionDate: '2024-03-01', score: 85, status: 'passed', department: '物流部', company: '金辉制药', position: '仓库管理员' },
  { id: '7', studentName: 'Sarah Smith', studentId: 'EMP-002', courseName: '生产线灭菌规程', courseCode: 'SOP-PRO-001', completionDate: '2024-03-05', score: 45, status: 'failed', department: '质量控制部 (QC)', company: '金辉制药', position: '分析化验员' },
];

const DataSummary: React.FC = () => {
  // Filter States
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Extract unique values for filters
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

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    if (total === 0) return { total: 0, passRate: '0%', avgScore: 0, failCount: 0 };
    const passed = filteredRecords.filter(r => r.status === 'passed').length;
    const avgScore = filteredRecords.reduce((acc, r) => acc + r.score, 0) / total;
    return {
      total,
      passRate: ((passed / total) * 100).toFixed(1) + '%',
      avgScore: avgScore.toFixed(1),
      failCount: total - passed
    };
  }, [filteredRecords]);

  // Toggle Handlers
  const toggleSelection = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const resetFilters = () => {
    setSelectedCompanies([]);
    setSelectedDepartments([]);
    setSelectedPositions([]);
    setSelectedStudents([]);
    setSelectedCourses([]);
    setStartDate('');
    setEndDate('');
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-wrap justify-between items-end gap-4 no-print">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-[#111318]">合规数据汇总</h1>
          <p className="text-gray-500 text-sm font-medium">按公司层级、部门及岗位进行多维分析。所有记录均可追溯审计。</p>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 h-12 px-6 bg-[#135bec] text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-xl">print</span>
          导出/打印报告
        </button>
      </div>

      {/* Filters Area - Two Row Layout */}
      <div className="bg-white rounded-xl border border-[#dbdfe6] p-6 shadow-sm space-y-8 no-print">
        {/* Row 1: Org Structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">corporate_fare</span>
              按公司筛选
            </label>
            <div className="max-h-28 overflow-y-auto border border-gray-100 rounded-lg p-2 custom-scrollbar bg-gray-50/30">
              {companies.map(c => (
                <label key={c} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer transition-colors">
                  <input type="checkbox" className="rounded border-gray-300 text-[#135bec]" checked={selectedCompanies.includes(c)} onChange={() => toggleSelection(selectedCompanies, setSelectedCompanies, c)} />
                  <span className="text-[11px] font-bold text-gray-600">{c}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">account_tree</span>
              按部门筛选
            </label>
            <div className="max-h-28 overflow-y-auto border border-gray-100 rounded-lg p-2 custom-scrollbar bg-gray-50/30">
              {departments.map(d => (
                <label key={d} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer transition-colors">
                  <input type="checkbox" className="rounded border-gray-300 text-[#135bec]" checked={selectedDepartments.includes(d)} onChange={() => toggleSelection(selectedDepartments, setSelectedDepartments, d)} />
                  <span className="text-[11px] font-bold text-gray-600">{d}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">badge</span>
              按岗位筛选
            </label>
            <div className="max-h-28 overflow-y-auto border border-gray-100 rounded-lg p-2 custom-scrollbar bg-gray-50/30">
              {positions.map(p => (
                <label key={p} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer transition-colors">
                  <input type="checkbox" className="rounded border-gray-300 text-[#135bec]" checked={selectedPositions.includes(p)} onChange={() => toggleSelection(selectedPositions, setSelectedPositions, p)} />
                  <span className="text-[11px] font-bold text-gray-600">{p}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Business Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">person</span>
              按学员筛选
            </label>
            <div className="max-h-28 overflow-y-auto border border-gray-100 rounded-lg p-2 custom-scrollbar">
              {students.map(s => (
                <label key={s} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                  <input type="checkbox" className="rounded border-gray-300 text-[#135bec]" checked={selectedStudents.includes(s)} onChange={() => toggleSelection(selectedStudents, setSelectedStudents, s)} />
                  <span className="text-[11px] font-medium text-gray-600">{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">library_books</span>
              按课程筛选
            </label>
            <div className="max-h-28 overflow-y-auto border border-gray-100 rounded-lg p-2 custom-scrollbar">
              {courses.map(c => (
                <label key={c} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                  <input type="checkbox" className="rounded border-gray-300 text-[#135bec]" checked={selectedCourses.includes(c)} onChange={() => toggleSelection(selectedCourses, setSelectedCourses, c)} />
                  <span className="text-[11px] font-medium text-gray-600 truncate">{c}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">时间 (起)</label>
              <input type="date" className="w-full h-10 px-3 bg-gray-50 border-none rounded-lg text-[11px] focus:ring-1 focus:ring-[#135bec]" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">时间 (止)</label>
              <input type="date" className="w-full h-10 px-3 bg-gray-50 border-none rounded-lg text-[11px] focus:ring-1 focus:ring-[#135bec]" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
           <p className="text-[10px] text-gray-400 italic">* 未勾选任何项即默认为“全选”模式</p>
           <button onClick={resetFilters} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1">
             <span className="material-symbols-outlined text-xs">filter_alt_off</span>
             重置所有筛选器
           </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '总培训人次', value: stats.total, color: 'text-[#111318]', icon: 'analytics' },
          { label: '平均及格率', value: stats.passRate, color: 'text-green-600', icon: 'check_circle' },
          { label: '平均得分', value: stats.avgScore, color: 'text-[#135bec]', icon: 'speed' },
          { label: '未达标人数', value: stats.failCount, color: 'text-red-500', icon: 'error' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-[#dbdfe6] shadow-sm flex items-center gap-4">
            <div className="size-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
              <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f3f4f6] bg-gray-50/20 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#111318]">合规性详细数据</h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase">匹配结果: {filteredRecords.length} 项</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">学员信息 / 组织层级</th>
                <th className="px-6 py-4">岗位</th>
                <th className="px-6 py-4">课程代码 / 名称</th>
                <th className="px-6 py-4">考核日期</th>
                <th className="px-6 py-4">成绩</th>
                <th className="px-6 py-4 text-center">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.length > 0 ? filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#111318]">{r.studentName}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{r.company} > {r.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-600">{r.position}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#111318]">{r.courseName}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{r.courseCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{r.completionDate}</td>
                  <td className="px-6 py-4 text-sm font-black">{r.score}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded uppercase ${
                      r.status === 'passed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {r.status === 'passed' ? '合格' : '不合格'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic text-sm">未找到符合当前筛选条件的记录</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          body { background-color: white !important; }
          .no-print { display: none !important; }
          main { padding: 0 !important; }
          .rounded-xl { border-radius: 0 !important; }
          header, aside, footer { display: none !important; }
          .lg\\:ml-64 { margin-left: 0 !important; }
          table { font-size: 10px; }
          .p-8 { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default DataSummary;
