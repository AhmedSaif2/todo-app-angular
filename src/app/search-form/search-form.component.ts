import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-form',
  imports: [FormsModule],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.css',
})
export class SearchFormComponent {
  searchText = '';
  priority = true;
  @Output() search = new EventEmitter<string>();
  @Output() priorityToggle = new EventEmitter<boolean>();
  onSearchTextChange() {
    console.log(this.search);
    this.search.emit(this.searchText);
  }
  onPriorityChange() {
    this.priority = !this.priority;
    this.priorityToggle.emit(!this.priority);
  }
}
