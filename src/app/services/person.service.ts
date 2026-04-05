import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Person } from '../models/person';
import { API_CONFIG, ApiConfig } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private personListSubject = new BehaviorSubject<Person[]>([]);
  public personList$ = this.personListSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(API_CONFIG) private apiConfig: ApiConfig
  ) {
    this.loadFromAssets();
    this.loadFromBackend();
  }

  private get personUrl(): string {
    return `${this.apiConfig.baseUrl}/person`;
  }

  loadPersonList(): void {
    // Try to load from backend
    this.loadFromBackend();
  }

  private loadFromBackend(): void {
    this.http.get<Person[]>(this.personUrl).subscribe(
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
    this.syncWithRetry(
      () => this.http.post<any>(this.personUrl, person),
      () => {
        this.loadPersonList();
        alert('Person added successfully!');
      },
      () => alert('Failed to save person. Please ensure backend is running.')
    );
  }

  importPersons(persons: Person[]): void {
    this.personListSubject.next(persons);
    let synced = 0;
    persons.forEach((person: Person) => {
      this.http.post<any>(this.personUrl, person).subscribe(
        () => {
          synced++;
          if (synced === persons.length) {
            this.loadFromBackend();
            alert('Data imported successfully!');
          }
        },
        (error) => console.error('Error importing person to backend:', error)
      );
    });
  }

  getPersonList(): Person[] {
    return this.personListSubject.value;
  }

  deletePerson(index: number): void {
    const currentList = this.personListSubject.value;
    const personToDelete = currentList[index];
    const personId = personToDelete.id;

    if (!personId) {
      console.error('Cannot delete person without id');
      return;
    }

    const updatedList = currentList.filter((_, i) => i !== index);
    this.personListSubject.next(updatedList);
    console.log('Person deleted locally, syncing with backend...');

    this.syncWithRetry(
      () => this.http.delete<any>(`${this.personUrl}/${personId}`),
      () => {
        this.loadFromBackend();
        alert('Person deleted successfully!');
      },
      () => console.log('Delete saved locally. Backend will sync when available.')
    );
  }

  updatePerson(index: number, updatedPerson: Person): void {
    const currentList = this.personListSubject.value;
    if (index < 0 || index >= currentList.length) return;

    const personId = updatedPerson.id || currentList[index].id;
    const personToSave = { ...updatedPerson, id: personId };

    const newList = [...currentList];
    newList[index] = personToSave;
    this.personListSubject.next(newList);
    console.log('Person updated locally, syncing with backend...');

    this.syncWithRetry(
      () => this.http.put<any>(`${this.personUrl}/${personId}`, personToSave),
      () => {
        this.loadFromBackend();
        alert('Person updated successfully!');
      },
      () => console.log('Update saved locally. Backend will sync when available.')
    );
  }

  deleteAllData(): void {
    this.http.delete<any>(this.personUrl).subscribe(
      () => {
        console.log('All data deleted');
        this.personListSubject.next([]);
      },
      (error) => {
        console.error('Error deleting data:', error);
        this.personListSubject.next([]);
      }
    );
  }

  private syncWithRetry(
    request: () => Observable<any>,
    onSuccess: () => void,
    onFailure: () => void,
    maxRetries = 3
  ): void {
    let retries = maxRetries;
    const attempt = () => {
      request().subscribe(
        () => onSuccess(),
        (error) => {
          retries--;
          if (retries > 0) {
            console.log(`Backend sync failed, retrying... (${retries} attempts left)`);
            setTimeout(() => attempt(), 1000);
          } else {
            console.error('Backend sync failed after retries:', error);
            onFailure();
          }
        }
      );
    };
    attempt();
  }
}


