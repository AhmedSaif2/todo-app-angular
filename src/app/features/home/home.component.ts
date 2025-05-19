import { Component } from '@angular/core';
import { TasksComponent } from '../tasks/task-list/tasks.component';
import { NewTaskComponent } from '../tasks/new-task/new-task.component';

@Component({
  selector: 'app-home',
  imports: [TasksComponent, NewTaskComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
