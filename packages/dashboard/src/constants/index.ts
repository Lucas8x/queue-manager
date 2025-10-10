import {
  AlertCircle,
  CheckCircle,
  CircleQuestionMark,
  Clock,
  Loader2,
} from 'lucide-vue-next';

export const STATUS_CONFIG: Record<
  string,
  {
    icon: typeof Clock;
    label: string;
    color: string;
    iconColor: string;
  }
> = {
  running: {
    icon: Loader2,
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconColor: 'text-yellow-600',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    label: 'Failed',
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600',
  },
  unknown: {
    icon: CircleQuestionMark,
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconColor: 'text-gray-600',
  },
} as const;
