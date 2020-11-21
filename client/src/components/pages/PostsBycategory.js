import { Button, Container } from '@material-ui/core'
import React from 'react'
import '../../css/PostByCategoryId.css'

import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import ThumbDownAltIcon from '@material-ui/icons/ThumbDownAlt';
import DeleteIcon from '@material-ui/icons/Delete';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import BookmarkBorderOutlinedIcon from "@material-ui/icons/BookmarkBorderOutlined";
import FlagIcon from '@material-ui/icons/Flag';
import FlagOutlinedIcon from '@material-ui/icons/FlagOutlined';
import moment from 'moment'
import { useState } from 'react'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Layout from '../Layout'
import { postCreate, getPosts, postDelete, UpVote, DownVote, addresourcebox, reportPost, removeFromResourceBox } from '../../redux/actions/postsActions'
import { profileDetails } from '../../redux/actions/profileAction'
import store from '../../redux/store'
import { ApplicationFormat, AudioAllFormat, TextFormat, ImageFormat, VideoFormat } from '../../utils/utils';
import FlipMove from 'react-flip-move'
import LaunchIcon from '@material-ui/icons/Launch';
import AttachmentIcon from '@material-ui/icons/Attachment';
import CreateIcon from '@material-ui/icons/Create';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';
import ReactPlayer from 'react-player/lazy'
import ReactAudioPlayer from 'react-audio-player';
import "react-sweet-progress/lib/style.css";
import { Progress } from 'react-sweet-progress'
import nl2br from 'nl2br'
import ScrollToTop from 'react-scroll-up'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Loader from '../Loader';
import { Toggle } from "react-toggle-component"

const useStyles = makeStyles((theme) => ({
    root: {
        // maxWidth: 345,
        marginBottom: 25,
    },
    media: {
        height: 0,
        paddingTop: "56.25%" // 16:9
    },
    avatar: {
        backgroundColor: red[500]
    },
    up_votes_count: {
        marginLeft: '10px',
    },
    down_votes_count: {
        marginLeft: '10px',
    },
    input: {
        display: 'none',
    },
}));

function PostsBycategory(props) {
    const classes = useStyles();
    // console.log(props.match.params.categoryId)
    const [toggle, setToggle] = useState(false)
    const [postContent, setpostContent] = useState('')
    const [file, setFile] = useState('')

    const { getPosts, profileDetails, match: { params: { categoryId } } } = props
    useEffect(() => {
        getPosts(categoryId)   //get posts by categoryId
        profileDetails()                         //ger user details 🍕

        store.dispatch({ type: 'CLEAR_INDIVIDUAL_POST' })
        store.dispatch({ type: 'CLEAN_COMMENTS' })     //clean comments state everytime when this component mount !
    }, [getPosts, profileDetails, categoryId])

    const handleSubmit = (e) => {
        e.preventDefault()
        const data = {
            postContent,
            categoryId: props.match.params.categoryId
        }

        var formData = new FormData();

        formData.append('postContent', nl2br(data.postContent))
        formData.append('categoryId', data.categoryId)
        formData.append('file', file)

        props.postCreate(formData)            //post created
        console.log(file, data)
        setpostContent('')
    }

    const handleDeletePost = (id) => {
        props.postDelete(id)
        console.log(id)
    }

    // votes
    const handleUpvote = (id) => {
        console.log(id)
        props.UpVote(id, props.auth.user.userId)
    }

    const handleDownvote = (id) => {
        console.log(id)
        props.DownVote(id, props.auth.user.userId)
    }

    const addToResource = (id) => {
        console.log(id)
        props.addresourcebox(id)
    }

    const removeFromResource = (id) => {
        console.log(id)
        props.removeFromResourceBox(id)
    }

    const handleReportPost = (id) => {
        props.reportPost(id, props.auth.user.userId)
    }

    const EnterticketNotVisibleState = {
        opacity: 0.1
    };
    const LeaveticketNotVisibleState = {
        opacity: 0.1
    };

    if (props.loading === true) {
        return (
            <Loader />
        )
    }
    console.log(toggle)
    return (
        <Layout>
            <Container maxWidth="lg" >
                <div className="imp_information">
                    <p>
                        {props.match.params.categoryName}
                    </p>
                    <div htmlFor="toggle-1">
                        <Toggle
                            name="toggle-1"
                            rightBackgroundColor="#04A54B"
                            leftKnobColor="grey"
                            rightKnobColor="white"
                            onToggle={() => setToggle((state) => !state)}
                        />
                    </div>
                </div>
                {toggle && (
                    <div className="create__post__">
                        <form onSubmit={handleSubmit} className="post_create_content" >
                            <textarea
                                type="text"
                                className="styled__textarea"
                                name="postContent"
                                value={postContent}
                                onChange={(e) => setpostContent(e.target.value)}
                            />
                            <input
                                className={classes.input}
                                id="contained-button-file"
                                type="file"
                                name="file"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            <div className="buttons_post">
                                <label htmlFor="contained-button-file" className="only_upload_button" >
                                    <Button fullWidth className="upload_button" size="small" variant="contained" component="span">
                                        <AttachmentIcon style={{ marginRight: '8px' }} /> <span style={{ fontWeight: '700' }} >Upload</span>
                                    </Button>
                                </label>
                                <Button className={postContent ? 'post_submit_button' : 'disabled_post_submit_button'} disabled={!postContent} size="small" variant="contained" type="submit" >
                                    <CreateIcon style={{ marginRight: '8px' }} />  <span style={{ fontWeight: '700' }}>Create Post</span>
                                </Button>
                            </div>
                            <Progress
                                style={{ marginTop: '15px' }}
                                percent={props.percentage}
                                theme={{
                                    active: {
                                        color: '#04A34A'
                                    },
                                    success: {
                                        symbol: '✅',
                                        color: '#04A34A'
                                    },
                                    default: {
                                        symbol: '❌',
                                    }
                                }}
                            />
                        </form>
                    </div>
                )}
                <div className="posts_div">
                    <FlipMove
                        enterAnimation={{
                            from: EnterticketNotVisibleState,
                            to: {}
                        }}
                        leaveAnimation={{
                            from: {},
                            to: LeaveticketNotVisibleState
                        }}
                    >
                        {props.posts && props.posts.map(post =>
                            (
                                <Card key={post._id} className={classes.root + " post_card"} >
                                    <div className={`${post.spamFlag === true ? 'bg-content' : ''}`} style={{ position: 'relative' }}>

                                        <CardHeader
                                            avatar={
                                                <Avatar
                                                    className="post_user_profile_photo"
                                                    alt={post.postBy.toLocaleUpperCase()}
                                                    src={`/posts/file/${post.profileImage}`}
                                                />
                                            }
                                            action={
                                                <div className="post_right_buttons">
                                                    {
                                                        props.auth.user.userId === post.postByUserId ? (
                                                            <IconButton className="delete_button" onClick={() => handleDeletePost(post._id)} size="small" variant="contained"  >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        ) : (
                                                                <IconButton disabled className="delete_button" onClick={() => handleDeletePost(post._id)} size="small" variant="contained" >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            )
                                                    }
                                                    {
                                                        // post.spamFlag === false &&
                                                        (
                                                            post?.reports?.includes(props.auth.user.userId) ? (
                                                                <IconButton style={{ color: '#0FAB4A' }} onClick={() => handleReportPost(post._id)} size="small" variant="contained"  >
                                                                    <FlagIcon />
                                                                </IconButton>
                                                            ) : (
                                                                    <IconButton style={{ color: '#0FAB4A' }} onClick={() => handleReportPost(post._id)} size="small" variant="contained"  >
                                                                        <FlagOutlinedIcon />
                                                                    </IconButton>
                                                                )
                                                        )
                                                    }
                                                    {
                                                        props?.details?.resourceBox?.includes(post._id) ? (
                                                            <IconButton style={{ color: '#0FAB4A' }} onClick={() => removeFromResource(post._id)} size="small" variant="contained"  >
                                                                <BookmarkIcon />
                                                            </IconButton>
                                                        ) : (
                                                                <IconButton style={{ color: '#0FAB4A' }} onClick={() => addToResource(post._id)} size="small" variant="contained" >
                                                                    <BookmarkBorderOutlinedIcon />
                                                                </IconButton>
                                                            )
                                                    }
                                                </div>
                                            }
                                            title={post.postBy}
                                            subheader={moment(post.createdAt).fromNow()}
                                        />
                                        <CardContent>
                                            <Typography style={{ marginBottom: '20px' }} variant="body2" color="textSecondary" component="p">
                                                <pre>
                                                    {post.postContent.replace(/<br\s*\/?>/gi, ' ')}
                                                </pre>
                                            </Typography>
                                            {ImageFormat?.includes(post?.fileContentType) && post?.fileName && (
                                                <img
                                                    height="300px"
                                                    width="450px"
                                                    src={`/posts/file/${post.fileName}`}
                                                    alt=""
                                                />
                                            )}
                                            {ApplicationFormat?.includes(post?.fileContentType) && post?.fileName && (
                                                <a className="link_button" style={{ color: 'black' }} rel="noopener noreferrer" href={process.env.NODE_ENV === 'development' ? `http://localhost:4000/posts/file/${post.fileName}` : `/posts/file/${post.fileName}`} target="_blank" >
                                                    <Button className="link_button_file" variant="contained" size="small">
                                                        View Document
                                                    </Button>
                                                </a>
                                            )}
                                            {TextFormat?.includes(post?.fileContentType) && post?.fileName && (
                                                <a className="link_button" style={{ color: 'black' }} rel="noopener noreferrer" href={process.env.NODE_ENV === 'development' ? `http://localhost:4000/posts/file/${post.fileName}` : `/posts/file/${post.fileName}`} target="_blank" >
                                                    <Button className="link_button_file" variant="contained" size="small">
                                                        View Document
                                                    </Button>
                                                </a>
                                            )}
                                            {AudioAllFormat?.includes(post?.fileContentType) && post?.fileName && (
                                                <ReactAudioPlayer
                                                    src={`/posts/file/${post.fileName}`}
                                                    controls
                                                    controlsList="nodownload"
                                                />
                                            )}
                                            {VideoFormat?.includes(post?.fileContentType) && post?.fileName && (
                                                <ReactPlayer
                                                    className='react-player fixed-bottom'
                                                    url={`/posts/file/${post.fileName}`}
                                                    width='500px'
                                                    height='300px'
                                                    controls={true}
                                                    onContextMenu={e => e.preventDefault()}
                                                    config={{ file: { attributes: { controlsList: 'nodownload' } } }}
                                                />
                                            )}
                                        </CardContent>
                                        <CardActions disableSpacing>
                                            {
                                                post?.upvotes?.includes(props?.auth?.user?.userId) ? (
                                                    <div className="down__vote">
                                                        <IconButton onClick={() => handleUpvote(post._id)} aria-label="add to favorites" style={{ color: `${post?.upvotes?.includes(props?.auth?.user?.userId) ? "#0eaa49" : ""}` }} >
                                                            <ThumbUpAltIcon />
                                                            <Typography className={classes.up_votes_count} variant="h6" component="h6">
                                                                {post.upvotes.length}
                                                            </Typography>
                                                        </IconButton>
                                                        <IconButton onClick={() => handleDownvote(post._id)} aria-label="remove from favorites">
                                                            <ThumbDownAltIcon />
                                                            <Typography className={classes.down_votes_count} variant="h6" component="h6">
                                                                {post.downvotes.length}
                                                            </Typography>
                                                        </IconButton>
                                                    </div>
                                                ) : (
                                                        <div className="up__vote">
                                                            <IconButton onClick={() => handleUpvote(post._id)} aria-label="add to favorites">
                                                                <ThumbUpAltIcon />
                                                                <Typography className={classes.up_votes_count} variant="h6" component="h6">
                                                                    {post.upvotes.length}
                                                                </Typography>
                                                            </IconButton>
                                                            <IconButton onClick={() => handleDownvote(post._id)} aria-label="remove from favorites" style={{ color: `${post?.downvotes?.includes(props?.auth?.user?.userId) ? "#0eaa49" : ""}` }} >
                                                                <ThumbDownAltIcon />
                                                                <Typography className={classes.down_votes_count} variant="h6" component="h6">
                                                                    {post.downvotes.length}
                                                                </Typography>
                                                            </IconButton>
                                                        </div>
                                                    )
                                            }
                                            <Link to={`/post/${post._id}`} >
                                                <IconButton style={{ marginLeft: '10px' }} size="small" variant="contained" color="default" >
                                                    <LaunchIcon />
                                                </IconButton>
                                            </Link>
                                        </CardActions>
                                        {/* {post.spamFlag && (
                                            <div className="sens_conte">
                                                <h2>Sensitive Content</h2>
                                            </div>
                                        )} */}
                                    </div>
                                    <div className={`${post.spamFlag === true ? 'fg-content' : 'hide-content'}`}>
                                        <div className="fg-content-container">
                                            <VisibilityOffOutlinedIcon className="visibility-icon" />
                                            <span>Post has been reported for inappropriate content</span>
                                        </div>
                                    </div>
                                </Card>
                            )
                        )}
                    </FlipMove>
                </div>
            </Container>
            <ScrollToTop
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    cursor: 'pointer',
                    transitionDuration: '0.2s',
                    transitionTimingFunction: 'linear',
                    transitionDelay: '0s',
                    backgroundColor: '#04A44B',
                    borderRadius: '50%'
                }}
                showUnder={160}
            >
                <IconButton>
                    <ArrowUpwardIcon style={{ color: 'white' }} />
                </IconButton>
            </ScrollToTop>
        </Layout>
    )
}

const mapStateToProps = (state) => {
    return {
        posts: state.posts.posts,
        auth: state.auth,
        upVotes: state.posts.upVotes,
        downVotes: state.posts.downVotes,
        details: state.profile.details,
        loading: state.loading.loading,
        percentage: state.posts.percentage
    }
}

export default connect(mapStateToProps, {
    postCreate,
    getPosts,
    postDelete,
    UpVote,
    DownVote,
    addresourcebox,
    removeFromResourceBox,
    profileDetails,
    reportPost
})(PostsBycategory)
