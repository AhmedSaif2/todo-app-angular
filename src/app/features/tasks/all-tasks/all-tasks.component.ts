import { Component, DestroyRef, inject } from '@angular/core';
import { TasksComponent } from '../task-list/task-list.component';
import { Task } from '../tasks.model';
import { FirestoreService } from '../../../core/services/firestore.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-all-tasks',
  imports: [TasksComponent],
  templateUrl: './all-tasks.component.html',
  styleUrl: './all-tasks.component.css',
})
export class AllTasksComponent {
  private route = inject(ActivatedRoute);
  private fireStore = inject(FirestoreService);
  private destroyRef = inject(DestroyRef);
  isLoading = false;
  tasks: Task[] = [];
  ngOnInit(): void {
    this.isLoading = true;
    this.fireStore.taskUpdates$.subscribe(() => this.loadTasks());
    this.fireStore.notifyTaskUpdated();
  }
  get pendingTasks() {
    return this.tasks.filter((task: Task) => task.state === 'Pending');
  }
  get completedTasks() {
    return this.tasks.filter((task: Task) => task.state === 'Completed');
  }
  onTaskChanged() {
    this.loadTasks();
  }
  loadTasks() {
    const userId = this.route.snapshot.paramMap.get('uid');
    const subscription = this.fireStore.getTasks(userId!).subscribe((tasks) => {
      this.tasks = tasks;
      this.isLoading = false;
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}
