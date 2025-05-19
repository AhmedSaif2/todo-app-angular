import { Component, inject, OnInit } from '@angular/core';
import { NewTask } from '../tasks.model';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../tasks.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-new-task',
  imports: [FormsModule, LoadingSpinnerComponent],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css',
})
export class NewTaskComponent {
  constructor(private route: ActivatedRoute) {}
  defaultTask!: NewTask;
  public isLoading = false;
  ngOnInit(): void {
    this.defaultTask = {
      title: '',
      description: '',
      state: 'Pending',
      priority: 'Low',
      userId: '',
    };
  }
  newTask: NewTask = { ...this.defaultTask };
  private taskService = inject(TaskService);
  onAddTask() {
    this.newTask.userId = this.route.snapshot.paramMap.get('uid')!;
    if (!this.newTask.title || !this.newTask.description) {
      alert('Please fill in all fields');
      return;
    }
    this.isLoading = true;
    this.taskService.addNewTask(this.newTask).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => console.error(err),
    });
    this.newTask = { ...this.defaultTask };
  }
}
