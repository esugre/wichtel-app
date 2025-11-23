import React, { useState, useEffect } from 'react';
import { Gift, Users, Shuffle, Plus, Trash2, Upload } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

/**
 * WICHTEL-WEBAPP - Firebase Version
 * 
 * Diese Version nutzt Firebase Firestore als Datenbank
 * - Alle Daten werden in der Cloud gespeichert
 * - Echtzeit-Synchronisation zwischen allen Nutzern
 * - Funktioniert auf allen Geräten
 * 
 * Firestore erklärt:
 * - collection: Eine "Tabelle" in der Datenbank (z.B. "groups")
 * - doc: Ein einzelnes Dokument (z.B. eine Gruppe)
 * - addDoc: Neues Dokument hinzufügen
 * - updateDoc: Dokument aktualisieren
 * - deleteDoc: Dokument löschen
 * - onSnapshot: Echtzeit-Listener (Updates automatisch)
 */

function WichtelApp() {
  // ==================== STATE MANAGEMENT ====================
  const [currentView, setCurrentView] = useState('home');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ==================== FIREBASE DATEN LADEN ====================
  
  /**
   * useEffect - Lädt Gruppen aus Firebase beim Start
   * 
   * onSnapshot erklärt:
   * - Hört auf Änderungen in der Datenbank
   * - Wird automatisch aufgerufen, wenn sich Daten ändern
   * - Echtzeit-Updates ohne Reload!
   */
  useEffect(() => {
    // Referenz zur "groups" Collection in Firestore
    const groupsCollection = collection(db, 'groups');
    
    // Echtzeit-Listener aufsetzen
    const unsubscribe = onSnapshot(groupsCollection, (snapshot) => {
      const loadedGroups = [];
      
      // Durchlaufe alle Dokumente
      snapshot.forEach((doc) => {
        loadedGroups.push({
          firebaseId: doc.id, // Firebase-ID (brauchen wir für Updates)
          ...doc.data() // Alle Daten aus dem Dokument
        });
      });
      
      setGroups(loadedGroups);
      setLoading(false);
      console.log('Gruppen geladen:', loadedGroups.length);
    }, (error) => {
      console.error('Fehler beim Laden:', error);
      setLoading(false);
      alert('Fehler beim Laden der Daten. Bitte Seite neu laden.');
    });
    
    // Cleanup: Listener entfernen wenn Component unmounted
    return () => unsubscribe();
  }, []);

  // ==================== ADMIN-FUNKTIONEN ====================
  
  const handleAdminLogin = () => {
    if (adminPassword === 'wichtel2024') {
      setIsAdminAuthenticated(true);
      setCurrentView('admin');
    } else {
      alert('Falsches Passwort!');
    }
  };

  /**
   * createGroup - Erstellt eine neue Gruppe in Firebase
   * 
   * addDoc erklärt:
   * - Fügt ein neues Dokument zur Collection hinzu
   * - Firebase generiert automatisch eine eindeutige ID
   * - Gibt eine Promise zurück (daher async/await)
   */
  const createGroup = async () => {
    const groupName = prompt('Name der Wichtelgruppe:');
    if (!groupName) return;

    try {
      const newGroup = {
        id: Date.now(),
        name: groupName,
        participants: [],
        isShuffled: false,
        createdAt: new Date().toISOString()
      };

      // Füge zur Firebase-Collection hinzu
      await addDoc(collection(db, 'groups'), newGroup);
      
      alert(`Gruppe "${groupName}" erstellt!`);
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
      alert('Fehler beim Erstellen der Gruppe');
    }
  };

  /**
   * deleteGroup - Löscht eine Gruppe aus Firebase
   * 
   * deleteDoc erklärt:
   * - Löscht ein Dokument anhand seiner Firebase-ID
   * - doc(db, 'collection', 'id') erstellt eine Referenz zum Dokument
   */
  const deleteGroup = async (firebaseId) => {
    if (!confirm('Gruppe wirklich löschen? Alle Daten gehen verloren!')) return;
    
    try {
      // Lösche das Dokument aus Firebase
      await deleteDoc(doc(db, 'groups', firebaseId));
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen der Gruppe');
    }
  };

  /**
   * addParticipant - Fügt einen Teilnehmer zur Gruppe hinzu
   * 
   * updateDoc erklärt:
   * - Aktualisiert ein bestehendes Dokument
   * - Nur die angegebenen Felder werden geändert
   */
  const addParticipant = async (firebaseId, groupId) => {
    const participantName = prompt('Name des Teilnehmers:');
    if (!participantName) return;

    try {
      // Finde die Gruppe
      const group = groups.find(g => g.firebaseId === firebaseId);
      if (!group) return;

      // Erstelle neuen Teilnehmer
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

      // Aktualisiere die Gruppe in Firebase
      const updatedParticipants = [...group.participants, newParticipant];
      await updateDoc(doc(db, 'groups', firebaseId), {
        participants: updatedParticipants
      });
      
      alert(`Teilnehmer hinzugefügt!\n\n📱 Link-Code für ${participantName}:\n\n${linkCode}\n\nDiesen Code beim "Teilnehmer-Login" eingeben!`);
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      alert('Fehler beim Hinzufügen des Teilnehmers');
    }
  };

  const deleteParticipant = async (firebaseId, participantId) => {
    if (!confirm('Teilnehmer wirklich löschen?')) return;

    try {
      const group = groups.find(g => g.firebaseId === firebaseId);
      if (!group) return;

      const updatedParticipants = group.participants.filter(p => p.id !== participantId);
      await updateDoc(doc(db, 'groups', firebaseId), {
        participants: updatedParticipants
      });
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen des Teilnehmers');
    }
  };

  /**
   * shuffleWichtel - Fisher-Yates Shuffle mit Firebase-Update
   */
  const shuffleWichtel = async (firebaseId) => {
    const group = groups.find(g => g.firebaseId === firebaseId);
    
    if (!group || group.participants.length < 2) {
      alert('Mindestens 2 Teilnehmer nötig!');
      return;
    }

    if (group.isShuffled && !confirm('Wichtel wurden bereits verteilt. Neu verteilen?')) {
      return;
    }

    try {
      const participants = [...group.participants];
      const shuffled = [...participants];
      
      // Fisher-Yates Shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Zuweisungen erstellen
      const updatedParticipants = participants.map((participant, index) => {
        const nextIndex = (index + 1) % shuffled.length;
        return {
          ...participant,
          assignedTo: shuffled[nextIndex].id
        };
      });

      // In Firebase speichern
      await updateDoc(doc(db, 'groups', firebaseId), {
        participants: updatedParticipants,
        isShuffled: true
      });

      alert('Wichtel wurden verteilt! 🎄\n\nJeder Teilnehmer kann sich jetzt mit seinem Link-Code einloggen!');
    } catch (error) {
      console.error('Fehler beim Verteilen:', error);
      alert('Fehler beim Verteilen der Wichtel');
    }
  };

  // ==================== TEILNEHMER-FUNKTIONEN ====================

  /**
   * loadParticipantByLink - Findet einen Teilnehmer anhand des Link-Codes
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
   * updateParticipantProfile - Nur lokaler State (ohne Speichern)
   */
  const updateParticipantProfile = (updatedProfile) => {
    setSelectedParticipant({
      ...selectedParticipant,
      profile: updatedProfile
    });
  };

  /**
   * saveParticipantProfile - Speichert das Profil in Firebase
   */
  const saveParticipantProfile = async () => {
    try {
      // Finde die Gruppe und aktualisiere den Teilnehmer
      const updatedParticipants = selectedGroup.participants.map(p => {
        if (p.id === selectedParticipant.id) {
          return {
            ...p,
            profile: selectedParticipant.profile
          };
        }
        return p;
      });

      // Speichere in Firebase
      await updateDoc(doc(db, 'groups', selectedGroup.firebaseId), {
        participants: updatedParticipants
      });
      
      alert('Profil gespeichert! ✓');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern des Profils');
    }
  };

  /**
   * handleImageUpload - Konvertiert Bild zu Base64 und speichert in Firebase
   */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Bitte wähle eine Bilddatei aus!');
      return;
    }

    // Prüfe Dateigröße (max 1MB für Firebase)
    if (file.size > 1024 * 1024) {
      alert('Bild ist zu groß! Bitte max. 1MB.');
      return;
    }

    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const updatedProfile = {
          ...selectedParticipant.profile,
          imageUrl: reader.result
        };
        
        // Lokaler State
        setSelectedParticipant({
          ...selectedParticipant,
          profile: updatedProfile
        });
        
        // Firebase Update
        const updatedParticipants = selectedGroup.participants.map(p => {
          if (p.id === selectedParticipant.id) {
            return {
              ...p,
              profile: updatedProfile
            };
          }
          return p;
        });
        
        await updateDoc(doc(db, 'groups', selectedGroup.firebaseId), {
          participants: updatedParticipants
        });
        
        alert('Bild hochgeladen! ✓');
      } catch (error) {
        console.error('Fehler beim Upload:', error);
        alert('Fehler beim Hochladen des Bildes');
      }
    };

    reader.readAsDataURL(file);
  };

  // ==================== RENDERING ====================

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <Gift className="w-16 h-16 mx-auto text-red-500 mb-4 animate-bounce" />
          <p className="text-gray-600">Lade Daten...</p>
        </div>
      </div>
    );
  }

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
                <div key={group.firebaseId} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                      <p className="text-sm text-gray-500">
                        {group.participants.length} Teilnehmer
                        {group.isShuffled && ' • ✓ Wichtel verteilt'}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteGroup(group.firebaseId)}
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
                          onClick={() => deleteParticipant(group.firebaseId, participant.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addParticipant(group.firebaseId, group.id)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Teilnehmer hinzufügen
                    </button>
                    <button
                      onClick={() => shuffleWichtel(group.firebaseId)}
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
                <p className="text-xs text-gray-500 mt-1">Max. 1MB</p>
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