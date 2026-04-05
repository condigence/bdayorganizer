import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Person } from '../models/person';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private personListSubject = new BehaviorSubject<Person[]>([]);
  public personList$ = this.personListSubject.asObservable();
  private backendUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {
    // Load from assets first on startup
    this.loadFromAssets();
    // Then try to sync with backend
    this.loadFromBackend();
  }

  loadPersonList(): void {
    // Try to load from backend
    this.loadFromBackend();
  }

  private loadFromBackend(): void {
    this.http.get<Person[]>(`${this.backendUrl}/person`).subscribe(
      (data) => {
        console.log('Loaded persons from backend:', data);
        if (Array.isArray(data) && data.length > 0) {
          this.personListSubject.next(data);
        } else {
          // If backend returns empty, fallback to assets
          this.loadFromAssets();
        }
      },
      (error) => {
        console.error('Error loading from backend:', error);
        // On error, fallback to assets
        this.loadFromAssets();
      }
    );
  }

  private loadFromAssets(): void {
    this.http.get<Person[]>('/assets/person-info.json').subscribe(
      (data) => {
        console.log('Loaded persons from assets:', data);
        this.personListSubject.next(Array.isArray(data) ? data : []);
      },
      (error) => {
        console.error('Error loading from assets:', error);
        this.personListSubject.next([]);
      }
    );
  }

  addPerson(person: Person): void {
    console.log('Adding person, syncing with backend...');
    
    // Retry logic
    let retries = 3;
    const syncWithRetry = () => {
      this.http.post<any>(`${this.backendUrl}/person`, person).subscribe(
        (response) => {
          console.log('Person added to backend:', response);
          // Reload the list from backend
          this.loadPersonList();
          alert('Person added successfully!');
        },
        (error) => {
          retries--;
          if (retries > 0) {
            console.log(`Backend sync failed, retrying... (${retries} attempts left)`);
            setTimeout(() => syncWithRetry(), 1000);
          } else {
            console.error('Error adding person to backend:', error);
            alert('Failed to save person. Please ensure backend is running.');
          }
        }
      );
    };
    
    syncWithRetry();
  }

  exportAsJson(): void {
    const personList = this.personListSubject.value;
    const jsonData = JSON.stringify(personList, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'person-info.json';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  importFromJson(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          // Save to backend
          this.http.put<any>(`${this.backendUrl}/person`, data).subscribe(
            (response) => {
              console.log('Data imported to backend:', response);
              this.personListSubject.next(data);
              alert('Data imported successfully!');
            },
            (error) => {
              console.error('Error importing to backend:', error);
              alert('Failed to import data. Please check if backend is running.');
            }
          );
        } else {
          alert('Invalid JSON format. Expected an array.');
        }
      } catch (error) {
        alert('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
  }

  getPersonList(): Person[] {
    return this.personListSubject.value;
  }

  deletePerson(index: number): void {
    const currentList = this.personListSubject.value;
    const updatedList = currentList.filter((_, i) => i !== index);
    
    // Update local state immediately
    this.personListSubject.next(updatedList);
    console.log('Person deleted locally, syncing with backend...');
    
    // Sync with backend - Retry logic
    let retries = 3;
    const syncWithRetry = () => {
      this.http.put<any>(`${this.backendUrl}/person`, updatedList).subscribe(
        (response) => {
          console.log('Person deleted and synced with backend:', response);
          this.personListSubject.next(updatedList);
          alert('Person deleted successfully!');
        },
        (error) => {
          retries--;
          if (retries > 0) {
            console.log(`Backend sync failed, retrying... (${retries} attempts left)`);
            setTimeout(() => syncWithRetry(), 1000);
          } else {
            console.error('Error syncing delete with backend:', error);
            console.log('Delete saved locally. Backend will sync when available.');
          }
        }
      );
    };
    
    syncWithRetry();
  }

  updatePerson(index: number, updatedPerson: Person): void {
    const currentList = this.personListSubject.value;
    if (index >= 0 && index < currentList.length) {
      // Replace the person at the exact index in the current list
      const newList = [...currentList];
      newList[index] = updatedPerson;
      
      // Update local state immediately
      this.personListSubject.next(newList);
      console.log('Person updated locally, syncing with backend...');
      
      // Sync with backend - Retry logic
      let retries = 3;
      const syncWithRetry = () => {
        this.http.put<any>(`${this.backendUrl}/person`, newList).subscribe(
          (response) => {
            console.log('Person updated and synced with backend:', response);
            this.personListSubject.next(newList);
            alert('Person updated successfully!');
          },
          (error) => {
            retries--;
            if (retries > 0) {
              console.log(`Backend sync failed, retrying... (${retries} attempts left)`);
              setTimeout(() => syncWithRetry(), 1000);
            } else {
              console.error('Error syncing update with backend:', error);
              console.log('Update saved locally. Backend will sync when available.');
            }
          }
        );
      };
      
      syncWithRetry();
    }
  }

  deleteAllData(): void {
    this.http.delete<any>(`${this.backendUrl}/person`).subscribe(
      (response) => {
        console.log('All data deleted:', response);
        this.personListSubject.next([]);
      },
      (error) => {
        console.error('Error deleting data:', error);
        this.personListSubject.next([]);
      }
    );
  }
}


