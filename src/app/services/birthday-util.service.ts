import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BirthdayUtilService {

  getNextBirthday(dob: Date | string): Date {
    const dobDate = new Date(dob);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextBday = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());

    if (nextBday < today) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }

    return nextBday;
  }

  getLastBirthday(dob: Date | string): Date {
    const dobDate = new Date(dob);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

  getDaysUntilNextBirthday(dob: Date | string): number {
    return this.daysUntil(this.getNextBirthday(dob));
  }

  getDaysSinceLastBirthday(dob: Date | string): number {
    return this.daysSince(this.getLastBirthday(dob));
  }
}
