import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { TasksComponent } from './tasks/tasks.component';
import { NewTaskComponent } from './tasks/new-task/new-task.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, TasksComponent, NewTaskComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'todo-angular';
}
