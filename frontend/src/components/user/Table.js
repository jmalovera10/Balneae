import React, {Component} from 'react';
import PropTypes from 'prop-types';

import "./Table.css";

export default class Table extends Component {

    makeReservation(){
        console.log(this.props.table);
        this.props.makeReservation(this.props.table.TABLE_ID);
    }

    render() {
        return (
            <div className="card">
                <div className="row no-gutters">
                    <div className="col-sm-2">
                        {
                            this.props.table.AVAILABLE_SEATS > 0 ?
                                <img alt="available" className="img-table-card img-fluid"
                                     src="https://img.icons8.com/flat_round/64/000000/checkmark.png"/>
                                : <img alt="not available" className="img-table-card img-fluid"
                                       src="https://img.icons8.com/office/64/000000/cancel-2.png"/>
                        }
                    </div>
                    <div className="col-sm-auto">
                        <div className="card-body">
                            <h4 className="card-title">{this.props.table.NAME}</h4>
                            <h6 className="card-subtitle mb-2 text-muted">Sillas
                                disponibles: <b>{this.props.table.AVAILABLE_SEATS}</b></h6>
                            <div className="row justify-content-around">
                                {
                                    this.props.hasReservation ?
                                        (this.props.tableReservationId ?
                                                <button className="btn btn-danger" onClick={this.props.cancelReservation}>
                                                    Cancelar Reserva
                                                </button>
                                                :
                                                <button disabled={true} className="btn btn-success">
                                                    Reservar Silla
                                                </button>
                                        )
                                        : <button className="btn btn-success" onClick={this.makeReservation.bind(this)}>
                                            Reservar Silla
                                        </button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Table.propTypes = {
    table: PropTypes.object.isRequired,
    hasReservation: PropTypes.bool.isRequired,
    makeReservation: PropTypes.func.isRequired,
    cancelReservation: PropTypes.func.isRequired,
};