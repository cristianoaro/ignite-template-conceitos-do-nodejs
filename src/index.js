const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  let { username } = request.headers;

  if (!users.find((user) => user.username == username)) {
    return response.status(404).json({ error: "Username not exists!" });
  }

  request.username = username;
  next();
}

app.post("/users", (request, response) => {
  let { name, username } = request.body;

  if (users.find((user) => user.username == username)) {
    return response.status(400).json({ error: "Username already exists!" });
  }

  let user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  let { username } = request;

  users.filter((user) => {
    if (user.username == username) {
      return response.status(200).json(user.todos);
    }
  });
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  let { username } = request;
  let { title, deadline } = request.body;

  let created_at = new Date().toISOString();

  let task = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at,
  };

  users.filter((user) => {
    if (user.username == username) {
      user.todos.push(task);
    }
  });

  return response.status(201).json(task);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  let { username } = request;
  let { id } = request.params;
  let { title, deadline } = request.body;

  let indexFilteredUser = users.findIndex((user) => user.username == username);

  let taskIndex = users[indexFilteredUser]["todos"].findIndex(
    (task) => task.id == id
  );

  if (taskIndex) {
    return response.status(404).json({ error: "Task not exists!" });
  }

  let oldTask = users[indexFilteredUser]["todos"][taskIndex];
  let newTask = { ...oldTask, title, deadline };

  users[indexFilteredUser]["todos"][taskIndex] = newTask;

  return response.status(200).json(newTask);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  let { username } = request;
  let { id } = request.params;

  let indexFilteredUser = users.findIndex((user) => user.username == username);

  let taskIndex = users[indexFilteredUser]["todos"].findIndex(
    (task) => task.id == id
  );

  if (taskIndex) {
    return response.status(404).json({ error: "Task not exists!" });
  }

  let oldTask = users[indexFilteredUser]["todos"][taskIndex];
  let newTask = { ...oldTask, done: true };

  users[indexFilteredUser]["todos"][taskIndex] = newTask;

  return response.status(200).json(newTask);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  let { username } = request;
  let { id } = request.params;

  let indexFilteredUser = users.findIndex((user) => user.username == username);

  let taskIndex = users[indexFilteredUser]["todos"].findIndex(
    (task) => task.id == id
  );

  console.log(taskIndex);

  if (taskIndex == -1) {
    return response.status(404).json({ error: "Task not exists!" });
  }

  users[indexFilteredUser]["todos"].splice(taskIndex, 1);

  return response.status(204).send();
});

module.exports = app;
