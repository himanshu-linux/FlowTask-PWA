import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  writeBatch,
  getDocs,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { actions } from '../utils/actionTypes';
import { db, storage } from '../firebase';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  loading: true, 
  statusFilter: 'All',
  priorityFilter: 'All',
  categoryFilter: 'All',
  searchQuery: '',
};

function taskReducer(state, action) {
  switch (action.type) {
    case actions.SET_TASKS:
      return { ...state, tasks: action.payload, loading: false };
    case actions.SET_LOADING:
      return { ...state, loading: action.payload };
    case actions.SET_STATUS:
      return { ...state, statusFilter: action.payload };
    case actions.SET_PRIORITY:
      return { ...state, priorityFilter: action.payload };
    case actions.SET_CATEGORY:
      return { ...state, categoryFilter: action.payload };
    case actions.SET_SEARCH:
      return { ...state, searchQuery: action.payload };
    case actions.REORDER_TASKS:
      return { ...state, tasks: action.payload };
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { currentUser } = useAuth();

  // ── Sync with Collaborative Tasks ───────────────────────────────────────
  useEffect(() => {
    if (!currentUser) {
      dispatch({ type: actions.SET_TASKS, payload: [], loading: false });
      return;
    }

    dispatch({ type: actions.SET_LOADING, payload: true });

    const tasksCol = collection(db, 'tasks');
    const q = query(
      tasksCol, 
      where('collaborators', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      
      dispatch({ type: actions.SET_TASKS, payload: tasksData });
    }, (error) => {
      console.error("Firestore Subscribe Error:", error);
      dispatch({ type: actions.SET_LOADING, payload: false });
    });

    return () => unsubscribe();
  }, [currentUser]);

  // ── Firestore Helper Actions ──────────────────────────────────────────────
  const firestoreActions = {
    addTask: async (taskData) => {
      if (!currentUser) return;
      const tasksCol = collection(db, 'tasks');
      const order = state.tasks.length;
      
      await addDoc(tasksCol, { 
        ...taskData, 
        order, 
        status: taskData.status || 'todo',
        completed: false,
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email,
        collaborators: [currentUser.uid],
        collaboratorEmails: [currentUser.email],
        commentsCount: 0,
        files: [],
        createdAt: Date.now() 
      });
    },

    toggleTask: async (id) => {
       const task = state.tasks.find(t => t.id === id);
       if (!task) return;
       const isCompleting = !task.completed;
       const taskRef = doc(db, 'tasks', id);
       await updateDoc(taskRef, { 
         completed: isCompleting,
         status: isCompleting ? 'completed' : 'todo',
         completedAt: isCompleting ? Date.now() : null
       });
    },

    moveTask: async (id, newStatus, newOrder) => {
      const taskRef = doc(db, 'tasks', id);
      const isCompleting = newStatus === 'completed';
      await updateDoc(taskRef, {
        status: newStatus,
        order: newOrder,
        completed: isCompleting,
        completedAt: isCompleting ? Date.now() : null
      });
    },

    editTask: async (id, data) => {
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, data);
    },

    deleteTask: async (id) => {
      const taskRef = doc(db, 'tasks', id);
      await deleteDoc(taskRef);
    },

    reorderTasks: async (newOrderTasks) => {
      const batch = writeBatch(db);
      newOrderTasks.forEach((task, index) => {
        const taskRef = doc(db, 'tasks', task.id);
        batch.update(taskRef, { order: index });
      });
      await batch.commit();
    },

    clearCompleted: async () => {
      const completedTasks = state.tasks.filter(t => t.status === 'completed' || t.completed);
      const batch = writeBatch(db);
      completedTasks.forEach(task => {
        const taskRef = doc(db, 'tasks', task.id);
        batch.delete(taskRef);
      });
      await batch.commit();
    },

    // ── Collaborative Specific Actions: Using Atomic Operators ──────────
    shareTask: async (taskId, email) => {
      const usersCol = collection(db, 'users');
      const userQuery = query(usersCol, where('email', '==', email.toLowerCase()));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error('User not found. They must sign up for TaskFlow first.');
      }
      
      const targetUser = userSnapshot.docs[0].data();
      const taskRef = doc(db, 'tasks', taskId);
      
      await updateDoc(taskRef, {
        collaborators: arrayUnion(targetUser.uid),
        collaboratorEmails: arrayUnion(targetUser.email)
      });
    },

    uploadFile: async (taskId, file) => {
      if (!currentUser) return;
      
      const fileId = Date.now() + '-' + file.name;
      const storageRef = ref(storage, `tasks/${taskId}/${fileId}`);
      
      // Upload to Storage
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      // Update Task metadata atomically
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        files: arrayUnion({
          id: fileId,
          name: file.name,
          url: url,
          type: file.type,
          uploadedAt: Date.now(),
          uploadedBy: currentUser.email
        })
      });
    },

    addComment: async (taskId, text) => {
      if (!currentUser) return;
      const commentsCol = collection(db, 'tasks', taskId, 'comments');
      const taskRef = doc(db, 'tasks', taskId);

      await addDoc(commentsCol, {
        text,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        userPhoto: currentUser.photoURL,
        createdAt: Date.now()
      });

      // Increment count atomically
      await updateDoc(taskRef, {
        commentsCount: increment(1)
      });
    }
  };

  // ── Filtering Logic ──────────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    return state.tasks.filter(task => {
      const matchStatus   = state.statusFilter === 'All' 
        ? true 
        : state.statusFilter === 'Completed' ? task.completed : !task.completed;
      const matchPriority = state.priorityFilter === 'All' ? true : task.priority === state.priorityFilter;
      const matchCategory = state.categoryFilter === 'All' ? true : task.category === state.categoryFilter;
      const matchSearch   = task.text.toLowerCase().includes(state.searchQuery.toLowerCase());
      
      return matchStatus && matchPriority && matchCategory && matchSearch;
    });
  }, [state.tasks, state.statusFilter, state.priorityFilter, state.categoryFilter, state.searchQuery]);

  const activeCount = state.tasks.filter(t => !t.completed).length;
  const completedCount = state.tasks.filter(t => t.completed).length;

  const value = {
    state,
    dispatch,
    filteredTasks,
    activeCount,
    completedCount,
    ...firestoreActions,
    // Add compatible action helpers
    actions: {
      setStatusFilter: (v) => ({ type: actions.SET_STATUS, payload: v }),
      setPriorityFilter: (v) => ({ type: actions.SET_PRIORITY, payload: v }),
      setCategoryFilter: (v) => ({ type: actions.SET_CATEGORY, payload: v }),
      setSearchQuery: (v) => ({ type: actions.SET_SEARCH, payload: v }),
    }
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTask = () => useContext(TaskContext);
