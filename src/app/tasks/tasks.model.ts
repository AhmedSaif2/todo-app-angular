export interface Task {
  id: string;
  title: string;
  description: string;
  state: 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

export interface NewTask {
  title: string;
  description: string;
  state: 'Pending' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}
