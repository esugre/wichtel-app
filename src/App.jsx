import React, { useState, useEffect } from 'react';
import { Gift, Users, Shuffle, Plus, Trash2, Upload, Eye, EyeOff } from 'lucide-react';

/**
 * WICHTEL-WEBAPP - Hauptkomponente
 * 
 * Was ist React?
 * React ist eine JavaScript-Bibliothek, die es einfacher macht, interaktive UIs zu bauen.
 * Statt HTML direkt zu manipulieren, beschreibst du, WIE die UI aussehen SOLL,
 * und React kümmert sich um die Updates.
 * 
 * Was sind "Hooks"? (useState, useEffect)
 * Hooks sind spezielle React-Funktionen, die mit "use" beginnen.
 * - useState: Speichert Daten, die sich ändern können (z.B. welche Seite gerade angezeigt wird)
 * - useEffect: Führt Code aus, wenn sich etwas ändert (z.B. Daten laden beim Start)
 */

function WichtelApp() {
  // ==================== STATE MANAGEMENT ====================
  /**
   * useState erklärt:
   * const [variable, setVariable] = useState(initialerWert);
   * 
   * - variable: Aktuelle Wert (lesbar)
   * - setVariable: Funktion zum Ändern des Werts
   * - initialerWert: Startwert beim ersten Laden
   * 
   * Beispiel: const [alter, setAlter] = useState(25);
   * - alter ist 25
   * - Mit setAlter(30) wird alter auf 30 gesetzt
   * - React rendert die Komponente neu, wenn sich der State ändert
   */

  // Welche Seite wird gerade angezeigt? 'home', 'admin', 'participant', 'view'
  const [currentView, setCurrentView] = useState('home');
  
  // Alle Wichtelgruppen (Array von Objekten)
  const [groups, setGroups] = useState([]);
  
  // Die aktuell ausgewählte Gruppe (ein Objekt oder null)
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Der aktuell ausgewählte Teilnehmer (ein Objekt oder null)
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  
  // Admin-Passwort (einfache Authentifizierung)
  const [adminPassword, setAdminPassword] = useState('');
  
  // Ist der Admin eingeloggt? (true/false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // ==================== DATEN LADEN UND SPEICHERN ====================
  /**
   * useEffect erklärt:
   * useEffect(() => { code }, [abhängigkeiten]);
   * 
   * - Der Code wird ausgeführt, wenn sich die Abhängigkeiten ändern
   * - Leeres Array [] = nur beim ersten Laden
   * - Kein Array = bei jedem Render
   * - [variable] = wenn sich "variable" ändert
   * 
   * Hier: Laden wir die gespeicherten Gruppen beim Start der App
   */
  useEffect(() => {
    loadGroups();
  }, []); // Leeres Array = nur einmal beim Start ausführen

  /**
   * loadGroups - Lädt gespeicherte Gruppen aus dem Storage
   * 
   * async/await erklärt:
   * - async: Markiert eine Funktion als asynchron (kann auf etwas warten)
   * - await: Wartet auf das Ergebnis einer Promise (hier: Storage-Zugriff)
   * - try/catch: Fängt Fehler ab, falls etwas schiefgeht
   */
  const loadGroups = async () => {
    try {
      // Versuche, gespeicherte Gruppen zu laden
      // window.storage.get gibt ein Objekt zurück: { key, value, shared }
      const result = await window.storage.get('wichtel-groups');
      
      if (result && result.value) {
        // JSON.parse wandelt einen String zurück in ein JavaScript-Objekt/Array
        const loadedGroups = JSON.parse(result.value);
        setGroups(loadedGroups);
      }
    } catch (error) {
      // Falls ein Fehler auftritt (z.B. keine Daten vorhanden), ignorieren wir ihn
      console.log('Keine gespeicherten Gruppen gefunden - das ist okay beim ersten Start');
    }
  };

  /**
   * saveGroups - Speichert alle Gruppen in den persistenten Storage
   * 
   * Parameter:
   * - updatedGroups: Die zu speichernden Gruppen
   * 
   * Warum eine separate Funktion?
   * - Zentraler Ort für das Speichern
   * - Einfacher zu warten und zu debuggen
   * - Kann Error-Handling hinzufügen
   */
  const saveGroups = async (updatedGroups) => {
    try {
      // JSON.stringify wandelt ein JavaScript-Objekt in einen String um
      // (Storage kann nur Strings speichern, keine komplexen Objekte)
      await window.storage.set('wichtel-groups', JSON.stringify(updatedGroups));
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Daten');
    }
  };

  // ==================== ADMIN-FUNKTIONEN ====================
  
  /**
   * handleAdminLogin - Prüft das Admin-Passwort
   * 
   * In einer echten App würde das Passwort serverseitig geprüft werden!
   * Hier: Einfache Client-seitige Prüfung (nur für Demo-Zwecke)
   */
  const handleAdminLogin = () => {
    // Einfaches Passwort (in echter App: verschlüsselt und serverseitig!)
    if (adminPassword === 'wichtel2024') {
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
    } else {
      alert('Falsches Passwort!');
    }
  };

  /**
   * createGroup - Erstellt eine neue Wichtelgruppe
   * 
   * Wie funktioniert das Erstellen?
   * 1. Generiere eine eindeutige ID (mit Date.now() - Millisekunden seit 1970)
   * 2. Erstelle ein Gruppen-Objekt mit allen nötigen Eigenschaften
   * 3. Füge die neue Gruppe zum Array hinzu
   * 4. Speichere alles
   */
  const createGroup = () => {
    const groupName = prompt('Name der Wichtelgruppe:');
    if (!groupName) return; // Abbruch, falls leer

    // Neues Gruppen-Objekt erstellen
    const newGroup = {
      id: Date.now(), // Eindeutige ID (Timestamp in Millisekunden)
      name: groupName,
      participants: [], // Array für Teilnehmer (anfangs leer)
      isShuffled: false, // Wurden die Wichtel schon zugeordnet?
      createdAt: new Date().toISOString() // ISO-Format: "2024-12-15T10:30:00.000Z"
    };

    // Spread-Operator (...) erklärt:
    // [...groups] erstellt eine KOPIE des Arrays und fügt am Ende newGroup hinzu
    // Warum nicht groups.push()? React erkennt Änderungen nur bei neuen Objekten!
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    
    alert(`Gruppe "${groupName}" erstellt!`);
  };

  /**
   * deleteGroup - Löscht eine Wichtelgruppe
   * 
   * Parameter:
   * - groupId: Die ID der zu löschenden Gruppe
   * 
   * Array.filter erklärt:
   * - Erstellt ein neues Array mit allen Elementen, für die die Bedingung true ist
   * - g.id !== groupId bedeutet: Behalte alle Gruppen, deren ID NICHT groupId ist
   * - Ergebnis: Alle Gruppen außer der gelöschten
   */
  const deleteGroup = (groupId) => {
    if (!confirm('Gruppe wirklich löschen? Alle Daten gehen verloren!')) return;
    
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    saveGroups(updatedGroups);
  };

  /**
   * addParticipant - Fügt einen neuen Teilnehmer zur Gruppe hinzu
   * 
   * Parameter:
   * - groupId: Die ID der Gruppe
   * 
   * Array.map erklärt:
   * - Geht durch jedes Element und erstellt ein neues Array
   * - Wenn group.id === groupId: Verändere diese Gruppe
   * - Sonst: Behalte die Gruppe unverändert
   * - Ergebnis: Neues Array mit einer modifizierten Gruppe
   */
  const addParticipant = (groupId) => {
    const participantName = prompt('Name des Teilnehmers:');
    if (!participantName) return;

    // Erstelle einen "lesbaren" Link-Code aus dem Namen
    // .toLowerCase() = in Kleinbuchstaben
    // .replace(/\s+/g, '') = entfernt alle Leerzeichen (Regex)
    // .substring(0, 10) = maximal 10 Zeichen
    const linkCode = participantName.toLowerCase().replace(/\s+/g, '').substring(0, 10) + Date.now() % 1000;

    const newParticipant = {
      id: Date.now(),
      name: participantName,
      linkCode: linkCode, // z.B. "heidi472"
      profile: {
        imageUrl: null, // Kein Bild am Anfang
        wishes: '', // Wünsche (leerer String)
        likes: '', // Mag ich
        dislikes: '', // Mag ich nicht
        hobbies: '', // Hobbies
        notes: '' // Zusätzliche Notizen
      },
      assignedTo: null // Wem wurde dieser Teilnehmer zugewiesen? (null = noch nicht)
    };

    // Finde die richtige Gruppe und füge den Teilnehmer hinzu
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        // Spread-Operator für Objekte: { ...group } erstellt eine Kopie
        // Dann überschreiben wir die participants-Eigenschaft
        return {
          ...group,
          participants: [...group.participants, newParticipant]
        };
      }
      return group; // Andere Gruppen unverändert zurückgeben
    });

    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    
    alert(`Teilnehmer hinzugefügt!\n\nLink für ${participantName}:\n${window.location.origin}/wichtel/${linkCode}\n\nDiesen Link an ${participantName} schicken!`);
  };

  /**
   * deleteParticipant - Löscht einen Teilnehmer aus einer Gruppe
   */
  const deleteParticipant = (groupId, participantId) => {
    if (!confirm('Teilnehmer wirklich löschen?')) return;

    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          participants: group.participants.filter(p => p.id !== participantId)
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    saveGroups(updatedGroups);
  };

  /**
   * shuffleWichtel - Verteilt die Wichtel zufällig
   * 
   * Der Fisher-Yates Shuffle-Algorithmus:
   * - Geht rückwärts durch das Array
   * - Tauscht jedes Element mit einem zufälligen Element davor
   * - Ergebnis: Faire, gleichverteilte Zufallsverteilung
   * 
   * Parameter:
   * - groupId: Die ID der Gruppe
   */
  const shuffleWichtel = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    
    if (!group || group.participants.length < 2) {
      alert('Mindestens 2 Teilnehmer nötig!');
      return;
    }

    if (group.isShuffled && !confirm('Wichtel wurden bereits verteilt. Neu verteilen?')) {
      return;
    }

    // Erstelle eine Kopie des Teilnehmer-Arrays für die Zuteilung
    const participants = [...group.participants];
    const shuffled = [...participants];
    
    // Fisher-Yates Shuffle-Algorithmus
    // Warum rückwärts? Damit wir bereits gemischte Elemente nicht nochmal anfassen
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Math.random() gibt eine Zahl zwischen 0 und 1
      // Math.floor() rundet ab
      // Ergebnis: Zufälliger Index zwischen 0 und i
      const j = Math.floor(Math.random() * (i + 1));
      
      // Destrukturierung zum Tauschen: [a, b] = [b, a]
      // Tauscht shuffled[i] und shuffled[j]
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Weise jedem Teilnehmer den nächsten in der gemischten Liste zu
    // Der letzte bekommt den ersten (Kreis schließen)
    const updatedParticipants = participants.map((participant, index) => {
      // Modulo (%) erklärt: Rest der Division
      // (index + 1) % length sorgt dafür, dass nach dem letzten wieder der erste kommt
      const nextIndex = (index + 1) % shuffled.length;
      
      return {
        ...participant,
        assignedTo: shuffled[nextIndex].id
      };
    });

    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          participants: updatedParticipants,
          isShuffled: true
        };
      }
      return g;
    });

    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    alert('Wichtel wurden verteilt! 🎄');
  };

  // ==================== TEILNEHMER-FUNKTIONEN ====================

  /**
   * loadParticipantByLink - Lädt einen Teilnehmer anhand seines Link-Codes
   * 
   * Parameter:
   * - linkCode: Der eindeutige Code aus der URL (z.B. "heidi472")
   * 
   * Array.find erklärt:
   * - Sucht das ERSTE Element, für das die Bedingung true ist
   * - Gibt das gefundene Element zurück oder undefined
   */
  const loadParticipantByLink = (linkCode) => {
    // Durchsuche alle Gruppen
    for (const group of groups) {
      // Suche in den Teilnehmern der Gruppe
      const participant = group.participants.find(p => p.linkCode === linkCode);
      
      if (participant) {
        setSelectedGroup(group);
        setSelectedParticipant(participant);
        setCurrentView('participant');
        return true;
      }
    }
    
    alert('Ungültiger Link!');
    return false;
  };

  /**
   * updateParticipantProfile - Aktualisiert das Profil eines Teilnehmers
   * 
   * Parameter:
   * - updatedProfile: Das neue Profil-Objekt
   */
  const updateParticipantProfile = (updatedProfile) => {
    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          participants: group.participants.map(p => {
            if (p.id === selectedParticipant.id) {
              return {
                ...p,
                profile: updatedProfile
              };
            }
            return p;
          })
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    
    // Aktualisiere auch den lokalen State
    setSelectedParticipant({
      ...selectedParticipant,
      profile: updatedProfile
    });
    
    alert('Profil gespeichert! ✓');
  };

  /**
   * handleImageUpload - Verarbeitet den Bild-Upload
   * 
   * Parameter:
   * - e: Das File-Input-Event
   * 
   * FileReader erklärt:
   * - Liest Dateien vom Computer des Users
   * - readAsDataURL: Konvertiert die Datei in Base64-String
   * - Base64: Text-Repräsentation von Binärdaten (kann in img src verwendet werden)
   */
  const handleImageUpload = (e) => {
    const file = e.target.files[0]; // Die erste ausgewählte Datei
    if (!file) return;

    // Prüfe, ob es ein Bild ist
    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle eine Bilddatei aus!');
      return;
    }

    // FileReader erstellen und konfigurieren
    const reader = new FileReader();
    
    // Diese Funktion wird aufgerufen, wenn das Bild geladen ist
    reader.onloadend = () => {
      // reader.result enthält jetzt den Base64-String des Bildes
      const updatedProfile = {
        ...selectedParticipant.profile,
        imageUrl: reader.result
      };
      updateParticipantProfile(updatedProfile);
    };

    // Starte das Lesen der Datei
    reader.readAsDataURL(file);
  };

  // ==================== RENDERING ====================
  /**
   * JSX erklärt:
   * - Sieht aus wie HTML, ist aber JavaScript
   * - Geschweifte Klammern ermöglichen JavaScript-Ausdrücke innerhalb von JSX
   * - className statt class (class ist ein reserviertes Wort in JS)
   * - onClick mit Funktion statt onclick mit String
   * - Selbstschließende Tags müssen Schrägstrich haben
   * 
   * Bedingtes Rendering:
   * - wenn condition && Component = zeige Component nur wenn condition true ist
   * - wenn condition ? A : B = wenn condition true zeige A, sonst B
   */

  // ===== HOME VIEW =====
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <Gift className="w-20 h-20 mx-auto text-red-500 mb-4" />
            
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Wichtel-App 🎄
            </h1>
            
            <p className="text-gray-600 mb-8">
              Organisiere deine Wichtelgruppe einfach und digital!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentView('admin-login')}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Admin-Bereich
              </button>
              
              <button
                onClick={() => {
                  const code = prompt('Gib deinen persönlichen Link-Code ein:');
                  if (code) loadParticipantByLink(code);
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Teilnehmer-Login
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>💡 <strong>Admin:</strong> Erstelle Gruppen und verwalte Teilnehmer</p>
              <p>🎁 <strong>Teilnehmer:</strong> Fülle dein Profil aus und sieh deinen Wichtel</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== ADMIN LOGIN =====
  if (currentView === 'admin-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Admin-Login
            </h2>
            
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Admin-Passwort eingeben"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <button
              onClick={handleAdminLogin}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Einloggen
            </button>

            <button
              onClick={() => setCurrentView('home')}
              className="w-full mt-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Zurück
            </button>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm text-gray-700">
              <p className="font-semibold mb-2">Demo-Passwort:</p>
              <code className="bg-gray-100 px-2 py-1 rounded">wichtel2024</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== ADMIN VIEW =====
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">Admin-Bereich</h1>
              <button
                onClick={() => {
                  setIsAdminAuthenticated(false);
                  setCurrentView('home');
                }}
                className="text-red-500 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          </div>

          <button
            onClick={createGroup}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl mb-6 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Neue Wichtelgruppe erstellen
          </button>

          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                Noch keine Gruppen vorhanden. Erstelle deine erste Wichtelgruppe!
              </div>
            ) : (
              groups.map(group => (
                <div key={group.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                      <p className="text-sm text-gray-500">
                        {group.participants.length} Teilnehmer
                        {group.isShuffled && ' • ✓ Wichtel verteilt'}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {group.participants.map(participant => (
                      <div key={participant.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-semibold">{participant.name}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            Link: /wichtel/{participant.linkCode}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteParticipant(group.id, participant.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addParticipant(group.id)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Teilnehmer hinzufügen
                    </button>
                    <button
                      onClick={() => shuffleWichtel(group.id)}
                      className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Shuffle className="w-4 h-4" />
                      {group.isShuffled ? 'Neu verteilen' : 'Wichtel verteilen'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== PARTICIPANT VIEW =====
  if (currentView === 'participant' && selectedParticipant && selectedGroup) {
    const assignedWichtel = selectedGroup.participants.find(
      p => p.id === selectedParticipant.assignedTo
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Willkommen, {selectedParticipant.name}! 🎄
            </h1>
            <p className="text-gray-600">Gruppe: {selectedGroup.name}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dein Profil ausfüllen</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profilbild hochladen
                </label>
                <div className="flex items-center gap-4">
                  {selectedParticipant.profile.imageUrl && (
                    <img
                      src={selectedParticipant.profile.imageUrl}
                      alt="Profil"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Bild hochladen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Was wünschst du dir?
                </label>
                <textarea
                  value={selectedParticipant.profile.wishes}
                  onChange={(e) => updateParticipantProfile({
                    ...selectedParticipant.profile,
                    wishes: e.target.value
                  })}
                  placeholder="Z.B. Bücher, Technik-Gadgets..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Was magst du?
                </label>
                <textarea
                  value={selectedParticipant.profile.likes}
                  onChange={(e) => updateParticipantProfile({
                    ...selectedParticipant.profile,
                    likes: e.target.value
                  })}
                  placeholder="Z.B. Schokolade, Katzen, Reisen..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Was magst du nicht?
                </label>
                <textarea
                  value={selectedParticipant.profile.dislikes}
                  onChange={(e) => updateParticipantProfile({
                    ...selectedParticipant.profile,
                    dislikes: e.target.value
                  })}
                  placeholder="Z.B. Nüsse, Duftkerzen..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hobbies & Interessen
                </label>
                <textarea
                  value={selectedParticipant.profile.hobbies}
                  onChange={(e) => updateParticipantProfile({
                    ...selectedParticipant.profile,
                    hobbies: e.target.value
                  })}
                  placeholder="Z.B. Gaming, Kochen, Fotografie..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zusätzliche Infos
                </label>
                <textarea
                  value={selectedParticipant.profile.notes}
                  onChange={(e) => updateParticipantProfile({
                    ...selectedParticipant.profile,
                    notes: e.target.value
                  })}
                  placeholder="Sonstige Hinweise für deinen Wichtel..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {selectedGroup.isShuffled && assignedWichtel && (
            <div className="bg-gradient-to-r from-green-500 to-red-500 rounded-2xl shadow-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Gift className="w-6 h-6" />
                Dein Wichtel ist...
              </h2>
              
              <div className="bg-white rounded-xl p-6 text-gray-800">
                <div className="flex items-start gap-4">
                  {assignedWichtel.profile.imageUrl && (
                    <img
                      src={assignedWichtel.profile.imageUrl}
                      alt={assignedWichtel.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4">{assignedWichtel.name}</h3>
                    
                    {assignedWichtel.profile.wishes && (
                      <div className="mb-3">
                        <p className="font-semibold text-green-600">🎁 Wünsche:</p>
                        <p className="text-gray-700">{assignedWichtel.profile.wishes}</p>
                      </div>
                    )}

                    {assignedWichtel.profile.likes && (
                      <div className="mb-3">
                        <p className="font-semibold text-green-600">❤️ Mag ich:</p>
                        <p className="text-gray-700">{assignedWichtel.profile.likes}</p>
                      </div>
                    )}

                    {assignedWichtel.profile.dislikes && (
                      <div className="mb-3">
                        <p className="font-semibold text-red-600">❌ Mag ich nicht:</p>
                        <p className="text-gray-700">{assignedWichtel.profile.dislikes}</p>
                      </div>
                    )}

                    {assignedWichtel.profile.hobbies && (
                      <div className="mb-3">
                        <p className="font-semibold text-blue-600">🎨 Hobbies:</p>
                        <p className="text-gray-700">{assignedWichtel.profile.hobbies}</p>
                      </div>
                    )}

                    {assignedWichtel.profile.notes && (
                      <div className="mb-3">
                        <p className="font-semibold text-purple-600">📝 Zusätzliche Infos:</p>
                        <p className="text-gray-700">{assignedWichtel.profile.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedGroup.isShuffled && !assignedWichtel && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-yellow-800">
                Die Wichtel wurden verteilt, aber es gab ein Problem bei der Zuteilung. 
                Bitte kontaktiere den Admin.
              </p>
            </div>
          )}

          {!selectedGroup.isShuffled && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
              <p className="text-blue-800">
                ⏳ Die Wichtel wurden noch nicht verteilt. Fülle dein Profil aus und warte auf die Zuteilung!
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setCurrentView('home');
              setSelectedParticipant(null);
              setSelectedGroup(null);
            }}
            className="w-full mt-6 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
      <div className="text-center">
        <Gift className="w-16 h-16 mx-auto text-red-500 mb-4 animate-bounce" />
        <p className="text-gray-600">Lade...</p>
      </div>
    </div>
  );
}

export default WichtelApp;