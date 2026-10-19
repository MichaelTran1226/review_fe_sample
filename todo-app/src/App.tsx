import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  SecurityCheckIcon,
  Note01Icon,
  Clock01Icon
} from '@hugeicons/core-free-icons';

import SpringCheck from './components/SpringCheck';
import RubberSegment from './components/RubberSegment';
import SwipeRow from './components/SwipeRow';
import SwipeToast from './components/SwipeToast';
import GlideSelect, { type GlideSelectOption } from './components/GlideSelect';
import CodeSlots, { type CodeSlotsStatus } from './components/CodeSlots';
import Stepper, { Step } from './components/Stepper';
import AnimatedList, { type AnimatedListEntry } from './components/AnimatedList';
import './App.css';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

type FilterType = 'all' | 'active' | 'completed';

const PRIORITY_OPTIONS: GlideSelectOption[] = [
  { value: 'low', label: 'Ưu tiên: Thấp', tag: 'Thấp' },
  { value: 'medium', label: 'Ưu tiên: Vừa', tag: 'Vừa' },
  { value: 'high', label: 'Ưu tiên: Cao', tag: 'Cao' }
];

const INITIAL_TASKS: Task[] = [
  { id: '1', text: 'Hoàn thiện đồ án SWP391 giai đoạn 1', completed: false, priority: 'high', createdAt: Date.now() - 3600000 },
  { id: '2', text: 'Tích hợp bộ React Components giao diện Xanh lá', completed: true, priority: 'high', createdAt: Date.now() - 2400000 },
  { id: '3', text: 'Chuẩn bị slide thuyết trình & kịch bản demo', completed: false, priority: 'medium', createdAt: Date.now() - 1200000 },
  { id: '4', text: 'Kiểm thử phản hồi cử chỉ vuốt và lò xo', completed: false, priority: 'low', createdAt: Date.now() }
];

const STORAGE_KEY = 'swp391_todo_tasks_light_green';
const SECRET_PIN = '1234';

export function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TASKS;
  });

  const [inputVal, setInputVal] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentStep, setCurrentStep] = useState(1);

  // PIN CodeSlots state
  const [pinStatus, setPinStatus] = useState<CodeSlotsStatus>('idle');
  const [pinKey, setPinKey] = useState(0);

  // Toast state
  const [toast, setToast] = useState<{
    open: boolean;
    title: string;
    desc?: string;
    actionLabel?: string;
    onAction?: () => void;
  }>({
    open: false,
    title: ''
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const showToast = (title: string, desc?: string, actionLabel?: string, onAction?: () => void) => {
    setToast({
      open: true,
      title,
      desc,
      actionLabel,
      onAction
    });
  };

  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputVal.trim();
    if (!text) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      priority: (priority as 'low' | 'medium' | 'high') || 'medium',
      createdAt: Date.now()
    };

    setTasks(prev => [newTask, ...prev]);
    setInputVal('');
    const priorityLabel = PRIORITY_OPTIONS.find(p => p.value === priority)?.tag || '';
    showToast('Đã thêm việc mới', `${text} (${priorityLabel})`);
  };

  const handleToggle = (id: string, completed: boolean) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, completed } : task))
    );
    const target = tasks.find(t => t.id === id);
    if (target && completed) {
      showToast('Đã hoàn thành', target.text);
    }
  };

  const handleDelete = (taskToDelete: Task) => {
    setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
    showToast('Đã xoá công việc', taskToDelete.text, 'Hoàn tác', () => {
      setTasks(prev => [taskToDelete, ...prev]);
      showToast('Đã khôi phục', taskToDelete.text);
    });
  };

  const handlePinComplete = async (code: string) => {
    if (code === SECRET_PIN) {
      setPinStatus('success');
      setTimeout(() => {
        const completedTotal = tasks.filter(t => t.completed).length;
        setTasks(prev => prev.filter(t => !t.completed));
        setPinStatus('idle');
        setPinKey(k => k + 1);
        showToast('Đã dọn dẹp thành công', `Đã xoá ${completedTotal} công việc đã hoàn thành`);
      }, 700);
    } else {
      setPinStatus('error');
      setTimeout(() => {
        setPinStatus('idle');
        setPinKey(k => k + 1);
      }, 1000);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getPriorityBadge = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high':
        return <span className="p-badge p-badge--high">Cao</span>;
      case 'medium':
        return <span className="p-badge p-badge--medium">Vừa</span>;
      case 'low':
        return <span className="p-badge p-badge--low">Thấp</span>;
    }
  };

  // Convert tasks into AnimatedList entries for Activity log
  const activityItems: AnimatedListEntry[] = tasks.map(t => ({
    id: t.id,
    icon: (
      <span className={`activity-icon-badge ${t.completed ? 'activity-icon-badge--done' : ''}`}>
        <HugeiconsIcon icon={t.completed ? CheckmarkCircle02Icon : Clock01Icon} size={16} />
      </span>
    ),
    title: t.text,
    description: t.completed ? 'Trạng thái: Đã hoàn thành' : `Ưu tiên: ${t.priority.toUpperCase()}`,
    meta: (
      <span className={`activity-status-pill ${t.completed ? 'activity-status-pill--done' : ''}`}>
        {t.completed ? 'Hoàn tất' : 'Đang xử lý'}
      </span>
    )
  }));

  return (
    <div className="todo-app-card">
      {/* App Brand Header */}
      <header className="brand-header">
        <div className="brand-title-wrap">
          <div className="brand-icon">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="brand-name">TaskFlow Green</h1>
            <p className="brand-tagline">Tông màu sáng · Điểm nhấn Xanh lá Emerald</p>
          </div>
        </div>
        <div className="brand-badge-pill">
          <span className="dot-pulse" />
          <span>{completedCount}/{tasks.length} Xong ({progressPercent}%)</span>
        </div>
      </header>

      {/* Component: Stepper (Chuyển đổi 3 phân hệ) */}
      <div className="stepper-section">
        <Stepper
          step={currentStep}
          onStepChange={step => setCurrentStep(step)}
          indicator="numbers"
          theme="light"
          accentColor="#10b981"
          frame={true}
          radius={18}
          width="100%"
          showFooter={false}
        >
          {/* STEP 1: QUẢN LÝ CÔNG VIỆC */}
          <Step title="Công việc" description="Danh sách & Thêm mới" icon={<HugeiconsIcon icon={Note01Icon} size={16} />}>
            <div className="step-content-pane">
              {/* Form thêm việc */}
              <form className="add-task-form" onSubmit={handleAddTask}>
                <div className="add-task-row">
                  <input
                    type="text"
                    className="add-task-input"
                    placeholder="Nhập việc cần làm... (Enter)"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                  />
                  {/* Component: GlideSelect */}
                  <GlideSelect
                    options={PRIORITY_OPTIONS}
                    value={priority}
                    onChange={val => setPriority(val)}
                    size="md"
                    radius={12}
                    surfaceColor="#ffffff"
                    accentColor="#10b981"
                    textColor="#0f172a"
                  />
                  <button type="submit" className="add-task-btn" disabled={!inputVal.trim()}>
                    <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={2.5} />
                    <span>Thêm</span>
                  </button>
                </div>
              </form>

              {/* Component: RubberSegment */}
              <div className="filter-segment-container">
                <RubberSegment
                  items={[
                    { value: 'all', label: `Tất cả (${tasks.length})` },
                    { value: 'active', label: `Đang làm (${tasks.length - completedCount})` },
                    { value: 'completed', label: `Đã xong (${completedCount})` }
                  ]}
                  value={filter}
                  onChange={val => setFilter(val as FilterType)}
                  trackColor="#f1f5f9"
                  thumbColor="#ffffff"
                  textColor="#64748b"
                  activeTextColor="#059669"
                  size="md"
                  radius={12}
                  inset={3}
                  equalSlots
                />
              </div>

              {/* Danh sách Task với SwipeRow & SpringCheck */}
              <div className="tasks-scroll-list">
                {filteredTasks.length === 0 ? (
                  <div className="tasks-empty-state">
                    <p>Không có công việc nào trong mục này</p>
                  </div>
                ) : (
                  filteredTasks.map(task => (
                    <SwipeRow
                      key={task.id}
                      actions={[
                        {
                          id: 'delete',
                          label: 'Xoá',
                          icon: <HugeiconsIcon icon={Delete02Icon} size={18} strokeWidth={2} />,
                          color: '#ef4444',
                          dismiss: true
                        }
                      ]}
                      onCommit={() => handleDelete(task)}
                      onAction={action => {
                        if (action.id === 'delete') handleDelete(task);
                      }}
                      rowColor="#ffffff"
                      drawerColor="#f8fafc"
                      actionColor="#ef4444"
                      textColor="#0f172a"
                      height={60}
                      radius={14}
                      actionWidth={76}
                      direction="left"
                      style={{ marginBottom: 10, boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.08)' }}
                    >
                      <div className="task-row-inner">
                        <SpringCheck
                          checked={task.completed}
                          onChange={checked => handleToggle(task.id, checked)}
                          label={task.text}
                          color="#0f172a"
                          fillColor="#10b981"
                          checkColor="#ffffff"
                          boxSize={22}
                          boxRadius={7}
                          fontSize={15}
                          bounce={0.25}
                          strike="left"
                        />
                        <div className="task-row-meta">
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>
                    </SwipeRow>
                  ))
                )}
              </div>
            </div>
          </Step>

          {/* STEP 2: TIẾN ĐỘ & NHẬT KÝ (ANIMATED LIST) */}
          <Step title="Nhật ký" description="Hoạt động gần đây" icon={<HugeiconsIcon icon={Clock01Icon} size={16} />}>
            <div className="step-content-pane">
              <div className="progress-summary-card">
                <div className="progress-bar-head">
                  <span className="progress-bar-title">Tiến độ hoàn thành</span>
                  <span className="progress-bar-num">{progressPercent}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="progress-caption">
                  Đã hoàn tất {completedCount} trên tổng số {tasks.length} công việc.
                </p>
              </div>

              {/* Component: AnimatedList */}
              <div className="animated-list-wrap">
                <h4 className="section-label">Danh sách hoạt động tương tác</h4>
                <AnimatedList
                  items={activityItems}
                  theme="light"
                  accentColor="#10b981"
                  animation="slide"
                  frame={true}
                  radius={16}
                  maxHeight={320}
                  onItemSelect={item => {
                    if (typeof item !== 'string') {
                      showToast('Hoạt động đã chọn', String(item.title));
                    }
                  }}
                />
              </div>
            </div>
          </Step>

          {/* STEP 3: XÁC THỰC MÃ PIN & DỌN DẸP (CODE SLOTS) */}
          <Step title="Bảo mật" description="Dọn dẹp PIN" icon={<HugeiconsIcon icon={SecurityCheckIcon} size={16} />}>
            <div className="step-content-pane">
              <div className="pin-feature-card">
                <div className="pin-feature-icon">
                  <HugeiconsIcon icon={SecurityCheckIcon} size={28} strokeWidth={2} />
                </div>
                <h3 className="pin-feature-title">Xác thực mã PIN bảo mật</h3>
                <p className="pin-feature-desc">
                  Nhập mã PIN <strong>1234</strong> để dọn dẹp {completedCount} công việc đã hoàn tất.
                </p>

                <div className="code-slots-panel">
                  <CodeSlots
                    key={pinKey}
                    length={4}
                    status={pinStatus}
                    onComplete={handlePinComplete}
                    onChange={() => setPinStatus('idle')}
                    accentColor="#10b981"
                    inkColor="#0f172a"
                    slotColor="#f1f5f9"
                    digitColor="#0f172a"
                    dangerColor="#ef4444"
                    slotSize={52}
                    gap={12}
                    radius={14}
                    bounce={0.25}
                  />
                </div>

                <div className="pin-hint-badge">
                  <span>💡 Gợi ý mã PIN mẫu: <strong>1234</strong></span>
                </div>
              </div>
            </div>
          </Step>
        </Stepper>
      </div>

      {/* Footer Navigation Switcher */}
      <footer className="stepper-nav-footer">
        <div className="step-switch-tabs">
          <button
            type="button"
            className={`step-tab-btn ${currentStep === 1 ? 'step-tab-btn--active' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            1. Việc cần làm
          </button>
          <button
            type="button"
            className={`step-tab-btn ${currentStep === 2 ? 'step-tab-btn--active' : ''}`}
            onClick={() => setCurrentStep(2)}
          >
            2. Nhật ký & Tiến độ
          </button>
          <button
            type="button"
            className={`step-tab-btn ${currentStep === 3 ? 'step-tab-btn--active' : ''}`}
            onClick={() => setCurrentStep(3)}
          >
            3. Dọn dẹp PIN
          </button>
        </div>
      </footer>

      {/* Component: SwipeToast (Light & Green Theme) */}
      <SwipeToast
        open={toast.open}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        title={toast.title}
        description={toast.desc}
        actionLabel={toast.actionLabel}
        onAction={toast.onAction}
        background="#ffffff"
        color="#0f172a"
        fuseColor="#10b981"
        duration={3500}
        radius={14}
        closeButton
      />
    </div>
  );
}

export default App;
