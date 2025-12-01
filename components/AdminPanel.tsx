import React, { useState } from 'react';
import { AppData, DigraphGroup, RhymeGroup } from '../types';
import { saveAppData, resetProgress } from '../services/storage';
import { X, Save, Trash2, Download, Upload, Plus, MessageCircle } from 'lucide-react';

interface AdminPanelProps {
  data: AppData;
  onUpdate: (newData: AppData) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ data, onUpdate, onClose }) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DigraphGroup | null>(null);
  const [editingRhyme, setEditingRhyme] = useState<RhymeGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'digraphs' | 'rhymes'>('digraphs');

  const handleLogin = () => {
    if (pin === data.pin) {
      setIsAuthenticated(true);
    } else {
      alert("Wrong PIN!");
      setPin('');
    }
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    const newGroups = data.groups.map(g => g.id === editingGroup.id ? editingGroup : g);
    if (!data.groups.find(g => g.id === editingGroup.id)) {
        newGroups.push(editingGroup);
    }
    
    const newData = { ...data, groups: newGroups };
    onUpdate(newData);
    saveAppData(newData);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (id: string) => {
      if (confirm("Delete this group?")) {
          const newData = { ...data, groups: data.groups.filter(g => g.id !== id) };
          onUpdate(newData);
          saveAppData(newData);
      }
  };

  const handleSaveRhyme = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingRhyme) return;
      
      const newRhymes = data.rhymeGroups.map(r => r.id === editingRhyme.id ? editingRhyme : r);
      if (!data.rhymeGroups.find(r => r.id === editingRhyme.id)) {
          newRhymes.push(editingRhyme);
      }

      const newData = { ...data, rhymeGroups: newRhymes };
      onUpdate(newData);
      saveAppData(newData);
      setEditingRhyme(null);
  };

  const handleDeleteRhyme = (id: string) => {
      if (confirm("Delete this rhyme group?")) {
          const newData = { ...data, rhymeGroups: data.rhymeGroups.filter(r => r.id !== id) };
          onUpdate(newData);
          saveAppData(newData);
      }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'digraph_data.json';
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const imported = JSON.parse(event.target?.result as string);
              if (imported.groups) {
                  onUpdate(imported);
                  saveAppData(imported);
                  alert("Import successful!");
              }
          } catch (err) {
              alert("Invalid file");
          }
      };
      reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
        <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Adults Only 🔐</h2>
          <input 
            type="password" 
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="text-4xl text-center border-2 border-slate-300 rounded-xl p-3 w-full mb-4 tracking-widest"
            placeholder="0000"
            maxLength={4}
          />
          <div className="flex gap-2">
            <button onClick={handleLogin} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold">Enter</button>
            <button onClick={onClose} className="bg-slate-200 text-slate-600 py-3 px-6 rounded-xl font-bold">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[60] overflow-y-auto">
      <div className="sticky top-0 bg-white shadow-sm p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-slate-700">Admin Dashboard</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X /></button>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8">
          
          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
              <button onClick={exportData} className="flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 p-4 rounded-xl font-bold">
                  <Download size={20} /> Export JSON
              </button>
              <label className="flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 p-4 rounded-xl font-bold cursor-pointer">
                  <Upload size={20} /> Import JSON
                  <input type="file" className="hidden" onChange={importData} accept=".json" />
              </label>
              <button onClick={() => { resetProgress(); alert("Progress cleared!"); }} className="col-span-2 text-red-500 text-sm font-bold p-2 border border-red-200 rounded-lg">
                  Reset Student Progress
              </button>
          </div>

          {/* TABS */}
          <div className="flex bg-slate-200 rounded-lg p-1">
             <button 
                onClick={() => setActiveTab('digraphs')}
                className={`flex-1 py-2 font-bold rounded-md transition-all ${activeTab === 'digraphs' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
             >
                Digraphs
             </button>
             <button 
                onClick={() => setActiveTab('rhymes')}
                className={`flex-1 py-2 font-bold rounded-md transition-all ${activeTab === 'rhymes' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
             >
                Rhyming Words
             </button>
          </div>

          {/* CONTENT */}
          {activeTab === 'digraphs' ? (
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">Digraph Groups</h3>
                      <button 
                        onClick={() => setEditingGroup({ id: Date.now().toString(), digraph: '', words: [], images: {} })}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-1 font-bold shadow"
                      >
                          <Plus size={16} /> New Group
                      </button>
                  </div>

                  {data.groups.map(group => (
                      <div key={group.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                          <div>
                              <div className="font-bold text-xl text-blue-600">{group.digraph}</div>
                              <div className="text-sm text-slate-500">{group.words.join(', ')}</div>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => setEditingGroup(group)} className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">Edit</button>
                              <button onClick={() => handleDeleteGroup(group.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={18} /></button>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">Rhyming Groups</h3>
                      <button 
                        onClick={() => setEditingRhyme({ id: Date.now().toString(), sound: '', words: [] })}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-1 font-bold shadow"
                      >
                          <Plus size={16} /> New Rhyme Set
                      </button>
                  </div>

                  {data.rhymeGroups.map(group => (
                      <div key={group.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                          <div>
                              <div className="font-bold text-xl text-purple-600">"{group.sound}" sound</div>
                              <div className="text-sm text-slate-500">{group.words.join(', ')}</div>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => setEditingRhyme(group)} className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">Edit</button>
                              <button onClick={() => handleDeleteRhyme(group.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={18} /></button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Edit DIGRAPH Modal */}
      {editingGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <form onSubmit={handleSaveGroup} className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">Edit Digraph</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-500 mb-1">Digraph (e.g. sh)</label>
                          <input 
                            required 
                            className="w-full border p-3 rounded-xl font-bold text-lg"
                            value={editingGroup.digraph}
                            onChange={e => setEditingGroup({...editingGroup, digraph: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-500 mb-1">Words (comma separated)</label>
                          <textarea 
                            required 
                            className="w-full border p-3 rounded-xl"
                            value={editingGroup.words.join(', ')}
                            onChange={e => setEditingGroup({...editingGroup, words: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button type="submit" className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                          <Save size={18} /> Save
                      </button>
                      <button type="button" onClick={() => setEditingGroup(null)} className="flex-1 bg-slate-200 text-slate-600 py-3 rounded-xl font-bold">Cancel</button>
                  </div>
              </form>
          </div>
      )}

      {/* Edit RHYME Modal */}
      {editingRhyme && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <form onSubmit={handleSaveRhyme} className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">Edit Rhyme Group</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-500 mb-1">Rhyme Sound (e.g. at, og)</label>
                          <input 
                            required 
                            className="w-full border p-3 rounded-xl font-bold text-lg"
                            value={editingRhyme.sound}
                            onChange={e => setEditingRhyme({...editingRhyme, sound: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-500 mb-1">Rhyming Words (comma separated)</label>
                          <textarea 
                            required 
                            className="w-full border p-3 rounded-xl h-32"
                            placeholder="cat, bat, rat, mat..."
                            value={editingRhyme.words.join(', ')}
                            onChange={e => setEditingRhyme({...editingRhyme, words: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button type="submit" className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                          <Save size={18} /> Save
                      </button>
                      <button type="button" onClick={() => setEditingRhyme(null)} className="flex-1 bg-slate-200 text-slate-600 py-3 rounded-xl font-bold">Cancel</button>
                  </div>
              </form>
          </div>
      )}

    </div>
  );
};