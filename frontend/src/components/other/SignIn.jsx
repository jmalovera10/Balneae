import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Cookies from 'universal-cookie';

import "./SignIn.css";

export default class SignIn extends Component {
    constructor(props) {
        super(props);
        this.classes = props.classes;
        this.state = {
            name: "",
            lastname: "",
            email: "",
            password: "",
            repeatPassword: "",
            message: null
        };
    }

    handleLogin = e => {
        e.preventDefault();
        let user = {
            email: this.state.email,
            password: this.state.password
        };
        axios.post('/API/loginUser', user)
            .then((res) => {
                return res.data;
            })
            .then((data) => {
                this.setState({message: data.message});
                this.props.updateAuth(data.auth);
                if (data.auth) {
                    let cookies = new Cookies();
                    cookies.set("COMUNIAPP_TOKEN_COOKIE", data.token, {path: '/'});
                    this.props.getContests();
                    this.props.updateComponent();
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    handleSignup = e => {
        e.preventDefault();

        let user = {
            name: this.state.name,
            lastname: this.state.lastname,
            email: this.state.email,
            password: this.state.password
        };
        axios.post('/API/signupUser', user)
            .then((res) => {
                return res.data;
            })
            .then((data) => {
                this.setState({message: data.message});
                this.props.updateAuth(data.auth);
                if (data.auth) {
                    let cookies = new Cookies();
                    cookies.set("COMUNIAPP_TOKEN_COOKIE", data.token, {path: '/'});
                }
                this.props.handleUser();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    handleChange = (e) => {
        this.setState(
            {
                [e.target.name]: e.target.value
            }
        )
    };

    render() {
        return (
            <div className="row justify-content-around">
                <div className="card login-card col-xs-10 col-sm-6 col-md-5 col-lg-4 col-xl-3">
                    <form>
                        {
                            this.props.isSignup ?
                                <div className="form-group align">
                                    <label htmlFor="name">Nombres</label>
                                    <div className="input-group mb-2">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="fas fa-user"></i></div>
                                        </div>
                                        <input type="text" className="form-control" id="name" placeholder="Juan"
                                               name="name"
                                               onChange={this.handleChange}/>
                                    </div>
                                </div>
                                : null
                        }
                        {
                            this.props.isSignup ?
                                <div className="form-group">
                                    <label htmlFor="lastname">Apellidos</label>
                                    <div className="input-group mb-2">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="fas fa-user"></i></div>
                                        </div>
                                        <input type="text" className="form-control" id="lastname"
                                               placeholder="Rodriguez"
                                               name="lastname"
                                               onChange={this.handleChange}/>
                                    </div>
                                </div>
                                : null
                        }
                        <div className="form-group">
                            <label htmlFor="email">Correo Uniandes</label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="fas fa-envelope"></i></div>
                                </div>
                                <input type="email" className="form-control" id="email"
                                       placeholder="ejemplo@uniandes.edu.co" name="email"
                                       onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <div className="input-group mb-2">
                                <div className="input-group-prepend">
                                    <div className="input-group-text"><i className="fas fa-lock"></i></div>
                                </div>
                                <input type="password" className="form-control" id="password4" placeholder="****"
                                       name="password"
                                       onChange={this.handleChange}/>
                            </div>
                        </div>
                        {
                            this.props.isSignup ?
                                <div className="form-group">
                                    <label htmlFor="RepeatPassword">Repita la Contraseña</label>
                                    <div className="input-group mb-2">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="fas fa-lock"></i></div>
                                        </div>
                                        <input type="password" className="form-control" id="repeatPassword"
                                               placeholder="****"
                                               name="password"
                                               onChange={this.handleChange}/>
                                    </div>
                                </div>
                                : null
                        }
                        <div className="row justify-content-around">
                            <button type="submit"
                                    className="btn btn-primary"
                                    onClick={this.props.isSignup ? this.handleSignup : this.handleLogin}>
                                {this.props.isSignup ? "Registrarse" : "Entrar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

SignIn.propTypes = {
    updateAuth: PropTypes.func.isRequired,
    getTables: PropTypes.func.isRequired,
    isSignup: PropTypes.bool.isRequired
};