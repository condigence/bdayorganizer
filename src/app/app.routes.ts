import { Routes } from '@angular/router';
import { AddInfoComponent } from './components/add-info/add-info.component';
import { ListInfoComponent } from './components/list-info/list-info.component';

export const routes: Routes = [
  { path: 'add', component: AddInfoComponent },
  { path: '', component: ListInfoComponent }
];
