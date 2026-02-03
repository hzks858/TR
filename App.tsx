
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
      name: '金辉制药 (总仓)', 
      code: '01', 
      manager: '王利民', 
      address: '上海市张江高科技园区 A1 栋', 
      isOpen: true,
      children: [
        { 
          id: 'D1', 
          name: '质量保证部 (QA)', 
          code: '0101', 
          manager: '张利民', 
          isGxP: true, 
          isOpen: true,
          children: [
            { id: 'P1', name: '首席合规官', code: '010101', riskLevel: 'High', children: [] },
            { id: 'P2', name: 'QA 经理', code: '010102', riskLevel: 'High', children: [] },
            { id: 'P4', name: 'QA 审计员', code: '010103', riskLevel: 'Medium', children: [] }
          ] 
        },
        { 
          id: 'D2', 
          name: '生产部 (L1)', 
          code: '0102', 
          manager: '李晓华', 
          isGxP: true, 
          isOpen: true,
          children: [
            { id: 'P3', name: '车间主任', code: '010201', riskLevel: 'High', children: [] },
            { id: 'P5', name: '灌装岗操作工', code: '010202', riskLevel: 'High', children: [] }
          ] 
        },
        { 
          id: 'D3', 
          name: '质量控制部 (QC)', 
          code: '0103', 
          manager: '陈思宇', 
          isGxP: true, 
          children: [
            { id: 'P6', name: '分析化验员', code: '010301', riskLevel: 'Medium', children: [] }
          ] 
        }
      ]
    }
  ],
  COURSE: [
    { id: '4', name: 'L1: 通用合规体系', code: '10', children: [
      { id: '5', name: 'L2: GMP 核心准则', code: '1001', children: [] }
    ]}
  ],
  STUDENT: [
    { id: '9', name: '在职正式员工', code: '20', children: [] }
  ]
};

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    code: 'SOP-PRO-001',
    name: '生产线灭菌操作规程',
    version: 'v4.0',
    category: '生产 SOP',
    status: 'active',
    lastUpdated: '2024-03-15',
    questionCount: 10,
    materials: [
      { id: 'm1', name: '灭菌演示视频.mp4', type: 'video', url: '#', status: 'active', expiryDate: '2025-03-15', uploadDate: '2024-03-15', hours: 1.5 }
    ],
    totalHours: 1.5,
    hierarchyIds: ['5']
  },
  {
    id: 'c2',
    code: 'QA-DI-102',
    name: '电子记录与电子签名指南',
    version: 'v1.2',
    category: 'QA 合规',
    status: 'active',
    lastUpdated: '2024-03-10',
    questionCount: 5,
    materials: [
      { id: 'm2', name: '21 CFR Part 11 解读.pdf', type: 'pdf', url: '#', status: 'active', expiryDate: '2026-03-10', uploadDate: '2024-03-10', hours: 2.0 }
    ],
    totalHours: 2.0,
    hierarchyIds: ['4']
  }
];

const PRESET_ACCOUNTS: UserAccount[] = [
  { 
    id: 'u1', 
    name: '王利民 (Admin)', 
    username: 'admin_wang', 
    password: 'password123', 
    employeeId: 'EMP-001', 
    role: Role.SYSTEM_ADMIN, 
    company: '金辉制药 (总仓)', 
    department: '系统管理部', 
    position: '首席合规官', 
    avatar: 'https://picsum.photos/seed/wang/80/80', 
    status: 'active', 
    lastLogin: '2024-03-20 10:30',
    workExperience: [
      { company: '辉瑞制药 (Pfizer)', position: 'QA 总监', period: '2015 - 2021', description: '负责亚太区 GMP 合规审计。' },
      { company: '阿斯利康', position: '质量经理', period: '2010 - 2015', description: '主导多次 FDA 现场核查。' }
    ],
    transferRecords: [
      { date: '2022-03-15', fromDept: '外部引进', toDept: '系统管理部', fromPos: 'N/A', toPos: '首席合规官', reason: '人才战略引进', approver: '集团董事会' }
    ]
  },
  { id: 'u2', name: '张利民 (QA)', username: 'qa_zhang', password: 'password123', employeeId: 'EMP-102', role: Role.QA_OFFICER, company: '金辉制药 (总仓)', department: '质量保证部 (QA)', position: 'QA 经理', avatar: 'https://picsum.photos/seed/zhang/80/80', status: 'active', lastLogin: '2024-03-20 09:15' },
  { id: 'u3', name: '陈思宇 (QC)', username: 'qc_chen', password: 'password123', employeeId: 'EMP-305', role: Role.EMPLOYEE, company: '金辉制药 (总仓)', department: '质量控制部 (QC)', position: '分析化验员', avatar: 'https://picsum.photos/seed/chen/80/80', status: 'active', lastLogin: '2024-03-19 14:20' },
  { id: 'u4', name: '李晓华 (Pro)', username: 'pro_li', password: 'password123', employeeId: 'EMP-208', role: Role.EMPLOYEE, company: '金辉制药 (总仓)', department: '生产部 (L1)', position: '车间主任', avatar: 'https://picsum.photos/seed/li/80/80', status: 'active', lastLogin: '2024-03-18 11:00' },
];

const INITIAL_PLANS: PlanItem[] = [
  { 
    id: 'P101', 
    targetCompanyIds: ['C1'], 
    targetDepartmentIds: [], 
    targetPositionIds: [],
    courseIds: ['c1', 'c2'],
    courseProgress: { 'c1': 30, 'c2': 60 },
    trainingTypes: ['ONLINE', 'SELF'],
    year: 2026,
    month: 3, 
    title: 'Q1 合规意识全员大考核', 
    code: 'TR-2026-Q1', 
    targetDescription: '金辉制药全员', 
    level: 'COMPANY', 
    status: 'in-progress', 
    owner: '集团 QA 总监', 
    progress: 45,
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
        { id: View.ANNUAL_PLAN, label: '年度培训计划', icon: 'calendar_today', roles: [Role.SYSTEM_ADMIN, Role.QA_OFFICER] },
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#dbdfe6] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-[#135bec] size-10 rounded-lg flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined">pill</span>
            </div>
            <div>
              <h1 className="text-[#111318] text-base font-bold leading-none">G-Train</h1>
              <p className="text-[#616f89] text-xs mt-1 font-medium">医药合规管理系统</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar">
            {menuSections.map((section, sIdx) => {
              const visibleItems = section.items.filter(item => item.roles.includes(currentUser.role));
              if (visibleItems.length === 0) return null;
              return (
                <div key={sIdx} className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3">{section.title}</p>
                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                          currentView === item.id ? 'bg-[#135bec]/10 text-[#135bec]' : 'text-[#616f89] hover:bg-gray-50'
                        }`}
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === item.id ? "'FILL' 1" : "" }}>
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

          <div className="pt-6 mt-6 border-t border-gray-100">
            <button onClick={() => navigateTo(View.USER_PROFILE)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all">
               <img src={currentUser.avatar} className="size-9 rounded-full border border-gray-200" />
               <div className="text-left">
                  <p className="text-xs font-bold text-[#111318] truncate w-32">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-400">个人设置</p>
               </div>
            </button>
          </div>
        </div>
      </aside>

      <div className={`flex-1 ${isSidebarOpen ? 'lg:ml-64' : ''} flex flex-col min-h-screen`}>
        <header className="h-16 bg-white border-b border-[#dbdfe6] sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-gray-400">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-lg font-bold text-[#111318]">
              {menuSections.flatMap(s => s.items).find(i => i.id === currentView)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-[#135bec]/5 text-[#135bec] rounded-full border border-[#135bec]/10">
                <span className="text-[10px] font-bold uppercase tracking-wider">合规环境: 激活</span>
             </div>
          </div>
        </header>
        <main className="p-8 flex-1">
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
