import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';  // Import the Quill editor styles

const App = () => {
  const [editorContent, setEditorContent] = useState('');  // State for rich text editor content
  const [tasks, setTasks] = useState([]);  // Store tasks from the API response
  const [loading, setLoading] = useState(true);  // Loading state for initial tasks from the database
  const [generating, setGenerating] = useState(false);  // Generating state for task creation

  // Handle content change in the editor
  const handleEditorChange = (value) => {
    setEditorContent(value);
  };

  // Function to load tasks from the backend
  const loadTasks = async () => {
    setLoading(true);  // Set loading state true when loading tasks from the database
    try {
      const response = await axios.get('http://localhost:8040/ai/loadTasks');
      console.log("Tasks loaded:", response.data);
      setTasks(response.data);  // Set fetched tasks to state
    } catch (error) {
      console.error('Error loading tasks:', error);
      alert('An error occurred while loading tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a task from the backend or UI
  const deleteTask = async (taskId, index) => {
    if (taskId) {
      // If task has an ID, make the delete request to the backend
      try {
        await axios.delete(`http://localhost:8040/ai/deleteTask/${taskId}`);
        console.log("Task deleted:", taskId);

        // Remove the deleted task from the state
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('An error occurred while deleting the task. Please try again.');
      }
    } else {
      // If task doesn't have an ID, just remove it from the UI (state)
      setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
    }
  };

  // Function to save a task to the backend
  const saveTask = async (task) => {
    setGenerating(true);  // Set generating state true when saving a task
    try {
      const response = await axios.post('http://localhost:8040/ai/saveTask', task, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Task saved successfully:', response.data);
      alert('Task saved!');
    } catch (error) {
      console.error('Error saving task:', error);
      alert('An error occurred while saving the task. Please try again.');
    } finally {
      setGenerating(false);  // Set generating state false after saving task
    }
  };

  // Function to handle input changes in each task's fields
  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  // Function to generate tasks based on editor content
  const generateTasks = async () => {
    setGenerating(true);  // Set generating state true when generating tasks
    try {
      console.log("Generating tasks...");

      // Extract plain text from the Quill editor content
      const plainText = extractPlainText(editorContent);

      // Send the plain text as the request body to generate tasks
      const response = await axios.post('http://localhost:8040/ai/generateTasks', plainText, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Tasks generated:", response.data);
      setTasks(response.data);  // Set generated tasks to state
    } catch (error) {
      console.error('Error generating tasks:', error);
      alert('An error occurred while generating tasks. Please try again.');
    } finally {
      setGenerating(false);  // Set generating state false after generating
    }
  };

  // Function to remove HTML tags and extract plain text
  const extractPlainText = (htmlContent) => {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    return doc.body.textContent || "";  // Get plain text from the HTML content
  };

  // Fetch tasks when the component mounts
  useEffect(() => {
    loadTasks();  // Call the loadTasks function when the component mounts
  }, []);

    // Function to clear the editor content and tasks list
    const clearAll = () => {
      setEditorContent('');  // Clear the editor content
    };
    
  return (
    <div className="app">
      <h1>Smart AI Task Manager</h1>

      <div>
        <ReactQuill
          value={editorContent}
          onChange={handleEditorChange}
          theme="snow"
          placeholder="Enter task details with priorities, deadlines, etc."
        />
      </div>

      <div>
        <button onClick={generateTasks} disabled={generating}>
          {generating ? 'Generating tasks...' : 'Help me generate tasks'}
        </button>

        <button onClick={clearAll} style={{ backgroundColor: 'grey', color: 'white', marginTop: '10px' }}>
          Wipe it !!
        </button>
      </div>
      <div>
        <h2>Tasks</h2>
        {loading && <p>Loading tasks from the backend...</p>}

        {tasks.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Deadline</th>
                <th>Dedication</th>
                <th>Done</th>
                <th>Delete</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task.id || index}>
                  <td>
                    <input
                      type="text"
                      value={task.title || ''}
                      onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                    />
                  </td>

                  <td>
                    <textarea
                      value={task.description || ''}
                      onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                    />
                  </td>

                  <td width='30px'>
                    <input 
                      type="date"
                      value={task.deadline || ''}
                      style={{ width: '100px'}}
                      onChange={(e) => handleTaskChange(index, 'deadline', e.target.value)}
                    />
                  </td>

                  <td width='20px'>
                    <input
                      type="number"
                      value={task.dailyTimeCommitment || ''}
                      style={{ width: '40px'}}
                      onChange={(e) => handleTaskChange(index, 'dailyTimeCommitment', e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="checkbox"
                      checked={task.completed || false}
                      onChange={(e) => handleTaskChange(index, 'completed', e.target.checked)}
                    />
                  </td>

                  <td>
                    <button onClick={() => deleteTask(task.id, index)} style={{ backgroundColor: 'red', color: 'white', marginRight: '5px' }}>
                      Delete
                    </button>
                  </td>

                  <td>
                    <button onClick={() => saveTask(task)} disabled={generating} style={{ backgroundColor: 'green', color: 'white' }}>
                      {generating ? 'Saving...' : 'Save'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && <p>No tasks available</p>
        )}
      </div>
    </div>
  );
};

export default App;