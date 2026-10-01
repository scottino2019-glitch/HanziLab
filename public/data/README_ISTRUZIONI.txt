# GUIDA ALL'AGGIORNAMENTO DEI FILE JSON PER I GIOCHI HANZI
=============================================================

Questa cartella (`public/data/`) contiene tutti i dati usati dall'applicazione:

1. `radicals.json`      -> Caccia ai Radicali (caratteri, radicali corretti, distrattori, spiegazione)
2. `evolution.json`     -> Evoluzione Caratteri (fasi evolutive dal pittogramma al moderno)
3. `logic.json`         -> Logica dei Caratteri (componenti che si uniscono, enigmi, opzioni)
4. `memory.json`        -> Memory Cinese (coppie Hanzi <-> Italiano e pinyin)
5. `stroke.json`        -> Ordine Tratti (caratteri, coordinate dei tratti, nomi delle pennellate)
6. `pronunciation.json` -> Quiz Pronuncia (caratteri, pinyin con toni, distrattori)
7. `radical_meanings.json` -> Dizionario dei significati dei radicali Kangxi

COME MODIFICARE I CONTENUTI SENZA RICOMPILARE:
----------------------------------------------
Poiché questi file risiedono nella cartella `public/data/`, vengono serviti come file statici.
Puoi:
1. Aprire qualunque file con il tuo editor di testo preferito (VS Code, Blocco Note, Sublime, ecc.).
2. Aggiungere o modificare elementi mantenendo la struttura JSON (parentesi quadre `[]`, virgole tra elementi).
3. Salvare il file.
4. Ricaricare la pagina web dell'applicazione nel browser: i nuovi contenuti appariranno immediatamente SENZA dover ricompilare!

OPPURE USA L'EDITOR INTEGRATO NELL'APP:
----------------------------------------
Nell'app trovi la sezione "Laboratorio / Gestione JSON":
- Ti permette di aggiungere o modificare elementi con interfaccia grafica visuale.
- Puoi provare subito i giochi con i tuoi nuovi dati.
- Puoi cliccare su "Scarica File JSON" per salvare direttamente il file pronto da sostituire qui in `public/data/`.
- Puoi importare file JSON modificati da te direttamente dal browser.
