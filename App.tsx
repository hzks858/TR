
import React, { useState, useEffect } from 'react';
import { View, Role, UserAccount, HierarchyNode, Course, PlanItem } from './types';
import AdminDashboard from './components/AdminDashboard';
import UserTrainingHub from './components/UserTrainingHub';
import TrainingArchive from './components/TrainingArchive';
import CourseContainer from './components/CourseContainer';
import DataSummary from './components/DataSummary';
import AnnualTrainingPlan from './components/AnnualTrainingPlan';
import OrgSettings from './components/OrgSettings';
import HierarchyManager from './components/HierarchyManager';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import AuditLogView from './components/AuditLogView';
import SystemManagement from './components/SystemManagement';

const INITIAL_HIERARCHY_DATA: Record<string, HierarchyNode[]> = {
  ORGANIZATION: [
    { 
      id: 'C1', 
      name: '金辉制药 (集团总部)', 
      code: '01', 
      manager: '王利民', 
      address: '上海市张江高科技园区 A1 栋', 
      isOpen: true,
      children: [
        { 
          id: 'D1', 
          name: '质量管理中心', 
          code: '0101', 
          manager: '张利民', 
          isGxP: true, 
          isOpen: true,
          children: [
            { 
              id: 'D1-1', 
              name: '质量保证部 (QA)', 
              code: '010101', 
              manager: '李晓华', 
              isOpen: true,
              children: [
                { id: 'P1', name: '首席合规官', code: '01010101', riskLevel: 'High', children: [] },
                { id: 'P2', name: '合规经理', code: '01010102', riskLevel: 'High', children: [] },
                { id: 'P4', name: '现场 QA 审计员', code: '01010103', riskLevel: 'Medium', children: [] }
              ] 
            },
            { 
              id: 'D1-2', 
              name: '质量控制部 (QC)', 
              code: '010102', 
              manager: '陈思宇', 
              children: [
                { id: 'P6', name: '无菌室化验员', code: '01010201', riskLevel: 'High', children: [] },
                { id: 'P7', name: '理化分析员', code: '01010202', riskLevel: 'Medium', children: [] }
              ] 
            }
          ] 
        },
        { 
          id: 'D2', 
          name: '生产制造中心', 
          code: '0102', 
          manager: '赵生产', 
          isGxP: true, 
          isOpen: true,
          children: [
            { id: 'P3', name: '灌装车间主任', code: '010201', riskLevel: 'High', children: [] },
            { id: 'P5', name: '自动化岗操作工', code: '010202', riskLevel: 'High', children: [] }
          ] 
        }
      ]
    },
    {
      id: 'C2',
      name: '金辉制药 (北美研发中心)',
      code: '02',
      manager: 'Dr. Robert Chen',
      address: 'Cambridge, MA, USA',
      isOpen: false,
      children: []
    }
  ],
  COURSE: [
    { id: '4', name: 'L1: 全球法规准则 (GMP/FDA)', code: '10', children: [
      { id: '5', name: 'L2: 药品生命周期合规', code: '1001', children: [] },
      { id: '6', name: 'L2: 数据完整性核心', code: '1002', children: [] }
    ]},
    { id: '7', name: 'L1: 生产工艺规程 (SOP)', code: '20', children: [
      { id: '8', name: 'L2: 洁净区行为规范', code: '2001', children: [] }
    ]}
  ],
  STUDENT: [
    { id: '9', name: '在职正式员工 (Full-time)', code: '30', children: [] },
    { id: '10', name: '外部承包商/咨询专家', code: '40', children: [] }
  ]
};

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    code: 'SOP-PRO-001',
    name: '生产线自动灭菌系统操作规程',
    version: 'v5.2',
    category: '生产 SOP',
    status: 'active',
    lastUpdated: '2024-03-20',
    questionCount: 15,
    materials: [
      { id: 'm1', name: '灭菌系统 3D 演示.mp4', type: 'video', url: '#', status: 'active', expiryDate: '2025-03-15', uploadDate: '2024-03-15', hours: 2.0 }
    ],
    totalHours: 2.0,
    hierarchyIds: ['8']
  },
  {
    id: 'c2',
    code: 'QA-DI-102',
    name: 'ALCOA+ 数据完整性深度解读',
    version: 'v2.0',
    category: 'QA 合规',
    status: 'active',
    lastUpdated: '2024-03-18',
    questionCount: 20,
    materials: [
      { id: 'm2', name: '21 CFR Part 11 指南.pdf', type: 'pdf', url: '#', status: 'active', expiryDate: '2026-03-10', uploadDate: '2024-03-10', hours: 3.5 }
    ],
    totalHours: 3.5,
    hierarchyIds: ['6']
  },
  {
    id: 'c3',
    code: 'QC-LAB-045',
    name: '高效液相色谱仪 (HPLC) 维护手册',
    version: 'v1.1',
    category: '质量控制 (QC)',
    status: 'active',
    lastUpdated: '2024-03-10',
    questionCount: 8,
    materials: [],
    totalHours: 1.0,
    hierarchyIds: ['5']
  }
];

const PRESET_ACCOUNTS: UserAccount[] = [
  { 
    id: 'u1', 
    name: '王利民 (集团 Admin)', 
    username: 'admin_wang', 
    password: 'password123', 
    employeeId: 'EMP-001', 
    role: Role.SYSTEM_ADMIN, 
    company: '金辉制药 (集团总部)', 
    department: '质量管理中心', 
    position: '首席合规官', 
    avatar: 'https://picsum.photos/seed/wang/80/80', 
    status: 'active', 
    lastLogin: '2024-03-21 10:30',
  },
  { id: 'u2', name: '张利民 (审计员)', username: 'qa_zhang', password: 'password123', employeeId: 'EMP-102', role: Role.QA_OFFICER, company: '金辉制药 (集团总部)', department: '质量保证部 (QA)', position: '合规经理', avatar: 'https://picsum.photos/seed/zhang/80/80', status: 'active', lastLogin: '2024-03-21 09:15' },
  { id: 'u3', name: '陈思宇 (实验主管)', username: 'qc_chen', password: 'password123', employeeId: 'EMP-305', role: Role.EMPLOYEE, company: '金辉制药 (集团总部)', department: '质量控制部 (QC)', position: '无菌室化验员', avatar: 'https://picsum.photos/seed/chen/80/80', status: 'active', lastLogin: '2024-03-20 14:20' },
  { id: 'u4', name: '李晓华 (高级操作工)', username: 'pro_li', password: 'password123', employeeId: 'EMP-208', role: Role.EMPLOYEE, company: '金辉制药 (集团总部)', department: '生产制造中心', position: '灌装车间主任', avatar: 'https://picsum.photos/seed/li/80/80', status: 'active', lastLogin: '2024-03-19 11:00' },
];

const INITIAL_PLANS: PlanItem[] = [
  { 
    id: 'P101', 
    targetCompanyIds: ['C1'], 
    targetDepartmentIds: [], 
    targetPositionIds: [],
    courseIds: ['c1', 'c2'],
    courseProgress: { 'c1': 80, 'c2': 40 },
    trainingTypes: ['ONLINE', 'SELF'],
    year: 2024,
    month: 3, 
    title: 'Q1 集团合规意识全员月度考核', 
    code: 'PLAN-2024-Q1-01', 
    targetDescription: '金辉制药集团全员', 
    level: 'COMPANY', 
    status: 'in-progress', 
    owner: '王利民', 
    progress: 60,
    priority: 'HIGH'
  }
];

const App: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(PRESET_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState<UserAccount>(users[0]);
  const [currentView, setCurrentView] = useState<View>(View.ADMIN_DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hierarchyData, setHierarchyData] = useState<Record<string, HierarchyNode[]>>(INITIAL_HIERARCHY_DATA);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [plans, setPlans] = useState<PlanItem[]>(INITIAL_PLANS);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '');
      if (Object.values(View).includes(hash as View)) {
        setCurrentView(hash as View);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (view: View) => {
    window.location.hash = `/${view}`;
    setCurrentView(view);
  };

  const menuSections = [
    {
      title: '业务管理中心',
      items: [
        { id: View.ADMIN_DASHBOARD, label: '概览仪表板', icon: 'dashboard', roles: [Role.SYSTEM_ADMIN, Role.QA_OFFICER] },
        { id: View.USER_MANAGEMENT, label: '学员管理', icon: 'manage_accounts', roles: [Role.SYSTEM_ADMIN, Role.QA_OFFICER] },
        { id: View.COURSE_CONTAINER, label: '课程目录', icon: 'library_books', roles: [Role.SYSTEM_ADMIN, Role.QA_OFFICER] },
        { id: View.ANNUAL_PLAN, label: '培训计划', icon: 'calendar_today', roles: [Role.SYSTEM_ADMIN, Role.QA_OFFICER] },
        { id: View.USER_TRAINING, label: '我的学习', icon: 'school', roles: [Role.SYSTEM_ADMIN, Role.QA_OFFICER, Role.EMPLOYEE] },
        { id: View.TRAINING_ARCHIVE, label: '培训档案', icon: 'history', roles: [Role.SYSTEM_ADMIN, Role.QA_OFFICER, Role.EMPLOYEE] },
      ]
    },
    {
      title: '系统与合规中心',
      items: [
        { id: View.SYSTEM_MANAGEMENT, label: '系统管理', icon: 'settings_suggest', roles: [Role.SYSTEM_ADMIN] },
        { id: View.AUDIT_LOGS, label: '审计追踪 (Part 11)', icon: 'history_edu', roles: [Role.SYSTEM_ADMIN] },
        { id: View.ORG_SETTINGS, label: '机构设置', icon: 'corporate_fare', roles: [Role.SYSTEM_ADMIN, Role.QA_OFFICER] },
        { id: View.HIERARCHY_MANAGER, label: '编码规则', icon: 'format_list_numbered', roles: [Role.SYSTEM_ADMIN] },
        { id: View.DATA_SUMMARY, label: '合规报表', icon: 'analytics', roles: [Role.SYSTEM_ADMIN, Role.QA_OFFICER] },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#f6f6f8]">
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#dbdfe6] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 overflow-hidden shadow-2xl lg:shadow-none`}
      >
        <div className="flex flex-col h-full p-6 w-64">
          <div className="flex items-center gap-3 mb-10 shrink-0">
            <div className="bg-[#135bec] size-10 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined font-bold">pill</span>
            </div>
            <div>
              <h1 className="text-[#111318] text-base font-black leading-none">G-Train</h1>
              <p className="text-[#616f89] text-[10px] mt-1 font-black uppercase tracking-widest">Compliance Center</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar no-scrollbar">
            {menuSections.map((section, sIdx) => {
              const visibleItems = section.items.filter(item => item.roles.includes(currentUser.role));
              if (visibleItems.length === 0) return null;
              return (
                <div key={sIdx} className="space-y-2">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-3">{section.title}</p>
                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${
                          currentView === item.id 
                            ? 'bg-[#135bec]/10 text-[#135bec] translate-x-1 shadow-sm' 
                            : 'text-[#616f89] hover:bg-gray-50 hover:translate-x-1'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentView === item.id ? "'FILL' 1" : "" }}>
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="pt-6 mt-6 border-t border-gray-100 shrink-0">
            <button onClick={() => navigateTo(View.USER_PROFILE)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-all group">
               <img src={currentUser.avatar} className="size-9 rounded-xl border border-gray-200 group-hover:scale-110 transition-transform shadow-sm object-cover" />
               <div className="text-left">
                  <p className="text-xs font-black text-[#111318] truncate w-32">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">My Settings</p>
               </div>
            </button>
          </div>
        </div>
      </aside>

      <div className={`flex-1 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} flex flex-col min-h-screen`}>
        <header className="h-16 bg-white border-b border-[#dbdfe6] sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 text-gray-400 hover:text-[#135bec] hover:bg-gray-50 rounded-lg transition-all"
            >
              <span className={`material-symbols-outlined transition-transform duration-500 ${!isSidebarOpen ? 'rotate-180' : ''}`}>
                menu_open
              </span>
            </button>
            <h2 className="text-lg font-black text-[#111318] animate-in slide-in-from-left-4 duration-500">
              {menuSections.flatMap(s => s.items).find(i => i.id === currentView)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100">
                <span className="text-[10px] font-black uppercase tracking-wider">合规环境: 验证已激活 (GAMP 5)</span>
             </div>
          </div>
        </header>
        <main className="p-8 flex-1 overflow-x-hidden">
          {currentView === View.ADMIN_DASHBOARD && <AdminDashboard />}
          {currentView === View.USER_MANAGEMENT && <UserManagement users={users} setUsers={setUsers} />}
          {currentView === View.SYSTEM_MANAGEMENT && <SystemManagement />}
          {currentView === View.AUDIT_LOGS && <AuditLogView />}
          {currentView === View.COURSE_CONTAINER && <CourseContainer courses={courses} setCourses={setCourses} questions={questions} setQuestions={setQuestions} hierarchyData={hierarchyData} />}
          {currentView === View.ANNUAL_PLAN && <AnnualTrainingPlan plans={plans} setPlans={setPlans} courses={courses} hierarchyData={hierarchyData} />}
          {currentView === View.USER_TRAINING && <UserTrainingHub plans={plans} setPlans={setPlans} currentUser={currentUser} courses={courses} />}
          {currentView === View.TRAINING_ARCHIVE && <TrainingArchive />}
          {currentView === View.DATA_SUMMARY && <DataSummary />}
          {currentView === View.ORG_SETTINGS && <OrgSettings hierarchyData={hierarchyData} setHierarchyData={setHierarchyData} />}
          {currentView === View.HIERARCHY_MANAGER && <HierarchyManager data={hierarchyData} setData={setHierarchyData} />}
          {currentView === View.USER_PROFILE && <UserProfile currentUser={currentUser} setCurrentUser={setCurrentUser} setUsers={setUsers} hierarchyData={hierarchyData} />}
        </main>
      </div>
    </div>
  );
};

export default App;
