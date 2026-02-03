
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HierarchyNode, Course, Material, Question } from '../types';

interface Props {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  hierarchyData: Record<string, HierarchyNode[]>;
}

interface ImportFailedItem {
  index: number;
  content: string;
  reason: string;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  failedItems: ImportFailedItem[];
}

const CATEGORIES = ['GMP 基础', '生产 SOP', '质量控制 (QC)', 'QA 合规', 'EHS 安全', '物料管理'];

const CourseContainer: React.FC<Props> = ({ courses, setCourses, questions, setQuestions, hierarchyData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Course['status'] | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedViewCourse, setSelectedViewCourse] = useState<Course | null>(null);
  const [detailsTab, setDetailsTab] = useState<'MATERIALS' | 'QUESTIONS' | 'HIERARCHY'>('QUESTIONS');
  
  const [step, setStep] = useState(1);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [activeHierarchyDomain, setActiveHierarchyDomain] = useState<'COURSE' | 'ORGANIZATION' | 'STUDENT'>('COURSE');

  // 批量导入与操作状态
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'IDLE' | 'VALIDATING' | 'FINISHED'>('IDLE');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  // 考核设计器状态
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);

  // 预览播放器状态
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'INTRO' | 'LEARN' | 'EXAM'>('INTRO');
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);

  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    version: 'v1.0',
    category: CATEGORIES[0],
    status: 'active' as Course['status'],
    materials: [] as Material[],
    totalHours: 0,
    hierarchyIds: [] as string[]
  });

  const [materialForm, setMaterialForm] = useState<Omit<Material, 'id' | 'uploadDate'>>({
    name: '', type: 'pdf', url: '', status: 'active', expiryDate: '', hours: 1.0
  });

  // 文件上传相关状态
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const total = courseForm.materials.filter(m => m.status === 'active').reduce((sum, m) => sum + (Number(m.hours) || 0), 0);
    setCourseForm(prev => ({ ...prev, totalHours: total }));
  }, [courseForm.materials]);

  const toggleHierarchy = (id: string) => {
    setCourseForm(prev => ({
      ...prev,
      hierarchyIds: prev.hierarchyIds.includes(id) 
        ? prev.hierarchyIds.filter(hid => hid !== id) 
        : [...prev.hierarchyIds, id]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile(file);
      setIsScanning(true);
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            const ext = file.name.split('.').pop()?.toLowerCase();
            let type: Material['type'] = 'pdf';
            if (['mp4', 'mov', 'avi'].includes(ext || '')) type = 'video';
            else if (['ppt', 'pptx'].includes(ext || '')) type = 'ppt';
            else if (['doc', 'docx'].includes(ext || '')) type = 'doc';
            setMaterialForm(prevForm => ({ ...prevForm, name: file.name.replace(/\.[^/.]+$/, ""), type, url: URL.createObjectURL(file) }));
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "\uFEFFType,Content,Options (split by |),Answer (Index or Text),Score,Difficulty,Explanation\n" +
      "single,什么是 GMP 的核心原则?,防止污染|防止混淆|以上皆是,2,5,Medium,核心是最大限度降低药品生产过程中污染、交叉污染以及混淆、差错等风险。\n" +
      "multiple,以下属于 GxP 范畴的是?,GMP|GCP|GDP|ISO9001,0|1|2,5,High,ISO 不是 GxP 法规。\n" +
      "blank,无菌操作的核心是控制___。,微生物,5,High,\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "G_Train_Question_Template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportQuestions = (format: 'json' | 'csv' = 'json') => {
    if (!currentCourseQuestions || currentCourseQuestions.length === 0) {
      alert("当前题库为空，无法导出");
      return;
    }

    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentCourseQuestions, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", dataStr);
      link.setAttribute("download", `${selectedViewCourse?.code || 'course'}_questions.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      let csvContent = "\uFEFFType,Content,Options,Answer,Score,Difficulty,Explanation\n";
      currentCourseQuestions.forEach(q => {
        const options = (q.options || []).map(o => o.replace(/"/g, '""')).join('|');
        const answer = Array.isArray(q.answer) ? q.answer.join('|') : q.answer;
        const content = q.content.replace(/"/g, '""');
        const explanation = (q.explanation || '').replace(/"/g, '""');
        csvContent += `"${q.type}","${content}","${options}","${answer}","${q.score}","${q.difficulty}","${explanation}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedViewCourse?.code || 'course'}_questions.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      alert('格式错误：仅支持 CSV 或 Excel 文件。请先下载模版。');
      if (importInputRef.current) importInputRef.current.value = '';
      return;
    }

    setImportStatus('VALIDATING');
    
    // 模拟合规核验过程
    setTimeout(() => {
        const result: ImportResult = {
          total: 10,
          success: 7,
          failed: 3,
          failedItems: [
            { index: 4, content: '物料分类标签中红色代表...', reason: '缺少“标准答案”字段' },
            { index: 7, content: '以下哪项不属于高风险操作?', reason: '选项数量不符合多选题规范（至少需要4个）' },
            { index: 9, content: '___是洁净区行为的核心。', reason: '题目内容与现有课程 [SOP-QA-02] 高度重复 (95%)' }
          ]
        };

        // 模拟向 questions 列表添加成功项
        const newQuestions: Question[] = Array.from({ length: 7 }).map((_, i) => ({
          id: 'QST-IMP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          courseId: selectedViewCourse?.id || '',
          type: 'single',
          content: `批量导入题目 ${i + 1}`,
          options: ['选项 A', '选项 B', '选项 C', '选项 D'],
          answer: 0,
          score: 5,
          difficulty: 'Medium'
        }));
        
        setQuestions(prev => [...prev, ...newQuestions]);
        setImportResult(result);
        setImportStatus('FINISHED');
        if (importInputRef.current) importInputRef.current.value = '';
    }, 2000);
  };

  const openQuestionEditor = (question?: Question) => {
    if (question) {
      setEditingQuestion({ ...question });
    } else {
      setEditingQuestion({
        courseId: selectedViewCourse?.id || '',
        type: 'single',
        content: '',
        options: ['', '', '', ''],
        answer: 0,
        score: 5,
        difficulty: 'Medium',
        pairs: [{ left: '', right: '' }, { left: '', right: '' }],
        explanation: ''
      });
    }
    setIsQuestionEditorOpen(true);
  };

  const saveQuestion = () => {
    if (!editingQuestion || !selectedViewCourse) return;
    const q = editingQuestion as Question;
    if (q.id) {
      setQuestions(prev => prev.map(item => item.id === q.id ? q : item));
    } else {
      const newQ = { ...q, id: 'QST-' + Math.random().toString(36).substr(2, 6).toUpperCase() };
      setQuestions(prev => [...prev, newQ]);
    }
    setIsQuestionEditorOpen(false);
  };

  const deleteQuestion = (id: string) => {
    if (!window.confirm('确定删除该考题吗？此操作不可撤销。')) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleStartPreview = (course: Course) => {
    setSelectedViewCourse(course);
    setPreviewMode('INTRO');
    setCurrentPlayIndex(0);
    setIsPreviewOpen(true);
  };

  const currentCourseQuestions = useMemo(() => {
    return questions.filter(q => q.courseId === (selectedViewCourse?.id || ''));
  }, [questions, selectedViewCourse]);

  const questionStats = useMemo(() => {
    const totalPoints = currentCourseQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
    const difficulties = currentCourseQuestions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { totalPoints, difficulties };
  }, [currentCourseQuestions]);

  const renderHierarchySelector = (nodes: HierarchyNode[], level: number = 0) => nodes.map(node => (
    <div key={node.id} className="select-none">
      <div className="flex items-center gap-3 py-2 hover:bg-white rounded-xl transition-all group">
        <div style={{ width: `${level * 24}px` }} className="shrink-0 flex justify-end">
          {level > 0 && <span className="border-l-2 border-b-2 border-gray-200 w-3 h-2 -translate-y-1.5 rounded-bl-sm"></span>}
        </div>
        <label className="flex items-center gap-3 cursor-pointer flex-1">
          <input 
            type="checkbox" 
            checked={courseForm.hierarchyIds.includes(node.id)} 
            onChange={() => toggleHierarchy(node.id)} 
            className={`size-4 rounded border-gray-300 transition-all ${
                activeHierarchyDomain === 'COURSE' ? 'text-[#135bec]' :
                activeHierarchyDomain === 'ORGANIZATION' ? 'text-purple-600' : 'text-emerald-600'
            }`} 
          />
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black ${courseForm.hierarchyIds.includes(node.id) ? 'text-[#111318]' : 'text-gray-500'}`}>
              {node.name}
            </span>
            <span className="text-[9px] font-mono font-bold text-gray-300 uppercase tracking-tighter">
              [{node.code}]
            </span>
          </div>
        </label>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="ml-1">
          {renderHierarchySelector(node.children, level + 1)}
        </div>
      )}
    </div>
  ));

  const handleFinalPublish = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const finalCourse: Course = {
      ...courseForm,
      id: editingCourseId || 'CRS-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      questionCount: editingCourseId ? courses.find(c => c.id === editingCourseId)?.questionCount || 0 : 0,
      lastUpdated: timestamp,
    };
    if (editingCourseId) {
      setCourses(prev => prev.map(c => c.id === editingCourseId ? finalCourse : c));
    } else {
      setCourses(prev => [finalCourse, ...prev]);
    }
    setIsModalOpen(false);
  };

  const filteredCourses = courses.filter(c => 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'ALL' || c.status === statusFilter)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#111318] tracking-tight">合规课程目录</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">数据驱动关联：受控教材与【多维层级数据】的可视化映射。</p>
        </div>
        <button onClick={() => { setEditingCourseId(null); setCourseForm({ code: '', name: '', version: 'v1.0', category: CATEGORIES[0], status: 'active', materials: [], totalHours: 0, hierarchyIds: [] }); setStep(1); setIsModalOpen(true); }} className="bg-[#135bec] text-white px-8 py-3 rounded-xl font-black text-xs shadow-xl uppercase tracking-widest active:scale-95 transition-all">发布受控新课程</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#dbdfe6] p-8 shadow-sm space-y-8">
        <div className="flex gap-4">
           <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input type="text" placeholder="搜索课程或代码..." className="w-full h-12 pl-12 pr-6 bg-gray-50 border-none rounded-2xl text-sm font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
           <select className="h-12 px-6 bg-gray-50 border-none rounded-2xl text-xs font-black uppercase tracking-widest" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
             <option value="ALL">全部状态</option>
             <option value="active">生效中 (Active)</option>
             <option value="paused">已暂停 (Paused)</option>
           </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <div key={course.id} onClick={() => { setSelectedViewCourse(course); setDetailsTab('QUESTIONS'); setIsDetailsModalOpen(true); }} className="bg-white rounded-[2rem] border border-[#dbdfe6] p-7 hover:shadow-2xl transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between">
               <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-black text-gray-400 tracking-wider bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{course.code}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase ${course.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{course.status}</span>
                  </div>
                  <h3 className="text-lg font-black text-[#111318] line-clamp-2 min-h-[3rem] group-hover:text-[#135bec] transition-colors">{course.name}</h3>
               </div>
               
               <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">总学时</span>
                    <span className="text-xl font-black text-[#135bec]">{course.totalHours.toFixed(1)} <span className="text-[10px]">H</span></span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleStartPreview(course); }} className="size-10 bg-white border border-gray-200 text-[#135bec] rounded-xl flex items-center justify-center hover:bg-blue-50 transition-all active:scale-90" title="预览课程">
                       <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingCourseId(course.id); setCourseForm({...course}); setStep(1); setIsModalOpen(true); }} className="size-10 bg-[#111318] text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all active:scale-90 shadow-lg shadow-black/10"><span className="material-symbols-outlined text-lg">edit</span></button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* 课程详情视图 (含考核设计器) */}
      {isDetailsModalOpen && selectedViewCourse && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#111318]/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-6xl rounded-[3.5rem] shadow-2xl overflow-hidden flex h-[85vh] animate-in zoom-in-95">
              <aside className="w-80 bg-gray-50 border-r border-gray-100 flex flex-col shrink-0 overflow-hidden">
                 <div className="p-12 space-y-8">
                    <div className="size-20 rounded-[2rem] bg-[#135bec] text-white flex items-center justify-center shadow-xl shadow-blue-500/30">
                       <span className="material-symbols-outlined text-4xl tracking-tighter">inventory_2</span>
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-[#111318] leading-tight">{selectedViewCourse.name}</h3>
                       <p className="text-[11px] font-mono text-gray-400 uppercase mt-2 tracking-widest">{selectedViewCourse.code} • {selectedViewCourse.version}</p>
                    </div>
                    <nav className="space-y-2 pt-8">
                       {[
                         { id: 'MATERIALS', label: '受控培训教材', icon: 'auto_stories' },
                         { id: 'QUESTIONS', label: '合规题库设计', icon: 'quiz' },
                         { id: 'HIERARCHY', label: '映射合规树', icon: 'account_tree' }
                       ].map(tab => (
                         <button 
                            key={tab.id}
                            onClick={() => { setDetailsTab(tab.id as any); }}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${detailsTab === tab.id ? 'bg-[#111318] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-100'}`}
                         >
                            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                            {tab.label}
                         </button>
                       ))}
                    </nav>
                 </div>
                 <div className="mt-auto p-12 bg-gray-100/50">
                    <button onClick={() => setIsDetailsModalOpen(false)} className="w-full h-14 bg-white text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm hover:text-red-500 transition-colors">关闭详情视图</button>
                 </div>
              </aside>

              <main className="flex-1 flex flex-col bg-white overflow-hidden">
                 <header className="px-12 py-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h4 className="text-sm font-black text-[#111318] uppercase tracking-[0.2em]">
                       {detailsTab === 'MATERIALS' ? '教材清单明细' : detailsTab === 'QUESTIONS' ? '考核设计器 (Assessment Designer)' : '多维合规映射'}
                    </h4>
                    
                    <div className="flex gap-4">
                       {detailsTab === 'QUESTIONS' ? (
                         <div className="flex items-center gap-3">
                            <input type="file" ref={importInputRef} className="hidden" accept=".csv, .xls, .xlsx" onChange={handleBulkImport} />
                            
                            <button onClick={handleDownloadTemplate} className="h-10 px-4 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2" title="下载标准试卷模版">
                               <span className="material-symbols-outlined text-lg">download</span>
                               <span className="hidden xl:inline">下载模版</span>
                            </button>
                            
                            <button onClick={() => importInputRef.current?.click()} className={`h-10 px-4 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 ${importStatus === 'VALIDATING' ? 'opacity-50 cursor-wait' : ''}`} title="上传 Excel/CSV 试卷文件">
                               <span className="material-symbols-outlined text-lg animate-pulse">{importStatus === 'VALIDATING' ? 'hourglass_empty' : 'upload_file'}</span>
                               <span className="hidden xl:inline">{importStatus === 'VALIDATING' ? '核验中...' : '导入试卷'}</span>
                            </button>

                            <div className="relative group">
                              <button className="h-10 px-4 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2" title="导出当前题库">
                                <span className="material-symbols-outlined text-lg">ios_share</span>
                                <span className="hidden xl:inline">导出题库</span>
                              </button>
                              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                                <button onClick={() => handleExportQuestions('json')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 transition-colors">导出为 JSON</button>
                                <button onClick={() => handleExportQuestions('csv')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 transition-colors">导出为 CSV</button>
                              </div>
                            </div>

                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                            <button onClick={() => openQuestionEditor()} className="h-10 px-6 bg-[#135bec] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                               <span className="material-symbols-outlined text-lg">add</span>
                               新增试题
                            </button>
                         </div>
                       ) : (
                          <button onClick={() => handleStartPreview(selectedViewCourse)} className="h-10 px-6 bg-gray-100 text-[#111318] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            学员视角预览
                          </button>
                       )}
                    </div>
                 </header>

                 <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {detailsTab === 'QUESTIONS' && (
                       <div className="space-y-10">
                          <div className="grid grid-cols-4 gap-4">
                             <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">总题目数</p>
                                <p className="text-2xl font-black text-[#111318] mt-1">{currentCourseQuestions.length}</p>
                             </div>
                             <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">题库总分</p>
                                <p className="text-2xl font-black text-[#135bec] mt-1">{questionStats.totalPoints} <span className="text-xs">Pts</span></p>
                             </div>
                             <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 col-span-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">难度分布</p>
                                <div className="flex items-center gap-4 mt-2">
                                   {['Low', 'Medium', 'High'].map(d => (
                                      <div key={d} className="flex items-center gap-2">
                                         <span className={`size-2 rounded-full ${d === 'High' ? 'bg-red-500' : d === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                         <span className="text-[10px] font-bold text-gray-600">{d}: {questionStats.difficulties[d] || 0}</span>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                             {currentCourseQuestions.length > 0 ? currentCourseQuestions.map((q, idx) => (
                                <div key={q.id} className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col gap-5">
                                   <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-3">
                                         <span className="size-8 rounded-full bg-[#135bec] text-white flex items-center justify-center text-[10px] font-black">
                                            {idx + 1}
                                         </span>
                                         <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${
                                            q.type === 'single' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            q.type === 'multiple' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                            q.type === 'blank' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                         }`}>
                                            {q.type === 'single' ? '单选题' : q.type === 'multiple' ? '多选题' : q.type === 'blank' ? '填空题' : '匹配题'}
                                         </span>
                                      </div>
                                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                         <button onClick={() => openQuestionEditor(q)} className="size-10 rounded-xl bg-gray-50 text-gray-400 hover:text-[#135bec] hover:bg-blue-50 transition-all flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                         </button>
                                         <button onClick={() => deleteQuestion(q.id)} className="size-10 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                         </button>
                                      </div>
                                   </div>
                                   <p className="text-sm font-bold text-[#111318] leading-relaxed">{q.content}</p>
                                </div>
                             )) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                                  <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                    <span className="material-symbols-outlined text-4xl">quiz</span>
                                  </div>
                                  <h4 className="text-gray-400 font-black text-sm uppercase tracking-widest">暂无考核题目</h4>
                                </div>
                             )}
                          </div>
                       </div>
                    )}
                    {/* ... other detailsTab cases ... */}
                 </div>
              </main>
           </div>
        </div>
      )}

      {/* 导入结果核验报告弹窗 */}
      {importStatus === 'FINISHED' && importResult && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-[#111318]/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95">
              <header className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-[#135bec] text-white flex items-center justify-center">
                       <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-[#111318]">合规性导入报告</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">扫描完成 • 21 CFR Part 11 数据完整性核验</p>
                    </div>
                 </div>
                 <button onClick={() => setImportStatus('IDLE')} className="size-10 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                 {/* Summary Cards */}
                 <div className="grid grid-cols-3 gap-6">
                    <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 text-center">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">文件总题数</p>
                       <p className="text-4xl font-black text-[#111318]">{importResult.total}</p>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-green-50 border border-green-100 text-center">
                       <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">通过核验并导入</p>
                       <p className="text-4xl font-black text-green-600">{importResult.success}</p>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-red-50 border border-red-100 text-center relative overflow-hidden">
                       <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">拦截项 (异常)</p>
                       <p className="text-4xl font-black text-red-600">{importResult.failed}</p>
                    </div>
                 </div>

                 {/* Failed Items List */}
                 {importResult.failedItems.length > 0 && (
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <span className="material-symbols-outlined text-red-500">warning</span>
                         <h4 className="text-sm font-black text-[#111318] uppercase tracking-widest">核验不通过明细</h4>
                      </div>
                      <div className="space-y-4">
                         {importResult.failedItems.map((item, idx) => (
                           <div key={idx} className="p-6 bg-red-50/30 rounded-2xl border border-red-100 flex items-start gap-6 animate-in slide-in-from-left-4" style={{ animationDelay: `${idx * 100}ms` }}>
                              <div className="size-10 rounded-xl bg-white text-red-600 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                                 #{item.index}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-black text-[#111318] truncate mb-1">“{item.content}”</p>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">核验异常:</span>
                                    <span className="text-[11px] font-medium text-red-800">{item.reason}</span>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}

                 <div className="p-6 bg-blue-50 rounded-2xl flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#135bec] text-xl">security</span>
                    <p className="text-[10px] text-[#135bec] font-bold leading-relaxed">
                       <b>数据完整性说明：</b> 系统已根据《合规导入规范》对文件进行了深度扫描。所有已导入的考题均已加盖时间戳并归入受控库。请对上述异常项进行修正后重新导入。
                    </p>
                 </div>
              </div>

              <footer className="px-10 py-8 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end">
                 <button 
                    onClick={() => setImportStatus('IDLE')}
                    className="px-12 h-12 bg-[#111318] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all"
                 >
                    确认并关闭报告
                 </button>
              </footer>
           </div>
        </div>
      )}

      {/* 题目编辑器及文件上传等其他模态框保持不变... */}
      {isQuestionEditorOpen && editingQuestion && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-[#111318]/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl overflow-hidden flex h-[85vh] animate-in zoom-in-95">
              <aside className="w-80 bg-gray-50 border-r border-gray-100 p-12 flex flex-col shrink-0">
                 <h5 className="text-[10px] font-black text-[#135bec] uppercase tracking-widest mb-10">考核题型设计</h5>
                 <div className="space-y-3">
                    {[
                       { id: 'single', label: '单选题', icon: 'radio_button_checked' },
                       { id: 'multiple', label: '多选题', icon: 'check_box' },
                       { id: 'blank', label: '填空题', icon: 'edit_note' },
                       { id: 'matching', label: '匹配题', icon: 'compare_arrows' }
                    ].map(type => (
                       <button 
                          key={type.id}
                          onClick={() => setEditingQuestion({ ...editingQuestion, type: type.id as any, answer: type.id === 'multiple' ? [] : type.id === 'matching' ? null : 0 })}
                          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${editingQuestion.type === type.id ? 'bg-[#111318] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-100'}`}
                       >
                          <span className="material-symbols-outlined text-xl">{type.icon}</span>
                          {type.label}
                       </button>
                    ))}
                 </div>
                 
                 <div className="mt-auto space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">分值设定</label>
                       <input 
                          type="number" 
                          className="w-full h-12 px-5 bg-white border border-gray-200 rounded-xl text-sm font-black text-[#135bec]"
                          value={editingQuestion.score}
                          onChange={e => setEditingQuestion({ ...editingQuestion, score: parseInt(e.target.value) })}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">难度等级</label>
                       <select 
                          className="w-full h-12 px-5 bg-white border border-gray-200 rounded-xl text-sm font-black"
                          value={editingQuestion.difficulty}
                          onChange={e => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                       >
                          <option value="Low">简单 (Low)</option>
                          <option value="Medium">中等 (Medium)</option>
                          <option value="High">困难 (High)</option>
                       </select>
                    </div>
                 </div>
              </aside>

              <main className="flex-1 flex flex-col overflow-hidden bg-white">
                 <header className="px-12 py-10 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h4 className="text-xl font-black text-[#111318]">设计考题内容</h4>
                    <button onClick={() => setIsQuestionEditorOpen(false)} className="size-10 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center">
                       <span className="material-symbols-outlined">close</span>
                    </button>
                 </header>

                 <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-10">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">题干内容</label>
                       <textarea 
                          className="w-full h-32 px-6 py-4 bg-gray-50 border-none rounded-[2rem] text-sm font-bold focus:ring-2 focus:ring-[#135bec] custom-scrollbar shadow-inner"
                          placeholder="请输入题目内容，例如：根据 GMP 规范，以下关于灭菌操作的描述正确的是..."
                          value={editingQuestion.content}
                          onChange={e => setEditingQuestion({ ...editingQuestion, content: e.target.value })}
                       />
                    </div>

                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">考核参数配置</label>
                          {(editingQuestion.type === 'single' || editingQuestion.type === 'multiple') && (
                             <button onClick={() => setEditingQuestion({ ...editingQuestion, options: [...(editingQuestion.options || []), ''] })} className="text-[10px] font-black text-[#135bec] uppercase tracking-widest underline">+ 增加选项</button>
                          )}
                          {editingQuestion.type === 'matching' && (
                             <button onClick={() => setEditingQuestion({ ...editingQuestion, pairs: [...(editingQuestion.pairs || []), { left: '', right: '' }] })} className="text-[10px] font-black text-[#135bec] uppercase tracking-widest underline">+ 增加配对</button>
                          )}
                       </div>

                       <div className="space-y-3">
                          {(editingQuestion.type === 'single' || editingQuestion.type === 'multiple') && editingQuestion.options?.map((opt, idx) => (
                             <div key={idx} className="flex items-center gap-4 animate-in slide-in-from-left-4">
                                <div 
                                   onClick={() => {
                                      if (editingQuestion.type === 'single') setEditingQuestion({ ...editingQuestion, answer: idx });
                                      else {
                                         const answers = Array.isArray(editingQuestion.answer) ? [...editingQuestion.answer] : [];
                                         const newAnswers = answers.includes(idx) ? answers.filter(a => a !== idx) : [...answers, idx];
                                         setEditingQuestion({ ...editingQuestion, answer: newAnswers });
                                      }
                                   }}
                                   className={`size-12 rounded-2xl flex items-center justify-center cursor-pointer border-2 transition-all ${
                                      (editingQuestion.type === 'single' ? editingQuestion.answer === idx : Array.isArray(editingQuestion.answer) && editingQuestion.answer.includes(idx))
                                         ? 'bg-[#135bec] border-[#135bec] text-white shadow-lg'
                                         : 'bg-white border-gray-100 text-gray-300'
                                   }`}
                                >
                                   <span className="text-xs font-black">{String.fromCharCode(65 + idx)}</span>
                                </div>
                                <input 
                                   type="text"
                                   className="flex-1 h-12 px-5 bg-gray-50 border-none rounded-xl text-sm font-bold"
                                   value={opt}
                                   onChange={e => {
                                      const newOpts = [...(editingQuestion.options || [])];
                                      newOpts[idx] = e.target.value;
                                      setEditingQuestion({ ...editingQuestion, options: newOpts });
                                   }}
                                   placeholder={`选项 ${String.fromCharCode(65 + idx)} 内容...`}
                                />
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <footer className="px-12 py-10 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0">
                    <button onClick={() => setIsQuestionEditorOpen(false)} className="px-8 h-12 text-sm font-bold text-gray-500">取消编辑</button>
                    <button onClick={saveQuestion} disabled={!editingQuestion.content} className="px-14 h-12 bg-[#135bec] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-30">保存至考题库</button>
                 </footer>
              </main>
           </div>
        </div>
      )}
    </div>
  );
};

export default CourseContainer;
