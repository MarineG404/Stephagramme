import json
import sqlite3

# 1. Charger le fichier JSON
with open("ods6.json", "r", encoding="utf-8") as f:
    data = json.load(f)

words = data["mots"]  # Liste de tous les mots

# 2. Créer la base SQLite
conn = sqlite3.connect("ods6.sqlite")
cur = conn.cursor()

# 3. Créer la table
cur.execute("DROP TABLE IF EXISTS words_ods6")
cur.execute("CREATE TABLE words_ods6 (id INTEGER PRIMARY KEY AUTOINCREMENT, word TEXT UNIQUE)")

# 4. Insérer les mots
for word in words:
    cur.execute("INSERT INTO words_ods6 (word) VALUES (?)", (word,))

# 5. Sauvegarder et fermer
conn.commit()
conn.close()
