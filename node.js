const express = require("express")
const morgan = require("morgan");
require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require('./config/database');
const routes = require('./routes/index');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
const connectDb = require("./src/config/db");
const userRoutes = require("./src/routes/user.routes");


// middlewares
app.use(express.json());
app.use(morgan("dev"));

if (process.env.NODE_ENV === "production") { app.use((req, res, next) => {console.log(`${req.method} ${req.url}`); next();}); }

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// routes
app.use("/api/users", userRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});
app.listen(port, () => {
    connectDb();
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});