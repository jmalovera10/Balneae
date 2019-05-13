import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from "react-router-dom";

import "./ReservationScreen.css";

export default class ReservationScreen extends Component {
    render() {
        let date = new Date(this.props.reservation.UNTIL);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        return (
            <div className="row justify-content-around reservation-body">
                <div className="col-sm-auto">
                    <h1>Hola {this.props.user.name}!</h1>
                    <h3>Tu reserva te espera! Debes llegar antes de las</h3>
                    <div className="row justify-content-around">
                        <h2>{hours}:{minutes<10?'0':null}{minutes} {hours >= 12 ? 'pm' : 'am'}</h2>
                    </div>
                    <div className="row justify-content-around">
                        <Link to="/">
                            <button className="btn btn-danger" onClick={this.props.cancelReservation}>Cancelar Reserva
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
}

ReservationScreen.propTypes = {
    user: PropTypes.object.isRequired,
    reservation: PropTypes.object.isRequired,
    reservedTable: PropTypes.object.isRequired,
    cancelReservation: PropTypes.func.isRequired
};