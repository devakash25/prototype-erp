import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Filter, CheckCircle, XCircle, Clock, AlertCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  IN_PROGRESS: <AlertCircle className="h-4 w-4" />,
  APPROVED: <CheckCircle className="h-4 w-4" />,
  REJECTED: <XCircle className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  LEAVE: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  EXPENSE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  PURCHASE: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  EVENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  HIRING: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  GENERAL: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-yellow-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500',
};

const STATUSES = ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];

interface WorkflowAction {
  id: string;
  action: string;
  comments: string;
  createdAt: string;
  performedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Workflow {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
  };
  actions: WorkflowAction[];
}

const FILTER_STATUSES = ['ALL', ...STATUSES];

export function AdminWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/administrative/workflows');
      setWorkflows(res.data);
    } catch (err) {
      console.error('Failed to fetch workflows', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/administrative/workflows/${id}`, { status });
      fetchWorkflows();
    } catch (err) {
      console.error('Failed to update workflow status', err);
    }
  };

  const filteredWorkflows = filterStatus === 'ALL'
    ? workflows
    : workflows.filter((w) => w.status === filterStatus);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStepIndex = (status: string) => {
    const steps = ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'COMPLETED'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflows</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage approval workflows</p>
          </div>
          <Link
            to="/administrative"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />
          {FILTER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {status === 'ALL' ? 'All' : status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredWorkflows.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No workflows found</p>
            </div>
          ) : (
            filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[workflow.type] || TYPE_COLORS.GENERAL)}>
                        {workflow.type}
                      </span>
                      <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[workflow.status])}>
                        {STATUS_ICONS[workflow.status]}
                        {workflow.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span className={cn('text-xs font-medium', PRIORITY_COLORS[workflow.priority])}>
                        {workflow.priority}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{workflow.title}</h3>
                    {workflow.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{workflow.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Created by {workflow.creator.firstName} {workflow.creator.lastName}</span>
                  <span>{formatDate(workflow.createdAt)}</span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-1">
                    {['PENDING', 'IN_PROGRESS', 'APPROVED', 'COMPLETED'].map((step, index) => {
                      const currentStep = getStepIndex(workflow.status);
                      const isCompleted = index <= currentStep && workflow.status !== 'REJECTED' && workflow.status !== 'CANCELLED';
                      const isCurrent = index === currentStep && workflow.status !== 'REJECTED' && workflow.status !== 'CANCELLED';
                      return (
                        <div key={step} className="flex items-center">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all',
                              isCompleted
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : isCurrent
                                ? 'bg-white dark:bg-gray-700 border-blue-600 text-blue-600'
                                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                            )}
                          >
                            {index + 1}
                          </div>
                          {index < 3 && (
                            <div className={cn(
                              'w-8 h-0.5 mx-1',
                              isCompleted ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            )} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {workflow.actions && workflow.actions.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Actions</p>
                    <div className="space-y-2">
                      {workflow.actions.slice(-2).map((action) => (
                        <div key={action.id} className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {action.performedBy.firstName} {action.performedBy.lastName}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {action.action.toLowerCase().replace('_', ' ')}
                          </span>
                          {action.comments && (
                            <span className="text-gray-500 dark:text-gray-400 italic">
                              - {action.comments}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workflow.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => updateStatus(workflow.id, 'IN_PROGRESS')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Clock className="h-3 w-3" />
                      Start Review
                    </button>
                    <button
                      onClick={() => updateStatus(workflow.id, 'APPROVED')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(workflow.id, 'REJECTED')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                )}

                {workflow.status === 'IN_PROGRESS' && (
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => updateStatus(workflow.id, 'APPROVED')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(workflow.id, 'REJECTED')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                )}

                {workflow.status === 'APPROVED' && (
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => updateStatus(workflow.id, 'COMPLETED')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Mark Complete
                    </button>
                    <button
                      onClick={() => updateStatus(workflow.id, 'CANCELLED')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <XCircle className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}