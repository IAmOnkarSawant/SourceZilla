import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Link } from 'react-scroll'
import { Container } from '@material-ui/core';
import AdjustIcon from '@material-ui/icons/Adjust';

export default function HideAppBar(props) {
    return (
        <React.Fragment>
            <CssBaseline />
                <AppBar style={{ backgroundColor: 'white', color: 'black' }} >
                    <Container maxWidth="lg">
                        <Toolbar className="toolbar_explore">
                            <div className="toolbarLeft">
                                <AdjustIcon style={{transform : 'scale(1.3)',color : '#05A54B'}} />
                                <Typography style={{ paddingLeft : '10px',fontSize: '27px', fontFamily: 'monospace', fontWeight: '600' }} variant="h6">BrandName</Typography>
                            </div>
                            <div className="toolbarRight">
                                <Link activeClass="active" className="home" to="Home" spy={true} smooth={true} duration={300} >
                                    Home
                                </Link>
                                <Link activeClass="active" className="aboutus" to="AboutUs" spy={true} smooth={true} duration={300} >
                                    About Us
                                </Link>
                                <Link activeClass="active" className="features" to="Features" spy={true} smooth={true} duration={300} >
                                    Features
                                </Link>
                                <Link activeClass="active" className="developers" to="Developers" spy={true} smooth={true} duration={300} >
                                    Developers
                                </Link>
                            </div>
                        </Toolbar>
                    </Container>
                </AppBar>
            <Toolbar />
        </React.Fragment>
    );
}