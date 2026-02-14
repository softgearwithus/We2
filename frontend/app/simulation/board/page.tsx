'use client';

import { useState } from 'react';

export default function KanbanBoard() {
    const [tasks, setTasks] = useState([
        { id: 'T-101', title: 'Fix navigation bar z-index issue', type: 'bug', status: 'To Do', priority: 'High', assignee: 'JD' },
        { id: 'T-102', title: 'Implement Auth0 integration', type: 'story', status: 'In Progress', priority: 'Critical', assignee: 'Me' },
        { id: 'T-103', title: 'Update dependencies to latest', type: 'task', status: 'Done', priority: 'Low', assignee: 'JD' },
        { id: 'T-104', title: 'Refactor user service', type: 'task', status: 'To Do', priority: 'Medium', assignee: 'Unassigned' },
        { id: 'T-105', title: 'Add dark mode support', type: 'story', status: 'In Progress', priority: 'High', assignee: 'Me' },
    ]);

    const columns = ['To Do', 'In Progress', 'Code Review', 'Done'];

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'Critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
            case 'High': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
            case 'Medium': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
        }
    };

    const onDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('taskId', id);
    };

    const onDrop = (e: React.DragEvent, status: string) => {
        const id = e.dataTransfer.getData('taskId');
        setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Sprint 24 Board</h1>
                    <p className="text-gray-400 text-sm">Acme Corp / Frontend Team</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-[#1e1e1e] flex items-center justify-center text-xs font-bold">JD</div>
                        <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-[#1e1e1e] flex items-center justify-center text-xs font-bold">Me</div>
                        <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-[#1e1e1e] flex items-center justify-center text-xs font-bold">+3</div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold text-sm transition-colors">
                        Create Issue
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
                {columns.map(col => (
                    <div
                        key={col}
                        className="min-w-[300px] bg-[#252526] rounded-xl flex flex-col h-full border border-[#333]"
                        onDrop={(e) => onDrop(e, col)}
                        onDragOver={onDragOver}
                    >
                        <div className="p-4 border-b border-[#333] flex items-center justify-between">
                            <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider">{col}</h3>
                            <span className="bg-[#333] px-2 py-0.5 rounded text-xs text-gray-400 font-mono">
                                {tasks.filter(t => t.status === col).length}
                            </span>
                        </div>

                        <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                            {tasks.filter(t => t.status === col).map(task => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, task.id)}
                                    className="bg-[#2d2d2d] p-4 rounded-lg border border-[#3e3e3e] shadow-sm hover:border-gray-500 cursor-grab hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-mono text-gray-500 group-hover:text-blue-400 transition-colors">{task.id}</span>
                                        <div className="w-6 h-6 rounded-full bg-purple-900 text-purple-200 flex items-center justify-center text-[10px] font-bold border border-purple-700">
                                            {task.assignee}
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-medium text-gray-200 mb-4 leading-snug">{task.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${getPriorityColor(task.priority)} font-bold uppercase`}>
                                            {task.priority}
                                        </span>
                                        {task.type === 'bug' && (
                                            <span className="text-[10px] px-2 py-0.5 rounded border bg-red-900/20 text-red-400 border-red-900/30 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">bug_report</span> Bug
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
