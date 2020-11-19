import React from 'react'
import '../../css/Categories.css'
import '../../css/Posts.css'
import Layout from '../Layout'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { follow, unFollow, reportFollowedCategory, followedCategories, unFollowFollowedCategory } from '../../redux/actions/postsActions'
import { profileDetails } from '../../redux/actions/profileAction'
import { Button, Container, IconButton } from '@material-ui/core'
import FlagOutlinedIcon from '@material-ui/icons/FlagOutlined';
import FlagIcon from '@material-ui/icons/Flag';
import PeopleAltOutlinedIcon from '@material-ui/icons/PeopleAltOutlined';
import Loader from '../Loader'

function Categories(props) {

    const { followedCategories, profileDetails } = props
    useEffect(() => {
        followedCategories()
        profileDetails()

        // store.dispatch({ type: 'CLEAN_POSTS' })
    }, [followedCategories, profileDetails])

    const Unfollow = (id) => {
        // console.log(id)
        const data = {
            categoryId: id
        }
        props.unFollowFollowedCategory(data)
    }

    const handleReportCategory = (id) => {
        props.reportFollowedCategory(id, props.auth.user.userId)
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
                    <div className="categories">
                        <div className="grid__container_for_categories">
                            {props.categories.map((category, index) =>
                                category.spamFlag === false &&
                                <div key={index} className="content" >
                                    <div className="overlay">
                                        <Link to={`/category/${category.categoryName}/${category._id}/`}>
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
        categories: state.posts.followedCategories,
        auth: state.auth,
        details: state.profile.details,
        loading: state.loading.loading
    }
}

export default connect(mapStateToProps, {
    profileDetails,
    follow,
    unFollow,
    reportFollowedCategory,
    followedCategories,
    unFollowFollowedCategory
})(Categories)
