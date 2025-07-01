// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Animation is handled by CSS
    
    // Clear localStorage to remove pre-existing tasks
    localStorage.removeItem('tasks');
    localStorage.removeItem('timeSlots');
    localStorage.removeItem('scheduledTasks');
    
    // Wait for animation to complete before initializing the todo list functionality
    setTimeout(initTodoApp, 1500); // Reduced time to match faster animation
});

function initTodoApp() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoList = document.getElementById('todo-list');
    const tasksCounter = document.getElementById('tasks-counter');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Time Slot Elements
    const timeInput = document.getElementById('time-input');
    const addTimeBtn = document.getElementById('add-time-btn');
    const timeSlotsList = document.getElementById('time-slots-list');
    const timeSlotSelect = document.getElementById('time-slot-select');
    
    // Task Result Elements
    const taskResultCard = document.getElementById('task-result-card');
    const scheduledTasksList = document.getElementById('scheduled-tasks-list');
    
    // App State
    let tasks = [];
    let timeSlots = [];
    let scheduledTasks = [];
    let currentFilter = 'all';
    
    // Load data from localStorage
    function loadData() {
        const savedTasks = localStorage.getItem('tasks');
        const savedTimeSlots = localStorage.getItem('timeSlots');
        const savedScheduledTasks = localStorage.getItem('scheduledTasks');
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        }
        
        if (savedTimeSlots) {
            timeSlots = JSON.parse(savedTimeSlots);
            renderTimeSlots();
            updateTimeSlotSelect();
        }
        
        if (savedScheduledTasks) {
            scheduledTasks = JSON.parse(savedScheduledTasks);
            renderScheduledTasks();
        }
    }
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('timeSlots', JSON.stringify(timeSlots));
        localStorage.setItem('scheduledTasks', JSON.stringify(scheduledTasks));
    }
    
    // Add a new time slot
    function addTimeSlot(time) {
        if (!time) return;
        
        // Parse the time to get hours and minutes
        const timeParts = time.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        
        // Calculate end time (30 minutes later by default)
        let endHours = hours;
        let endMinutes = minutes + 30;
        
        // Adjust if minutes overflow
        if (endMinutes >= 60) {
            endHours = (endHours + 1) % 24;
            endMinutes = endMinutes % 60;
        }
        
        // Format end time
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        
        // Format for display
        const displayTime = `${time} to ${endTime}`;
        
        // Check if time slot already exists
        if (timeSlots.some(slot => slot.startTime === time && slot.endTime === endTime)) {
            alert('This time slot already exists!');
            return;
        }
        
        const newTimeSlot = {
            id: Date.now().toString(),
            startTime: time,
            endTime: endTime,
            displayTime: displayTime
        };
        
        timeSlots.push(newTimeSlot);
        saveData();
        renderTimeSlots();
        updateTimeSlotSelect();
        timeInput.value = '';}
    }
    
    // Add a new task
    function addTask(text, timeSlotId = null) {
        if (text.trim() === '') return;
        
        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date(),
            timeSlotId: timeSlotId
        };
        
        tasks.unshift(newTask); // Add to beginning of array
        
        // If a time slot was selected, create a scheduled task
        if (timeSlotId) {
            const selectedTimeSlot = timeSlots.find(slot => slot.id === timeSlotId);
            if (selectedTimeSlot) {
                const scheduledTask = {
                    id: Date.now().toString() + '-scheduled',
                    taskId: newTask.id,
                    text: text,
                    time: selectedTimeSlot.displayTime,
                    startTime: selectedTimeSlot.startTime,
                    endTime: selectedTimeSlot.endTime,
                    completed: false
                };
                
                scheduledTasks.push(scheduledTask);
                renderScheduledTasks();
                
                // Show the scheduled tasks card if it was hidden
                taskResultCard.style.display = 'block';
            }
        }
        
        saveData();
        renderTasks();
        taskInput.value = '';
        
        // Reset time slot select if it was visible
        if (timeSlotSelect.style.display !== 'none') {
            timeSlotSelect.style.display = 'none';
            timeSlotSelect.value = '';
        }
        
        // Add a little animation to the input
        taskInput.classList.add('success');
        setTimeout(() => taskInput.classList.remove('success'), 500);
    }
    
    // Delete a time slot
    function deleteTimeSlot(id) {
        // Check if any scheduled tasks use this time slot
        const hasScheduledTasks = scheduledTasks.some(task => {
            const slot = timeSlots.find(slot => slot.id === id);
            return slot && task.startTime === slot.startTime && task.endTime === slot.endTime;
        });
        
        if (hasScheduledTasks) {
            if (!confirm('This time slot has scheduled tasks. Deleting it will also remove those tasks. Continue?')) {
                return;
            }
            
            // Remove scheduled tasks with this time slot
            const slotToDelete = timeSlots.find(slot => slot.id === id);
            if (slotToDelete) {
                scheduledTasks = scheduledTasks.filter(task => 
                    !(task.startTime === slotToDelete.startTime && task.endTime === slotToDelete.endTime));
            }
        }
        
        timeSlots = timeSlots.filter(slot => slot.id !== id);
        saveData();
        renderTimeSlots();
        updateTimeSlotSelect();
        renderScheduledTasks();
        
        // Hide the scheduled tasks card if there are no more scheduled tasks
        if (scheduledTasks.length === 0) {
            taskResultCard.style.display = 'none';
        }
    }
    
    // Delete a task
    function deleteTask(id) {
        // Remove any scheduled tasks associated with this task
        scheduledTasks = scheduledTasks.filter(scheduledTask => scheduledTask.taskId !== id);
        
        tasks = tasks.filter(task => task.id !== id);
        saveData();
        renderTasks();
        renderScheduledTasks();
        
        // Hide the scheduled tasks card if there are no more scheduled tasks
        if (scheduledTasks.length === 0) {
            taskResultCard.style.display = 'none';
        }
    }
    
    // Delete a scheduled task
    function deleteScheduledTask(id) {
        scheduledTasks = scheduledTasks.filter(task => task.id !== id);
        saveData();
        renderScheduledTasks();
        
        // Hide the scheduled tasks card if there are no more scheduled tasks
        if (scheduledTasks.length === 0) {
            taskResultCard.style.display = 'none';
        }
    }
    
    // Toggle task completion status
    function toggleTaskStatus(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                // Also update any scheduled tasks associated with this task
                scheduledTasks = scheduledTasks.map(scheduledTask => {
                    if (scheduledTask.taskId === id) {
                        return { ...scheduledTask, completed: !task.completed };
                    }
                    return scheduledTask;
                });
                
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveData();
        renderTasks();
        renderScheduledTasks();
    }
    
    // Clear all completed tasks
    function clearCompleted() {
        // Get IDs of completed tasks
        const completedTaskIds = tasks.filter(task => task.completed).map(task => task.id);
        
        // Remove completed tasks
        tasks = tasks.filter(task => !task.completed);
        
        // Remove scheduled tasks associated with completed tasks
        scheduledTasks = scheduledTasks.filter(scheduledTask => {
            return !completedTaskIds.includes(scheduledTask.taskId);
        });
        
        saveData();
        renderTasks();
        renderScheduledTasks();
        
        // Hide the scheduled tasks card if there are no more scheduled tasks
        if (scheduledTasks.length === 0) {
            taskResultCard.style.display = 'none';
        }
    }
    
    // Filter tasks based on current filter
    function getFilteredTasks() {
        switch(currentFilter) {
            case 'active':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            default:
                return tasks;
        }
    }
    
    // Render time slots
    function renderTimeSlots() {
        timeSlotsList.innerHTML = '';
        
        if (timeSlots.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.classList.add('empty-message');
            emptyMessage.textContent = 'No time slots added yet.';
            timeSlotsList.appendChild(emptyMessage);
            return;
        }
        
        // Sort time slots by start time
        const sortedTimeSlots = [...timeSlots].sort((a, b) => {
            return a.startTime.localeCompare(b.startTime);
        });
        
        sortedTimeSlots.forEach(timeSlot => {
            const timeSlotItem = document.createElement('div');
            timeSlotItem.classList.add('time-slot-item');
            
            timeSlotItem.innerHTML = `
                <span>${timeSlot.displayTime}</span>
                <button class="time-slot-delete">×</button>
            `;
            
            const deleteBtn = timeSlotItem.querySelector('.time-slot-delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTimeSlot(timeSlot.id);
            });
            
            // Make the whole time slot clickable to select it for a task
            timeSlotItem.addEventListener('click', () => {
                // Show the time slot select dropdown
                timeSlotSelect.style.display = 'inline-block';
                timeSlotSelect.value = timeSlot.id;
            });
            
            timeSlotsList.appendChild(timeSlotItem);
        });
    }
    
    // Update the time slot select dropdown
    function updateTimeSlotSelect() {
        timeSlotSelect.innerHTML = '<option value="">Select a time slot</option>';
        
        // Sort time slots by start time
        const sortedTimeSlots = [...timeSlots].sort((a, b) => {
            return a.startTime.localeCompare(b.startTime);
        });
        
        sortedTimeSlots.forEach(timeSlot => {
            const option = document.createElement('option');
            option.value = timeSlot.id;
            option.textContent = timeSlot.displayTime;
            timeSlotSelect.appendChild(option);
        });
    }
    
    // Create HTML for a single task
    function createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        // Check if this task has a time slot
        let timeSlotInfo = '';
        if (task.timeSlotId) {
            const timeSlot = timeSlots.find(slot => slot.id === task.timeSlotId);
            if (timeSlot) {
                timeSlotInfo = `<span class="task-time">${timeSlot.displayTime}</span>`;
            }
        }
        
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            ${timeSlotInfo}
            <button class="task-delete"></button>
        `;
        
        // Add event listeners
        const checkbox = taskItem.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
        
        const deleteBtn = taskItem.querySelector('.task-delete');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        return taskItem;
    }
    
    // Create HTML for a scheduled task
    function createScheduledTaskElement(scheduledTask) {
        const taskItem = document.createElement('div');
        taskItem.classList.add('scheduled-task-item');
        if (scheduledTask.completed) {
            taskItem.classList.add('completed');
        }
        
        taskItem.innerHTML = `
            <div class="scheduled-task-time">${scheduledTask.time}</div>
            <div class="scheduled-task-content">
                <span class="scheduled-task-text">${scheduledTask.text}</span>
                <button class="scheduled-task-delete"></button>
            </div>
        `;
        
        const deleteBtn = taskItem.querySelector('.scheduled-task-delete');
        deleteBtn.addEventListener('click', () => deleteScheduledTask(scheduledTask.id));
        
        return taskItem;
    }
    
    // Render all tasks based on current filter
    function renderTasks() {
        const filteredTasks = getFilteredTasks();
        todoList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.classList.add('empty-message');
            emptyMessage.textContent = currentFilter === 'all' ? 
                'No tasks yet. Add one above!' : 
                `No ${currentFilter} tasks found.`;
            todoList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                todoList.appendChild(createTaskElement(task));
            });
        }
        
        // Update counter
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksCounter.textContent = activeTasks;
    }
    
    // Render scheduled tasks
    function renderScheduledTasks() {
        scheduledTasksList.innerHTML = '';
        
        if (scheduledTasks.length === 0) {
            taskResultCard.style.display = 'none';
            return;
        }
        
        taskResultCard.style.display = 'block';
        
        // Sort scheduled tasks by start time
        const sortedScheduledTasks = [...scheduledTasks].sort((a, b) => {
            return a.startTime ? a.startTime.localeCompare(b.startTime || '') : 0;
        });
        
        sortedScheduledTasks.forEach(scheduledTask => {
            scheduledTasksList.appendChild(createScheduledTaskElement(scheduledTask));
        });
    }
    
    // Set active filter
    function setFilter(filter) {
        currentFilter = filter;
        
        // Update active filter button
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        renderTasks();
    }
    
    // Event Listeners
    addTimeBtn.addEventListener('click', () => {
        addTimeSlot(timeInput.value);
    });
    
    timeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTimeSlot(timeInput.value);
        }
    });
    
    addTaskBtn.addEventListener('click', () => {
        const selectedTimeSlotId = timeSlotSelect.style.display !== 'none' ? timeSlotSelect.value : null;
        addTask(taskInput.value, selectedTimeSlotId);
    });
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const selectedTimeSlotId = timeSlotSelect.style.display !== 'none' ? timeSlotSelect.value : null;
            addTask(taskInput.value, selectedTimeSlotId);
        }
    });
    
    // Show time slot select when task input is focused
    taskInput.addEventListener('focus', () => {
        if (timeSlots.length > 0) {
            timeSlotSelect.style.display = 'inline-block';
        }
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });
    
    // Initialize
    loadData();
    
    // Hide the scheduled tasks card initially if there are no scheduled tasks
    if (scheduledTasks.length === 0) {
        taskResultCard.style.display = 'none';
    }
}