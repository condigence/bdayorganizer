import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Load person data
const dataPath = path.join(__dirname, 'src/assets/person-info.json');
let peopleData: any[] = [];

try {
  const data = fs.readFileSync(dataPath, 'utf-8');
  peopleData = JSON.parse(data);
} catch (error) {
  console.log('Could not load person-info.json, starting with empty data');
}

// Get all persons
app.get('/api/person', (req, res) => {
  res.json(peopleData);
});

// Get a single person
app.get('/api/person/:id', (req, res) => {
  const person = peopleData.find((p: any) => p.id === req.params.id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});

// Add a new person
app.post('/api/person', (req, res) => {
  const newPerson = { id: Date.now().toString(), ...req.body };
  peopleData.push(newPerson);
  savePeopleData();
  res.status(201).json(newPerson);
});

// Update a person
app.put('/api/person/:id', (req, res) => {
  const index = peopleData.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    peopleData[index] = { ...peopleData[index], ...req.body };
    savePeopleData();
    res.json(peopleData[index]);
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});

// Delete a person
app.delete('/api/person/:id', (req, res) => {
  const index = peopleData.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    const deleted = peopleData.splice(index, 1);
    savePeopleData();
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Person not found' });
  }
});

function savePeopleData() {
  fs.writeFileSync(dataPath, JSON.stringify(peopleData, null, 2));
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
