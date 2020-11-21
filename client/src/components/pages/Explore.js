import React from 'react'
import '../../css/Explore.css'
import Navbar from './Explore/Navbar'
import { Container, Grid } from '@material-ui/core'
import EntryContainer from './Explore/EntryContainer'
import databse from './Explore/undraw_co-working_825n (1).svg'
import Card from './Explore/Card'
import Developer from './Explore/Developer'
import { Element } from 'react-scroll'

function Explore() {
    return (
        <>
            <Element name="Home" className="home">
                <Navbar />
                <Container fixed>
                    <Grid
                        container
                        spacing={0}
                        alignItems="center"
                        justify="center"
                        style={{ height: 'calc(100vh - 0px)' }}
                    >
                        <Grid item lg={6} >
                            <EntryContainer />
                        </Grid>
                        <Grid item lg={6} >
                            <img height="570px" src={databse} alt="" />
                        </Grid>
                    </Grid>
                </Container>
            </Element>
            <Element name="AboutUs" className="aboutus">
                <Container fixed
                    alignItems="flex-start"
                    justify="center"
                    style={{ minHeight: 'calc(100vh - 0px)' }}
                >
                    <p className="aboutUs">Motivation</p>
                    <hr style={{
                        border: "0",
                        height: "4px",
                        backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0),  #05A54B, rgba(0, 0, 0, 0))",
                    }} />
                    <Grid
                        container
                        spacing={0}
                    >
                        <Grid item lg={12} >
                            <p style={{ textAlign: 'justify', paddingTop: '55px'}} >
                                Lorem ipsum doio obcalaborum quis enim fugiat reiciendis doloremque maxime rerum at! Omnis dolore quae incidunt ad quod, nobis excepturi et expedita est atque sunt ea obcaecati saepe iste eveniet, illo velit voluptates quo, totam exercitationem quisquam id architecto sed? Accusamus placeat tenetur porro harum suscipit ducimus tempore ea unde consectetur at in officiis vel dolor aspernatur neque quo illo sequi, beatae officia voluptatibus iusto laudantium? Dolorem neque nam, non doloribus, provident, beatae voluptates quisquam odio quas dignissimos possimus vero quos. Quo non vero possimus, illum tenetur saepe explicabo et perspiciatis. Cumque repellat qui id optio quibusdam voluptatibus consequuntur tempore vel fugit eveniet delectus ducimus deserunt, neque voluptate dolorum nobis ab praesentium aspernatur voluptas, mollitia asperiores error ea cupiditate rerum. Sint, veritatis! Sint doloribus, incidunt sequi optio soluta expedita neque perferendis quos aliquam iusto repudiandae perspiciatis, provident nihil hic ducimus numquam alias commodi. Alias eveniet architecto quas libero itaque. Aperiam laudantium distinctio quis sunt perferendis eaque inventore voluptatem laborum vel illum, atque autem accusamus natus iste dolores similique iusto praesentium recusandae eligendi modi, repudiandae, fugiat consectetur est. Aliquid necessitatibus illum unde. Inventore, maxime id. Ipsam voluptatibus laudantium, excepturi nisi consequatur perspiciatis alias maiores iure iste eaque quis ipsa exercitationem, distinctio voluptates nesciunt cumque tenetur. Veniam laboriosam dolor maiores eaque saepe! Repellat modi voluptatum necessitatibus excepturi ducimus perspiciatis consequuntur aspernatur minima itaque quod quae adipisci, qui eos quasi nulla nam at ex, culpa neque amet commodi ratione, magnam omnis. Molestiae quod nam debitis voluptate consequuntur numquam sint aliquam explicabo excepturi quos, quis qui, blanditiis rerum molestias dolor, laborum alias quaerat ad expedita quasi illum consequatur porro vitae ducimus! Ipsum dolorem, modi sapiente voluptatem, explicabo rem dolore facere velit maiores illo nesciunt accusamus perferendis saepe at ea fugit nemo laudantium! Eaque eum molestiae eveniet asperiores. Molestiae laudantium quod maxime quas. A dolore est quam dicta, minima modi consequuntur delectus maxime facere obcaecati repellat soluta nihil, enim iure ut ab recusandae reiciendis tempora quae assumenda mollitia accusamus voluptas dolorem. Distinctio aliquid repudiandae sunt accusantium autem ea minus eaque, id alias ex. Hic porro repudiandae quisquam nihil distinctio molestiae non ipsam culpa accusamus laudantium ullam ea, alias eligendi nisi exercitationem reprehenderit nobis soluta velit iure nemo, iste quod, officia aliquam cupiditate! Quas recusandae cupiditate iusto commodi perferendis doloremque ex facere natus laboriosam provident, rerum delectus, enim quod corrupti est praesentium quibusdam culpa. Perferendis deleniti ea harum asperiores possimus rerum esse minima aut in cum doloremque corporis molestiae officiis, repellat soluta sit optio sequi voluptas. Voluptatem temporibus magnam in blanditiis ratione totam cum sunt eveniet vitae, voluptates officia, earum similique quasi quos voluptate ipsum debitis modi suscipit ducimus consequuntur maxime facilis odio velit. Totam assumenda beatae inventore enim asperiores dignissimos, adipisci ad corporis sunt hic minima alias excepturi libero, laboriosam ab aut aspernatur voluptate rerum aliquam eum dolorum quisquam accusamus voluptates harum? Tenetur inventore repellat quae veritatis provident laborum. Perspiciatis soluta atque eum non aspernatur, optio iste natus ullam esse eius neque et odit labore omnis praesentium placeat impedit, perferendis doloremque repellendus similique deleniti libero in voluptatem alias. Beatae assumenda deserunt cum ipsam veritatis ullam numquam.
                            </p>
                        </Grid>
                    </Grid>
                </Container>
            </Element>
            <Element name="Features" className="features">
                <Container maxWidth="lg"
                    alignItems="center"
                    justify="center"
                    style={{ minHeight: 'calc(100vh - 0px)' }}
                >
                    <p className="Features">Features</p>
                    <hr style={{
                        border: "0",
                        height: "4px",
                        backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0),  #05A54B, rgba(0, 0, 0, 0))",
                    }} />
                    <Grid
                        container
                        spacing={5}
                        style={{ paddingTop: '50px' }}
                    >
                        <Grid item lg={4} md={4} sm={6} >
                            <Card />
                        </Grid>
                        <Grid item lg={4} md={4} sm={6} >
                            <Card />
                        </Grid>
                        <Grid item lg={4} md={4} sm={6} >
                            <Card />
                        </Grid>
                    </Grid>
                </Container>
            </Element>
            <Element name="Developers" className="developers">
                <Container maxWidth="lg"
                    alignItems="center"
                    justify="center"
                    style={{ minHeight: 'calc(100vh - 0px)' }}
                >
                    <p className="Developers">Developers</p>
                    <hr style={{
                        border: "0",
                        height: "4px",
                        backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0),  #05A54B, rgba(0, 0, 0, 0))",
                    }} />
                    <Grid
                        container
                        spacing={2}
                        style={{ paddingTop: '100px' }}
                    >
                        <Grid item lg={3} md={3} sm={6} xs={12} >
                            <Developer />
                        </Grid>
                        <Grid item lg={3} md={3} sm={6} xs={12} >
                            <Developer />
                        </Grid>
                        <Grid item lg={3} md={3} sm={6} xs={12} >
                            <Developer />
                        </Grid>
                        <Grid item lg={3} md={3} sm={6} xs={12} >
                            <Developer />
                        </Grid>
                    </Grid>
                </Container>
            </Element>
        </>
    )
}

export default Explore
