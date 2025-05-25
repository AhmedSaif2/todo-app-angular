import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Task } from '../tasks.model';
import { TaskComponent } from './task.component';
import { of } from 'rxjs';
import { createPlatform } from '@angular/core';
import { StatusChangeEvent } from '@angular/forms';

// Mock Tasks
const mockTask: Task = {
  id: '1',
  title: 'Task 1',
  description: 'Description 1',
  state: 'Pending',
  priority: 'Low',
  userId: '123',
};
const mockFireStore = {
  taskUpdates$: of(null),
  notifyTaskUpdated: jasmine.createSpy(),
  deleteTask: jasmine.createSpy().and.returnValue(of(0)),
  updateTask: jasmine.createSpy().and.returnValue(of(0)),
};

describe('task-list component', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let fireStore: FirestoreService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskComponent],
      providers: [
        {
          provide: FirestoreService,
          useValue: mockFireStore,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    component.task = mockTask;
    fireStore = TestBed.inject(FirestoreService);
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log(component);
    expect(component).toBeTruthy();
  });
  it('should delete task', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.onDeleteTask();
    expect(mockFireStore.deleteTask).toHaveBeenCalled();
    expect(mockFireStore.notifyTaskUpdated).toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this task?'
    );
  });
  it('should change state', () => {
    component.onChangeState();
    expect(mockFireStore.updateTask).toHaveBeenCalled();
    expect(mockFireStore.notifyTaskUpdated).toHaveBeenCalled();
  });
});
