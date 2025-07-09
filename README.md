# ToDoList CodeAlpha

This is a simple ToDo List web application built with Node.js, Express, and EJS templating. It allows users to create and manage tasks in different lists dynamically.

## Features

- Add, view, and delete tasks.
- Create custom lists by specifying list names in the URL.
- Tasks and lists are persisted in a JSON file (`tasks.json`).


## Installation

1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone the repository or download the project files.
3. Run `npm install` to install dependencies.

## Running the Application

Start the server with:

```bash
node app.js
```

The app will be running on [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app.js` - Main application file with Express server and routes.
- `Views/` - EJS templates for rendering pages.
- `Public/` - Static files like CSS.
- `tasks.json` - JSON file storing tasks and lists data.

## Usage

- Access the default list at `/`.
- Create custom lists by navigating to `/listName`.
- Add tasks via the form on each list page.
- Delete tasks using the checkbox and delete button.

## License

This project is open source and free to use.
