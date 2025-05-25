import { Component, inject, OnInit } from '@angular/core';
import { NewTask } from '../tasks.model';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FirestoreService } from '../../../core/services/firestore.service';

@Component({
  selector: 'app-new-task',
  imports: [FormsModule, LoadingSpinnerComponent],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css',
})
export class NewTaskComponent {
  constructor(private route: ActivatedRoute) {}
  defaultTask!: NewTask;
  isLoading = false;
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
  private fireStore = inject(FirestoreService);
  onAddTask() {
    this.newTask.userId = this.route.snapshot.paramMap.get('uid')!;
    if (!this.newTask.title || !this.newTask.description) {
      alert('Please fill in all fields');
      return;
    }
    this.isLoading = true;
    this.fireStore.addNewTask(this.newTask).subscribe({
      next: () => {
        this.isLoading = false;
        this.fireStore.notifyTaskUpdated();
        this.newTask = { ...this.defaultTask };
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      },
    });
  }
}
