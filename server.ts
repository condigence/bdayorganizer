import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PersonRepository } from './person-repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'src/assets/person-info.json');
const personRepo = new PersonRepository(dataPath);

// Get all persons
app.get('/api/person', (req, res) => {
  res.json(personRepo.getAll());
});

// Get a single person
app.get('/api/person/:id', (req, res) => {
  const person = personRepo.getById(req.params.id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});

// Add a new person
app.post('/api/person', (req, res) => {
  const newPerson = personRepo.add(req.body);
  res.status(201).json(newPerson);
});

// Update a person
app.put('/api/person/:id', (req, res) => {
  const updated = personRepo.update(req.params.id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});

// Delete a person
app.delete('/api/person/:id', (req, res) => {
  const deleted = personRepo.delete(req.params.id);
  if (deleted) {
    res.json(deleted);
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});

// Delete all persons
app.delete('/api/person', (req, res) => {
  personRepo.deleteAll();
  res.json({ message: 'All data deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
