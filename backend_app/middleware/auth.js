const jwt=require('jsonwebtoken');

const secret = '394eujrei9wfjki9sejrf94w9kf9wri9fu2i3jewwww';

module.exports.verifyRoute = (req, res, next) => {
    
    let token = req.headers.authorization && req.headers.authorization;
    // console.log(`checking headers: `, req.headers);

    if(token) {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }


        jwt.verify(token, secret, (err, decode) => {
            if (err) {
                return res.json({
                    status: 'error',
                    message: 'Invalid or Expired Token Provided'
                });
            } else {
                req.body.decodedUser = decode;
                // return res.json(decode);
                next();
            }
        })
    } else {
        return res.json({
            'status': 'error',
            'message': 'Unathorized request! Please verify yourself first!'
        })
    }
    
};

module.exports.generateToken = (payload) => {
    

    // const signOptions = {
    //     expiresIn: '',
    //     issuer: '', subject: '', audience: '', algorithm: 'ssh'
    // };

    const generatedToken = jwt.sign(payload, secret);

    return generatedToken;
};