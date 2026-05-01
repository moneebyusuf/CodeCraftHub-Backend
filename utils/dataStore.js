const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/courses.json');

const dataStore = {
    async loadCourses() {
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            await fs.writeFile(DATA_FILE, '[]', 'utf8');
            return [];
        }
    },

    async saveCourses(courses) {
        await fs.writeFile(DATA_FILE, JSON.stringify(courses, null, 2), 'utf8');
    }
};

module.exports = dataStore;