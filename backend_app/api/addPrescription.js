const express = require('express');
const asyncHandler = require('express-async-handler');
const { getPushTokenForDoctor, addPrescription, getPushTokenForPatient, getOtherPrescriptionInfo, setOtherPrescriptionInfo, updateOthertPrescriptionData } = require('../model/model');
const { sendPushRequest } = require('../helpers/helpers');


const router = express.Router();

router.post('/', asyncHandler(async (req, res, next) => {

    const doctor_id = req.body.doctor_id && req.body.doctor_id;
    const prescription_meta = req.body.prescription_meta && req.body.prescription_meta;
    const patient_id = req.body.patient_id && req.body.patient_id;

    if( doctor_id && prescription_meta && patient_id ) {

        const payload = {
            doctor_id, prescription_meta, patient_id
        };

        const response = await addPrescription(payload);

        
        if(response.affectedRows === 1) {

            let getPushTokenOfPatient = await getPushTokenForPatient(patient_id);

            let parsePrescriptionData = JSON.parse(prescription_meta);
            let referrredDoctor = parsePrescriptionData.referredDoctors;
            if(referrredDoctor.length) {
                referrredDoctor = referrredDoctor[0];
                // let getPushTokenForDr = await getPushTokenForDoctor(referrredDoctor.doctor_id);
                let referredDrName = referrredDoctor.doctor_name.replace("|", " ");
                let title = `New Prescription and referred to you to ${referredDrName}`;
                let body = `New Prescription Generated and ${referredDrName} has been referrred you to your prescription`;
                sendPushNotification(title, body, getPushTokenOfPatient);
            } else {
                let title = `New Prescription!`;
                let body = `New Prescription has been generated successfully`;
                sendPushNotification(title, body, getPushTokenOfPatient);
            }

            let getOtherHistoryOfPatient =  await getOtherPrescriptionInfo(patient_id);

            let parsedPrescription = JSON.parse(prescription_meta);
            let otherPrescriptionData = {
                medicalHistories: parsedPrescription.medicalHistories,
                preExistingIllnesses: parsedPrescription.preExistingIllnesses,
                labInvestigationReport: {},
            };
            otherPrescriptionData = JSON.stringify(otherPrescriptionData);

            if(getOtherHistoryOfPatient.length > 0) {
                

                await updateOthertPrescriptionData(otherPrescriptionData, patient_id);
            } else {
                
                let PatientHistoryObject = {
                    patient_id,
                    patient_histories: otherPrescriptionData
                };

                await setOtherPrescriptionInfo(PatientHistoryObject);
            }

            res.json({
                status: 'success',
                message: 'prescription has been uploaded to server successfully',
                insertedId: response.insertId
            });

        } else {
            res.json({
                status: 'error',
                message: 'Something went wrong while adding prescription',
                errResponse: response
            });
        }
    } else {
        res.json({
            status: 'error',
            message: 'Please provide required informations to continue',
        })
    }



}));


const sendPushNotification = (title, body, pushToken) => {

    let forPatient = true;
    sendPushRequest(
        pushToken,
        body,
        title,
        {},
        forPatient,
        (response) => {
            console.log(response)
        }
    );

}

module.exports = router;
