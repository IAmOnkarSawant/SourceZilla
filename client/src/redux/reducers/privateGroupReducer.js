const initialState = {
    groups: [],
    groupsIndividual: {},
    passcode: ''
}

const privategroupreducer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_PRIVATE_GROUPS':
            return {
                ...state,
                groups: action.payload
            }
        case 'CREATE_PRIVATE_GROUP':
            return {
                ...state,
                groups: [...state.groups, action.payload],
                passcode: action.passcode
            }
        case 'GET_PRIVATE_POSTS_BY_GROUP_ID':
            return {
                ...state,
                groupsIndividual: action.payload
            }
        case 'CLEAR_INDIVIDUAL_POSTS':
            return {
                ...state,
                groupsIndividual: []
            }
        case 'CREATE_PRIVATE_POST':
            return {
                ...state,
                groupsIndividual: {
                    ...state.groupsIndividual,
                    posts: [
                        ...state.groupsIndividual.posts,
                        action.payload
                    ]
                }
            }

        //UPVOTES AND DOWNVOTES
        case 'UPVOTE_PRIVATE_POST':
            return {
                ...state,
                groupsIndividual: {
                    ...state.groupsIndividual,
                    posts: state.groupsIndividual.posts.map(post => {
                        if (post._id === action.postId) {
                            return {
                                ...post,
                                upvotes: [...post.upvotes, action.payload],
                                downvotes: post.downvotes.filter(downvote => downvote !== action.payload)
                            }
                        }
                        return post
                    })
                }
            }
        case 'DOWNVOTE_PRIVATE_POST':
            return {
                ...state,
                groupsIndividual: {
                    ...state.groupsIndividual,
                    posts: state.groupsIndividual.posts.map(post => {
                        if (post._id === action.postId) {
                            return {
                                ...post,
                                downvotes: [...post.downvotes, action.payload],
                                upvotes: post.upvotes.filter(upvote => upvote !== action.payload),
                            }
                        }
                        return post
                    })
                }
            }

        case 'DELETE_PRIVATE_POST':
            return {
                ...state,
                groupsIndividual: {
                    ...state.groupsIndividual,
                    posts: state.groupsIndividual.posts.filter(post => post._id !== action.payload)
                }
            }

        case 'CLEAN_PASSCODE':
            return {
                ...state,
                passcode: ''
            }

        case 'REPORT_PRIVATE_POST':
            return {
                ...state,
                groupsIndividual: {
                    ...state.groupsIndividual,
                    posts: state.groupsIndividual.posts.map(post => {
                        if (post._id === action.payload) {
                            return {
                                ...post,
                                reports: [
                                    ...post.reports,
                                    action.userId
                                ]
                            }
                        }
                        return post
                    })
                }
            }
        default:
            return state;
    }
}

export default privategroupreducer;