
import React from 'react';

/**
 * @deprecated
 * 该组件已迁移至 CourseContainer.tsx 的子视图中。
 * 这样做的目的是为了实现更紧密的合规性绑定，即每门课程直接管理其对应的考核内容。
 */
const AssessmentDesigner: React.FC = () => {
  return (
    <div className="p-20 text-center">
      <h2 className="text-xl font-bold text-gray-400 italic">功能已迁移至课程管理详情页。</h2>
      <p className="text-sm text-gray-400 mt-2">请通过“课程目录” -> “管理题库”访问此功能。</p>
    </div>
  );
};

export default AssessmentDesigner;
