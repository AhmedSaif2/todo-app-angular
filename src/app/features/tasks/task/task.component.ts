import { afterNextRender, Component, inject, Input } from '@angular/core';
import { Task } from '../tasks.model';
import { TaskService } from '../tasks.service';

@Component({
  selector: 'app-task',
  imports: [],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
})
export class TaskComponent {
  @Input({ required: true }) task!: Task;
  private taskService = inject(TaskService);
  onDeleteTask() {
    if (confirm('Are you sure you want to delete this task?')) {
      // Assuming there's a service to handle task deletion
      this.taskService.deleteTask(this.task.id).subscribe({
        next: () => console.log('Task Deleted.'),
        error: (err) => console.error(err),
      });
      console.log('Task Deleted.');
    }
  }
  onChangeState() {
    this.taskService
      .updateTask(
        this.task.id,
        this.task.state === 'Pending' ? 'Completed' : 'Pending'
      )
      .subscribe({
        next: () => console.log('Task Updated Successfully'),
        error: (err) => console.error(err),
      });
  }
  onDragStart(event: DragEvent, task: Task) {
    event.dataTransfer?.setData('text/plain', JSON.stringify(task));
  }
}
