import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchFormComponent } from './search-form.component';
import { FormsModule } from '@angular/forms';
import { input } from '@angular/core';

describe('SearchFormComponent', () => {
  let component: SearchFormComponent;
  let fixture: ComponentFixture<SearchFormComponent>;
  let inputElement: HTMLInputElement;
  let priorityButton: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFormComponent);
    component = fixture.componentInstance;
    inputElement = fixture.nativeElement.querySelector('input');
    priorityButton = fixture.nativeElement.querySelector('.sort');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search event when input changes', () => {
    let searchEvent = spyOn(component.search, 'emit');
    inputElement.value = 'test search';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.searchText).toBe('test search');
    expect(searchEvent).toHaveBeenCalledWith('test search');
  });

  //   it('should emit priorityToggle event when priority button is clicked', () => {
  //     expect(priorityToggleEvent).toHaveBeenCalledTimes(1);
  //     expect(priorityToggleEvent).toHaveBeenCalledWith(true);
  //   });

  it('should toggle priority when priority button is clicked', () => {
    expect(component.priority).toBe(true);
    priorityButton.click();
    fixture.detectChanges();
    expect(component.priority).toBe(false);
  });
});
