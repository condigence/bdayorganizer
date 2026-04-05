import { Routes } from '@angular/router';
import { AddPersonComponent } from './components/add-person/add-person.component';
import { ListPersonComponent } from './components/list-person/list-person.component';

export const routes: Routes = [
  { path: 'add', component: AddPersonComponent },
  { path: '', component: ListPersonComponent }
];
