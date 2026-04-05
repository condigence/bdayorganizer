import { Injectable } from '@angular/core';
import { Person } from '../models/person';

@Injectable({
  providedIn: 'root'
})
export class PersonExportService {

  exportAsJson(personList: Person[]): void {
    const jsonData = JSON.stringify(personList, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'person-info.json';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  parseImportFile(file: File): Promise<Person[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            resolve(data);
          } else {
            reject(new Error('Invalid JSON format. Expected an array.'));
          }
        } catch {
          reject(new Error('Error parsing JSON file'));
        }
      };
      reader.readAsText(file);
    });
  }
}
