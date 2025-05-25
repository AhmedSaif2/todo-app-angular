import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllTasksComponent } from './all-tasks.component';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, Subscription } from 'rxjs';
import { FirestoreService } from '../../../core/services/firestore.service';
import { Task } from '../tasks.model';
import { DestroyRef, inject } from '@angular/core';

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
    state: 'Completed',
    priority: 'High',
    userId: '123',
  },
];

const mockFireStore = {
  taskUpdates$: of(null),
  notifyTaskUpdated: jasmine.createSpy(),
  getTasks: jasmine.createSpy().and.returnValue(of(mockTasks)),
};

const mockActivatedRoutes = {
  snapshot: {
    paramMap: { get: () => '123' },
  },
};

describe('AllTasksComponent', () => {
  let component: AllTasksComponent;
  let fixture: ComponentFixture<AllTasksComponent>;
  let fireStore: FirestoreService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllTasksComponent],
      providers: [
        {
          provide: FirestoreService,
          useValue: mockFireStore,
        },
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoutes,
        },
        {
          provide: DestroyRef,
          useValue: {
            onDestroy: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AllTasksComponent);
    component = fixture.componentInstance;
    fireStore = TestBed.inject(FirestoreService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call notifiyTaskUpdated on init', () => {
    expect(fireStore.notifyTaskUpdated).toHaveBeenCalled();
  });
  it('should load tasks on init', () => {
    expect(fireStore.getTasks).toHaveBeenCalledWith('123');
    expect(component.isLoading).toBe(false);
  });
  it('should get pending tasks', () => {
    expect(component.pendingTasks.length).toEqual(1);
    expect(component.pendingTasks[0].state).toEqual('Pending');
  });
  it('should get completed tasks', () => {
    expect(component.completedTasks.length).toEqual(1);
    expect(component.completedTasks[0].state).toEqual('Completed');
  });
  it('should load on change', () => {
    component.onTaskChanged();
    expect(fireStore.getTasks).toHaveBeenCalledWith('123');
  });
});
