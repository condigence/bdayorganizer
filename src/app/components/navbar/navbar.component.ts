import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Person } from '../../models/person';
import { PersonService } from '../../services/person.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  upcomingBdays: Person[] = [];
  recentBdays: Person[] = [];
  showUpcomingDropdown = false;
  showRecentDropdown = false;
  personList: Person[] = [];

  constructor(private personService: PersonService) {}

  ngOnInit(): void {
    this.personService.personList$.subscribe((list) => {
      this.personList = list;
      this.updateBdayLists();
    });
  }

  updateBdayLists(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate upcoming birthdays (next 30 days)
    const upcoming = this.personList
      .map(person => ({
        person,
        nextBday: this.getNextBirthday(person.dob)
      }))
      .filter(item => {
        const daysUntil = this.daysUntil(item.nextBday);
        return daysUntil >= 0 && daysUntil <= 30;
      })
      .sort((a, b) => this.daysUntil(a.nextBday) - this.daysUntil(b.nextBday))
      .slice(0, 5)
      .map(item => item.person);

    // Calculate recent birthdays (last 7 days)
    const recent = this.personList
      .map(person => ({
        person,
        lastBday: this.getLastBirthday(person.dob)
      }))
      .filter(item => {
        const daysSince = this.daysSince(item.lastBday);
        return daysSince >= 0 && daysSince <= 7;
      })
      .sort((a, b) => this.daysSince(a.lastBday) - this.daysSince(b.lastBday))
      .slice(0, 5)
      .map(item => item.person);

    this.upcomingBdays = upcoming;
    this.recentBdays = recent;
  }

  getNextBirthday(dob: Date): Date {
    const dobDate = new Date(dob);
    const today = new Date();
    const nextBday = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
    
    if (nextBday < today) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }
    
    return nextBday;
  }

  getLastBirthday(dob: Date): Date {
    const dobDate = new Date(dob);
    const today = new Date();
    const lastBday = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
    
    if (lastBday > today) {
      lastBday.setFullYear(today.getFullYear() - 1);
    }
    
    return lastBday;
  }

  daysUntil(date: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const givenDate = new Date(date);
    givenDate.setHours(0, 0, 0, 0);
    const diffTime = givenDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  daysSince(date: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const givenDate = new Date(date);
    givenDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - givenDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysUntilDisplay(person: Person): number {
    return this.daysUntil(this.getNextBirthday(person.dob));
  }

  getDaysSinceDisplay(person: Person): number {
    return this.daysSince(this.getLastBirthday(person.dob));
  }

  toggleUpcomingDropdown(): void {
    this.showUpcomingDropdown = !this.showUpcomingDropdown;
    this.showRecentDropdown = false;
  }

  toggleRecentDropdown(): void {
    this.showRecentDropdown = !this.showRecentDropdown;
    this.showUpcomingDropdown = false;
  }

  closeDropdowns(): void {
    this.showUpcomingDropdown = false;
    this.showRecentDropdown = false;
  }
}
