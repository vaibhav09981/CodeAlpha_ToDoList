const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const port = 3000;

const app = express();
const ejs = require("ejs");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// File path for storing tasks
const dataFilePath = path.join(__dirname, "tasks.json");

// Initialize data store
let todoTasks = [];
let lists = {};

// Default tasks
const defaultTasks = [];

// Load data from file if exists
function loadData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      todoTasks = data.todoTasks || [];
      lists = data.lists || {};
      console.log("Data loaded successfully");
    } else {
      // Initialize with default data
      todoTasks = [...defaultTasks];
      saveData();
      console.log("Initialized with default data");
    }
  } catch (err) {
    console.error("Error loading data:", err);
    todoTasks = [...defaultTasks];
  }
}

// Save data to file
function saveData() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify({ todoTasks, lists }), 'utf8');
    console.log("Data saved successfully");
  } catch (err) {
    console.error("Error saving data:", err);
  }
}

// Load data on startup
loadData();

app.get("/", (req, res) => {
  res.render("list", {
    listTitle: "Today",
    newListItems: todoTasks,
  });
});

app.get("/create-list", (req, res) => {
  const listName = req.query.listName;
  if (listName) {
    // Redirect to the new list
    res.redirect("/" + listName);
  } else {
    // If no list name provided, redirect to home
    res.redirect("/");
  }
});

app.get("/:DynamicNames", (req, res, next) => {
  const dynamicName = req.params.DynamicNames;
  
  // Skip if trying to access about page
  if (dynamicName === "about") {
    return next();
  }

  if (!lists[dynamicName]) {
    // Create a new list
    lists[dynamicName] = [];
    saveData();
  }

  res.render("list", {
    listTitle: dynamicName,
    newListItems: lists[dynamicName],
  });
});

app.post("/", (req, res) => {
  const taskName = req.body.newItem;
  const taskTime = req.body.newTime || "";
  const listName = req.body.list;

  const newTask = {
    id: Date.now().toString(),
    tasks: taskName,
    time: taskTime
  };

  if (listName === "Today") {
    todoTasks.push(newTask);
  } else {
    if (!lists[listName]) {
      lists[listName] = [];
    }
    lists[listName].push(newTask);
  }

  saveData();
  res.redirect(listName === "Today" ? "/" : "/" + listName);
});

app.post("/delete", (req, res) => {
  const checkedTaskItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    todoTasks = todoTasks.filter(task => task.id !== checkedTaskItem);
  } else {
    if (lists[listName]) {
      lists[listName] = lists[listName].filter(task => task.id !== checkedTaskItem);
    }
  }

  saveData();
  res.redirect(listName === "Today" ? "/" : "/" + listName);
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});