import { Component } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { TasksComponent } from './features/tasks/task-list/tasks.component';
import { NewTaskComponent } from './features/tasks/new-task/new-task.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'todo-angular';
}
