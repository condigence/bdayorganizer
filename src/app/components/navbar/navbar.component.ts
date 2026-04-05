import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Person } from '../../models/person';
import { PersonService } from '../../services/person.service';
import { BirthdayUtilService } from '../../services/birthday-util.service';

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

  constructor(
    private personService: PersonService,
    private birthdayUtil: BirthdayUtilService
  ) {}

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
        nextBday: this.birthdayUtil.getNextBirthday(person.dob)
      }))
      .filter(item => {
        const daysUntil = this.birthdayUtil.daysUntil(item.nextBday);
        return daysUntil >= 0 && daysUntil <= 30;
      })
      .sort((a, b) => this.birthdayUtil.daysUntil(a.nextBday) - this.birthdayUtil.daysUntil(b.nextBday))
      .slice(0, 5)
      .map(item => item.person);

    // Calculate recent birthdays (last 7 days)
    const recent = this.personList
      .map(person => ({
        person,
        lastBday: this.birthdayUtil.getLastBirthday(person.dob)
      }))
      .filter(item => {
        const daysSince = this.birthdayUtil.daysSince(item.lastBday);
        return daysSince >= 0 && daysSince <= 7;
      })
      .sort((a, b) => this.birthdayUtil.daysSince(a.lastBday) - this.birthdayUtil.daysSince(b.lastBday))
      .slice(0, 5)
      .map(item => item.person);

    this.upcomingBdays = upcoming;
    this.recentBdays = recent;
  }

  getNextBirthday(dob: Date): Date {
    return this.birthdayUtil.getNextBirthday(dob);
  }

  getLastBirthday(dob: Date): Date {
    return this.birthdayUtil.getLastBirthday(dob);
  }

  daysUntil(date: Date): number {
    return this.birthdayUtil.daysUntil(date);
  }

  daysSince(date: Date): number {
    return this.birthdayUtil.daysSince(date);
  }

  getDaysUntilDisplay(person: Person): number {
    return this.birthdayUtil.getDaysUntilNextBirthday(person.dob);
  }

  getDaysSinceDisplay(person: Person): number {
    return this.birthdayUtil.getDaysSinceLastBirthday(person.dob);
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
