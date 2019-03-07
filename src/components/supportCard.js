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
      error: null,
    };
  }

  handleClick = async () => {
    
  };

  render() {
    const { classes, connext, web3,  channelState, connextState } = this.props;
    const { error } = this.state;

    console.log('rendering...,?')

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
          <Typography variant="h6">
              <span>{`Text 1`}</span>
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">
              <span>{`Text 2`}</span>
          </Typography>
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
