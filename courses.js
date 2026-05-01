const express = require('express');
const router = express.Router();
const dataStore = require('./utils/dataStore');

router.get('/', async (req, res) => {
    const courses = await dataStore.loadCourses();
    res.json(courses);
});

router.get('/:id', async (req, res) => {
    const courses = await dataStore.loadCourses();
    const course = courses.find(c => c.id == req.params.id);
    
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
});

router.post('/', async (req, res) => {
    const courses = await dataStore.loadCourses();
    
    const newCourse = {
        id: Date.now(),
        name: req.body.name,
        description: req.body.description,
        target_date: req.body.target_date,
        status: req.body.status || 'Not Started',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    courses.push(newCourse);
    await dataStore.saveCourses(courses);
    res.status(201).json(newCourse);
});

router.put('/:id', async (req, res) => {
    let courses = await dataStore.loadCourses();
    const index = courses.findIndex(c => c.id == req.params.id);
    
    if (index === -1) {
        return res.status(404).json({ message: "Course not found" });
    }

    courses[index] = { ...courses[index], ...req.body };
    
    await dataStore.saveCourses(courses);
    res.json(courses[index]);
});

router.delete('/:id', async (req, res) => {
    let courses = await dataStore.loadCourses();
    const filtered = courses.filter(c => c.id != req.params.id);
    
    if (courses.length === filtered.length) {
        return res.status(404).json({ message: "Course not found" });
    }

    await dataStore.saveCourses(filtered);
    res.status(204).send();
});

module.exports = router;