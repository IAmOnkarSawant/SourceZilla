import React from 'react'
import '../../css/Categories.css'
import '../../css/Posts.css'
import Layout from '../Layout'
import { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { getCategories, createCategory, follow, unFollow, reportCategory, popularCategories, latestCategories, oldestCategories } from '../../redux/actions/postsActions'
import { profileDetails } from '../../redux/actions/profileAction'
import { Avatar, Button, Container, Fab, IconButton, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import FlagOutlinedIcon from '@material-ui/icons/FlagOutlined';
import FlagIcon from '@material-ui/icons/Flag';
import SendIcon from '@material-ui/icons/Send';
import PeopleAltOutlinedIcon from '@material-ui/icons/PeopleAltOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import store from '../../redux/store'
import Loader from '../Loader'

const useStyles = makeStyles((theme) => ({
    extendedIcon: {
        marginRight: theme.spacing(0),
    },
    leave_button: {
        marginTop: 20
    },
}));

function Categories(props) {
    const classes = useStyles();
    const { getCategories, profileDetails } = props

    useEffect(() => {
        getCategories()      //get all categories
        profileDetails()

        store.dispatch({ type: 'CLEAN_POSTS' })
    }, [getCategories, profileDetails])

    const [cat, setCat] = useState('')
    const handleSubmit = (e) => {
        e.preventDefault()
        const data = {
            categoryName: cat
        }
        props.createCategory(data)
        console.log(cat)
        setCat('')
    }

    const follow = (id) => {
        // console.log(id)
        const data = {
            categoryId: id
        }
        props.follow(data)
    }

    const Unfollow = (id) => {
        // console.log(id)
        const data = {
            categoryId: id
        }
        props.unFollow(data)
    }

    const handleReportCategory = (id) => {
        props.reportCategory(id, props.auth.user.userId)
    }

    const handleSelectChange = (e) => {
        if (e.target.value === 'popular') {
            props.popularCategories()
        }
        if (e.target.value === 'latest') {
            props.latestCategories()
        }
        if (e.target.value === 'oldest') {
            props.oldestCategories()
        }
        if (e.target.value === '') {
            props.getCategories()
        }
    }

    if (props.loading === true) {
        return (
            <Loader />
        )
    }

    return (
        <>
            <Layout>
                <Container maxWidth="xl" className="posts__container">
                    <Paper elevation={1} className="createPost">
                        <div className="create">
                            <form onSubmit={handleSubmit} className="form">
                                <Avatar
                                    className="avatar__create"
                                    alt={`${props?.details?.userName?.toUpperCase()}`}
                                    src={props.details.fileName && `/posts/file/${props?.details?.fileName}`}
                                />
                                <input
                                    onChange={(e) => setCat(e.target.value)}
                                    type="text"
                                    name="categoryName"
                                    value={cat}
                                    placeholder={`What's on your mind, ${props.auth.user.userName} ?`}
                                    className="create__input"
                                />
                                <IconButton disabled={!cat} style={{ backgroundColor: 'white' }} type="submit" size="small" className="" >
                                    <SendIcon className={classes.extendedIcon + ' sendicon'} />
                                </IconButton>
                            </form>
                        </div>
                    </Paper>
                    <div className="upper_category_box">
                        <div className="upper_category_box_left">
                            <div class="select">
                                <select name="sorting" id="sorting" onClick={handleSelectChange}>
                                    <option value=" ">Select</option>
                                    <option value="">All</option>
                                    <option value="popular">Popular</option>
                                    <option value="latest">Latest</option>
                                    <option value="oldest">Oldest</option>
                                </select>
                            </div>
                        </div>
                        <div className="upper_category_box_right">
                            <Fab className={classes.leave_button + ' leave_group_icon'} size="medium" color="secondary" variant="extended" onClick={() => props.history.push('/followedcategories/')}>
                                <ExitToAppIcon className={classes.extendedIcon} />
                                <span style={{ marginLeft: '10px' }} >My Followed Categories</span>
                            </Fab>
                        </div>
                    </div>
                    <div className="categories">
                        <div className="grid__container_for_categories">
                            {props.categories.map((category, index) => {
                                return (
                                    category.spamFlag === false &&
                                    <div key={index} className="content" >
                                        <div className="overlay">
                                            <Link to={`/category/${category._id}/`}>
                                                <button className="Stylishbtn style">{category.categoryName}</button>
                                            </Link>
                                            <div className="followers_length">
                                                <PeopleAltOutlinedIcon className="people_icon" />
                                                {category.followers.length}
                                            </div>
                                        </div>
                                        <div className="category_card_follow_unfollow_buttons">
                                            {
                                                category.followers.includes(props.auth.user.userId) ? (
                                                    <Button className="follow_btn" fullWidth onClick={() => Unfollow(category._id)} style={{ marginTop: '10px' }} size="small" variant="contained" color="secondary" >
                                                        UnFollow
                                                    </Button>
                                                ) : (
                                                        <Button className="Unfollow_btn" fullWidth onClick={() => follow(category._id)} style={{ marginTop: '10px' }} size="small" variant="contained" color="primary" >
                                                            Follow
                                                        </Button>
                                                    )
                                            }
                                        </div>
                                        <div className="category_card_report_button">
                                            {
                                                category.reports.includes(props.auth.user.userId) ? (
                                                    <IconButton style={{ color: '#0FAB4A' }} onClick={() => handleReportCategory(category._id)} size="medium" variant="contained" color="default" >
                                                        <FlagIcon />
                                                    </IconButton>
                                                ) : (
                                                        <IconButton style={{ color: '#0FAB4A' }} onClick={() => handleReportCategory(category._id)} size="medium" variant="contained" color="default" >
                                                            <FlagOutlinedIcon />
                                                        </IconButton>
                                                    )
                                            }
                                        </div>
                                    </div>
                                )
                            }
                            )}
                        </div>
                    </div>
                </Container>
            </Layout>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        categories: state.posts.categories,
        auth: state.auth,
        details: state.profile.details,
        loading: state.loading.loading
    }
}

export default connect(mapStateToProps, {
    profileDetails,
    follow,
    unFollow,
    getCategories,
    createCategory,
    reportCategory,
    popularCategories,
    latestCategories,
    oldestCategories
})(Categories)
