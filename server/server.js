const express = require('express')
const app = express();

// exemple
app.get("/api", (req,res)=>{
    res.json({"users": ["user1", "user2"]})
})

app.listen(5000, console.log("Serveur connecté au port 5000"))