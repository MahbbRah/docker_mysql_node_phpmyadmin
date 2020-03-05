
const app = require('express')();
const mysql = require('mysql');

const bodyParser = require('body-parser');

app.use(bodyParser.json({
    limit: '100mb'
})); // support json encoded bodies

// environment variables
const APP_PORT = process.env.PORT || 4006;
const DB_PORT = process.env.MYSQL_PORT || 3306;
const DB_HOST = process.env.MYSQL_HOST || 'mysql';

// // mysql credentials
const connection = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
});

connection.connect((err) => {
    if (err) {
        console.error('error connecting mysql: ', err);
    } else {
        app.listen(APP_PORT, (err) => {
            if (err) {
                console.error('Error starting  server', err);
            } else {
                console.log('server listening at portss ' + APP_PORT);
            }
        });
    }
});

// home page
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Hello world'
    });
});

// // insert a student into database
// app.post('/add-student', (req, res) => {
//     const student = req.body;
//     const query = 'INSERT INTO students values(?, ?)';

//     connection.query(query, [student.rollNo, student.name], (err, results, fields) => {
//         if (err) {
//             console.error(err);
//             res.json({
//                 success: false,
//                 message: 'Error occured'
//             });
//         } else {
//             res.json({
//                 success: true,
//                 message: 'Successfully added student'
//             });
//         }
//     });
// });

// // fetch all students
// app.post('/get-students', (req, res) => {
//     const query = 'SELECT * FROM students';
//     connection.query(query, (err, results, fields) => {
//         if (err) {
//             console.error(err);
//             res.json({
//                 success: false,
//                 message: 'Error occured'
//             });
//         } else {
//             res.json({
//                 success: true,
//                 result: results
//             });
//         }
//     });
// });

