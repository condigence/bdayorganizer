import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Person } from '../../models/person';
import { PersonService } from '../../services/person.service';

@Component({
  selector: 'app-list-info',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list-info.component.html',
  styleUrl: './list-info.component.css'
})
export class ListInfoComponent implements OnInit, OnDestroy {
  personList: Person[] = [];
  filteredList: Person[] = [];
  searchQuery: string = '';
  sortBy: string = 'name';
  showForm: boolean = false;
  isEditMode: boolean = false;
  editingIndex: number = -1;
  isLoading: boolean = false;
  formErrors: { [key: string]: string } = {};

  person: Person = {
    name: '',
    nickName: '',
    dob: new Date(),
    image: ''
  };

  imagePreview: string = '';

  constructor(private personService: PersonService) {}

  ngOnInit(): void {
    this.resetForm();
    // Subscribe to personList$ to get data changes
    this.personService.personList$.subscribe((list) => {
      console.log('ListInfo received persons:', list);
      this.personList = list;
      this.filterAndSort();
    });
    // Initial load from backend/assets
    this.refreshData();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  refreshData(): void {
    this.isLoading = true;
    this.personService.loadPersonList();
    // Set timeout to give async operations time to complete
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }


  filterAndSort(): void {
    let filtered = this.personList.filter(p =>
      p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (p.nickName && p.nickName.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );

    filtered.sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (this.sortBy === 'name-reverse') {
        return b.name.localeCompare(a.name);
      } else if (this.sortBy === 'dob') {
        return new Date(a.dob).getTime() - new Date(b.dob).getTime();
      }
      return 0;
    });

    this.filteredList = filtered;
  }

  onSearch(): void {
    this.filterAndSort();
  }

  onSortChange(): void {
    this.filterAndSort();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  openAddForm(): void {
    this.showForm = true;
    this.resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.person.image = e.target.result;
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  savePersonInfo(): void {
    if (this.person.name.trim() === '') {
      alert('Please enter a name');
      return;
    }

    if (this.isEditMode && this.editingIndex !== -1) {
      this.personService.updatePerson(this.editingIndex, { ...this.person });
      alert('Person updated successfully!');
    } else {
      this.personService.addPerson({ ...this.person });
      alert('Person added successfully!');
    }
    this.resetForm();
    this.showForm = false;
    setTimeout(() => {
      this.refreshData();
    }, 500);
  }

  editPerson(person: Person): void {
    // Find the index in the original personList, not the filtered list
    const actualIndex = this.personList.findIndex(
      (p) => p.name === person.name && new Date(p.dob).getTime() === new Date(person.dob).getTime()
    );
    
    if (actualIndex !== -1) {
      this.person = { ...person };
      this.imagePreview = person.image;
      this.editingIndex = actualIndex;
      this.isEditMode = true;
      this.showForm = true;
      this.formErrors = {};
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Could not find person to edit. Please try again.');
    }
  }

  deletePerson(index: number): void {
    if (confirm('Are you sure you want to delete this person?')) {
      this.personService.deletePerson(index);
      setTimeout(() => {
        this.refreshData();
      }, 500);
    }
  }

  deletePersonByObject(person: Person): void {
    if (confirm('Are you sure you want to delete this person?')) {
      // Find the actual index in the full personList
      const actualIndex = this.personList.findIndex(p => 
        p.name === person.name && 
        new Date(p.dob).getTime() === new Date(person.dob).getTime()
      );
      
      if (actualIndex !== -1) {
        this.personService.deletePerson(actualIndex);
        // Don't call refreshData() - service already updates the subject
      } else {
        alert('Could not find person to delete. Please try again.');
      }
    }
  }

  resetForm(): void {
    this.person = {
      name: '',
      nickName: '',
      dob: new Date(),
      image: ''
    };
    this.imagePreview = '';
    this.editingIndex = -1;
    this.isEditMode = false;
  }

  calculateAge(dob: Date | string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
