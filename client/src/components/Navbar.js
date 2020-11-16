import React from 'react';
import '../css/Navbar.css'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { NavLink, withRouter } from 'react-router-dom';
import { Avatar } from '@material-ui/core';
import bookLogo from '../Images/book.png'
import { connect } from 'react-redux';
import { logoutUser } from '../redux/actions/authActions'

function Navbar(props) {

    const onLogout = (e) => {
        e.preventDefault()
        props.logoutUser(props.history)
    }

    console.log(props.scrollClass)

    const guestLinks = (
        <div className="navbar__right">
            <NavLink
                activeClassName="navbar__link--active"
                className="navbar__link"
                to="/auth/login/"
            >
                Log In
            </NavLink>
            <NavLink
                activeClassName="navbar__link--active"
                className="navbar__link"
                to="/auth/register/"
            >
                Sign Up
            </NavLink>
        </div>
    )

    const authLinks = (
        <div className="navbar__right">
            {
                props.auth.user.role === 'Admin' ? (
                    <NavLink
                        activeClassName="navbar__link--active"
                        className="navbar__link"
                        to="/admin/"
                    >
                        Admin
                    </NavLink>
                ) : (
                        null
                    )
            }
            <NavLink
                activeClassName="navbar__link--active"
                className="navbar__link"
                to="/categories/"
            >
                Categories
            </NavLink>
            <NavLink
                activeClassName="navbar__link--active"
                className="navbar__link"
                to="/groups/"
            >
                Groups
            </NavLink>
            <NavLink
                activeClassName="navbar__link--active"
                className="navbar__link"
                to="/profile/"
            >
                Profile
            </NavLink>
            <span className="logout__button" onClick={onLogout} >Logout</span>
            <Avatar alt="" src={`/posts/file/${props.details.fileName}`} />
        </div>
    )

    return (
        <div className="navbar">
            <AppBar className={`${props.scrollClass === true ? "scrollable_navbar" : "navbar__strip"}`}>
                <Toolbar className="navbar__toolbar">
                    <div className="navbar__left">
                        <img className="navbar__logo" src={bookLogo} width="50px" height="50px" alt="" />
                        <p className="navbar__brand">
                            BookaGram.com
                        </p>
                    </div>
                    <div className="navbar__middle">
                        {/* <SearchBar /> */}
                    </div>
                    {
                        props.auth.isAuthenticated ? authLinks : guestLinks
                    }
                </Toolbar>
            </AppBar>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
        details: state.profile.details
    }
}

export default connect(mapStateToProps, { logoutUser })(withRouter(Navbar))
