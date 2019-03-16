import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import { Grid, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core";
import { getChannelBalanceInUSD } from "../utils/currencyFormatting";

const styles = theme => ({
  row: {
    color: "white"
  },
  pending: {
    marginBottom: "3%",
    color: "white"
  },
  clipboard: {
    cursor: "pointer"
  }
});

class ChannelCard extends Component {
  render() {
    const { classes, channelState, connextState } = this.props;
    const display = getChannelBalanceInUSD(channelState, connextState);
    const substr = channelState ? [channelState.balanceTokenUser, "00"] : ["0","00"]
    const userWei = channelState ? [channelState.balanceWeiUser, "00"] : ["0","00"]
    const hubToken = channelState ? [channelState.balanceTokenHub, "00"] : ["0","00"]
    const hubWei = channelState ? [channelState.balanceWeiHub, "00"] : ["0","00"];

    return (
      <Card className={classes.card}>
      <Grid container direction="column" alignItems="center">
      <Grid item>
        <span>
          <Typography inline={true} variant="h5" className={classes.row}>
            {"GZE "}
          </Typography>
          <Typography inline={true} variant="h1" className={classes.row}>
            <span>{display.substring(1, display.length - 2)}</span>
          </Typography>
          <Typography inline={true} variant="h3" className={classes.row}>
            <span>{display.substr(display.length - 2)}</span>
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
