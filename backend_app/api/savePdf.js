const express = require('express');
const fs = require('fs');
const shortid = require('shortid');
const asyncHandler = require('express-async-handler');
const app = express();
const router = express.Router();

router.post('/', asyncHandler(async (req, res, next) => {

    var base64Data = req.body.base64Data ? req.body.base64Data : '';

    // console.log(req.body);

    if(base64Data) {

        //check first values if data:pdf includes then remove it.
        if (base64Data.substring(0, 20) == 'data:application/pdf')
            base64Data = base64Data.replace('data:application/pdf;base64,', '');

        const fileName = `prescription_${shortid.generate()}.pdf`;

        fs.writeFile(`public/prescription/${fileName}`, base64Data, {
            encoding: 'base64'
        }, (err) => {
            if(err) res.json({ status: 'error', message: 'Error on saving file', errMsg: err})

            let fileWithoutExt = fileName.replace('.pdf', '');
            res.json({ 
                status: 'success', 
                message: 'File has been saved successfully',
                fileName: fileWithoutExt
            });
        });
    } else {
        res.json({
            status: 'error',
            message: 'No data found to save as PDF!'
        })
    }
}));

module.exports = router;
