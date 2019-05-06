import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class UserHome extends Component{

    render() {
        return(
            <div>
                {
                    this.props.tables.length==0?
                        <div className="jumbotron">
                            <h1 className="display-4">Ooops!</h1>
                            <p className="lead">Parece que no hay mesas disponibles :(</p>
                        </div>
                        :null
                }
            </div>
        );
    }
}

UserHome.propTypes = {
    tables: PropTypes.array.isRequired
};