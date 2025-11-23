import React, { useState, useEffect } from 'react';
import { Gift, Users, Shuffle, Plus, Trash2, Upload, Eye, EyeOff } from 'lucide-react';

/**
 * WICHTEL-WEBAPP - Hauptkomponente (Netlify-Version)
 * 
 * Diese Version nutzt localStorage statt window.storage
 * localStorage ist ein Browser-Feature, das Daten lokal speichert
 * - Funktioniert in jedem Browser
 * - Daten bleiben auch nach Seiten-Reload erhalten
 * - Wird pro Domain gespeichert
 */

function WichtelApp() {
  // ==================== STATE MANAGEMENT ====================
  const [currentView, setCurrentView] = useState('home');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // ==================== DATEN LADEN UND SPEICHERN ====================
  
  /**
   * useEffect - Lädt Daten beim Start der App
   */
  useEffect(() => {
    loadGroups();
  }, []);

  /**
   * loadGroups - Lädt gespeicherte Gruppen aus localStorage
   * 
   * localStorage erklärt:
   * - localStorage.getItem('key') holt einen gespeicherten Wert
   * - Gibt einen String zurück oder null wenn nicht vorhanden
   * - JSON.parse() wandelt den String zurück in ein JavaScript-Objekt
   */
  const loadGroups = () => {
    try {
      // Hole den gespeicherten String aus localStorage
      const savedGroups = localStorage.getItem('wichtel-groups');
      
      if (savedGroups) {
        // Wandle den JSON-String zurück in ein Array
        const parsedGroups = JSON.parse(savedGroups);
        setGroups(parsedGroups);
        console.log('Gruppen geladen:', parsedGroups.length);
      } else {
        console.log('Keine gespeicherten Gruppen gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      // Bei Fehler: Leeres Array verwenden
      setGroups([]);
    }
  };

  /**
   * saveGroups - Speichert alle Gruppen in localStorage
   * 
   * localStorage.setItem erklärt:
   * - localStorage.setItem('key', 'value') speichert einen Wert
   * - Kann nur Strings speichern, daher JSON.stringify()
   * - Bleibt gespeichert bis der Browser-Cache gelöscht wird
   */
  const saveGroups = (updatedGroups) => {
    try {
      // Wandle das Array in einen JSON-String um
      const jsonString = JSON.stringify(updatedGroups);
      
      // Speichere in localStorage
      localStorage.setItem('wichtel-groups', jsonString);
      console.log('Gruppen gespeichert:', updatedGroups.length);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Daten. Ist der Browser-Speicher voll?');
    }
  };

  // ==================== ADMIN-FUNKTIONEN ====================
  
  const handleAdminLogin = () => {
    if (adminPassword === 'wichtel2024') {
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
    } else {
      alert('Falsches Passwort!');
    }
  };

  const createGroup = () => {
    const groupName = prompt('Name der Wichtelgruppe:');
    if (!groupName) return;

    const newGroup = {
      id: Date.now(),
      name: groupName,
      participants: [],
      isShuffled: false,
      createdAt: new Date().toISOString()
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    
    alert(`Gruppe "${groupName}" erstellt!`);
  };

  const deleteGroup = (groupId) => {
    if (!confirm('Gruppe wirklich löschen? Alle Daten gehen verloren!')) return;
    
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    saveGroups(updatedGroups);
  };

  /**
   * addParticipant - Fügt einen neuen Teilnehmer hinzu
   * 
   * Der linkCode ist das, was der Teilnehmer später eingibt!
   * Format: name + zufällige Zahl (z.B. "heidi472")
   */
  const addParticipant = (groupId) => {
    const participantName = prompt('Name des Teilnehmers:');
    if (!participantName) return;

    // Erstelle einen kurzen, merkbaren Link-Code
    // toLowerCase() = Kleinbuchstaben
    // replace(/\s+/g, '') = Entferne alle Leerzeichen
    // Date.now() % 1000 = Zufällige 3-stellige Zahl
    const linkCode = participantName.toLowerCase().replace(/\s+/g, '').substring(0, 10) + (Date.now() % 1000);

    const newParticipant = {
      id: Date.now(),
      name: participantName,
      linkCode: linkCode,
      profile: {
        imageUrl: null,
        wishes: '',
        likes: '',
        dislikes: '',
        hobbies: '',
        notes: ''
      },
      assignedTo: null
    };

    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          participants: [...group.participants, newParticipant]
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    saveGroups(updatedGroups);
    
    // Zeige den Link-Code an - DAS muss der Teilnehmer eingeben!
    alert(`Teilnehmer hinzugefügt!\n\n📱 Link-Code für ${participantName}:\n\n${linkCode}\n\nDiesen Code beim "Teilnehmer-Login" eingeben!`);
  };

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
   * shuffleWichtel - Fisher-Yates Shuffle Algorithmus
   * 
   * Verteilt die Wichtel fair und zufällig
   * Jeder bekommt genau einen Wichtel, niemand sich selbst
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

    const participants = [...group.participants];
    const shuffled = [...participants];
    
    // Fisher-Yates Shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Weise zu: Jeder bekommt den nächsten in der Liste
    // Der letzte bekommt den ersten (Kreis)
    const updatedParticipants = participants.map((participant, index) => {
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
    alert('Wichtel wurden verteilt! 🎄\n\nJeder Teilnehmer kann sich jetzt mit seinem Link-Code einloggen!');
  };

  // ==================== TEILNEHMER-FUNKTIONEN ====================

  /**
   * loadParticipantByLink - Findet einen Teilnehmer anhand des Link-Codes
   * 
   * Der Link-Code ist z.B. "heidi472"
   * Durchsucht alle Gruppen nach diesem Code
   */
  const loadParticipantByLink = (linkCode) => {
    console.log('Suche Teilnehmer mit Code:', linkCode);
    
    for (const group of groups) {
      const participant = group.participants.find(p => p.linkCode === linkCode);
      
      if (participant) {
        console.log('Teilnehmer gefunden:', participant.name);
        setSelectedGroup(group);
        setSelectedParticipant(participant);
        setCurrentView('participant');
        return true;
      }
    }
    
    alert('Ungültiger Link-Code! Bitte den Code nochmal prüfen.');
    return false;
  };

  /**
   * updateParticipantProfile - Aktualisiert nur den lokalen State (OHNE Speichern)
   * 
   * Wird bei jeder Tastatureingabe aufgerufen
   * Speichert NICHT in localStorage (das macht saveParticipantProfile)
   */
  const updateParticipantProfile = (updatedProfile) => {
    // Aktualisiere nur den lokalen State
    setSelectedParticipant({
      ...selectedParticipant,
      profile: updatedProfile
    });
  };

  /**
   * saveParticipantProfile - Speichert das Profil dauerhaft
   * 
   * Wird nur beim Klick auf den Speichern-Button aufgerufen
   */
  const saveParticipantProfile = () => {
    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          participants: group.participants.map(p => {
            if (p.id === selectedParticipant.id) {
              return {
                ...p,
                profile: selectedParticipant.profile
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
    
    alert('Profil gespeichert! ✓');
  };

  /**
   * handleImageUpload - Konvertiert Bild zu Base64
   * 
   * FileReader erklärt:
   * - Liest Dateien vom Computer
   * - readAsDataURL wandelt in Base64-String um
   * - Base64 kann direkt in <img src="..."> verwendet werden
   */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle eine Bilddatei aus!');
      return;
    }

    const reader = new FileReader();
    
    reader.onloadend = () => {
      const updatedProfile = {
        ...selectedParticipant.profile,
        imageUrl: reader.result
      };
      updateParticipantProfile(updatedProfile);
    };

    reader.readAsDataURL(file);
  };

  // ==================== RENDERING ====================

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
                  const code = prompt('Gib deinen Link-Code ein (z.B. heidi472):');
                  if (code) loadParticipantByLink(code.trim().toLowerCase());
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Teilnehmer-Login
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500 space-y-2">
              <p>💡 <strong>Admin:</strong> Erstelle Gruppen und verwalte Teilnehmer</p>
              <p>🎁 <strong>Teilnehmer:</strong> Fülle dein Profil aus und sieh deinen Wichtel</p>
              <p className="text-xs mt-4 text-gray-400">
                Tipp: Der Link-Code wird dir vom Admin geschickt!
              </p>
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
                          <p className="text-xs text-gray-500 font-mono bg-yellow-100 px-2 py-1 rounded inline-block">
                            Link-Code: {participant.linkCode}
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

              {/* SPEICHERN-BUTTON */}
              <button
                onClick={saveParticipantProfile}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Profil speichern
              </button>
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