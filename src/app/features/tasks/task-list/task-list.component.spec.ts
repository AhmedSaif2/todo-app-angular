import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Task } from '../tasks.model';
import { TasksComponent } from './task-list.component';
import { of } from 'rxjs';
import { createPlatform } from '@angular/core';
import { StatusChangeEvent } from '@angular/forms';

// Mock Tasks
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    state: 'Pending',
    priority: 'Low',
    userId: '123',
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    state: 'Pending',
    priority: 'High',
    userId: '123',
  },
];

const mockFireStore = {
  taskUpdates$: of(null),
  notifyTaskUpdated: jasmine.createSpy(),
  updateTask: jasmine.createSpy().and.returnValue(of(0)),
};

describe('task-list component', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        {
          provide: FirestoreService,
          useValue: mockFireStore,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    component.tasks = [...mockTasks];
    component.taskState = 'Pending';
    fixture.detectChanges();
  });
  afterEach(() => {
    mockFireStore.updateTask.calls.reset();
    mockFireStore.notifyTaskUpdated.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(' should change tasks on search', () => {
    component.onSearch('Task 1');
    console.log(component.searchText);
    expect(component.localTasks.length).toEqual(1);
  });

  it(' should change tasks on priority', () => {
    component.onSort(false);
    expect(component.localTasks[0].priority).toEqual('High');
    expect(component.localTasks[1].priority).toEqual('Low');

    component.onSort(true);
    expect(component.localTasks[0].priority).toEqual('Low');
    expect(component.localTasks[1].priority).toEqual('High');
  });

  it('should change state on drop', () => {
    let mockTask = { ...mockTasks[0], state: 'Completed' };

    let mockEvent = {
      dataTransfer: {
        getData: jasmine.createSpy().and.returnValue(JSON.stringify(mockTask)),
      },
      preventDefault: jasmine.createSpy(),
    };
    component.onDrop(mockEvent as unknown as DragEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockFireStore.updateTask).toHaveBeenCalledWith(
      '1',
      'Pending',
      '123'
    );
    expect(mockFireStore.notifyTaskUpdated).toHaveBeenCalled();
  });
  it('should do nothing on drop within the same state', () => {
    let mockTask = { ...mockTasks[0], state: 'Pending' };
    let mockEvent = {
      dataTransfer: {
        getData: jasmine.createSpy().and.returnValue(JSON.stringify(mockTask)),
      },
      preventDefault: jasmine.createSpy(),
    };
    component.onDrop(mockEvent as unknown as DragEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockFireStore.updateTask).not.toHaveBeenCalled();
    expect(mockFireStore.notifyTaskUpdated).not.toHaveBeenCalled();
  });
});
