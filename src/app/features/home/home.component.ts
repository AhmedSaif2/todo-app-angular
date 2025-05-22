import { Component } from '@angular/core';
import { TasksComponent } from '../tasks/task-list/task-list.component';
import { NewTaskComponent } from '../tasks/new-task/new-task.component';
import { AllTasksComponent } from '../tasks/all-tasks/all-tasks.component';

@Component({
  selector: 'app-home',
  imports: [NewTaskComponent, AllTasksComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
