import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

const IsAdmin = ({ component: Component, auth, details, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            auth.isAuthenticated === true ? (
                auth.user.role === "Admin" ? (
                    <Component {...props} />
                ) : (
                        <Redirect to="/categories/"/>
                    )
            ) : (
                    <Redirect to="/auth/login/" />
                )
        }
    />
);

const mapStateToProps = state => {
    return {
        auth: state.auth
    }
};

export default connect(mapStateToProps, null)(IsAdmin);