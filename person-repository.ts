import fs from 'fs';

export class PersonRepository {
  private data: any[] = [];

  constructor(private dataPath: string) {
    this.load();
  }

  private load(): void {
    try {
      const raw = fs.readFileSync(this.dataPath, 'utf-8');
      this.data = JSON.parse(raw);
    } catch {
      console.log('Could not load person data, starting empty');
      this.data = [];
    }
  }

  private save(): void {
    fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
  }

  getAll(): any[] {
    return this.data;
  }

  getById(id: string): any | undefined {
    return this.data.find((p: any) => p.id === id);
  }

  add(person: any): any {
    const newPerson = { id: Date.now().toString(), ...person };
    this.data.push(newPerson);
    this.save();
    return newPerson;
  }

  update(id: string, updates: any): any | undefined {
    const index = this.data.findIndex((p: any) => p.id === id);
    if (index === -1) return undefined;
    this.data[index] = { ...this.data[index], ...updates };
    this.save();
    return this.data[index];
  }

  delete(id: string): any | undefined {
    const index = this.data.findIndex((p: any) => p.id === id);
    if (index === -1) return undefined;
    const deleted = this.data.splice(index, 1);
    this.save();
    return deleted[0];
  }

  deleteAll(): void {
    this.data = [];
    this.save();
  }
}
