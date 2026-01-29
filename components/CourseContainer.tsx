
import React, { useState, useRef, useMemo } from 'react';

interface LearningPath {
  id: string;
  name: string;
  color: string;
}

const LEARNING_PATHS: LearningPath[] = [
  { id: 'lp1', name: '新员工 GMP 入职', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { id: 'lp2', name: 'QA 核心技能进阶', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { id: 'lp3', name: '生产现场无菌操作', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { id: 'lp4', name: '21 CFR Part 11 合规专向', color: 'bg-amber-50 text-amber-700 border-amber-100' },
];

const ORG_COMPANIES = [
  { id: 'C1', name: '金辉制药 (总仓)' },
  { id: 'C2', name: '金辉研发中心 (上海)' },
  { id: 'C3', name: '金辉生物制剂工厂' },
];

const ORG_DEPARTMENTS = [
  { id: 'D1', name: '质量保证部 (QA)' },
  { id: 'D2', name: '质量控制部 (QC)' },
  { id: 'D3', name: '生产部' },
  { id: 'D4', name: '物流/供应链' },
];

const ORG_POSITIONS = [
  { id: 'P1', name: '经理/主管' },
  { id: 'P2', name: 'QA/QC 专员' },
  { id: 'P3', name: '验证工程师' },
  { id: 'P4', name: '生产操作岗' },
];

interface Course {
  id: string;
  code: string;
  name: string;
  version: string;
  category: string;
  status: 'active' | 'paused' | 'draft';
  lastUpdated: string;
  questionCount: number;
  learningPathIds: string[];
  targetCompanyIds: string[];
  targetDepartmentIds: string[];
  targetPositionIds: string[];
}

interface MatchingPair {
  left: string;
  right: string;
}

interface Question {
  id: string;
  type: 'single' | 'multiple' | 'boolean' | 'cloze' | 'matching';
  text: string;
  options: string[];
  correctAnswers: number[];
  clozeAnswers: string[];
  matchingPairs: MatchingPair[];
  courseId: string;
}

const CourseContainer: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', code: 'SOP-PRO-001', name: '生产线灭菌规程', version: 'v2.0', category: 'GMP 生产', status: 'active', lastUpdated: '2023-10-12', questionCount: 2, learningPathIds: ['lp1', 'lp3'], targetCompanyIds: ['C1', 'C3'], targetDepartmentIds: ['D3'], targetPositionIds: ['P4'] },
    { id: '2', code: 'SOP-QC-005', name: 'HPLC 样品制备指南', version: 'v1.1', category: '质量控制', status: 'paused', lastUpdated: '2023-11-05', questionCount: 0, learningPathIds: ['lp2'], targetCompanyIds: ['C1'], targetDepartmentIds: ['D2'], targetPositionIds: ['P2'] },
    { id: '3', code: 'POL-QA-10', name: '数据完整性政策', version: 'v4.0', category: '合规/政策', status: 'active', lastUpdated: '2024-01-20', questionCount: 1, learningPathIds: ['lp1', 'lp4'], targetCompanyIds: ['C1', 'C2', 'C3'], targetDepartmentIds: ['D1', 'D2'], targetPositionIds: ['P1', 'P2', 'P3'] },
  ]);

  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', courseId: '1', type: 'single', text: '在洁净区 B 级环境下，人员更衣的正确顺序应该是？', options: ['先穿连体服再戴手套', '先消毒再穿连体服', '选项 C', '选项 D'], correctAnswers: [1], clozeAnswers: [], matchingPairs: [] },
    { id: 'q2', courseId: '1', type: 'cloze', text: 'GMP 要求生产设备应当建立[[blank]]，记录内容包括使用、[[blank]]、维护和维修情况。', options: [], correctAnswers: [], clozeAnswers: ['使用日志', '清洁'], matchingPairs: [] },
    { id: 'q3', courseId: '3', type: 'matching', text: '请将下列数据完整性原则与对应的描述匹配：', options: [], correctAnswers: [], clozeAnswers: [], matchingPairs: [
      { left: 'ALCOA+', right: '数据完整性核心原则' },
      { left: '21 CFR Part 11', right: '电子记录与签名' }
    ]},
  ]);

  const [viewMode, setViewMode] = useState<'list' | 'assessment'>('list');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Modals & UX States
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [importingQuestions, setImportingQuestions] = useState<Omit<Question, 'id' | 'courseId'>[]>([]);

  const [courseFormData, setCourseFormData] = useState({ 
    code: '', 
    name: '', 
    version: 'v1.0', 
    category: 'GMP 生产', 
    status: 'draft' as Course['status'],
    learningPathIds: [] as string[],
    targetCompanyIds: [] as string[],
    targetDepartmentIds: [] as string[],
    targetPositionIds: [] as string[]
  });
  
  const initialQuestionState: Omit<Question, 'id' | 'courseId'> = {
    type: 'single',
    text: '',
    options: ['', '', '', ''],
    correctAnswers: [0],
    clozeAnswers: [''],
    matchingPairs: [{ left: '', right: '' }]
  };
  const [questionFormData, setQuestionFormData] = useState(initialQuestionState);

  const [auditTrail, setAuditTrail] = useState([
    { time: '2024-02-16 • 10:00:00 UTC', title: '课程状态变更', desc: 'SOP-QC-005 已由管理员设为“暂停”', actor: 'Admin (System)', icon: 'pause_circle' },
    { time: '2024-01-20 • 15:30:00 UTC', title: '版本升级发布', desc: 'POL-QA-10 已升级至 v4.0 并发布。', actor: 'Sarah J. (QA)', icon: 'upgrade' },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addAuditLog = (title: string, desc: string, icon: string) => {
    const newLog = {
      time: `${new Date().toISOString().split('T')[0]} • ${new Date().toLocaleTimeString()} UTC`,
      title,
      desc,
      actor: 'Alex J. (Admin)',
      icon
    };
    setAuditTrail(prev => [newLog, ...prev]);
  };

  const handleOpenAssessment = (course: Course) => {
    setSelectedCourse(course);
    setViewMode('assessment');
    setSelectedQuestionIds(new Set());
    setSearchQuery('');
    addAuditLog('进入题库管理', `管理员 Alex J. 开始维护课程 ${course.code} 的考核题库。`, 'quiz');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCourse(null);
  };

  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseFormData({
        code: course.code,
        name: course.name,
        version: course.version,
        category: course.category,
        status: course.status,
        learningPathIds: [...course.learningPathIds],
        targetCompanyIds: [...(course.targetCompanyIds || [])],
        targetDepartmentIds: [...(course.targetDepartmentIds || [])],
        targetPositionIds: [...(course.targetPositionIds || [])]
      });
    } else {
      setEditingCourse(null);
      setCourseFormData({ 
        code: '', 
        name: '', 
        version: 'v1.0', 
        category: 'GMP 生产', 
        status: 'draft', 
        learningPathIds: [], 
        targetCompanyIds: [], 
        targetDepartmentIds: [], 
        targetPositionIds: [] 
      });
    }
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...courseFormData } : c));
      addAuditLog('课程更新', `更新了课程 ${courseFormData.code} 的基本信息及其组织靶向设置。`, 'edit');
    } else {
      const newCourse: Course = {
        id: Math.random().toString(36).substr(2, 9),
        ...courseFormData,
        lastUpdated: new Date().toISOString().split('T')[0],
        questionCount: 0
      };
      setCourses(prev => [...prev, newCourse]);
      addAuditLog('创建课程', `创建了新课程 ${newCourse.code} 并指定了组织架构归属。`, 'add_business');
    }
    setIsCourseModalOpen(false);
  };

  const toggleSelection = (key: keyof typeof courseFormData, id: string) => {
    setCourseFormData(prev => {
      const currentList = prev[key] as string[];
      const isSelected = currentList.includes(id);
      return {
        ...prev,
        [key]: isSelected 
          ? currentList.filter(item => item !== id) 
          : [...currentList, id]
      };
    });
  };

  const handleOpenQuestionModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionFormData({ 
        type: question.type, 
        text: question.text, 
        options: [...question.options], 
        correctAnswers: [...question.correctAnswers],
        clozeAnswers: [...(question.clozeAnswers || [])],
        matchingPairs: [...(question.matchingPairs || [])]
      });
    } else {
      setEditingQuestion(null);
      setQuestionFormData(initialQuestionState);
    }
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    if (editingQuestion) {
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...q, ...questionFormData } : q));
      addAuditLog('题目修订', `修改了课程 ${selectedCourse.code} 的一道 [${questionFormData.type}] 题目。`, 'edit_note');
    } else {
      const newQuestion: Question = {
        id: Math.random().toString(36).substr(2, 9),
        courseId: selectedCourse.id,
        ...questionFormData
      };
      setQuestions(prev => [...prev, newQuestion]);
      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, questionCount: c.questionCount + 1 } : c));
      setSelectedCourse(prev => prev ? { ...prev, questionCount: prev.questionCount + 1 } : null);
      addAuditLog('新增题目', `在课程 ${selectedCourse.code} 中添加了一道 [${questionFormData.type}] 类型的新题目。`, 'add_circle');
    }
    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedCourse) return;
    if (!window.confirm('确定要删除这道题目吗？该操作符合审计追踪要求将被记录。')) return;

    setQuestions(prev => prev.filter(q => q.id !== questionId));
    setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, questionCount: Math.max(0, c.questionCount - 1) } : c));
    setSelectedCourse(prev => prev ? { ...prev, questionCount: prev.questionCount - 1 } : null);
    addAuditLog('删除题目', `在课程 ${selectedCourse.code} 中移除了一道题目。`, 'delete_forever');
  };

  const handleBatchDelete = () => {
    if (!selectedCourse || selectedQuestionIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedQuestionIds.size} 道题目吗？`)) return;

    const count = selectedQuestionIds.size;
    setQuestions(prev => prev.filter(q => !selectedQuestionIds.has(q.id)));
    setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, questionCount: Math.max(0, c.questionCount - count) } : c));
    setSelectedCourse(prev => prev ? { ...prev, questionCount: Math.max(0, prev.questionCount - count) } : null);
    addAuditLog('批量删除题目', `在课程 ${selectedCourse.code} 中批量删除了 ${count} 道题目。`, 'delete_sweep');
    setSelectedQuestionIds(new Set());
  };

  const toggleSelectQuestion = (id: string) => {
    const next = new Set(selectedQuestionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedQuestionIds(next);
  };

  const toggleSelectAll = (currentBatchIds: string[]) => {
    if (selectedQuestionIds.size === currentBatchIds.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(currentBatchIds));
    }
  };

  // --- CSV Import Logic ---
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => parseCSV(event.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n');
    const parsedQuestions: Omit<Question, 'id' | 'courseId'>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 2) continue;
      const [type, text, c1, c2, correct] = parts;
      parsedQuestions.push({
        type: (type.toLowerCase() as any) || 'single',
        text: text || '',
        options: c1 ? c1.split('|') : [],
        correctAnswers: correct ? correct.split('|').map(v => parseInt(v)) : [0],
        clozeAnswers: c1 && type === 'cloze' ? c1.split('|') : [],
        matchingPairs: type === 'matching' && c1 && c2 ? c1.split('|').map((l, idx) => ({ left: l, right: c2.split('|')[idx] || '' })) : []
      });
    }
    if (parsedQuestions.length > 0) {
      setImportingQuestions(parsedQuestions);
      setIsImportPreviewOpen(true);
    }
  };

  const confirmImport = () => {
    if (!selectedCourse) return;
    const newBatch = importingQuestions.map(q => ({ ...q, id: Math.random().toString(36).substr(2, 9), courseId: selectedCourse.id }));
    setQuestions(prev => [...prev, ...newBatch]);
    setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, questionCount: c.questionCount + newBatch.length } : c));
    setSelectedCourse(prev => prev ? { ...prev, questionCount: prev.questionCount + newBatch.length } : null);
    addAuditLog('批量导入题目', `成功为课程 ${selectedCourse.code} 批量导入了 ${newBatch.length} 道题目。`, 'upload_file');
    setIsImportPreviewOpen(false);
  };

  const toggleCorrectAnswer = (idx: number) => {
    setQuestionFormData(prev => {
      if (prev.type === 'single' || prev.type === 'boolean') return { ...prev, correctAnswers: [idx] };
      const isSelected = prev.correctAnswers.includes(idx);
      return { ...prev, correctAnswers: isSelected ? prev.correctAnswers.filter(i => i !== idx) : [...prev.correctAnswers, idx] };
    });
  };

  const filteredQuestions = useMemo(() => {
    let result = questions.filter(q => q.courseId === selectedCourse?.id);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.text.toLowerCase().includes(q) || item.type.toLowerCase().includes(q));
    }
    if (sortOrder === 'newest') result.reverse();
    return result;
  }, [questions, selectedCourse, searchQuery, sortOrder]);

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'single': return 'radio_button_checked';
      case 'multiple': return 'check_box';
      case 'boolean': return 'thumbs_up_down';
      case 'cloze': return 'edit_square';
      case 'matching': return 'drag_handle';
      default: return 'quiz';
    }
  };

  const renderAssessmentDesigner = () => {
    if (!selectedCourse) return null;
    const currentBatchIds = filteredQuestions.map(q => q.id);
    
    return (
      <div className="flex flex-col h-[calc(100vh-220px)] animate-in slide-in-from-right duration-500">
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={handleBackToList} className="size-10 rounded-full bg-white border border-[#dbdfe6] flex items-center justify-center text-gray-400 hover:text-[#135bec] transition-all shadow-sm">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                <span>课程列表</span>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-[#135bec]">考核设计: {selectedCourse.code}</span>
              </div>
              <h2 className="text-2xl font-black text-[#111318]">{selectedCourse.name}</h2>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={handleImportClick} className="flex items-center gap-2 h-10 px-4 bg-white border border-[#dbdfe6] text-xs font-bold rounded-lg hover:border-[#135bec] transition-all group shadow-sm">
               <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-[#135bec]">upload_file</span>
               批量导入 (CSV)
             </button>
             <button onClick={() => handleOpenQuestionModal()} className="flex items-center gap-2 h-10 px-4 bg-[#135bec] text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all">
               <span className="material-symbols-outlined text-sm">add</span>
               新增题目
             </button>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 bg-white border border-[#dbdfe6] rounded-xl flex flex-col overflow-hidden shadow-sm">
             <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                    <input 
                      type="text" 
                      placeholder="搜索题目内容或类型..." 
                      className="h-9 pl-9 pr-4 bg-white border border-gray-200 rounded-lg text-xs font-medium w-64 focus:ring-1 focus:ring-[#135bec] transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-[#135bec]"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                  >
                    <option value="newest">最新优先</option>
                    <option value="oldest">最早优先</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#135bec] focus:ring-[#135bec]"
                      checked={selectedQuestionIds.size === currentBatchIds.length && currentBatchIds.length > 0}
                      onChange={() => toggleSelectAll(currentBatchIds)}
                    />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">全选</span>
                  </label>
                  
                  {selectedQuestionIds.size > 0 && (
                    <button 
                      onClick={handleBatchDelete}
                      className="flex items-center gap-1.5 px-3 h-8 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all animate-in zoom-in-95 duration-200"
                    >
                      <span className="material-symbols-outlined text-sm">delete_sweep</span>
                      批量删除 ({selectedQuestionIds.size})
                    </button>
                  )}
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/10">
                {filteredQuestions.length > 0 ? filteredQuestions.map((q, idx) => (
                    <div 
                      key={q.id} 
                      className={`bg-white border rounded-lg p-5 transition-all relative group ${
                        selectedQuestionIds.has(q.id) ? 'border-[#135bec] shadow-md ring-1 ring-[#135bec]/10' : 'border-gray-100 hover:shadow-md'
                      }`}
                    >
                      <div className="absolute top-5 left-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-[#135bec] focus:ring-[#135bec]"
                          checked={selectedQuestionIds.has(q.id)}
                          onChange={() => toggleSelectQuestion(q.id)}
                        />
                      </div>

                      <div className="pl-8">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <span className="size-6 rounded bg-[#135bec]/10 text-[#135bec] flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                            <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded">
                              <span className="material-symbols-outlined text-[14px] text-gray-400">{getQuestionTypeIcon(q.type)}</span>
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {q.type === 'single' ? '单项选择' : q.type === 'multiple' ? '多项选择' : q.type === 'boolean' ? '判断' : q.type === 'cloze' ? '填空' : '匹配'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleOpenQuestionModal(q)} className="text-gray-300 hover:text-[#135bec] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                            <button onClick={() => handleDeleteQuestion(q.id)} className="text-gray-300 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                          </div>
                        </div>
                        
                        <p className="text-sm font-bold text-[#111318] mb-4 leading-relaxed">
                          {q.type === 'cloze' 
                            ? q.text.split('[[blank]]').map((part, i, arr) => (
                                <React.Fragment key={i}>
                                  {part}
                                  {i < arr.length - 1 && <span className="mx-1 px-2 py-0.5 bg-blue-50 text-[#135bec] border-b border-[#135bec] italic font-mono text-xs">[{q.clozeAnswers[i] || '待填入'}]</span>}
                                </React.Fragment>
                              ))
                            : q.text
                          }
                        </p>

                        {(q.type === 'single' || q.type === 'multiple' || q.type === 'boolean') && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, i) => (
                              <div key={i} className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-3 transition-colors ${q.correctAnswers.includes(i) ? 'bg-green-50/50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                <span className="material-symbols-outlined text-base">
                                  {q.correctAnswers.includes(i) ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'matching' && (
                          <div className="space-y-2">
                            {q.matchingPairs.map((pair, i) => (
                              <div key={i} className="flex items-center gap-4">
                                <div className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-700 text-center shadow-xs">{pair.left}</div>
                                <span className="material-symbols-outlined text-gray-300">link</span>
                                <div className="flex-1 p-3 bg-green-50/50 border border-green-100 rounded-lg text-xs font-bold text-green-700 text-center shadow-xs">{pair.right}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in-95 duration-300">
                    <div className="size-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-6">
                      <span className="material-symbols-outlined text-4xl">search_off</span>
                    </div>
                    <h4 className="text-xl font-black text-gray-400">未找到符合条件的题目</h4>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs">尝试调整搜索词或过滤器，或者点击右上角新增题目。</p>
                  </div>
                )}
             </div>
          </div>
          
          <aside className="w-80 space-y-6">
            <div className="bg-white border border-[#dbdfe6] rounded-xl p-5 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">题库概况</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">题目总数</span>
                  <span className="font-black text-[#111318] text-lg">{selectedCourse.questionCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-gray-50 pt-3">
                  <span className="text-gray-500 font-medium">筛选后显示</span>
                  <span className="font-black text-[#135bec]">{filteredQuestions.length} 题</span>
                </div>
              </div>
              <button className="w-full mt-6 py-2.5 bg-[#111318] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md">
                预览学员界面
              </button>
            </div>
          </aside>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {viewMode === 'list' ? (
        <>
          <div className="flex flex-wrap justify-between items-end gap-4 border-b border-gray-200 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                <span>G-Train</span>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-[#135bec]">合规课程目录</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#111318]">合规课程管理</h1>
              <p className="text-gray-500 max-w-2xl text-sm font-medium">集中管理所有 SOP、政策和培训模块。题库现在直接在课程详情中进行维护。</p>
            </div>
            <button 
              onClick={() => handleOpenCourseModal()}
              className="flex items-center gap-2 h-10 px-5 bg-[#135bec] text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              创建新课程
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-6">
              <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">代码/名称</th>
                        <th className="px-6 py-4">关联路径</th>
                        <th className="px-6 py-4 text-center">状态</th>
                        <th className="px-6 py-4">考核题库</th>
                        <th className="px-6 py-4 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-mono font-bold text-gray-400 leading-none mb-1">{course.code}</span>
                              <span className="text-sm font-bold text-[#111318] group-hover:text-[#135bec] cursor-pointer transition-colors" onClick={() => handleOpenCourseModal(course)}>{course.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {course.learningPathIds.length > 0 ? course.learningPathIds.map(lpId => {
                                const lp = LEARNING_PATHS.find(p => p.id === lpId);
                                return lp ? (
                                  <span key={lpId} className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter ${lp.color}`}>
                                    {lp.name}
                                  </span>
                                ) : null;
                              }) : (
                                <span className="text-[9px] text-gray-300 italic">未关联路径</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded uppercase ${
                              course.status === 'active' ? 'bg-green-50 text-green-700' : 
                              course.status === 'paused' ? 'bg-amber-50 text-amber-700' : 
                              'bg-gray-100 text-gray-400'
                            }`}>
                              {course.status === 'active' ? '生效中' : course.status === 'paused' ? '已暂停' : '草案'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${course.questionCount > 0 ? 'bg-blue-50 text-[#135bec]' : 'bg-red-50 text-red-400'}`}>
                                {course.questionCount} 题
                              </span>
                              <button 
                                onClick={() => handleOpenAssessment(course)}
                                className="text-[#135bec] hover:underline text-[10px] font-black uppercase tracking-widest"
                              >
                                管理题库
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-1.5 rounded text-gray-400 hover:text-[#135bec] transition-all" onClick={() => handleOpenCourseModal(course)}><span className="material-symbols-outlined text-lg">edit</span></button>
                              <button className="p-1.5 rounded text-gray-400 hover:text-red-500 transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#dbdfe6] shadow-sm flex flex-col h-full min-h-[500px]">
                <div className="px-6 py-4 border-b border-[#f3f4f6]">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#135bec]">history</span>
                    合规审计追踪
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="relative border-l-2 border-gray-100 ml-2 space-y-6">
                    {auditTrail.map((item, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute -left-[7px] top-1 size-3 rounded-full border-2 border-white shadow-sm bg-[#135bec]"></div>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{item.time}</p>
                        <p className="text-xs font-bold text-[#111318] mt-0.5">{item.title}</p>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-0.5">{item.desc}</p>
                        <div className="mt-2 text-[9px] font-bold text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">{item.icon}</span>
                          {item.actor}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : renderAssessmentDesigner()}

      {/* Course Edit/Add Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto custom-scrollbar">
          <div className="bg-white w-full max-w-4xl my-8 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-[#111318]">{editingCourse ? '编辑课程属性' : '创建合规课程'}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">设置基本信息、学习路径及组织靶向受众</p>
              </div>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSaveCourse} className="p-8 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">课程名称</label>
                  <input type="text" required className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]" value={courseFormData.name} onChange={e => setCourseFormData({...courseFormData, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">课程代码</label>
                  <input type="text" required className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#135bec]" value={courseFormData.code} onChange={e => setCourseFormData({...courseFormData, code: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">版本号</label>
                  <input type="text" required className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]" value={courseFormData.version} onChange={e => setCourseFormData({...courseFormData, version: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">发布状态</label>
                  <select className="w-full h-11 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold" value={courseFormData.status} onChange={e => setCourseFormData({...courseFormData, status: e.target.value as any})}>
                    <option value="draft">草案 (Draft)</option>
                    <option value="active">生效中 (Active)</option>
                    <option value="paused">已暂停 (Paused)</option>
                  </select>
                </div>
              </div>

              {/* Learning Paths */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">关联学习路径 (Learning Paths)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {LEARNING_PATHS.map(path => {
                    const isSelected = courseFormData.learningPathIds.includes(path.id);
                    return (
                      <button
                        key={path.id}
                        type="button"
                        onClick={() => toggleSelection('learningPathIds', path.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isSelected ? 'bg-blue-50 border-[#135bec] ring-1 ring-[#135bec]/20' : 'bg-white border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#111318]">{path.name}</span>
                          <span className="text-[9px] text-gray-400 font-medium">ID: {path.id}</span>
                        </div>
                        {isSelected && <span className="material-symbols-outlined text-[#135bec] text-lg">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Audience / Org Targeting */}
              <div className="space-y-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#135bec] text-lg">groups</span>
                  <h4 className="text-sm font-black text-[#111318] uppercase tracking-widest">靶向受众设置 (Target Audience)</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Companies */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">corporate_fare</span>
                      目标公司实体
                    </label>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {ORG_COMPANIES.map(c => (
                        <button
                          key={c.id} type="button" onClick={() => toggleSelection('targetCompanyIds', c.id)}
                          className={`text-left px-3 py-2 rounded-lg text-[11px] font-bold border transition-all ${
                            courseFormData.targetCompanyIds.includes(c.id)
                              ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                              : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Departments */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">account_tree</span>
                      针对部门
                    </label>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {ORG_DEPARTMENTS.map(d => (
                        <button
                          key={d.id} type="button" onClick={() => toggleSelection('targetDepartmentIds', d.id)}
                          className={`text-left px-3 py-2 rounded-lg text-[11px] font-bold border transition-all ${
                            courseFormData.targetDepartmentIds.includes(d.id)
                              ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                              : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Positions */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">engineering</span>
                      受众岗位
                    </label>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {ORG_POSITIONS.map(p => (
                        <button
                          key={p.id} type="button" onClick={() => toggleSelection('targetPositionIds', p.id)}
                          className={`text-left px-3 py-2 rounded-lg text-[11px] font-bold border transition-all ${
                            courseFormData.targetPositionIds.includes(p.id)
                              ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                              : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 italic font-medium">* 选中项即为该课程的强制推送范围。符合 21 CFR 自动分配逻辑。</p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-4">
                <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-6 h-11 text-sm font-bold text-gray-500">取消</button>
                <button type="submit" className="px-10 h-11 bg-[#135bec] text-white text-sm font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest">确认并保存课程</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {isImportPreviewOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-8 overflow-hidden flex flex-col h-[70vh]">
            <h3 className="text-xl font-black mb-4">导入预览 ({importingQuestions.length} 题)</h3>
            <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar border border-gray-100 rounded-lg p-4 bg-gray-50/20">
               {importingQuestions.map((q, i) => (
                  <div key={i} className="py-2 border-b border-gray-100 text-sm flex gap-3 items-start">
                    <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded uppercase h-fit mt-0.5">{q.type}</span>
                    <span className="font-bold text-gray-700">{q.text}</span>
                  </div>
               ))}
            </div>
            <div className="flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsImportPreviewOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">取消</button>
              <button onClick={confirmImport} className="px-10 py-2 bg-[#135bec] text-white font-black rounded-lg shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs">确认导入到题库</button>
            </div>
          </div>
        </div>
      )}

      {/* Question Edit/Add Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-[#111318]">{editingQuestion ? '编辑题目' : '新增考核题目'}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">符合合规要求的题型编制</p>
              </div>
              <button onClick={() => setIsQuestionModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleSaveQuestion} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">题目类型</label>
                  <select 
                    className="w-full h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]"
                    value={questionFormData.type}
                    onChange={e => {
                      const newType = e.target.value as Question['type'];
                      if (questionFormData.text && !confirm('切换类型将重置当前题目的部分选项，是否继续？')) return;
                      setQuestionFormData({
                        ...questionFormData,
                        type: newType,
                        options: newType === 'boolean' ? ['正确', '错误'] : (newType === 'cloze' || newType === 'matching' ? [] : ['', '', '', '']),
                        correctAnswers: [0],
                        clozeAnswers: newType === 'cloze' ? [''] : [],
                        matchingPairs: newType === 'matching' ? [{ left: '', right: '' }] : []
                      });
                    }}
                  >
                    <option value="single">单项选择题</option>
                    <option value="multiple">多项选择题</option>
                    <option value="boolean">判断题</option>
                    <option value="cloze">填空题</option>
                    <option value="matching">匹配题</option>
                  </select>
                </div>
                <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-3 flex flex-col justify-center text-center">
                  <p className="text-[10px] text-[#135bec] font-bold uppercase">当前课程</p>
                  <p className="text-xs font-black text-[#111318] truncate">{selectedCourse?.name}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">题目内容</label>
                   {questionFormData.type === 'cloze' && (
                     <button 
                       type="button" 
                       onClick={() => {
                         setQuestionFormData({
                           ...questionFormData,
                           text: questionFormData.text + '[[blank]]',
                           clozeAnswers: [...questionFormData.clozeAnswers, '']
                         });
                       }}
                       className="text-[10px] font-black text-[#135bec] flex items-center gap-1 hover:underline"
                     >
                       <span className="material-symbols-outlined text-xs">add_box</span>
                       插入填空位
                     </button>
                   )}
                </div>
                <textarea 
                  required
                  rows={3}
                  placeholder={questionFormData.type === 'cloze' ? '请输入内容，使用 [[blank]] 代表空位...' : '请输入题目具体描述...'}
                  className="w-full p-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec] transition-all"
                  value={questionFormData.text}
                  onChange={e => setQuestionFormData({...questionFormData, text: e.target.value})}
                />
              </div>

              {(questionFormData.type === 'single' || questionFormData.type === 'multiple' || questionFormData.type === 'boolean') && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">选项及答案</label>
                    {questionFormData.type !== 'boolean' && (
                      <button 
                        type="button" 
                        onClick={() => setQuestionFormData({...questionFormData, options: [...questionFormData.options, '']})}
                        className="text-[10px] font-black text-[#135bec] hover:underline"
                      >+ 添加选项</button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {questionFormData.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-300">
                        <div className="flex-1 flex items-center bg-gray-50 border border-transparent focus-within:border-[#135bec] rounded-xl overflow-hidden transition-all">
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 text-[10px] font-black text-gray-400 border-r uppercase tracking-tighter shrink-0">{String.fromCharCode(65 + idx)}</div>
                          <input 
                            type="text" required readOnly={questionFormData.type === 'boolean'}
                            className="flex-1 h-12 px-4 bg-transparent border-none text-sm font-bold focus:ring-0"
                            value={option}
                            onChange={e => {
                              const opts = [...questionFormData.options];
                              opts[idx] = e.target.value;
                              setQuestionFormData({...questionFormData, options: opts});
                            }}
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => toggleCorrectAnswer(idx)}
                          className={`size-10 rounded-xl flex items-center justify-center border transition-all shrink-0 ${questionFormData.correctAnswers.includes(idx) ? 'bg-green-500 text-white border-green-500 shadow-md ring-2 ring-green-100' : 'bg-white text-gray-200 border-gray-100 hover:text-green-500'}`}
                        >
                          <span className="material-symbols-outlined text-xl">{questionFormData.correctAnswers.includes(idx) ? 'check_circle' : 'radio_button_unchecked'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {questionFormData.type === 'cloze' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">填空位标准答案</label>
                  {questionFormData.clozeAnswers.map((answer, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-blue-50 text-[#135bec] flex items-center justify-center text-[10px] font-black border border-blue-100 shrink-0">{idx + 1}</div>
                      <input 
                        type="text" required placeholder={`请输入第 ${idx + 1} 个空位的答案`}
                        className="flex-1 h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]"
                        value={answer}
                        onChange={e => {
                          const ans = [...questionFormData.clozeAnswers];
                          ans[idx] = e.target.value;
                          setQuestionFormData({...questionFormData, clozeAnswers: ans});
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {questionFormData.type === 'matching' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">匹配对 (左侧 ↔ 右侧)</label>
                    <button type="button" onClick={() => setQuestionFormData({...questionFormData, matchingPairs: [...questionFormData.matchingPairs, {left: '', right: ''}]})} className="text-[10px] font-black text-[#135bec] hover:underline">+ 添加配对</button>
                  </div>
                  {questionFormData.matchingPairs.map((pair, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input type="text" required placeholder="左项" className="flex-1 h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]" value={pair.left} onChange={e => {
                        const pairs = [...questionFormData.matchingPairs];
                        pairs[idx].left = e.target.value;
                        setQuestionFormData({...questionFormData, matchingPairs: pairs});
                      }} />
                      <span className="material-symbols-outlined text-gray-300">swap_horiz</span>
                      <input type="text" required placeholder="右项" className="flex-1 h-12 px-4 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#135bec]" value={pair.right} onChange={e => {
                        const pairs = [...questionFormData.matchingPairs];
                        pairs[idx].right = e.target.value;
                        setQuestionFormData({...questionFormData, matchingPairs: pairs});
                      }} />
                      <button type="button" onClick={() => setQuestionFormData({...questionFormData, matchingPairs: questionFormData.matchingPairs.filter((_, i) => i !== idx)})} className="text-gray-300 hover:text-red-500 p-1"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setIsQuestionModalOpen(false)} className="px-6 h-12 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">取消</button>
                <button type="submit" className="px-12 h-12 bg-[#135bec] text-white text-sm font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest">
                  {editingQuestion ? '保存修改' : '确认新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContainer;
