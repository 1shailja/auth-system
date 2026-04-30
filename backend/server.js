const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://shailjag1010_db_user:admin1234@ac-ul94cqy-shard-00-00.jpuuijw.mongodb.net:27017,ac-ul94cqy-shard-00-01.jpuuijw.mongodb.net:27017,ac-ul94cqy-shard-00-02.jpuuijw.mongodb.net:27017/?ssl=true&replicaSet=atlas-2rtrse-shard-0&authSource=admin&appName=Cluster0")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/api/auth", require("./routes/auth"));

app.listen(5000, () => console.log("Server running on port 5000"));