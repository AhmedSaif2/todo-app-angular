import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { TaskComponent } from './task/task.component';
import { TaskService } from './tasks.service';
import { FormsModule } from '@angular/forms';
import { Task } from './tasks.model';
import { SearchFormComponent } from '../search-form/search-form.component';
import { ActivatedRoute } from '@angular/router';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-tasks',
  imports: [TaskComponent, FormsModule, SearchFormComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit {
  @Input({ required: true }) taskState!: 'Pending' | 'Completed';
  private route = inject(ActivatedRoute);
  searchText = '';
  private taskService = inject(TaskService);
  private destroyRef = inject(DestroyRef);
  tasks: Task[] = [];
  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('uid');
    const subscription = this.taskService.getTasks().subscribe((next) => {
      return (this.tasks = next.filter(
        (task) => task.state === this.taskState && task.userId === userId
      ));
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const droppedData = event.dataTransfer?.getData('text/plain');
    console.log(droppedData);

    if (!droppedData) return;
    const task: Task = JSON.parse(droppedData);

    if (task.state == this.taskState) return;

    // this.taskService.updateTask(task.id, this.taskState);
    this.taskService.updateTask(task.id, this.taskState).subscribe({
      next: () => console.log('Task Updated Successfully'),
      error: (err) => console.error(err),
    });
  }
  onSearch(text: string) {
    this.taskService
      .searchTasks(
        text,
        this.taskState,
        this.route.snapshot.paramMap.get('uid')!
      )
      .subscribe({
        next: (tasks) => (this.tasks = tasks),
        error: (err) => console.error(err),
      });
  }
  onSort(sortType: boolean) {
    this.taskService
      .sortTasks(
        sortType,
        this.taskState,
        this.route.snapshot.paramMap.get('uid')!
      )
      .subscribe({
        next: (tasks) => (this.tasks = tasks),
        error: (err) => console.error(err),
      });
  }
}
