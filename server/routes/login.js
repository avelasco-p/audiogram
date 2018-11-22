const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/User');

router.get('/', (req, res, next) => {
    res.sendFile('./client/index.html', {root: __dirname + '/../../'});
});


router.post('/', (req, res, next) => {
    const tmpUser = new User({
        email: req.body.email,
    });

    console.log(`user email: ${tmpUser.email}`);

    User.findOne({ email: tmpUser.email })
        .exec()
        .then(user => {
            console.log('from database: ' + user);

            if (!user) {
                tmpUser.save()
                    .then(result => {
                        jwt.sign({
                            userId: result._id,
                            email: result.email,
                        }, 'secretKey', {
                            expiresIn: '1h',
                        }, (err, token) => {
                            if(err){
                                console.log(err);
                                res.send(err);
                            }

                            req.session.accessToken = 'Bearer ' + token;
                            res.redirect('/');
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).send(err);
                    });
            } else {
                jwt.sign({
                    userId: user._id,
                    email: user.email,
                }, 'secretKey', {
                    expiresIn: '1h',
                }, (err, token) => {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }

                    req.session.accessToken = 'Bearer ' + token;
                    res.redirect('/');
                });


            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err);
        });
});


module.exports = router;
