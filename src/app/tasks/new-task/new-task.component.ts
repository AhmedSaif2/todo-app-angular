import { Component, inject, OnInit } from '@angular/core';
import { NewTask } from '../tasks.model';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../tasks.service';

@Component({
  selector: 'app-new-task',
  imports: [FormsModule],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css',
})
export class NewTaskComponent {
  readonly defaultTask: NewTask = {
    title: '',
    description: '',
    state: 'Pending',
    priority: 'Low',
  };
  newTask: NewTask = { ...this.defaultTask };
  private taskService = inject(TaskService);
  onAddTask() {
    if (!this.newTask.title || !this.newTask.description) {
      alert('Please fill in all fields');
      return;
    }
    this.taskService.addNewTask(this.newTask).subscribe({
      next: () => console.log('Task added successfully'),
      error: (err) => console.error(err),
    });
  }
}
