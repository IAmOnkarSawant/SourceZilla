import { Button } from '@material-ui/core'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

function EntryContainer(props) {
    const [isClicked, setIsClicked] = useState(false)
    const [isClickedSignUp, setIsClickedSignUp] = useState(false)
    if (isClicked) {
        return (
            <Redirect push to="/categories/" />
        )
    }
    if (isClickedSignUp) {
        return (
            <Redirect push to="/auth/login" />
        )
    }
    return (
        <div>
            <p className="Explore_title">
                Welcome To BrandName
            </p>
            <p style={{maxWidth : '500px',color : 'grey',fontSize : '18px'}}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam, velit cum nemo quas, ea minima vel quidem doloremque minus vitae id natus repudiandae mollitia temporibus officia cumque cupiditate ipsa hic!</p>
            <Button onClick={() => setIsClicked(true)} className="explore_btn">
                Explore
            </Button>
            {
                !props.auth.isAuthenticated && (
                    <Button style={{ marginLeft: '20px' }} onClick={() => setIsClickedSignUp(true)} className="explore_btn_signin">
                        Sign In
                    </Button>
                )
            }
        </div>
    )
}

const mapStateToProps = state => {
    return {
        auth: state.auth
    }
}

export default connect(mapStateToProps, null)(EntryContainer)
