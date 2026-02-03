
import React, { useState, useCallback } from 'react';
import { ScreenSize, BuilderComponent } from '../types';

const COMPONENT_DEFINITIONS = [
  { type: 'heading', label: '主标题', icon: 'title', defaultProps: { text: '新合规模块', level: 1 } },
  { type: 'text', label: '正文段落', icon: 'notes', defaultProps: { text: '在此输入 SOP 描述...' } },
  { type: 'button', label: '操作按钮', icon: 'smart_button', defaultProps: { label: '开始培训', variant: 'primary' } },
  { type: 'input', label: '文本输入框', icon: 'input', defaultProps: { placeholder: '请在此输入...', label: '用户输入项' } },
  { type: 'card', label: '数据卡片', icon: 'square_foot', defaultProps: { title: 'KPI 标题', value: '100%' } },
  { type: 'badge', label: '状态标签', icon: 'label', defaultProps: { text: '有效', color: 'green' } },
  { type: 'spacer', label: '间距', icon: 'vertical_align_center', defaultProps: { size: 'md' } },
];

const LayoutBuilder: React.FC = () => {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [components, setComponents] = useState<BuilderComponent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  const addComponent = (type: BuilderComponent['type'], defaultProps: any) => {
    const newComp: BuilderComponent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      props: { ...defaultProps }
    };
    setComponents(prev => [...prev, newComp]);
    setSelectedId(newComp.id);
  };

  const updateProp = (id: string, prop: string, value: any) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, props: { ...c.props, [prop]: value } } : c));
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const getCanvasWidth = () => {
    switch (screenSize) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      case 'desktop': return 'w-full max-w-5xl';
    }
  };

  const selectedComp = components.find(c => c.id === selectedId);

  const renderComponent = (comp: BuilderComponent) => {
    const isSelected = selectedId === comp.id;
    const commonClasses = `relative p-2 rounded transition-all group ${isSelected ? 'ring-2 ring-[#135bec] bg-blue-50/30' : 'hover:ring-1 hover:ring-gray-300'}`;

    let element;
    switch (comp.type) {
      case 'heading':
        element = <h1 className={`font-black text-[#111318] ${comp.props.level === 1 ? 'text-3xl' : 'text-xl'}`}>{comp.props.text}</h1>;
        break;
      case 'text':
        element = <p className="text-gray-500 text-sm">{comp.props.text}</p>;
        break;
      case 'button':
        element = (
          <button className={`px-4 py-2 rounded-lg font-bold text-sm ${
            comp.props.variant === 'primary' ? 'bg-[#135bec] text-white shadow-md' : 'border border-gray-200 bg-white'
          }`}>
            {comp.props.label}
          </button>
        );
        break;
      case 'input':
        element = (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">{comp.props.label}</label>
            <input type="text" placeholder={comp.props.placeholder} className="w-full h-10 px-3 bg-[#f3f4f6] border-none rounded-lg text-sm" disabled />
          </div>
        );
        break;
      case 'card':
        element = (
          <div className="bg-white p-6 rounded-xl border border-[#dbdfe6] shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">{comp.props.title}</p>
            <p className="text-2xl font-black text-[#111318]">{comp.props.value}</p>
          </div>
        );
        break;
      case 'badge':
        element = (
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            comp.props.color === 'green' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {comp.props.text}
          </span>
        );
        break;
      case 'spacer':
        element = <div style={{ height: comp.props.size === 'lg' ? '40px' : '20px' }}></div>;
        break;
    }

    return (
      <div 
        key={comp.id} 
        onClick={(e) => { e.stopPropagation(); setSelectedId(comp.id); }}
        className={commonClasses}
      >
        {element}
        {isSelected && (
          <button 
            onClick={(e) => { e.stopPropagation(); removeComponent(comp.id); }}
            className="absolute -right-2 -top-2 bg-red-500 text-white size-5 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        )}
      </div>
    );
  };

  const generateCode = () => {
    let code = `<div className="space-y-4">\n`;
    components.forEach(c => {
      switch (c.type) {
        case 'heading': code += `  <h1 className="text-3xl font-black">${c.props.text}</h1>\n`; break;
        case 'text': code += `  <p className="text-gray-500">${c.props.text}</p>\n`; break;
        case 'button': code += `  <button className="bg-[#135bec] text-white px-4 py-2 rounded font-bold">${c.props.label}</button>\n`; break;
        case 'input': code += `  <div className="space-y-1"><label>${c.props.label}</label><input className="w-full border p-2 rounded" placeholder="${c.props.placeholder}" /></div>\n`; break;
        case 'card': code += `  <div className="p-4 border rounded shadow-sm"><h4>${c.props.title}</h4><p>${c.props.value}</p></div>\n`; break;
      }
    });
    code += `</div>`;
    return code;
  };

  return (
    <div className="flex h-full bg-[#f6f6f8] overflow-hidden">
      {/* Component Library */}
      <aside className="w-72 border-r border-[#dbdfe6] flex flex-col bg-white">
        <div className="p-6 border-b border-[#dbdfe6]">
          <h3 className="text-sm font-bold text-[#111318] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#135bec]">category</span>
            UI 组件库
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">医药行业级 UI 模块</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {COMPONENT_DEFINITIONS.map(def => (
            <button
              key={def.type}
              onClick={() => addComponent(def.type as any, def.defaultProps)}
              className="w-full flex items-center gap-3 p-3 bg-[#f8fafc] border border-[#dbdfe6] rounded-xl hover:border-[#135bec] hover:bg-white transition-all group text-left"
            >
              <div className="size-10 rounded-lg bg-white border border-[#dbdfe6] flex items-center justify-center text-gray-400 group-hover:text-[#135bec] transition-colors">
                <span className="material-symbols-outlined">{def.icon}</span>
              </div>
              <span className="text-xs font-bold text-[#111318]">{def.label}</span>
              <span className="material-symbols-outlined ml-auto text-sm text-gray-300 group-hover:text-[#135bec]">add</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Builder Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 bg-white border-b border-[#dbdfe6] px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            {(['mobile', 'tablet', 'desktop'] as ScreenSize[]).map(size => (
              <button
                key={size}
                onClick={() => setScreenSize(size)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${
                  screenSize === size ? 'bg-white text-[#135bec] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {size === 'mobile' ? 'smartphone' : size === 'tablet' ? 'tablet_mac' : 'desktop_windows'}
                </span>
                {size === 'mobile' ? '手机' : size === 'tablet' ? '平板' : '桌面'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCode(!showCode)}
              className="px-4 h-9 bg-[#111318] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">code</span>
              {showCode ? '返回编辑器' : '生成代码'}
            </button>
            <button className="px-4 h-9 bg-[#135bec] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors">
              <span className="material-symbols-outlined text-sm">publish</span>
              部署模块
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-12 flex justify-center bg-[#f0f2f5] custom-scrollbar">
          {showCode ? (
            <div className="w-full max-w-4xl bg-gray-900 rounded-xl p-8 text-green-400 font-mono text-xs overflow-auto shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <span className="text-gray-500 uppercase tracking-widest">生成的 React 组件代码</span>
                <button className="text-white hover:text-[#135bec] font-bold" onClick={() => {
                  navigator.clipboard.writeText(generateCode());
                  alert('代码已复制到剪贴板');
                }}>复制代码</button>
              </div>
              <pre className="whitespace-pre-wrap">{generateCode()}</pre>
            </div>
          ) : (
            <div className={`${getCanvasWidth()} transition-all duration-300 min-h-full bg-white shadow-2xl rounded-2xl border border-white relative overflow-hidden flex flex-col`}>
              {/* Status bar mock */}
              <div className="h-6 bg-gray-50 flex items-center justify-between px-4 text-[9px] font-bold text-gray-400 border-b border-gray-100">
                <span>上午 9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[12px]">signal_cellular_alt</span>
                  <span className="material-symbols-outlined text-[12px]">wifi</span>
                  <span className="material-symbols-outlined text-[12px]">battery_full</span>
                </div>
              </div>

              <div 
                className="p-8 flex-1 space-y-4" 
                onClick={() => setSelectedId(null)}
              >
                {components.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-24">
                    <span className="material-symbols-outlined text-6xl mb-4">drag_and_drop</span>
                    <h4 className="text-xl font-black">画布为空</h4>
                    <p className="text-sm max-w-xs">从左侧边栏选择组件，开始构建您的合规业务界面。</p>
                  </div>
                ) : (
                  components.map(renderComponent)
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Property Inspector */}
      <aside className="w-80 border-l border-[#dbdfe6] flex flex-col bg-white">
        <div className="p-6 border-b border-[#dbdfe6]">
          <h3 className="text-sm font-bold text-[#111318] flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">settings</span>
            检查器
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">配置元素属性</p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {selectedComp ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-[#135bec]">{COMPONENT_DEFINITIONS.find(d => d.type === selectedComp.type)?.icon}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#135bec] uppercase tracking-widest">{selectedComp.type}</p>
                  <p className="text-xs font-bold text-gray-700">唯一标识: {selectedComp.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(selectedComp.props).map(([key, value]) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      {key === 'text' ? '文本内容' : 
                       key === 'label' ? '标签名称' : 
                       key === 'placeholder' ? '占位符' : 
                       key === 'title' ? '标题' : 
                       key === 'value' ? '数值' : 
                       key === 'variant' ? '样式变体' : 
                       key === 'color' ? '颜色/状态' : 
                       key === 'level' ? '标题级别' : 
                       key === 'size' ? '尺寸' : key}
                    </label>
                    {/* Fixed: Casting value to any/string to prevent 'unknown' assignment error */}
                    {typeof value === 'string' && key !== 'variant' && key !== 'color' && (
                      <input
                        type="text"
                        value={value as string}
                        onChange={(e) => updateProp(selectedComp.id, key, e.target.value)}
                        className="w-full bg-[#f3f4f6] border-none rounded-lg p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#135bec]"
                      />
                    )}
                    {/* Fixed: Casting value to any/string to prevent 'unknown' assignment error */}
                    {key === 'variant' && (
                      <select 
                        value={value as string}
                        onChange={(e) => updateProp(selectedComp.id, key, e.target.value)}
                        className="w-full bg-[#f3f4f6] border-none rounded-lg p-2.5 text-xs font-bold"
                      >
                        <option value="primary">主按钮样式</option>
                        <option value="outline">线框样式</option>
                      </select>
                    )}
                    {/* Fixed: Casting value to any/string to prevent 'unknown' assignment error */}
                    {key === 'color' && (
                      <select 
                        value={value as string}
                        onChange={(e) => updateProp(selectedComp.id, key, e.target.value)}
                        className="w-full bg-[#f3f4f6] border-none rounded-lg p-2.5 text-xs font-bold"
                      >
                        <option value="green">正常/安全 (绿色)</option>
                        <option value="red">紧急/警告 (红色)</option>
                      </select>
                    )}
                    {key === 'level' && (
                      <div className="flex gap-2">
                        {[1, 2].map(l => (
                          <button
                            key={l}
                            onClick={() => updateProp(selectedComp.id, key, l)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border ${value === l ? 'border-[#135bec] bg-blue-50 text-[#135bec]' : 'border-gray-200 bg-white'}`}
                          >
                            H{l} 级别
                          </button>
                        ))}
                      </div>
                    )}
                    {key === 'size' && (
                      <div className="flex gap-2">
                        {['md', 'lg'].map(s => (
                          <button
                            key={s}
                            onClick={() => updateProp(selectedComp.id, key, s)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border ${value === s ? 'border-[#135bec] bg-blue-50 text-[#135bec]' : 'border-gray-200 bg-white'}`}
                          >
                            {s === 'md' ? '常规' : '大号'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <span className="material-symbols-outlined text-4xl mb-2">touch_app</span>
              <p className="text-[10px] font-bold uppercase tracking-widest">请选择画布中的元素以进行编辑</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default LayoutBuilder;
