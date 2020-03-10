
const app = require('express')();
const cors = require('cors')
var http = require('http').Server(app);
var io = require('socket.io')(http);
// const router = express.Router();
const routes = require('./api/index');
const bodyParser = require('body-parser');

//attach io to req.io so it accessible via all routes;
app.use(function (req, res, next) {
    req.io = io;
    next();
})

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '100mb'
}));
app.use(bodyParser.json({
    limit: '100mb'
}));

//enable all request. from third party sites, apps, and so on.
app.use(cors());

app.use('/api', routes);

// environment variables
const APP_PORT = process.env.PORT || 4006;


// home page
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Hello world'
    });
});

http.listen(APP_PORT, (err) => {
    if (err) {
        console.error('Error starting  server', err);
    } else {
        console.log('server listening at port ' + APP_PORT);
    }
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