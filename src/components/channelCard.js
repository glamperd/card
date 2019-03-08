import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import { Grid, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core";
import { getChannelBalanceInUSD } from "../utils/currencyFormatting";

const styles = theme => ({
  card: {
    display: "flex",
    flexDirection: "row",
    flexBasis: "100%",
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
    // only displays token value by default
    const display = getChannelBalanceInUSD(channelState, connextState)
    return (
      <Card className={classes.card}>
        <Grid container direction="column" alignItems="center">
          <Grid item>
            <span>
              <Typography inline={true} variant="h5" className={classes.row}>
                {"$ "}
              </Typography>
              <Typography inline={true} variant="h1" className={classes.row}>
                <span>{display.substring(1, display.length - 2)}</span>
              </Typography>
              <Typography inline={true} variant="h3" className={classes.row}>
                <span>{display.substr(display.length - 2)}</span>
              </Typography>
            </span>
          </Grid>
        </Grid>
      </Card>
    );
  }
}

export default withStyles(styles)(ChannelCard);
