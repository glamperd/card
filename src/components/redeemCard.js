import { withStyles, Button, CircularProgress } from "@material-ui/core";
import ReceiveIcon from "@material-ui/icons/SaveAlt";
import DoneIcon from "@material-ui/icons/Done";
import ErrorIcon from "@material-ui/icons/ErrorOutline";
import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import QRGenerate from "./qrGenerate";
import { CopyToClipboard } from "react-copy-to-clipboard";

const queryString = require("query-string");

const styles = theme => ({
  icon: {
    width: "40px",
    height: "40px"
  }
});

class RedeemCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      secret: null,
      isConfirm: false,
      purchaseId: null,
      retryCount: 0
    };
  }

  async componentWillMount() {
    const { location } = this.props;
    const query = queryString.parse(location.search);
    // uncondonditionally set secret from query
    this.setState({ secret: query.secret });

    // set state vars if they exist
    if (location.state && location.state.isConfirm) {
      // TODO: test what happens if not routed with isConfirm
      this.setState({ isConfirm: location.state.isConfirm });
    }
  }

  async componentWillReceiveProps() {
    await this.redeemPayment();
  }

  generateQrUrl(secret) {
    const { publicUrl } = this.props;
    const url = `${publicUrl}/redeem?secret=${secret ? secret : ""}`;
    return url;
  }

  async redeemPayment() {
    const { secret, isConfirm, purchaseId, retryCount } = this.state;
    const { connext, channelState } = this.props;
    if (!connext || !channelState) {
      console.log("Connext or channel object not detected");
      return;
    }

    if (!secret) {
      console.log("No secret detected, cannot redeem payment.");
      return;
    }

    if (isConfirm) {
      console.log(
        "User is creator of linked payment, not automatically redeeming."
      );
      return;
    }

    // user is not payor, can redeem payment
    try {
      if (!purchaseId && retryCount < 5) {
        const updated = await connext.redeem(secret);
        this.setState({ purchaseId: updated.purchaseId });
      }
      if (retryCount >= 5) {
        this.setState({ purchaseId: "failed" });
      }
    } catch (e) {
      this.setState({ retryCount: retryCount + 1 });
      console.log("Error redeeming payment:", e.message);
    }
  }

  render() {
    let { secret, isConfirm, purchaseId } = this.state;

    const { classes } = this.props;
    const url = this.generateQrUrl(secret);

    // if you are not the sender, AND the purchase ID is not set
    // render a loading sign, then a check mark once the purchaseID
    // is set in the state
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
          <ReceiveIcon className={classes.icon} />
        </Grid>
        <Grid item xs={12}>
          <Typography noWrap variant="h5">
            {isConfirm && <span>{"Scan to Redeem"}</span>}
            {purchaseId == "failed" && <span>{"Uh Oh! Payment Failed"}</span>}
            {purchaseId && purchaseId != "failed" && (
              <span>{"Payment Redeemed!"}</span>
            )}
            {!purchaseId && !isConfirm && <span>{"Redeeming Payment..."}</span>}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {isConfirm && <QRGenerate value={url} />}
        </Grid>
        {isConfirm && (
          <Grid item xs={12}>
            <CopyToClipboard text={url}>
              <Button variant="outlined" fullWidth>
                <Typography noWrap variant="body1">
                  <Tooltip
                    disableFocusListener
                    disableTouchListener
                    title="Click to Copy"
                  >
                    <span>{url}</span>
                  </Tooltip>
                </Typography>
              </Button>
            </CopyToClipboard>
          </Grid>
        )}
        <Grid
          item
          lg
          style={{
            paddingTop: "10%",
            paddingBottom: "15%"
          }}
        >
          {purchaseId == "failed" && <ErrorIcon className={classes.icon} />}
          {purchaseId && purchaseId != "failed" && (
            <DoneIcon className={classes.icon} />
          )}
          {!purchaseId && !isConfirm && <CircularProgress />}
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

export default withStyles(styles)(RedeemCard);
