const express = require('express');
const cors = require('cors');
const coursesRoutes = require('./courses');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Welcome to CodeCraftHub API! Go to /api/courses to see the data.');
});

app.use('/api/courses', coursesRoutes);

app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});