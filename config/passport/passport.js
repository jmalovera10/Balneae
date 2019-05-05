const jwtSecret = require('./jwtConfig');
const bcrypt = require('bcryptjs');

const BCRYPT_SALT_ROUNDS = 12;

const localStrategy = require('passport-local').Strategy,
    JWTstrategy = require('passport-jwt').Strategy,
    User = require('../mongoose/conf'),
    ExtractJWT = require('passport-jwt').ExtractJwt;

module.exports = function (passport) {
    passport.use(
        'register',
        new localStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                session: false,
            },
            (email, password, done) => {
                try {
                    User.findOne({'email': email})
                        .then((user) => {
                            if (user) {
                                console.log('username already taken');
                                return done(null, false, {message: 'El usuario ya existe', auth: false});
                            } else {
                                let newUser = new User();
                                newUser.email = email;
                                newUser.password = newUser.generateHash(password);
                                newUser.save(function (err) {
                                    if (err)
                                        throw err;
                                    return done(null, newUser);
                                });
                            }
                        });
                } catch (err) {
                    done(err);
                }
            },
        ),
    );

    passport.use(
        'login',
        new localStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                session: false,
            },
            (email, password, done) => {
                console.log(email);
                try {
                    User.findOne({email: email}).then(user => {
                        if (user === null) {
                            return done(null, false, {
                                message: 'El usuario y/o contraseña son incorrectos',
                                auth: false
                            });
                        } else {
                            bcrypt.compare(password, user.password).then(response => {
                                if (response !== true) {
                                    console.log('passwords do not match');
                                    return done(null, false, {
                                        message: 'El usuario y/o contraseña son incorrectos',
                                        auth: false
                                    });
                                }
                                console.log('user found & authenticated');
                                // note the return needed with passport local - remove this return for passport JWT
                                return done(null, user);
                            });
                        }
                    });
                } catch (err) {
                    done(err);
                }
            },
        ),
    );

    const opts = {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtSecret.secret,
    };

    passport.use(
        'jwt',
        new JWTstrategy(opts, (jwt_payload, done) => {
            try {
                User.findOne({_id: jwt_payload.id,}).then(user => {
                    if (user) {
                        console.log('user found in db in passport');
                        // note the return removed with passport JWT - add this return for passport local
                        done(null, user);
                    } else {
                        console.log('user not found in db');
                        done(null, false);
                    }
                });
            } catch (err) {
                done(err);
            }
        }),
    );
};