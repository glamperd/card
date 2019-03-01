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
import { BigNumber } from "ethers/utils";

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
      sendError: false,
      showReceipt: false,
      previouslyRedeemed: false,
      amount: null,
      requestedCollateral: false,
    };
  }

  async componentWillMount() {
    const { location } = this.props;
    const query = queryString.parse(location.search);
    // uncondonditionally set secret from query
    console.log('query:', query)
    this.setState({ secret: query.secret, amount: { 
      amountToken: query.amountToken,
      amountWei: query.amountWei,
    } });

    // set state vars if they exist
    if (location.state && location.state.isConfirm) {
      // TODO: test what happens if not routed with isConfirm
      this.setState({ isConfirm: location.state.isConfirm });
    }

    // set time component mounted
    this.setState({ redeemStarted: Date.now() })

    setInterval(async () => {
      await this.redeemPayment();
    }, 2000);
  }

  generateQrUrl(secret, amount) {
    const { publicUrl } = this.props;
    const url = `${publicUrl}/redeem?secret=${secret ? secret : ""}&amountToken=${amount ? amount.amountToken : "0"}&amountWei=${amount ? amount.amountWei : "0"}`;
    return url;
  }

  async redeemPayment() {
    const { secret, isConfirm, purchaseId, redeemStarted, amount, previouslyRedeemed, requestedCollateral } = this.state;
    const { connext, channelState, connextState } = this.props;
    if (!connext || !channelState || !connextState) {
      console.log("Connext or channel object not detected");
      return;
    }

    if (!secret) {
      console.log("No secret detected, cannot redeem payment.");
      return;
    }

    // make sure you don't update the timer on a linked payment confirmation
    if (isConfirm) {
      return;
    }

    if (purchaseId) {
      return
    }

    // return if the payment has already been redeemed
    if (previouslyRedeemed) {
      this.setState({ purchaseId: "failed", sendError: true, showReceipt: true });
      return
    }

    // check if the time has already elapsed based on time mounted
    if (Date.now() - redeemStarted > 300 * 1000) {
      // set the purchase to failed, show send error and receipt
      this.setState({ purchaseId: "failed", sendError: true, showReceipt: true });
      return
    }
    // check if the channel has collateral, otherwise display loading
    if (new BigNumber(channelState.balanceTokenHub).lt(new BigNumber(amount.amountToken))) {
      // channel does not have collateral
      await connext.requestCollateral()
      // if you already requested collateral, return
      return
    }


    // user is not payor, channel has collateral, can try to redeem payment
    try {
      if (!purchaseId) {
        console.log('Redeeming linked payment with secret', secret)
        const updated = await connext.redeem(secret);
        // make sure hub isnt silently failing by returning null purchase id
        // as it processes collateral
        if (!updated.purchaseId || !updated.amount) {
          return
        }

        this.setState({ purchaseId: updated.purchaseId, amount: updated.amount, showReceipt: true });
      }
    } catch (e) {
      if (e.message.indexOf("Payment has been redeemed") !== -1) {
        this.setState({ previouslyRedeemed: true })
        return
      }
    }
  }

  render() {
    let { secret, isConfirm, purchaseId, sendError, showReceipt, previouslyRedeemed, amount } = this.state;

    const { classes } = this.props;
    const url = this.generateQrUrl(secret, amount);

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
