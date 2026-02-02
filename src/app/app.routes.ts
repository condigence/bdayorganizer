import { Routes } from '@angular/router';
import { AddInfoComponent } from './components/add-info/add-info.component';
import { ListInfoComponent } from './components/list-info/list-info.component';
import { UpcomingBirthdaysComponent } from './components/upcoming-birthdays/upcoming-birthdays.component';
import { TodaysBirthdaysComponent } from './components/todays-birthdays/todays-birthdays.component';
import { BirthdayCalendarComponent } from './components/birthday-calendar/birthday-calendar.component';

export const routes: Routes = [
  { path: 'add', component: AddInfoComponent },
  { path: 'upcoming', component: UpcomingBirthdaysComponent },
  { path: 'today', component: TodaysBirthdaysComponent },
  { path: 'calendar', component: BirthdayCalendarComponent },
  { path: '', component: ListInfoComponent }
];
