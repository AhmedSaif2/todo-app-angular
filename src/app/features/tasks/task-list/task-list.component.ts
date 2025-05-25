import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '../tasks.model';
import { ActivatedRoute } from '@angular/router';
import { TaskComponent } from '../task/task.component';
import { SearchFormComponent } from '../../../shared/components/search-form/search-form.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FirestoreService } from '../../../core/services/firestore.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-tasks',
  imports: [
    TaskComponent,
    FormsModule,
    SearchFormComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css',
})
export class TasksComponent {
  @Input({ required: true }) tasks!: Task[];
  @Input({ required: true }) taskState!: 'Pending' | 'Completed';
  @Input({ required: true }) isLoading!: boolean;
  @Output() taskChanged = new EventEmitter<void>();
  searchText = '';
  private fireStore = inject(FirestoreService);
  sortType = true;

  get localTasks() {
    const priorityOrder = ['High', 'Medium', 'Low'];
    return this.tasks
      .filter((task) => task.title.includes(this.searchText))
      .sort((a, b) =>
        this.sortType
          ? priorityOrder.indexOf(a.priority) -
            priorityOrder.indexOf(b.priority)
          : priorityOrder.indexOf(b.priority) -
            priorityOrder.indexOf(a.priority)
      );
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const droppedData = event.dataTransfer?.getData('text/plain');
    if (!droppedData) return;

    const task: Task = JSON.parse(droppedData);

    if (task.state === this.taskState) return;

    this.fireStore
      .updateTask(task.id, this.taskState, task.userId)
      .subscribe(() => this.fireStore.notifyTaskUpdated());
  }

  onSearch(text: string) {
    this.searchText = text;
  }
  onSort(sortType: boolean) {
    this.sortType = !sortType;
  }
}
