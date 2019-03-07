import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import DepositIcon from "@material-ui/icons/AttachMoney";
import Tooltip from "@material-ui/core/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import QRGenerate from "./qrGenerate";
import Snackbar from "./snackBar";
import { withStyles } from "@material-ui/core";

const styles = theme => ({
  icon: {
    width: "40px",
    height: "40px"
  }
});

class SupportCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null
    };
  }

  handleClick = () => {
    window.open("https://discord.gg/q2cakRc", "_blank");
    window.close();
    return false;
  };

  render() {
    const {
      classes,
      connext,
      web3,
      channelState,
      connextState,
      channelManagerAddress
    } = this.props;
    const { error, exitableBalance } = this.state;

    const exitableState =
      channelState &&
      channelState.sigUser &&
      channelState.sigHub &&
      channelState.sigUser != "0x0" &&
      channelState.sigHub != "0x0";

    return (
      <Grid
        container
        spacing={24}
        direction="column"
        style={{
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: "10%",
          paddingBottom: "10%",
          textAlign: "center",
          justifyContent: "center"
        }}
      >
        <Grid item xs={12}>
          <Typography variant="h2">
            <span>{`Uh oh!`}</span>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography paragraph variant="h6">
            <span>{`There appears to be an error with your channel. Please contact us on discord, for help resolve this gaslessly!`}</span>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {exitableState && (
            <Typography paragraph variant="body1">
              <span>{`If you need your funds now, use this update to call 'startExitWithUpdate' on the contract at ${
                channelState.contractAddress
              }.`}</span>
            </Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          {exitableState && (
            <Typography paragraph variant="body2">
              {`${JSON.stringify(channelState, null, 2)}.`}
            </Typography>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <Button
            variant="outlined"
            style={{
              background: "#FFF",
              border: "1px solid #F22424",
              color: "#F22424",
              width: "15%"
            }}
            size="medium"
            onClick={() => this.handleClick()}
          >
            Support
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            style={{
              background: "#FFF",
              border: "1px solid #F22424",
              color: "#F22424",
              width: "15%"
            }}
            size="medium"
            onClick={() => this.props.history.push("/")}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(SupportCard);
