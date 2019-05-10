import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Table from './Table';
import Cookies from 'universal-cookie';
import axios from 'axios';

import "./UserHome.css";

export default class UserHome extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tableReservationId: undefined,
            seatReservationId: null,
            hasReservation: false
        };

        this.makeReservation = this.makeReservation.bind(this);
        this.cancelReservation = this.cancelReservation.bind(this);
    }

    makeReservation(tableId) {
        let cookies = new Cookies();
        let token = cookies.get("COMUNIAPP_TOKEN_COOKIE", {path: '/'});
        console.log(token);
        if (token) {
            let config = {
                headers: {'Authorization': 'Bearer ' + token}
            };
            axios.post(`/API/table/${tableId}/seat`, config)
                .then((res) => {
                    return res.data;
                })
                .then((res) => {
                    this.setState({
                        hasReservation: res.reservationStatus,
                        tableReservationId: res.tableId,
                        seatReservationId: res.seatId
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    cancelReservation() {
        let cookies = new Cookies();
        let token = cookies.get("COMUNIAPP_TOKEN_COOKIE", {path: '/'});
        if (token) {
            let config = {
                headers: {'Authorization': 'Bearer ' + token}
            };
            axios.delete(`/API/table/${this.state.tableReservationId}/seat/${this.state.seatReservationId}`, config)
                .then((res) => {
                    return res.data;
                })
                .then((res) => {
                    this.setState({
                        hasReservation: res.reservationStatus,
                        tableReservationId: res.tableId
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }

    render() {
        let tables = [];
        if (this.props.tables) {
            tables = this.props.tables.map((tb) => {
                return (
                    <div key={tb.TABLE_ID} className="table col-sm-4">
                        <Table table={tb} hasReservation={this.state.hasReservation}
                               makeReservation={this.makeReservation} cancelReservation={this.cancelReservation}
                               tableReservationId={this.state.tableReservationId}/>
                    </div>
                );
            });
        }
        return (
            <div>
                {
                    this.props.tables.length === 0 ?
                        <div className="jumbotron">
                            <h1 className="display-4">Ooops!</h1>
                            <p className="lead">Parece que no hay mesas disponibles :(</p>
                        </div>
                        :
                        <div className="row">
                            {tables}
                        </div>
                }
            </div>
        );
    }
}

UserHome.propTypes = {
    tables: PropTypes.array.isRequired
};