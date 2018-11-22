const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let token = req.session.accessToken;

    if (token) {
        token =  token.split(' ')[1];
    }

    jwt.verify(token, 'secretKey', (err, authData) => {
        if (err) {
            return res.redirect('../');
        }

        req.userData = authData;
    });

    next();
}
