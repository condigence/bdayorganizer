import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Person } from '../../models/person';
import { PersonService } from '../../services/person.service';

interface BirthdayInfo {
  person: Person;
  nextBirthday: Date;
  daysUntil: number;
  age: number;
}

@Component({
  selector: 'app-upcoming-birthdays',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './upcoming-birthdays.component.html',
  styleUrl: './upcoming-birthdays.component.css'
})
export class UpcomingBirthdaysComponent implements OnInit, OnDestroy {
  upcomingBirthdays: BirthdayInfo[] = [];
  personList: Person[] = [];
  daysFilter: number = 30;
  isLoading: boolean = false;

  constructor(private personService: PersonService) {}

  ngOnInit(): void {
    this.personService.personList$.subscribe((list: Person[]) => {
      this.personList = list;
      this.updateUpcomingBirthdays();
    });
    this.refreshData();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  refreshData(): void {
    this.isLoading = true;
    this.personService.loadPersonList();
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  updateUpcomingBirthdays(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birthdays: BirthdayInfo[] = this.personList
      .map(person => {
        const nextBday = this.getNextBirthday(person.dob);
        const daysUntil = this.daysUntil(nextBday);
        const age = this.calculateAge(person.dob);
        
        return {
          person,
          nextBirthday: nextBday,
          daysUntil,
          age
        };
      })
      .filter(item => item.daysUntil >= 0 && item.daysUntil <= this.daysFilter)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    this.upcomingBirthdays = birthdays;
  }

  getNextBirthday(dob: Date | string): Date {
    const dobDate = new Date(dob);
    const today = new Date();
    const nextBday = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
    
    if (nextBday < today) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }
    
    return nextBday;
  }

  daysUntil(date: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const givenDate = new Date(date);
    givenDate.setHours(0, 0, 0, 0);
    const diffTime = givenDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  onDaysFilterChange(): void {
    this.updateUpcomingBirthdays();
  }

  getDaysUntilText(days: number): string {
    if (days === 0) return 'Today! 🎉';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  }

  getBirthdayEmoji(days: number): string {
    if (days === 0) return '🎂';
    if (days <= 7) return '🎈';
    if (days <= 14) return '🎁';
    return '📅';
  }
}

