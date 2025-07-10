"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const txtFile = './ods6.txt'; // chemin vers ton fichier texte
const jsonFile = './ods6.json'; // nom du fichier json à créer
// lire le fichier texte, supposer un mot par ligne
const data = fs.readFileSync(txtFile, 'utf-8');
// transformer en tableau (en supprimant lignes vides)
const mots = data.split(/\r?\n/).filter(line => line.trim().length > 0);
// écrire en JSON
fs.writeFileSync(jsonFile, JSON.stringify(mots, null, 2));
console.log(`Fichier JSON créé: ${jsonFile} avec ${mots.length} mots.`);
