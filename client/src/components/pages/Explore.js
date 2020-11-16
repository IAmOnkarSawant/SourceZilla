import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import '../../css/Explore.css'
import Layout from '../Layout'
import { profileDetails } from '../../redux/actions/profileAction'
import { useEffect } from 'react'
import { connect } from 'react-redux'

function Explore(props) {
    const [isClicked, setIsClicked] = useState(false)

    const { profileDetails } = props

    useEffect(() => {
        profileDetails()
    }, [profileDetails])

    if (isClicked) {
        return (
            <Redirect push to="/categories/" />
        )
    }

    return (
        <Layout>
            <div className="explore">
                <div className="grid__container" onClick={() => setIsClicked(true)} >
                    <div className="grid-item">E</div>
                    <div className="grid-item">X</div>
                    <div className="grid-item">P</div>
                    <div className="grid-item">L</div>
                    <div className="grid-item">O</div>
                    <div className="grid-item">R</div>
                    <div className="grid-item">E</div>
                </div>
            </div>
        </Layout>
    )
}

export default connect(null, { profileDetails })(Explore)
