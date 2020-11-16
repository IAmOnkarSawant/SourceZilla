import { Box, Button } from '@material-ui/core'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { profileResourceBox, profileResourceBoxDelete } from '../../redux/actions/profileAction'
import FlipMove from 'react-flip-move'
import moment from 'moment'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ProfileLoader from '../ProfileLoader'

function ResourceBox(props) {

    const { profileResourceBox } = props
    useEffect(() => {
        profileResourceBox()
    }, [profileResourceBox])

    const handleDeleteResource = (id) => {
        console.log(id)
        props.profileResourceBoxDelete(id)
    }

    if (props.loading) {
        return (
            <ProfileLoader />
        )
    }

    return (
        <>
            <FlipMove>
                {props?.resourceBox && props?.resourceBox?.map(resource =>
                    <Box position="relative" className="resourceBox" key={resource._id} boxShadow={1}>
                        <div className="resourceBox_content">
                            <span className="resourceBox_createdAt">{moment(resource.createdAt).fromNow()}</span>
                            <span className="resourceBox_postContent">
                                <pre>
                                    {resource.postContent.replace(/<br\s*\/?>/gi, ' ')}
                                </pre>
                            </span>
                        </div>
                        <div className="resourceBox_buttons">
                            <Button className="resource__btns resourceBox_delete_button" color="secondary" variant="contained" size="small" onClick={() => handleDeleteResource(resource._id)} >
                                <DeleteOutlineIcon style={{ marginRight: '10px' }} />  Delete
                            </Button>
                            <Link to={`/post/${resource._id}/`}>
                                <Button className="resource__btns resourceBox_view" style={{ color: 'white' }} color="primary" variant="contained" size="small">
                                    <OpenInNewIcon style={{ marginRight: '10px' }} /> view
                                </Button>
                            </Link>
                        </div>
                    </Box>
                )}
            </FlipMove>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        resourceBox: state.profile.resourceBox,
        loading: state.loading.loading
    }
}

export default connect(mapStateToProps, { profileResourceBox, profileResourceBoxDelete })(ResourceBox)
