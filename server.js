// ============================================================
//  ELIEL POSTER — BACKEND CANDIDATURES
//  Node.js + Express + SQLite (via better-sqlite3)
//  Installation : npm install express better-sqlite3 cors
//  Lancement    : node server.js
// ============================================================

const express    = require('express');
const Database   = require('better-sqlite3');
const cors       = require('cors');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ============================================================
//  MIDDLEWARES
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // fichiers dans le même dossier que server.js

// ============================================================
//  BASE DE DONNÉES SQLITE
// ============================================================
const db = new Database('candidatures.db');

// Création de la table si elle n'existe pas encore
db.exec(`
    CREATE TABLE IF NOT EXISTS candidatures (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        nom          TEXT    NOT NULL,
        prenom       TEXT    NOT NULL,
        email        TEXT    NOT NULL,
        telephone    TEXT    NOT NULL,
        residence    TEXT    NOT NULL,
        poste        TEXT    NOT NULL,
        type_contrat TEXT    NOT NULL,
        experience   TEXT    NOT NULL,
        portfolio    TEXT,
        motivation   TEXT    NOT NULL,
        date_envoi   TEXT    DEFAULT (datetime('now', 'localtime'))
    )
`);

// ============================================================
//  ROUTE POST — Recevoir une candidature
// ============================================================
app.post('/api/candidatures', (req, res) => {
    const { nom, prenom, email, telephone, residence, poste, type_contrat, experience, portfolio, motivation } = req.body;

    // Validation serveur
    if (!nom || !prenom || !email || !telephone || !residence || !poste || !type_contrat || !experience || !motivation) {
        return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    }

    try {
        const insert = db.prepare(`
            INSERT INTO candidatures (nom, prenom, email, telephone, residence, poste, type_contrat, experience, portfolio, motivation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const resultat = insert.run(nom, prenom, email, telephone, residence, poste, type_contrat, experience, portfolio || null, motivation);

        return res.status(201).json({
            message: 'Candidature enregistrée avec succès.',
            id: resultat.lastInsertRowid
        });

    } catch (erreur) {
        console.error('Erreur base de données :', erreur.message);
        return res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' });
    }
});

// ============================================================
//  ROUTE GET — Consulter toutes les candidatures (admin)
//  Protégez cette route avec un middleware auth en production
// ============================================================
app.get('/api/candidatures', (req, res) => {
    try {
        const candidatures = db.prepare('SELECT * FROM candidatures ORDER BY date_envoi DESC').all();
        return res.status(200).json(candidatures);
    } catch (erreur) {
        console.error('Erreur lecture :', erreur.message);
        return res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// ============================================================
//  ROUTE GET — Consulter une candidature par ID
// ============================================================
app.get('/api/candidatures/:id', (req, res) => {
    const { id } = req.params;
    try {
        const candidature = db.prepare('SELECT * FROM candidatures WHERE id = ?').get(id);
        if (!candidature) return res.status(404).json({ message: 'Candidature introuvable.' });
        return res.status(200).json(candidature);
    } catch (erreur) {
        console.error('Erreur lecture :', erreur.message);
        return res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// ============================================================
//  DÉMARRAGE DU SERVEUR
// ============================================================
app.listen(PORT, () => {
    console.log(`Serveur Eliel Poster démarré sur http://localhost:${PORT}`);
});
