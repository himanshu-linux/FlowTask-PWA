import { useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { notificationService } from '../services/notificationService';
import toast from 'react-hot-toast';

export default function ReminderManager() {
  const { filteredTasks, editTask } = useTask();

  useEffect(() => {
    // Run check every 30 seconds
    const interval = setInterval(() => {
      const now = new Date();
      
      filteredTasks.forEach(async (task) => {
        // Only check active tasks with a due date and time that haven't been notified yet
        if (task.completed || !task.dueDate || !task.dueTime || task.notified) return;

        // Combine date and time
        const [year, month, day] = task.dueDate.split('-');
        const [hours, minutes] = task.dueTime.split(':');
        const dueDateTime = new Date(year, month - 1, day, hours, minutes);

        // If current time >= due time
        if (now >= dueDateTime) {
          // 1. Play professional sound
          notificationService.playSound();

          // 2. Decide behavior: Native notification + Toast
          const title = 'Task Reminder';
          const body = `Time to focus on: ${task.text}`;

          // Native notification (if backgrounded or permission granted)
          notificationService.notify(title, body);

          // In-app Toast
          toast(body, {
            icon: '⏰',
            duration: 6000,
            style: {
              borderRadius: '16px',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              fontWeight: 'bold',
            },
          });

          // 3. Mark as notified in Firestore so we don't repeat
          try {
            await editTask(task.id, { notified: true });
          } catch (err) {
            console.error('Failed to update notified status:', err);
          }
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [filteredTasks, editTask]);

  return null; // Headless component
}
