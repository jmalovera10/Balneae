import React, {Component} from 'react';
import {NavLink} from "react-router-dom";
import PropTypes from 'prop-types';

export default class Navbar extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <button className="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <NavLink to="/">
                    <button className="btn my-2 my-sm-0">Balneae</button>
                </NavLink>

                <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                    <div className="navbar-nav ml-auto">
                        <NavLink to="/">
                            <button className="btn my-2 my-sm-0 btn-navbar">Inicio</button>
                        </NavLink>
                        {
                            this.props.auth ?
                                null
                                : <NavLink to="/signup">
                                    <button className="btn btn-outline-success my-2 my-sm-0 btn-navbar">Registrarse</button>
                                </NavLink>
                        }
                        {
                            this.props.auth ?
                                <button className="btn btn-success my-2 my-sm-0 btn-navbar"
                                        onClick={this.props.logout}>Salir</button>
                                : <NavLink to="/login">
                                    <button className="btn btn-success btn-navbar">Iniciar Sesión</button>
                                </NavLink>
                        }
                    </div>
                </div>
            </nav>
        );
    }
}

Navbar.propTypes = {
    auth: PropTypes.bool.isRequired,
    logout: PropTypes.func.isRequired
};