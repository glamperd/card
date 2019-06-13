import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import { Grid, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core";
import { getOwedBalanceInDAI, getBalanceEth, getBalanceToken } from "../utils/currencyFormatting";

const styles = theme => ({
  row: {
    color: "green"
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
    const { custodialBalance } = this.state.persistent;
    //const substr = channelState ? channelState.balanceTokenUser : "0";
    const hubWei = channelState ? getBalanceEth(channelState.balanceWeiHub, connextState) : "0";
    const hubToken = channelState ? getBalanceToken(channelState.balanceTokenHub, connextState) : "0";
    const userWei = channelState ? getBalanceEth(channelState.balanceWeiUser, connextState) : "0";
    const userCustToken = custodialBalance ? getBalanceToken(custodialBalance.balanceToken, connextState) : "0";
    const balance = getOwedBalanceInDAI(connextState)
    const whole = balance.substring(0, balance.indexOf('.'))
    const part = balance.substring(balance.indexOf('.'))

    return (
      <Card className={classes.card}>
       <Grid container direction="column" alignItems="center">
        <Grid item style={{color:'black'}}>
        <span >
          <Typography inline={true} variant="h5" className={classes.row}>
            {"GZE "}
          </Typography>
          <Typography inline={true} variant="h1" className={classes.row}>
            <span>{whole}</span>
          </Typography>
          <Typography inline={true} variant="h3" className={classes.row}>
            <span>{part}</span>
          </Typography>
        </span>
        </Grid>
        <Grid item>
            <span>
            {'User Eth:' + userWei}
            </span>
        </Grid>
        <Grid item>
            <span>
            {'Hub Eth:' + hubWei}
            </span>
        </Grid>
        <Grid item>
            <span>
            {'Hub GZE:' + hubToken}
            </span>
        </Grid>
        <Grid item>
            <span>
            {'Custodial GZE:' + userCustToken}
            </span>
        </Grid>
       </Grid>
      </Card>
    );
  }
}

export default withStyles(styles)(ChannelCard);
