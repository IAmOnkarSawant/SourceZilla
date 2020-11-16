import { Box, Button } from '@material-ui/core'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { profileMyPosts, deleteMyPost } from '../../redux/actions/profileAction'
import moment from 'moment'
import FlipMove from 'react-flip-move'
import { Link } from 'react-router-dom'
import LockOpenIcon from '@material-ui/icons/LockOpen';
import PublicIcon from '@material-ui/icons/Public';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ProfileLoader from '../ProfileLoader'

function Myposts(props) {

    const { profileMyPosts } = props
    useEffect(() => {
        profileMyPosts()
    }, [profileMyPosts])

    const handleDeleteResource = (postId) => {
        console.log(postId)
        props.deleteMyPost(postId)
    }

    if (props.loading) {
        return (
            <ProfileLoader />
        )
    }

    return (
        <>
            <FlipMove>
                {props?.myposts && props?.myposts.map(post =>
                    <Box position="relative" className="myposts" key={post._id} boxShadow={1}>
                        <div className="my_post_content">
                            <span className="my_post_createdAt">{moment(post.createdAt).fromNow()}</span>
                            <span className="my_post_postContent">
                                <pre>
                                    {post.postContent.replace(/<br\s*\/?>/gi, ' ')}
                                </pre>
                            </span>
                        </div>
                        <span className="my_post_accessibilty" >  {post.accessibilty === 'private' ? <LockOpenIcon /> : <PublicIcon />}</span>
                        <div className="my_post_buttons">
                            <Button className="resource__btns my_post_delete_button" variant="contained" size="small" onClick={() => handleDeleteResource(post._id)} >
                                <DeleteOutlineIcon style={{ marginRight: '10px' }} />  Delete
                            </Button>
                            <Link to={`/post/${post._id}/`}>
                                <Button className="resource__btns my_post_delete_view" variant="contained" size="small">
                                    <OpenInNewIcon style={{ marginRight: '10px' }} />  view
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
        myposts: state.profile.myposts,
        loading: state.loading.loading
    }
}

export default connect(mapStateToProps, { profileMyPosts, deleteMyPost })(Myposts)
