import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MessageSquare, Paperclip, Send, 
  User, Calendar, Clock, Trash2, 
  FileText, Image as ImageIcon, Download, 
  MoreVertical, Smile, Trash, 
  Users
} from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const TaskDetailModal = ({ isOpen, onClose, task }) => {
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'files'
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { addComment, uploadFile } = useTask();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const commentsEndRef = useRef(null);

  // Sync comments
  useEffect(() => {
    if (!isOpen || !task?.id) return;

    const commentsCol = collection(db, 'tasks', task.id, 'comments');
    const q = query(commentsCol, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [isOpen, task?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment(task.id, commentText);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile(task.id, file);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="w-full max-w-4xl h-[85vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Column: Details */}
            <div className="flex-1 p-8 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-8">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  task.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                  task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {task.priority} Priority
                </span>
                <button onClick={onClose} className="p-2 md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                {task.text}
              </h2>

              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {task.description || "No description provided for this task."}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Created</span>
                  </div>
                  <div className="font-semibold text-gray-700 dark:text-gray-200">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                  <div className="font-semibold text-gray-700 dark:text-gray-200 capitalize">
                    {task.status}
                  </div>
                </div>
              </div>

              {/* Collaborators */}
              <div className="mb-8">
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                  <Users className="w-4 h-4" />
                  Collaborators
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.collaboratorEmails?.map((email, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">
                        {email[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{email}</span>
                      {email === task.ownerEmail && (
                        <span className="text-[10px] bg-blue-500 text-white px-1.5 rounded ml-1">Owner</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interaction */}
            <div className="w-full md:w-[400px] flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
              {/* Tabs */}
              <div className="flex border-b border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                    activeTab === 'comments' ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  Comments ({comments.length})
                  {activeTab === 'comments' && (
                    <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('files')}
                  className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                    activeTab === 'files' ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  Files ({task.files?.length || 0})
                  {activeTab === 'files' && (
                    <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                  )}
                </button>
                <button onClick={onClose} className="p-4 hidden md:block hover:text-red-500 transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'comments' ? (
                  <div className="space-y-4">
                    {comments.map((comment, idx) => (
                      <div key={idx} className={`flex gap-3 ${comment.userId === currentUser.uid ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs text-white shrink-0 overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                          {comment.userPhoto ? (
                            <img src={comment.userPhoto} alt="" />
                          ) : (
                            comment.userName[0].toUpperCase()
                          )}
                        </div>
                        <div className={`max-w-[80%] ${comment.userId === currentUser.uid ? 'text-right' : ''}`}>
                          <div className="text-[10px] text-gray-400 mb-1 px-1">
                            {comment.userName} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className={`p-3 rounded-2xl text-sm ${
                            comment.userId === currentUser.uid 
                              ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20' 
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none shadow-sm'
                          }`}>
                            {comment.text}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all text-gray-500"
                    >
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Paperclip className="w-4 h-4" />
                          <span className="font-semibold text-sm">Upload File</span>
                        </>
                      )}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

                    {task.files?.map((file, idx) => (
                      <div key={idx} className="group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:border-blue-500">
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-blue-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{file.name}</div>
                          <div className="text-[10px] text-gray-400">by {file.uploadedBy}</div>
                        </div>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comment Input */}
              {activeTab === 'comments' && (
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800">
                  <form onSubmit={handleAddComment} className="relative">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-sm shadow-inner"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailModal;
