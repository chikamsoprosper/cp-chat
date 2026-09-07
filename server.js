const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	},
	serveClient: true
});
// Allow JSON data from signup/login requests
app.use(express.json());
// Serve CP Chat files
app.use(express.static(path.join(__dirname, "..")));
// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});
// ===============================
// SIGN UP
// ===============================
const users = [];
app.post("/signup", (req, res) => {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
        return res.status(400).json({
            message: "Please fill in all fields."
        });
    }
    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters."
        });
    }
    const existingUser = users.find(
        user =>
            user.email.toLowerCase() === email.toLowerCase() ||
            user.username.toLowerCase() === username.toLowerCase()
    );
    if (existingUser) {
        return res.status(409).json({
            message: "Email or username already exists."
        });
    }
    const newUser = {
        id: Date.now().toString(),
        name,
        username,
        email,
        password
    };
    users.push(newUser);
    console.log("New user registered:", username);
    res.status(201).json({
        message: "Account created successfully!"
    });
});
// ===============================
// LOG IN
// ===============================
app.post("/login", (req, res) => {
    const { email, password } = req.body;
	console.log("Login attempt:", email);
console.log("Registered users:", users);
    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter your email and password."
        });
    }
    const user = users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
    );
    if (!user || user.password !== password) {
        return res.status(401).json({
            message: "Invalid email or password."
        });
    }
    res.status(200).json({
        message: "Login successful!",
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email
        }
    });
});
// ===============================
// SOCKET.IO CHAT
// ===============================
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("chat message", (msg) => {
        io.emit("chat message", msg);
    });
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});
// ===============================
// SERVER
// ===============================
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
server.listen(PORT, HOST, () => {
    console.log(`CP Chat Server running on ${HOST}: port ${PORT}`);
});