import { Task } from './tasks.model';

export const dummyTasks: Task[] = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description for Task 1',
    state: 'Pending',
    priority: 'High',
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description for Task 2',
    state: 'Pending',
    priority: 'Medium',
  },
  {
    id: '3',
    title: 'Task 3',
    description: 'Description for Task 3',
    state: 'Completed',
    priority: 'Low',
  },
];
