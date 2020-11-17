import React from 'react'
import '../../css/PrivateGroups.css'
import '../../css/Categories.css'
import Layout from '../Layout'
import { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { profileDetails } from '../../redux/actions/profileAction'
import { getprivateGroups, createprivateGroup } from '../../redux/actions/privategroupAction'
import { Avatar, Button, Container, Dialog, IconButton, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
// import NavigationIcon from '@material-ui/icons/Navigation';
import store from '../../redux/store'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import FileCopyIcon from '@material-ui/icons/FileCopy'
import SendIcon from '@material-ui/icons/Send';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Loader from '../Loader'

const useStyles = makeStyles((theme) => ({
    extendedIcon: {
        marginRight: theme.spacing(0),
    },
}));

function PrivateGroups({ profileDetails, getprivateGroups, createprivateGroup, details, groups, auth, loading, passcode }) {
    const classes = useStyles();
    const [groupName, setgroupName] = useState('')
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false)

    const handleClose = () => {
        setOpen(false);
        setCopied(false)
    };

    useEffect(() => {
        getprivateGroups()
        profileDetails()

        if (passcode) {
            setOpen(true)
        }

        store.dispatch({ type: 'CLEAR_INDIVIDUAL_POSTS' })
        store.dispatch({ type: 'CLEAN_ERRORS' })
    }, [getprivateGroups, profileDetails, passcode])

    console.log(passcode)
    useEffect(() => {
        return () => {
            store.dispatch({ type: 'CLEAN_PASSCODE' })
        }
    }, [])

    const handleCreateGroup = (e) => {
        e.preventDefault()

        createprivateGroup(groupName)
        setgroupName('')
    }

    if (loading === true) {
        return (
            <Loader />
        )
    }

    return (
        <Layout>
            <Container maxWidth="xl" className="posts__container">
                <Paper elevation={1} className="createPost">
                    <div className="create">
                        <form onSubmit={handleCreateGroup} className="form">
                            <Avatar className="avatar__create" alt={`${details?.userName?.toUpperCase()}`} src={`/posts/file/${details.fileName}`} />
                            <input
                                onChange={(e) => setgroupName(e.target.value)}
                                type="text"
                                name="groupName"
                                value={groupName}
                                placeholder={`What's on your mind, ${auth.user.userName} ?`}
                                className="create__input"
                            />
                            <IconButton disabled={!groupName} style={{ backgroundColor: 'white' }} type="submit" size="small" className="" >
                                <SendIcon className={classes.extendedIcon + ' sendicon'} />
                            </IconButton>
                        </form>
                    </div>
                </Paper>
                <div className="categories">
                    <div className="grid__container_for_categories">
                        {
                            groups.map((group, index) => {
                                return (
                                    <div key={index} className="content" >
                                        <div className="overlay">
                                            <Link to={`/groups/${group.groupName}/${group._id}/`}>
                                                <button className="Stylishbtn style">{group.groupName}</button>
                                            </Link>
                                        </div>
                                        <div className="Join_group_buttton">
                                            {!details?.myPrivateGroups?.includes(group._id) ? (
                                                <Button className="join_group_button" fullWidth size="small" variant="contained">
                                                    <Link style={{ padding: '0px 60px' }}
                                                        to={{
                                                            pathname: `/modal/${group._id}/join/`,
                                                            state: { modal: true }
                                                        }}
                                                    >
                                                        Join Group
                                                        </Link>
                                                </Button>
                                            ) : (
                                                    <Button fullWidth disabled size="small" variant="contained">
                                                        <Link style={{ padding: '0px 60px' }}
                                                            to={{
                                                                pathname: `/modal/${group._id}/join/`,
                                                                state: { modal: true }
                                                            }}
                                                        >
                                                            Join Group
                                                            </Link>
                                                    </Button>
                                                )
                                            }
                                        </div>
                                    </div>
                                )
                            }
                            )
                        }
                    </div>
                </div>
            </Container>
            <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
                <div className="passcode_container">
                    <h2 className="passcode">{passcode}</h2>
                    <CopyToClipboard text={passcode} onCopy={() => setCopied(true)}>
                        {
                            copied ? (
                                <button className="passcode_copy" >
                                    <FileCopyIcon style={{ color: '#0EAA49' }} />
                                </button>
                            ) : (
                                    <button className="passcode_copy" >
                                        <FileCopyOutlinedIcon />
                                    </button>
                                )
                        }
                    </CopyToClipboard>
                </div>
                {copied ? <span className="copy_message">copied</span> : null}
            </Dialog>
        </Layout>
    )
}

const mapStateToProps = (state) => {
    return {
        groups: state.groups.groups,
        auth: state.auth,
        details: state.profile.details,
        loading: state.loading.loading,
        passcode: state.groups.passcode
    }
}

export default connect(mapStateToProps, { profileDetails, getprivateGroups, createprivateGroup })(PrivateGroups)
