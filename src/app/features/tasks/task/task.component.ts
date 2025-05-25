import { Component, inject, Input } from '@angular/core';
import { Task } from '../tasks.model';
import { FirestoreService } from '../../../core/services/firestore.service';

@Component({
  selector: 'app-task',
  imports: [],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
})
export class TaskComponent {
  @Input({ required: true }) task!: Task;
  private fireStore = inject(FirestoreService);
  onDeleteTask() {
    if (confirm('Are you sure you want to delete this task?')) {
      // Assuming there's a service to handle task deletion
      this.fireStore.deleteTask(this.task.id).subscribe({
        next: () => this.fireStore.notifyTaskUpdated(),
      });
    }
  }
  onChangeState() {
    this.fireStore
      .updateTask(
        this.task.id,
        this.task.state === 'Pending' ? 'Completed' : 'Pending',
        this.task.userId
      )
      .subscribe({
        next: () => this.fireStore.notifyTaskUpdated(),
      });
  }
  onDragStart(event: DragEvent, task: Task) {
    event.dataTransfer?.setData('text/plain', JSON.stringify(task));
  }
}
