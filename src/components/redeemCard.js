import { withStyles, Button, CircularProgress, Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions } from "@material-ui/core";
import ReceiveIcon from "@material-ui/icons/SaveAlt";
import DoneIcon from "@material-ui/icons/Done";
import ErrorIcon from "@material-ui/icons/ErrorOutline";
import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import QRGenerate from "./qrGenerate";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { BigNumber } from "ethers/utils";
import { getAmountInUSD } from "../utils/currencyFormatting";

const queryString = require("query-string");

const styles = theme => ({
  icon: {
    width: "40px",
    height: "40px"
  }
});

const RedeemPaymentStates = {
  IsSender: 0,
  Redeeming: 1,
  PaymentAlreadyRedeemed: 2,
  Timeout: 3,
  Success: 4,
}

function getStatus (state) {
  const {
    isConfirm,
    purchaseId,
    sendError,
    previouslyRedeemed,
  } = state;

  const failed = purchaseId && purchaseId === 'failed'
  let status
  if (isConfirm) {
    // sender of redeemed payment
    status = RedeemPaymentStates.IsSender
  } else if (failed && previouslyRedeemed) {
    status = RedeemPaymentStates.PaymentAlreadyRedeemed
  } else if (failed && !previouslyRedeemed) {
    status = RedeemPaymentStates.Timeout
  } else if (!isConfirm && !purchaseId) {
    // still loading, purchase id assigned at failure
    status = RedeemPaymentStates.Redeeming
  } else if (!failed && purchaseId && !sendError) {
    status = RedeemPaymentStates.Success
  } else {
    // default to error if unknown occurs
    status = RedeemPaymentStates.Timeout
  }

  return status
}

function RedeemPaymentDialogContent(status, amount, connextState) {
  switch (status) {
    case RedeemPaymentStates.Timeout:
      return (
      <Grid>
        <DialogTitle disableTypography>
          <Typography variant="h5" style={{ color: "#F22424" }}>
            Payment Failed
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText variant="body1" style={{ color: "#0F1012" }}>
            This is most likely because your Card is being set up.
          </DialogContentText>
          <DialogContentText variant="body1" style={{ color: "#0F1012", paddingTop: "5%" }}>
            Please try again in 30s and contact support if you
            continue to experience issues. (Settings --> Support)
          </DialogContentText>
          </DialogContent>
      </Grid>
      )
    case RedeemPaymentStates.PaymentAlreadyRedeemed:
      return (
        <Grid>
            <DialogTitle disableTypography>
              <Typography variant="h5" style={{ color: "#F22424" }}>
                Payment Failed
              </Typography>
            </DialogTitle>
          <DialogContent>
            <DialogContentText variant="body1" style={{ color: "#0F1012" }}>
              It appears this payment has already been redeemed.
            </DialogContentText>
          </DialogContent>
        </Grid>
      )
    case RedeemPaymentStates.Success:
        return (
          <Grid>
            <DialogTitle disableTypography>
              <Typography variant="h5" style={{ color: "#009247" }}>
                Redeemed Successfully!
              </Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText variant="body1" style={{ color: "#0F1012" }}>
                Amount: {getAmountInUSD(amount, connextState)}
              </DialogContentText>
            </DialogContent>
          </Grid>
        )
    default:
          return
  }
}

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
      requestedCollateral: false
    };
  }

  async componentWillMount() {
    const { location } = this.props;
    const query = queryString.parse(location.search);
    // uncondonditionally set secret from query
    this.setState({
      secret: query.secret,
      amount: {
        amountToken: query.amountToken,
        amountWei: query.amountWei
      }
    });

    // set state vars if they exist
    if (location.state && location.state.isConfirm) {
      // TODO: test what happens if not routed with isConfirm
      this.setState({ isConfirm: location.state.isConfirm });
    }

    // set time component mounted
    this.setState({ redeemStarted: Date.now() });

    setInterval(async () => {
      await this.redeemPayment();
    }, 2000);
  }

  generateQrUrl(secret, amount) {
    const { publicUrl } = this.props;
    const url = `${publicUrl}/redeem?secret=${
      secret ? secret : ""
    }&amountToken=${amount ? amount.amountToken : "0"}&amountWei=${
      amount ? amount.amountWei : "0"
    }`;
    return url;
  }

  async redeemPayment() {
    const {
      secret,
      isConfirm,
      purchaseId,
      redeemStarted,
      amount,
      previouslyRedeemed
    } = this.state;
    const { connext, channelState, connextState } = this.props;
    if (!connext || !channelState || !connextState) {
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
      return;
    }

    // return if the payment has already been redeemed
    if (previouslyRedeemed) {
      this.setState({
        purchaseId: "failed",
        sendError: true,
        showReceipt: true
      });
      return;
    }

    // check if the time has already elapsed based on time mounted
    if (Date.now() - redeemStarted > 300 * 1000) {
      // set the purchase to failed, show send error and receipt
      this.setState({
        purchaseId: "failed",
        sendError: true,
        showReceipt: true
      });
      return;
    }
    // check if the channel has collateral, otherwise display loading
    if (
      new BigNumber(channelState.balanceTokenHub).lt(
        new BigNumber(amount.amountToken)
      ) &&
      !connextState.runtime.awaitingOnChainTransaction
    ) {
      // channel does not have collateral
      await connext.requestCollateral();
      this.setState({requestedCollateral: true})
      // if you already requested collateral, return
      return;
    }

    // user is not payor, channel has collateral, can try to redeem payment
    try {
      if (!purchaseId) {
        const updated = await connext.redeem(secret);
        // make sure hub isnt silently failing by returning null purchase id
        // as it processes collateral
        if (!updated.purchaseId || !updated.amount) {
          return;
        }

        this.setState({
          purchaseId: updated.purchaseId,
          amount: updated.amount,
          showReceipt: true
        });
      }
    } catch (e) {
      if (e.message.indexOf("Payment has been redeemed") !== -1) {
        this.setState({ previouslyRedeemed: true });
        return;
      }
    }
  }

  render() {
    const {
      secret,
      showReceipt,
      amount,
      requestedCollateral
    } = this.state;

    const { classes, connextState } = this.props;
    const url = this.generateQrUrl(secret, amount);

    const status = getStatus(this.state)
    // if you are not the sender, AND the purchase ID is not set
    // render a loading sign, then a check mark once the purchaseID
    // is set in the state
    return (
      <Grid>
      <Grid
        container
        spacing={16}
        direction="column"
        style={{
          paddingLeft: "10%",
          paddingRight: "10%",
          paddingTop: "10%",
          textAlign: "center",
          justifyContent: "center",
        }}
      >
      <Dialog
          open={showReceipt && status !== RedeemPaymentStates.IsSender}
          onBackdropClick={() =>
            this.setState({ showReceipt: false, sendError: false })
          }
          fullWidth
          style={{
              justify: "center",
              alignItems: "center",
              textAlign: "center",
              margin: "auto",
            }}
          className={classes.center}
        >
          <Grid
            container
            style={{
              backgroundColor: "#FFF",
              paddingTop: "10%",
              paddingBottom: "10%"
            }}
            justify="center"
          >
            {RedeemPaymentDialogContent(status, amount, connextState)}
            <DialogActions>
              <Button
                style={{
                  background: "#FFF",
                  border: "1px solid #F22424",
                  color: "#F22424",
                }}
                variant="outlined"
                size="small"
                onClick={() => this.props.history.push("/")}
              >
                Home
              </Button>
            </DialogActions>
          </Grid>
        </Dialog>
      
        <Grid item xs={12}>
          <ReceiveIcon className={classes.icon} />
        </Grid>
        <Grid item xs={12}>
          <Typography noWrap variant="h5">
            {status === RedeemPaymentStates.IsSender && <span>{"Scan to Redeem"}</span>}
            {(status === RedeemPaymentStates.Timeout || status === RedeemPaymentStates.PaymentAlreadyRedeemed) && <span>{"Uh Oh! Payment Failed"}</span>}
            {status === RedeemPaymentStates.Success && (
              <span>{"Payment Redeemed!"}</span>
            )}
            {status === RedeemPaymentStates.Redeeming && <span>{"Redeeming Payment..."}</span>}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {status === RedeemPaymentStates.IsSender && <QRGenerate value={url} />}
        </Grid>
        {status === RedeemPaymentStates.IsSender && (
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
          xs={12}
          style={{
            paddingTop: "10%",
          }}
        >
          {(status === RedeemPaymentStates.Timeout || status === RedeemPaymentStates.PaymentAlreadyRedeemed) && <ErrorIcon className={classes.icon} />}
          {status === RedeemPaymentStates.Success && (
            <DoneIcon className={classes.icon} />
          )}
          <Typography noWrap variant="body1" style={{marginBottom: "1.5em"}} color="primary">
            {status == RedeemPaymentStates.IsSender && <span>{"Make sure to copy this link!"}</span>}
          </Typography>
          <Typography noWrap variant="body1" style={{marginBottom: "1.5em"}}>
            {status === RedeemPaymentStates.Redeeming && requestedCollateral && <span>{"Setting up your card too. This will take 30-40s."}</span>}
          </Typography>
          {status === RedeemPaymentStates.Redeeming && <CircularProgress />}
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="outlined"
            style={{
              background: "#FFF",
              border: "1px solid #F22424",
              color: "#F22424",
            }}
            size="medium"
            onClick={() => this.props.history.push("/")}
          >
            Back
          </Button>
        </Grid>
       </Grid>
       </Grid>
    );
  }
}

export default withStyles(styles)(RedeemCard);
