import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class Table extends Component {
    render() {
        return (
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title">{this.props.table.NAME}</h4>
                    <h6 className="card-subtitle mb-2 text-muted">Sillas
                        disponibles: <b>{this.props.table.AVAILABLE_SEATS}</b></h6>
                    <div className="row justify-content-around">
                        <button className="btn btn-success" disabled={this.props.hasReservation}>Reservar Silla</button>
                    </div>
                </div>
            </div>
        );
    }
}

Table.propTypes = {
    table: PropTypes.object.isRequired,
    hasReservation: PropTypes.bool.isRequired
};