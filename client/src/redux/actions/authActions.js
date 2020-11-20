import axios from 'axios';
import jwt_decode from 'jwt-decode'
import setAuthToken from '../../setAuthToken'
import { toast } from "react-toastify";
import { options } from '../../utils/utils'

export const registerUser = (user, history) => {
    return (dispatch) => {
        axios.post(`/register/signup`, user)
            .then(res => {
                history.push('/auth/login');
                console.log(res)

                dispatch({
                    type: 'REGISTER_SUCCESS'
                })
                toast.dark('Register Successfully 🔐', options);
            })
            .catch(err => {
                dispatch({
                    type: 'GET_ERRORS',
                    payload: err.response.data
                });
                console.log(err.response.data)
                err.response.data.message && toast.dark('🧑 ' + err.response.data.message, options)
            });
    }
}

export const loginUser = (user, history) => {
    return (dispatch) => {
        axios.post(`/register/login`, user)
            .then(res => {
                // console.log(res);
                const { token } = res.data;
                console.log(token)
                localStorage.setItem('jwtToken', token)
                setAuthToken(token);
                const decoded = jwt_decode(token);
                dispatch(setCurrentUser(decoded))
                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: {
                        token: token
                    }
                })
                history.push('/categories/');

                toast.dark("Login Successfully 🔓", options);
            })
            .catch(err => {
                dispatch({
                    type: 'GET_ERRORS',
                    payload: err.response.data
                });
                console.log(err.response.data)
                err.response.data.message && toast.dark('🧑 ' + err.response.data.message, options)
            });
    }
}

export const setCurrentUser = decoded => ({
    type: 'SET_CUREENT_USER',
    payload: decoded
});

export const logoutUser = (history) => {
    return (dispatch) => {
        localStorage.removeItem('jwtToken');
        setAuthToken(false);
        dispatch({
            type: 'SET_CUREENT_USER',
            payload: {}
        })
        dispatch({
            type: 'LOGOUT_SUCCESS'
        })
        history.push('/auth/login/');
        toast.dark("Logout Successfully 🔐", options);
    }
}