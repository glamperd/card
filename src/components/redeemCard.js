import { withStyles, Button, CircularProgress, Modal } from "@material-ui/core";
import ReceiveIcon from "@material-ui/icons/SaveAlt";
import DoneIcon from "@material-ui/icons/Done";
import ErrorIcon from "@material-ui/icons/ErrorOutline";
import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import QRGenerate from "./qrGenerate";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getDollarSubstring } from "../utils/getDollarSubstring";

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
      retryCount: 0,
      sendError: false,
      showReceipt: false,
      previouslyRedeemed: false,
      amount: null,
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

    setInterval(async () => {
      await this.redeemPayment();
    }, 2500);
  }

  generateQrUrl(secret) {
    const { publicUrl } = this.props;
    const url = `${publicUrl}/redeem?secret=${secret ? secret : ""}`;
    return url;
  }

  async redeemPayment() {
    const { secret, isConfirm, purchaseId, retryCount } = this.state;
    const { connext, channelState, connextState } = this.props;
    if (!connext || !channelState || !connextState) {
      console.log("Connext or channel object not detected");
      return;
    }

    if (!secret) {
      console.log("No secret detected, cannot redeem payment.");
      return;
    }

    if (isConfirm) {
      console.log("User is creator of linked payment, not automatically redeeming.");
      return;
    }

    // user is not payor, can redeem payment
    try {
      if (!purchaseId && retryCount < 5) {
        console.log('Redeeming linked payment with secret', secret)
        const updated = await connext.redeem(secret);
        if (updated.purchaseId == null) {
          this.setState({ retryCount: retryCount + 1})
        }
        this.setState({ purchaseId: updated.purchaseId, amount: updated.amount, showReceipt: true });
      }
      if (retryCount >= 5) {
        this.setState({ purchaseId: "failed", sendError: true, showReceipt: true });
      }
    } catch (e) {
      if (e.message.indexOf("Payment has been redeemed") !== -1) {
        this.setState({ retryCount: 5, previouslyRedeemed: true })
        return
      }
      this.setState({ retryCount: retryCount + 1 });
      console.log('retryCount', retryCount + 1)
    }
  }

  render() {
    let { secret, isConfirm, purchaseId, sendError, showReceipt, previouslyRedeemed, amount } = this.state;

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
            {purchaseId === "failed" && <span>{"Uh Oh! Payment Failed"}</span>}
            {purchaseId && purchaseId !== "failed" && <span>{"Payment Redeemed!"}</span>}
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
                  <Tooltip disableFocusListener disableTouchListener title="Click to Copy">
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
          {purchaseId === "failed" && <ErrorIcon className={classes.icon} />}
          {purchaseId && purchaseId !== "failed" && <DoneIcon className={classes.icon} />}
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
        <Modal
          open={showReceipt && !isConfirm}
          onBackdropClick={() => this.setState({ showReceipt: false, sendError: false })}
          style={{
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            position: "absolute",
            top: "25%",
            width: "375px",
            marginLeft: "auto",
            marginRight: "auto",
            left: "0",
            right: "0"
          }}
        >
          <Grid container style={{ backgroundColor: "#FFF", paddingTop: "10%", paddingBottom: "10%" }} justify="center">
            {sendError ? ((
              previouslyRedeemed ? 
              <Grid style={{ width: "80%" }}>
                <Grid item style={{ margin: "1em" }}>
                  <Typography variant="h5" style={{ color: "#F22424" }}>
                    Payment Failed
                  </Typography>
                </Grid>
                <Grid item style={{ margin: "1em" }}>
                  <Typography variant="body1" style={{ color: "#0F1012" }}>
                    It appears this payment has already been redeemed.
                  </Typography>
                </Grid>
              </Grid>
              :
              <Grid style={{ width: "80%" }}>
                <Grid item style={{ margin: "1em" }}>
                  <Typography variant="h5" style={{ color: "#F22424" }}>
                    Payment Failed
                  </Typography>
                </Grid>
                <Grid item style={{ margin: "1em" }}>
                  <Typography variant="body1" style={{ color: "#0F1012" }}>
                    This is most likely because your Card is being set up.
                  </Typography>
                </Grid>
                <Grid item style={{ margin: "1em" }}>
                  <Typography variant="body1" style={{ color: "#0F1012" }}>
                    Please try again in 30s and contact support if you continue to experience issues. (Settings --> Support)
                  </Typography>
                </Grid>
              </Grid>
            )) : (
              <Grid style={{ width: "80%" }}>
                <Grid item style={{ margin: "1em" }}>
                  <Typography variant="h5" style={{ color: "#009247" }}>
                    Redeemed Successfully!
                  </Typography>
                </Grid>
                <Grid item style={{ margin: "1em" }}>
                  <Typography variant="body1" style={{ color: "#0F1012" }}>
                    Amount: ${amount ? getDollarSubstring(amount.amountToken)[0] + "." + getDollarSubstring(amount.amountToken)[1].substr(0, 2): ""}
                  </Typography>
                </Grid>
              </Grid>
            )}
            <Grid item style={{ margin: "1em", flexDirection: "row", width: "80%" }}>
              <Button
                style={{
                  background: "#FFF",
                  border: "1px solid #F22424",
                  color: "#F22424",
                  marginLeft: "5%"
                }}
                variant="outlined"
                size="small"
                onClick={() => this.props.history.push("/")}
              >
                Home
              </Button>
            </Grid>
          </Grid>
        </Modal>
      </Grid>
    );
  }
}

export default withStyles(styles)(RedeemCard);
