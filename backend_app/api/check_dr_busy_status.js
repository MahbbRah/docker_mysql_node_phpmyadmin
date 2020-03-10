const express = require('express');
const asyncHandler = require('express-async-handler');
const { getDoctorFromQueue } = require('../model/model');

const router = express.Router();

router.post('/', asyncHandler(async (req, res, next) => {

    const doctor_id = req.body.doctor_id && req.body.doctor_id;
    
    if (doctor_id) {
        
        const busyDoctors = await getDoctorFromQueue(doctor_id, "active");

        res.json({
            status: 'success',
            isBusy: busyDoctors.length ? true : false,
            result: busyDoctors
        });

    } else {
        
        res.json({
            status: 'error',
            message: "You must have to provide required parameters",

        });
    }

}));

module.exports = router;
