import { Component } from '@angular/core';
import { NewTaskComponent } from '../../features/tasks/new-task/new-task.component';
import { AllTasksComponent } from '../../features/tasks/all-tasks/all-tasks.component';
@Component({
  selector: 'app-home',
  imports: [NewTaskComponent, AllTasksComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
