const express = require('express');
const asyncHandler = require('express-async-handler');
const { clearDoctorQueueAppointment } = require('../model/model');

const router = express.Router();

router.post('/', asyncHandler(async (req, res, next) => {

    const doctor_id = req.body.doctor_id && req.body.doctor_id;
    
    if (doctor_id) {
        
        await clearDoctorQueueAppointment(doctor_id, "active");
       
        res.json({
            status: 'success',
            message: 'Your Queue has been cleared successfully'
        })

    } else {
        
        res.json({
            status: 'error',
            message: "You must have to provide required parameters",

        });
    }

}));

module.exports = router;
