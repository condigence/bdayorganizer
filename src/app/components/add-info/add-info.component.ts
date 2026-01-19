import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Person } from '../../models/person';
import { PersonService } from '../../services/person.service';

@Component({
  selector: 'app-add-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-info.component.html',
  styleUrl: './add-info.component.css'
})
export class AddInfoComponent implements OnInit {
  person: Person = {
    name: '',
    nickName: '',
    dob: new Date(),
    image: ''
  };

  imagePreview: string = '';
  personList: Person[] = [];
  editingIndex: number = -1;
  isEditMode: boolean = false;
  formErrors: { [key: string]: string } = {};

  constructor(private personService: PersonService) {}

  ngOnInit(): void {
    this.resetForm();
    this.personService.personList$.subscribe((list) => {
      this.personList = list;
    });
  }

  onImageSelected(event: any) {
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

  savePersonInfo() {
    // Reset errors
    this.formErrors = {};
    
    // Validation
    if (!this.person.name || this.person.name.trim() === '') {
      this.formErrors['name'] = 'Name is required';
    }
    if (!this.person.dob) {
      this.formErrors['dob'] = 'Date of Birth is required';
    }
    
    // If there are errors, show them and return
    if (Object.keys(this.formErrors).length > 0) {
      return;
    }
    
    if (this.isEditMode && this.editingIndex !== -1) {
      // Update existing person
      this.personService.updatePerson(this.editingIndex, { ...this.person });
      alert('Person updated successfully!');
    } else {
      // Add new person
      this.personService.addPerson({ ...this.person });
      alert('Person added successfully!');
    }
    this.resetForm();
  }

  resetForm() {
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

  editPerson(index: number, person: Person) {
    // Find the index in the original personList
    const actualIndex = this.personList.findIndex(
      (p) => p.name === person.name && new Date(p.dob).getTime() === new Date(person.dob).getTime()
    );
    
    if (actualIndex !== -1) {
      this.person = { ...person };
      this.imagePreview = person.image;
      this.editingIndex = actualIndex;
      this.isEditMode = true;
      this.formErrors = {};
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('Could not find person to edit. Please try again.');
    }
  }

  deletePerson(index: number) {
    if (confirm('Are you sure you want to delete this person?')) {
      this.personService.deletePerson(index);
    }
  }
}
