const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

const DATA_FILE = path.join(__dirname, 'courses.json');
const PORT = 5000;

app.use(cors());
app.use(express.json());

function loadCourses() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
        return [];
    }
    
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading courses:', error);
        return [];
    }
}

function saveCourses(courses) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving courses:', error);
        return false;
    }
}

function getNextId(courses) {
    if (courses.length === 0) {
        return 1;
    }
    return Math.max(...courses.map(c => c.id)) + 1;
}

app.get('/api/courses', (req, res) => {
    try {
        const courses = loadCourses();
        res.status(200).json({
            success: true,
            count: courses.length,
            courses: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: `Failed to retrieve courses: ${error.message}`
        });
    }
});

app.post('/api/courses', (req, res) => {
    try {
        const data = req.body;
        
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No data provided'
            });
        }
        
        const requiredFields = ['name', 'description', 'target_date', 'status'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        
        const validStatuses = ['Not Started', 'In Progress', 'Completed'];
        if (!validStatuses.includes(data.status)) {
            return res.status(400).json({
                success: false,
                error: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        const courses = loadCourses();
        const newCourse = {
            id: getNextId(courses),
            name: data.name,
            description: data.description,
            target_date: data.target_date,
            status: data.status,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        
        courses.push(newCourse);
        
        if (saveCourses(courses)) {
            res.status(201).json({
                success: true,
                message: 'Course added successfully',
                course: newCourse
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to save course'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: `Failed to add course: ${error.message}`
        });
    }
});

app.delete('/api/courses/:id', (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const courses = loadCourses();
        const courseIndex = courses.findIndex(c => c.id === courseId);
        
        if (courseIndex === -1) {
            return res.status(404).json({
                success: false,
                error: `Course with ID ${courseId} not found`
            });
        }
        
        const deletedCourse = courses.splice(courseIndex, 1)[0];
        
        if (saveCourses(courses)) {
            res.status(200).json({
                success: true,
                message: 'Course deleted successfully',
                deleted_course: deletedCourse
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to save changes'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: `Failed to delete course: ${error.message}`
        });
    }
});

app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('CodeCraftHub API is starting...');
    console.log('='.repeat(60));
    console.log(`API is available at: http://localhost:${PORT}`);
    console.log('='.repeat(60));
});