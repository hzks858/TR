
import React, { useState, useEffect } from 'react';
import { View } from './types';
import AdminDashboard from './components/AdminDashboard';
import UserTrainingHub from './components/UserTrainingHub';
import TrainingArchive from './components/TrainingArchive';
import CourseContainer from './components/CourseContainer';
import DataSummary from './components/DataSummary';
import AnnualTrainingPlan from './components/AnnualTrainingPlan';
import OrgSettings from './components/OrgSettings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.ADMIN_DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync hash routing
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

  const menuItems = [
    { id: View.ADMIN_DASHBOARD, label: '仪表板', icon: 'dashboard' },
    { id: View.ORG_SETTINGS, label: '机构设置', icon: 'account_tree' },
    { id: View.ANNUAL_PLAN, label: '年度计划', icon: 'calendar_today' },
    { id: View.USER_TRAINING, label: '我的培训', icon: 'school' },
    { id: View.COURSE_CONTAINER, label: '课程目录', icon: 'library_books' },
    { id: View.TRAINING_ARCHIVE, label: '培训档案', icon: 'history' },
    { id: View.DATA_SUMMARY, label: '数据总结', icon: 'analytics' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f6f6f8]">
      {/* Sidebar */}
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

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  currentView === item.id 
                    ? 'bg-[#135bec]/10 text-[#135bec]' 
                    : 'text-[#616f89] hover:bg-gray-50'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === item.id ? "'FILL' 1" : "" }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-[#dbdfe6] space-y-4">
            <button className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white py-2.5 rounded-lg text-sm font-bold shadow-md transition-all">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              审计就绪模式
            </button>
            <div className="flex items-center gap-3 px-3 text-[#616f89] cursor-pointer hover:text-[#111318]">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-medium">设置</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'lg:ml-64' : ''} flex flex-col min-h-screen`}>
        <header className="h-16 bg-white border-b border-[#dbdfe6] sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-400"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-lg font-bold text-[#111318]">
              {menuItems.find(i => i.id === currentView)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ecfdf5] text-[#10b981] rounded-full border border-[#10b981]/20">
              <span className="size-2 bg-[#10b981] rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider">现场检查就绪</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-[#111318] leading-none">Alex Johnson</p>
                  <p className="text-[10px] text-gray-500 mt-1">首席培训专员</p>
                </div>
                <img 
                  src="https://picsum.photos/seed/alex/80/80" 
                  alt="Profile" 
                  className="size-10 rounded-full border border-gray-200"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          {currentView === View.ADMIN_DASHBOARD && <AdminDashboard />}
          {currentView === View.USER_TRAINING && <UserTrainingHub />}
          {currentView === View.TRAINING_ARCHIVE && <TrainingArchive />}
          {currentView === View.COURSE_CONTAINER && <CourseContainer />}
          {currentView === View.DATA_SUMMARY && <DataSummary />}
          {currentView === View.ANNUAL_PLAN && <AnnualTrainingPlan />}
          {currentView === View.ORG_SETTINGS && <OrgSettings />}
        </main>

        <footer className="mt-auto px-8 py-6 border-t border-[#dbdfe6] bg-white flex justify-between items-center text-[10px] text-gray-400">
          <p>© 2024 G-Train LMS. 符合 21 CFR Part 11 & EU GMP Annex 11 要求的合规 environment。</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-1"><span className="size-1.5 bg-green-500 rounded-full"></span> 系统状态: 正常运行</span>
            <a href="#" className="hover:text-[#135bec]">合规手册</a>
            <a href="#" className="hover:text-[#135bec]">审计日志</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
