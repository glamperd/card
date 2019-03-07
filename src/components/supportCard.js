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
    const { channelState } = this.props;
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
          paddingLeft: "5%",
          paddingRight: "5%",
          paddingTop: "10%",
          paddingBottom: "10%",
          textAlign: "center",
          justifyContent: "center"
        }}
      >
        <Grid item xs={12}>
          <Typography variant="h3">
            <span>{`Uh oh!`}</span>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography paragraph variant="h6">
            <span>{`There seems to be an error with your channel. Contact us on discord to resolve this gaslessly!`}</span>
          </Typography>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            {exitableState && (
              <Typography paragraph variant="subtitle2">
                <span>{`If you need your funds now, use this state to call 'startExitWithUpdate' onchain at ${
                  channelState.contractAddress
                }.`}</span>
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            {exitableState && (
              <Typography variant="caption" style={{ fontSize: "10px" }}>
                {channelRender(channelState)}
              </Typography>
            )}
          </Grid>
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
      </Grid>
    );
  }
}

export default withStyles(styles)(SupportCard);

function channelRender(channelState) {
  return Object.entries(channelState).map(([key, value], i) => {
    return (
      <div>
        <span>
          {key}: {value}{" "}
        </span>
      </div>
    );
  });
}
