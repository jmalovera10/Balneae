import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Table from './Table';

import "./UserHome.css";

export default class UserHome extends Component {

    render() {
        let tables = [];
        if(this.props.tables){
            tables = this.props.tables.map((tb)=>{
               return(
                  <div className="table col-sm-4">
                        <Table table={tb} hasReservation={false}/>
                  </div>
               ) ;
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