import React, { useState, useEffect } from 'react';
import { Heart, Plus, Search, Calendar, Users, BookOpen, Upload, Send, X } from 'lucide-react';

const MemorialApp = () => {
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [newMemory, setNewMemory] = useState({
    title: '',
    date: '',
    story: '',
    author: '',
    image: null
  });

  const [commentForm, setCommentForm] = useState({
    text: '',
    author: ''
  });

  // API base URL - adjust for production
  const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

  // Demo data for local testing
  useEffect(() => {
    // Since we can't actually connect to a server in this demo,
    // we'll use local state with sample data
    const sampleMemories = [
      {
        id: 1,
        title: 'יום הגיוס',
        date: '2022-07-15',
        story: 'היום שבו התחיל את שירותו הצבאי. היה כל כך גאה ונחוש לשרת את המדינה. זכור אותו עומד בגאווה עם המדים החדשים.',
        author: 'אמא',
        image_url: null,
        comments: [
          { id: 1, author: 'אבא', text: 'זכור אותו כל כך נרגש באותו יום', created_at: '2024-01-15' },
          { id: 2, author: 'אחות', text: 'תמיד הסתכלתי עליו בהערצה', created_at: '2024-01-16' }
        ]
      },
      {
        id: 2,
        title: 'חופשה בצפון',
        date: '2023-03-20',
        story: 'הטיול המשפחתי האחרון שלנו לכנרת. איך הוא אהב את הטבע ואת הזמן המשותף. שם ליד המים, צוחק עם כולנו.',
        author: 'דוד',
        image_url: null,
        comments: [
          { id: 3, author: 'דודה', text: 'איך הוא צחק כל הזמן באותו טיול', created_at: '2024-01-17' }
        ]
      }
    ];
    setMemories(sampleMemories);
  }, []);

  // Filter memories based on search
  const filteredMemories = memories.filter(memory =>
    memory.title.includes(searchTerm) || 
    memory.story.includes(searchTerm) ||
    memory.author.includes(searchTerm)
  );

  // Add new memory (local demo version)
  const handleAddMemory = async () => {
    if (!newMemory.title || !newMemory.story || !newMemory.author) {
      setError('יש למלא את כל השדות הנדרשים');
      return;
    }

    try {
      setLoading(true);
      
      // In production, this would be an API call
      // For demo, we'll add to local state
      const memory = {
        ...newMemory,
        id: Date.now(),
        comments: [],
        image_url: newMemory.image ? URL.createObjectURL(newMemory.image) : null
      };
      
      setMemories([memory, ...memories]);
      setNewMemory({ title: '', date: '', story: '', author: '', image: null });
      setShowAddForm(false);
      setError('');
      
    } catch (err) {
      setError('שגיאה בהוספת הזיכרון');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle image file selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('הקובץ גדול מדי (מקסימום 10MB)');
        return;
      }
      setNewMemory({ ...newMemory, image: file });
    }
  };

  // Add comment to memory (local demo version)
  const handleAddComment = (memoryId) => {
    if (!commentForm.text.trim() || !commentForm.author.trim()) return;

    const newComment = {
      id: Date.now(),
      author: commentForm.author,
      text: commentForm.text,
      created_at: new Date().toISOString()
    };

    setMemories(memories.map(memory => 
      memory.id === memoryId 
        ? { ...memory, comments: [...memory.comments, newComment] }
        : memory
    ));

    // Update selected memory if it's open
    if (selectedMemory && selectedMemory.id === memoryId) {
      setSelectedMemory({
        ...selectedMemory,
        comments: [...selectedMemory.comments, newComment]
      });
    }

    setCommentForm({ text: '', author: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-8 h-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-800">זכרו לנצח</h1>
            </div>
            <p className="text-gray-600">מקום לשתף זיכרונות וסיפורים יקרים</p>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
                <button 
                  onClick={() => setError('')}
                  className="mr-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש זיכרונות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'טוען...' : 'הוספת זיכרון'}
          </button>
        </div>

        {/* Add Memory Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-right">הוספת זיכרון חדש</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="כותרת הזיכרון *"
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                className="p-3 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newMemory.date}
                onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <input
              type="text"
              placeholder="שם המספר *"
              value={newMemory.author}
              onChange={(e) => setNewMemory({ ...newMemory, author: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-right focus:ring-2 focus:ring-blue-500"
            />
            
            <textarea
              placeholder="ספר את הסיפור... *"
              rows="4"
              value={newMemory.story}
              onChange={(e) => setNewMemory({ ...newMemory, story: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-right focus:ring-2 focus:ring-blue-500"
            />

            {/* Image Upload */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 text-right">הוספת תמונה:</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                <label className="flex items-center gap-2 cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                  <Upload className="w-4 h-4" />
                  בחר תמונה
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {newMemory.image && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 px-3 py-2 bg-green-100 rounded-lg">
                      תמונה נבחרה: {newMemory.image.name}
                    </span>
                    <button
                      onClick={() => setNewMemory({ ...newMemory, image: null })}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddMemory}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'שומר...' : 'שמור זיכרון'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                ביטול
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !showAddForm && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">טוען זיכרונות...</p>
          </div>
        )}

        {/* Memories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map((memory) => (
            <div key={memory.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {memory.image_url && (
                <img
                  src={memory.image_url}
                  alt={memory.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{formatDate(memory.date)}</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-right">{memory.title}</h3>
                <p className="text-gray-700 mb-4 text-right">
                  {memory.story.length > 150 ? memory.story.substring(0, 150) + '...' : memory.story}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 font-medium">{memory.author}</span>
                  <button
                    onClick={() => setSelectedMemory(memory)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    קרא עוד
                  </button>
                </div>
                {memory.comments && memory.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      {memory.comments.length} תגובות
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMemories.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">אין זיכרונות להצגה</h3>
            <p className="text-gray-400">נסה לשנות את החיפוש או להוסיף זיכרון חדש</p>
          </div>
        )}
      </div>

      {/* Memory Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            {selectedMemory.image_url && (
              <img
                src={selectedMemory.image_url}
                alt={selectedMemory.title}
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{formatDate(selectedMemory.date)}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-right">{selectedMemory.title}</h2>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 text-right leading-relaxed whitespace-pre-wrap">
                {selectedMemory.story}
              </p>
              
              <div className="text-sm text-blue-600 font-medium mb-6 text-right">
                נכתב על ידי: {selectedMemory.author}
              </div>

              {/* Comments */}
              <div className="border-t pt-6">
                <h4 className="font-bold mb-4 text-right">תגובות והוספות</h4>
                
                {selectedMemory.comments && selectedMemory.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-gray-700 text-right mb-1">{comment.text}</p>
                    <p className="text-sm text-blue-600 text-right">{comment.author}</p>
                  </div>
                ))}

                {/* Add Comment Form */}
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="השם שלך"
                    value={commentForm.author}
                    onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-right text-sm"
                  />
                  <textarea
                    placeholder="הוסף זיכרון או מחשבה..."
                    rows="2"
                    value={commentForm.text}
                    onChange={(e) => setCommentForm({ ...commentForm, text: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-right text-sm"
                  />
                  <button
                    onClick={() => handleAddComment(selectedMemory.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    הוסף תגובה
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemorialApp;
