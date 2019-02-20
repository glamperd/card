import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core";

const styles = {
  card: {
    display: "flex",
    flexDirection: "row",
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
  clipboard: {
    cursor: "pointer"
  }
};

class ChannelCard extends Component {
  getSubstring(string) {
    let temp = parseFloat(string);
    if (!temp || temp === 0) {
      return ["0", "00"]
    }
    temp = temp * Math.pow(10, -18);
    let substring = temp.toString().split(".");
    return substring;
  }

  render() {
    const { classes, channelState } = this.props
    return (
      <Card className={classes.card}>
        <span>
          <Typography inline={true} variant="h5" className={classes.row}>
            {"$ "}
          </Typography>
          <Typography inline={true} variant="h1" className={classes.row}>
            <span>{this.getSubstring(channelState.balanceTokenUser)[0]}</span>
          </Typography>
          <Typography inline={true} variant="h3" className={classes.row}>
            <span>{"." + this.getSubstring(channelState.balanceTokenUser)[1].substring(0, 2)}</span>
          </Typography>
        </span>
      </Card>
    );
  }
}

export default withStyles(styles)(ChannelCard);
