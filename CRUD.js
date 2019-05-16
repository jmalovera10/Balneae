const jwtSecret = require('./config/passport/jwtConfig');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('./config/mongoose/conf');
const Table = require('./config/mongoose/table');
const Reservation = require('./config/mongoose/reservation');

// ASYNCHRONOUS DB UPDATING
const Agenda = require('agenda');
const agenda = new Agenda({db: {address: process.env.MONGO_URL}});

agenda.define('UPDATE RESERVATION STATUS', () => {
    console.log("RESERVATIONS UPDATED");
    Reservation.find({STATUS: "ACTIVE", UNTIL: {$lt: Date.now()}})
        .then((reservations) => {
            reservations.forEach((r) => {
                r.STATUS = "TIMEOUT";
                r.save();
                Table.findOne({TABLE_ID: r.TABLE_ID})
                    .then((t) => {
                        let seats = [];
                        t.SEATS.forEach((s) => {
                            if (Number(s.SEAT_ID) === Number(r.SEAT_ID)) {
                                seats.push({
                                    SEAT_ID: s.SEAT_ID,
                                    STATUS: "FREE"
                                });
                                t.AVAILABLE_SEATS += 1;
                            } else {
                                seats.push(s);
                            }
                        });
                        t.SEATS = seats;
                        t.save();
                    });
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

(async function () { // IIFE to give access to async/await
    await agenda.start();
    await agenda.every('0.5 minutes', 'UPDATE RESERVATION STATUS');
    console.log("STARTING AGENDA");
})();


let AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

/**
 * Method meant to register a user
 * @param req
 * @param res
 * @param next
 */
exports.signupUser = (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if (err) {
            console.log(err);
        }
        if (info !== undefined) {
            console.log(info.message);
            res.send(info);
        } else {
            req.logIn(user, err => {
                const data = {
                    name: req.body.name,
                    lastname: req.body.lastname,
                    email: req.body.email,
                };
                let ses = new AWS.SES({apiVersion: '2010-12-01'});
                let params = {
                    EmailAddress: req.body.email
                };
                ses.verifyEmailIdentity(params, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else console.log(data);           // successful response
                });
                User.findOne({email: data.email})
                    .then((user) => {
                        user.updateOne({
                            name: data.name,
                            lastname: data.lastname
                        }).then(() => {
                            console.log('user created in db');
                            const token = jwt.sign({id: user._id}, jwtSecret.secret, {expiresIn: '1h'});
                            return res.status(200).send({
                                message: null,
                                auth: true,
                                token: token,
                                id: user._id
                            });
                        });
                    });
            });
        }
    })(req, res, next);
};

/**
 * Method meant to login a user
 * @param req
 * @param res
 * @param next
 */
exports.loginUser = (req, res, next) => {
    console.log(req.body);
    passport.authenticate('login', (err, user, info) => {
        if (err) {
            console.log(err);
        }
        if (info !== undefined) {
            console.log(info.message);
            res.send(info);
        } else {
            req.logIn(user, err => {
                User.findOne({email: req.body.email}).then(user => {
                    const token = jwt.sign({id: user._id}, jwtSecret.secret, {expiresIn: '2h'});
                    return res.status(200).send({
                        auth: true,
                        token: token,
                        message: null,
                        id: user._id
                    });
                });
            });
        }
    })(req, res, next);
};

/**
 * Method meant to find a user from a given token
 * @param req
 * @param res
 * @param next
 */
exports.findUser = (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err) {
            console.log(err);
        }
        if (info !== undefined) {
            console.log(info.message);
            return res.status(400).send("Unauthorized");
        } else {
            console.log('user found in db from route');
            return res.status(200).send({
                name: user.name,
                lastname: user.lastname,
                email: user.email,
                _id: user._id,
            });
        }
    })(req, res, next);
};

/**
 * Method meant to retrieve all available tables from the database
 * @param req
 * @param res
 * @param user
 */
exports.getTables = (req, res, user) => {
    Table.find().then((tables) => {
        return res.status(200).json(tables);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({message: "Something went wrong with the db"})
    });
};

/**
 * Method meant to get all reservations
 * @param req
 * @param res
 * @param user
 */
exports.getReservations = (req, res, user) => {
    let userId = user._id;
    Reservation.findOne({USER_ID: userId, STATUS: "ACTIVE", UNTIL: {$gte: Date.now()}}).then((reservations) => {
        return res.status(200).json(reservations);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({message: "Something went wrong with the db"})
    });
};

/**
 * Method meant to reserve a seat
 * @param req
 * @param res
 * @param user
 */
exports.reserveSeat = (req, res, user) => {
    let userId = user._id;
    let tableId = req.params.tableId;

    Table.findOne({TABLE_ID: tableId}).then((table) => {

        // Update seat status
        if (table && table.AVAILABLE_SEATS > 0) {
            let seats = [];
            let occupied = false;
            let seatId = undefined;
            table.SEATS.forEach((s) => {
                if (s.STATUS === 'FREE' && !occupied) {
                    occupied = true;
                    seatId = s.SEAT_ID;
                    table.AVAILABLE_SEATS -= 1;
                    seats.push({
                        SEAT_ID: s.SEAT_ID,
                        STATUS: 'RESERVED'
                    });
                } else {
                    seats.push(s);
                }
            });
            table.SEATS = seats;
            table.save((err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({reservationStatus: false, message: "Table doesn't exist"});
                }
                // Save reservation
                let reservation = Reservation();
                reservation.TABLE_ID = tableId;
                reservation.SEAT_ID = seatId;
                reservation.USER_ID = userId;
                reservation.STATUS = "ACTIVE";
                reservation.UNTIL = Date.now() + 300000;

                reservation.save((err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({reservationStatus: false, message: "Table doesn't exist"});
                    }
                    sendInteractionEmail(user);
                    return res.status(200).json({reservationStatus: true, reservation: reservation});
                });
            });

        } else {
            return res.status(500).json({reservationStatus: false, message: "Table doesn't exist"});
        }

    }).catch((err) => {
        console.log(err);
        return res.status(500).json({reservationStatus: false});
    });
};

/**
 * Method that send the user an email to encourage the interaction with others in the table
 * @param user that has done the reservation
 */
function sendInteractionEmail(user) {
    // Create sendEmail params
    let params = {
        Destination: {
            ToAddresses: [
                user.email,
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `<!DOCTYPE html>
<html>
<title>Web Page Design</title>
<head>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
<style type="text/css">
    h3{
        margin:5%;
    },
    .header{
        background: #22ff22;
    }
</style>
</head>
<body>
    
<div class="jumbotron header">
    <h1>
        ${user.name} tu reserva te espera!
    </h1>
</div>
<div class"card">
    <div class="card-body">
        <div class="row justify-content-around">
            <div class="col-3">
        <img class="img-fluid" src="https://image.flaticon.com/icons/svg/809/809447.svg"/>
        </div>
        </div>
    <h3>
    Queremos que tu experiencia sea completa y agradable mientras utilizas el espacio,
    por lo que te queríamos invitar a que rompas el hielo con los que están en la mesa. 
    Puedes empezar preguntándoles qué opinan de la aplicación ;)
    </h3>
    </div>
</div>
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
</body>
</html>`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Gracias por usar Comuniapp!'
            }
        },
        Source: process.env.SENDER_EMAIL,
        ReplyToAddresses: [
            process.env.SENDER_EMAIL
        ],
    };

    let sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
    sendPromise.then(
        function (data) {
            console.log(data.MessageId);
        }).catch(
        function (err) {
            console.error(err, err.stack);
        });
}

/**
 * Method meant to get all reservations
 * @param req
 * @param res
 * @param user
 */
exports.cancelReservation = (req, res, user) => {
    let userId = user._id;
    let reservationId = req.params.reservationId;

    Reservation.findOne({_id: reservationId, USER_ID: userId}).then((reservation) => {
        // Change reservation status to cancelled
        if (reservation) {
            reservation.STATUS = "CANCELLED";
            reservation.save();
            // Update table status
            Table.findOne({TABLE_ID: reservation.TABLE_ID}).then((table) => {
                let seats = [];
                table.SEATS.forEach((s) => {
                    if (Number(s.SEAT_ID) === Number(reservation.SEAT_ID)) {
                        seats.push({
                            SEAT_ID: reservation.SEAT_ID,
                            STATUS: "FREE"
                        })
                    } else {
                        seats.push(s);
                    }
                });
                table.AVAILABLE_SEATS += 1;
                table.SEATS = seats;
                console.log(table);
                table.save((err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({message: "Reservation doesn't exist"});
                    }
                    return res.status(200).json({reservationStatus: "CANCELLED"});
                });
            });
        } else {
            return res.status(500).json({message: "Reservation doesn't exist"});
        }
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({message: "Something went wrong with the db"})
    });
};

/**
 * Method meant to retrieve all available tables from the database
 * @param req
 * @param res
 */
exports.getTableForModules = (req, res) => {
    let tableId = req.params.tableId;
    Table.findOne({TABLE_ID: tableId}).then((table) => {
        return res.status(200).json(table);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({message: "Something went wrong with the db"})
    });
};

/**
 * Method meant to insert a table into the database
 * @param req
 * @param res
 */
exports.insertTable = (req, res) => {
    console.log("INSERTION IN PROCESS");
    let tableId = req.params.tableId;
    let name = req.body.NAME;
    let seats = req.body.SEATS;
    let availableSeats = req.body.AVAILABLE_SEATS;
    Table.findOne({TABLE_ID: tableId}).then((table) => {
        if (table) {
            return res.status(200).send(table);
        } else {
            let table = new Table();
            table.TABLE_ID = tableId;
            table.NAME = name;
            table.SEATS = seats;
            table.AVAILABLE_SEATS = availableSeats;
            table.save((err) => {
                if (err)
                    throw err;
            });
            return res.status(200).send(table);
        }
    }).catch((err) => {
        console.log(err);
        return res.status(500).send({message: "Something went wrong with the db"});
    });
};

/**
 * Method meant to insert a table into the database
 * @param req
 * @param res
 */
exports.updateSeat = (req, res) => {
    console.log("UPDATE SET STARTED");
    let tableId = req.params.tableId;
    let seatId = req.body.SEAT_ID;
    let status = req.body.STATUS;
    Table.findOne({TABLE_ID: tableId}).then((table) => {
        console.log(table);
        if (table) {
            let seats = table.SEATS;
            let newSeats = [];
            seats.forEach((s) => {
                if (s.SEAT_ID === seatId) {
                    newSeats.push({
                        SEAT_ID: seatId,
                        STATUS: status
                    });
                } else {
                    newSeats.push(s);
                }
            });
            if (status === 'FREE') {
                table.AVAILABLE_SEATS += 1;
            } else {
                table.AVAILABLE_SEATS -= 1;
            }
            table.SEATS = newSeats;
            table.save((err) => {
                if (err)
                    throw err;
            });
            return res.status(200).send(req.body);
        } else {
            return res.status(500).send({message: "Table doesn't exist"});
        }
    }).catch((err) => {
        console.log(err);
        return res.status(500).send({message: "Something went wrong with the db"});
    });
};