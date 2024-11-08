import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'database.sqlite'));
const app = express();

app.use(cors());
app.use(express.json());

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    phoneNumber TEXT NOT NULL,
    email TEXT NOT NULL,
    personalNumber TEXT NOT NULL,
    moveInDate TEXT,
    resiliationDate TEXT,
    apartmentId INTEGER,
    FOREIGN KEY (apartmentId) REFERENCES apartments(id)
  );

  CREATE TABLE IF NOT EXISTS apartments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    apartmentNumber TEXT NOT NULL,
    floor TEXT NOT NULL,
    postalCode TEXT NOT NULL,
    city TEXT NOT NULL,
    tenantId INTEGER,
    FOREIGN KEY (tenantId) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    number TEXT NOT NULL,
    amount INTEGER NOT NULL,
    apartmentId INTEGER,
    tenantId INTEGER,
    FOREIGN KEY (apartmentId) REFERENCES apartments(id),
    FOREIGN KEY (tenantId) REFERENCES tenants(id)
  );
`);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Tenants endpoints
app.get('/api/tenants', (req, res) => {
  try {
    const { keyId, apartmentId } = req.query;
    let query = 'SELECT * FROM tenants';
    let params = [];

    if (keyId) {
      query = `
        SELECT tenants.* 
        FROM tenants 
        JOIN keys ON tenants.id = keys.tenantId 
        WHERE keys.id = ?
      `;
      params = [keyId];
    } else if (apartmentId) {
      query += ' WHERE apartmentId = ?';
      params = [apartmentId];
    }

    const tenants = db.prepare(query).all(...params);
    res.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tenants', (req, res) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO tenants (firstName, lastName, phoneNumber, email, personalNumber, moveInDate, resiliationDate, apartmentId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.body.firstName,
      req.body.lastName,
      req.body.phoneNumber,
      req.body.email,
      req.body.personalNumber,
      req.body.moveInDate,
      req.body.resiliationDate,
      req.body.apartmentId
    );
    
    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tenants/:id', (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE tenants 
      SET firstName = ?, lastName = ?, phoneNumber = ?, email = ?, 
          personalNumber = ?, moveInDate = ?, resiliationDate = ?, apartmentId = ?
      WHERE id = ?
    `);

    stmt.run(
      req.body.firstName,
      req.body.lastName,
      req.body.phoneNumber,
      req.body.email,
      req.body.personalNumber,
      req.body.moveInDate,
      req.body.resiliationDate,
      req.body.apartmentId,
      req.params.id
    );
    
    res.json({ id: parseInt(req.params.id), ...req.body });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tenants/:id', (req, res) => {
  try {
    db.prepare('UPDATE keys SET tenantId = NULL WHERE tenantId = ?').run(req.params.id);
    db.prepare('DELETE FROM tenants WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apartments endpoints
app.get('/api/apartments', (req, res) => {
  try {
    const { keyId, tenantId } = req.query;
    let query = 'SELECT * FROM apartments';
    let params = [];

    if (keyId) {
      query = `
        SELECT apartments.* 
        FROM apartments 
        JOIN keys ON apartments.id = keys.apartmentId 
        WHERE keys.id = ?
      `;
      params = [keyId];
    } else if (tenantId) {
      query = `
        SELECT apartments.* 
        FROM apartments 
        JOIN tenants ON apartments.id = tenants.apartmentId 
        WHERE tenants.id = ?
      `;
      params = [tenantId];
    }

    const apartments = db.prepare(query).all(...params);
    res.json(apartments);
  } catch (error) {
    console.error('Error fetching apartments:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/apartments', (req, res) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO apartments (street, number, apartmentNumber, floor, postalCode, city, tenantId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.body.street,
      req.body.number,
      req.body.apartmentNumber,
      req.body.floor,
      req.body.postalCode,
      req.body.city,
      req.body.tenantId
    );
    
    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    console.error('Error creating apartment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/apartments/:id', (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE apartments 
      SET street = ?, number = ?, apartmentNumber = ?, floor = ?, 
          postalCode = ?, city = ?, tenantId = ?
      WHERE id = ?
    `);

    stmt.run(
      req.body.street,
      req.body.number,
      req.body.apartmentNumber,
      req.body.floor,
      req.body.postalCode,
      req.body.city,
      req.body.tenantId,
      req.params.id
    );
    
    res.json({ id: parseInt(req.params.id), ...req.body });
  } catch (error) {
    console.error('Error updating apartment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/apartments/:id', (req, res) => {
  try {
    db.prepare('UPDATE keys SET apartmentId = NULL WHERE apartmentId = ?').run(req.params.id);
    db.prepare('UPDATE tenants SET apartmentId = NULL WHERE apartmentId = ?').run(req.params.id);
    db.prepare('DELETE FROM apartments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting apartment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Keys endpoints
app.get('/api/keys', (req, res) => {
  try {
    const { tenantId, apartmentId } = req.query;
    let query = 'SELECT * FROM keys';
    let params = [];

    if (tenantId) {
      query += ' WHERE tenantId = ?';
      params = [tenantId];
    } else if (apartmentId) {
      query += ' WHERE apartmentId = ?';
      params = [apartmentId];
    }

    const keys = db.prepare(query).all(...params);
    res.json(keys);
  } catch (error) {
    console.error('Error fetching keys:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/keys', (req, res) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO keys (type, number, amount, apartmentId, tenantId)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.body.type,
      req.body.number,
      req.body.amount,
      req.body.apartmentId,
      req.body.tenantId
    );
    
    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    console.error('Error creating key:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/keys/:id', (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE keys 
      SET type = ?, number = ?, amount = ?, apartmentId = ?, tenantId = ?
      WHERE id = ?
    `);

    stmt.run(
      req.body.type,
      req.body.number,
      req.body.amount,
      req.body.apartmentId,
      req.body.tenantId,
      req.params.id
    );
    
    res.json({ id: parseInt(req.params.id), ...req.body });
  } catch (error) {
    console.error('Error updating key:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/keys/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM keys WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting key:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});