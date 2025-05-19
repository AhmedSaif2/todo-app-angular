import { Injectable } from '@angular/core';
import { NewTask, Task } from './tasks.model';
import { from, map, Observable } from 'rxjs';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  updateDoc,
} from '@angular/fire/firestore';
import { addDoc, deleteDoc, DocumentReference } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private firestore: Firestore) {}

  getTasks(): Observable<Task[]> {
    const tasksCollection = collection(this.firestore, 'tasks');
    return collectionData(tasksCollection, { idField: 'id' }) as Observable<
      Task[]
    >;
  }

  public addNewTask(newTask: NewTask): Observable<DocumentReference> {
    return from(addDoc(collection(this.firestore, 'tasks'), newTask));
  }
  public deleteTask(id: string): Observable<void> {
    return from(deleteDoc(doc(this.firestore, 'tasks', id)));
  }
  public updateTask(
    id: string,
    newState: 'Pending' | 'Completed'
  ): Observable<void> {
    return from(
      updateDoc(doc(this.firestore, 'tasks', id), { state: newState })
    );
  }
  public searchTasks(
    searchText: string,
    state: 'Pending' | 'Completed',
    userId: string
  ): Observable<Task[]> {
    return this.getTasks().pipe(
      map((tasks) =>
        tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchText.toLowerCase()) &&
            task.state === state &&
            task.userId === userId
        )
      )
    );
  }
  public sortTasks(
    sortType: boolean,
    state: 'Pending' | 'Completed',
    userId: string
  ): Observable<Task[]> {
    const priorityOrder = ['High', 'Medium', 'Low'];
    return this.getTasks().pipe(
      map((tasks) =>
        tasks
          .sort((a, b) =>
            sortType
              ? priorityOrder.indexOf(a.priority) -
                priorityOrder.indexOf(b.priority)
              : priorityOrder.indexOf(b.priority) -
                priorityOrder.indexOf(a.priority)
          )
          .filter((task) => task.state === state && task.userId === userId)
      )
    );
  }
}
