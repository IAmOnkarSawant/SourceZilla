import React from 'react'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems : 'center',
        flexDirection: 'column'
    },
});

function Developer() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <img style={{borderRadius : '50%',border:'.5px solid black'}} width="200px" height="200px" alt="Remy Sharp" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP2E26iELuE_NlgAE1nApcazP7veiduc7Dzw&usqp=CAU" />
            <h2 style={{marginTop : '20px'}} className="">Pranav M.</h2>
            <p>B.tech</p>
        </div>
    )
}

export default Developer
