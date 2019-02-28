import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import { Grid, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core";
import { getDollarSubstring } from "../utils/getDollarSubstring";


const styles = theme => ({
  card: {
    display: "flex",
    flexDirection: "row",
    flexBasis:"100%",
    width: "100%",
    height: "auto",
    marginTop: "-2%",
    justifyContent: "center",
    backgroundColor: "#282b2e",
    elevation: "0",
    square: true,
    color: "white",
    paddingTop: "25%",
    paddingBottom: "25%"
  },
  row: {
    color: "white"
  },
  pending:{
    marginBottom:"3%",
    color:"white"
  },
  clipboard: {
    cursor: "pointer"
  }
});

class ChannelCard extends Component {

  render() {
    const { classes, channelState } = this.props;
    const substr = channelState ? getDollarSubstring(channelState.balanceTokenUser) : ["0","00"]
    const userWei = channelState ? getDollarSubstring(channelState.balanceWeiUser) : ["0","00"]
    const hubToken = channelState ? getDollarSubstring(channelState.balanceTokenHub) : ["0","00"]
    const hubWei = channelState ? getDollarSubstring(channelState.balanceWeiHub) : ["0","00"];

    return (
      <Card className={classes.card}>
      <Grid container direction="column" alignItems="center">
      <Grid item>
        <span>
          <Typography inline={true} variant="h5" className={classes.row}>
            {"GZE "}
          </Typography>
          <Typography inline={true} variant="h1" className={classes.row}>
            <span>{substr[0]}</span>
          </Typography>
          <Typography inline={true} variant="h3" className={classes.row}>
            <span>{"." + substr[1].substring(0, 2)}</span>
          </Typography>
        </span>
        </Grid>
        <Grid item>
            <span>
            {'User Eth:' + userWei[0] + '.' + userWei[1].substring(0, 2)}
            </span>
        </Grid>
        <Grid item>
            <span>
            {'Hub Eth:' + hubWei[0] + '.' + hubWei[1].substring(0, 2)}
            </span>
        </Grid>
        <Grid item>
            <span>
            {'Hub GZE:' + hubToken[0] + '.' + hubToken[1].substring(0, 2)}
            </span>
        </Grid>
        </Grid>
      </Card>
    );
  }
}

export default withStyles(styles)(ChannelCard);
