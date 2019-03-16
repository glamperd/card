import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import ReceiveIcon from "@material-ui/icons/SaveAlt";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Typography from "@material-ui/core/Typography";
//import CopyIcon from "@material-ui/icons/FileCopy";
import QRGenerate from "./qrGenerate";
//import IconButton from "@material-ui/core/IconButton";
//import HighlightOffIcon from "@material-ui/icons/HighlightOff";
//import { withRouter } from "react-router-dom";
import { withStyles, Grid } from "@material-ui/core";
import Snackbar from "./snackBar";
import BN from "bn.js";
import Web3 from "web3";
import { getAmountInUSD } from "../utils/currencyFormatting";
import { emptyAddress } from "connext/dist/Utils";

const styles = theme => ({
  icon: {
    width: "40px",
    height: "40px"
  }
});

class ReceiveCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      amountToken: null,
      displayValue: "",
      error: null,
      qrUrl: this.generateQrUrl("0"),
      copied: false
    };
  }

  handleClick = async () => {
    this.setState({ copied: false });
  };

  handleCopy = () => {
    const error = this.validatePayment()
    if (error) {
      this.setState({ copied: false })
      return
    }
    this.setState({ copied: true })
  }

  validatePayment = () => {
    const { amountToken, } = this.state
    const { connextState, maxTokenDeposit, } = this.props
    let error = null
    this.setState({ error: null })
    if (!amountToken) {
      error = "Please enter a valid amount"
      this.setState({ error })
      return error
    }
    const tokenBig = new BN(amountToken)
    const amount = {
      amountWei: '0',
      amountToken: maxTokenDeposit,
    }
    if (tokenBig.gt(new BN(amount.amountToken))) {
      error = `Channel balances are capped at ${getAmountInUSD(amount, connextState)}`
    }
    if (tokenBig.isZero() || tokenBig.isNeg()) {
      error = "Please enter a payment amount above 0"
    }

    this.setState({ error })
    return error
  }

  updatePaymentHandler = async value => {
    // appears to be just value
    const token = value ? value : "0"
    // protect against precision errors
    const decimal = (
      value.startsWith('.') ? value.substr(1) : value.split('.')[1]
    )

    let error = null
    let tokenVal = value
    if (decimal && decimal.length > 18) {
      tokenVal = value.startsWith('.') ? value.substr(0, 19) : value.split('.')[0] + '.' + decimal.substr(0, 18)
      error = `Value too precise! Using ${tokenVal}`
    }    
    this.setState({
      qrUrl: this.generateQrUrl(value),
      amountToken: Web3.utils.toWei(tokenVal, "ether"),
      displayValue: value,
      error,
    });
  };

  generateQrUrl = value => {
    const { publicUrl, address } = this.props;
    // function should take a payment value
    // and convert it to the url with
    // appropriate strings to prefill a send
    // modal state (recipient, amountToken)
    const url = `${publicUrl || "https:/"}/send?amountToken=${value || "0"}&recipient=${address || emptyAddress}`;
    return url;
  };

  render() {
    const { classes } = this.props;
    const { qrUrl, error, displayValue, amountToken, copied } = this.state;
    return (
      <Grid
        container
        spacing={16}
        direction="column"
        style={{
          paddingLeft: "10%",
          paddingRight: "10%",
          paddingTop: "10%",
          paddingBottom: "10%",
          textAlign: "center",
          justifyContent: "center"
        }}
      >
        <Snackbar
          handleClick={this.handleClick}
          onClose={this.handleClick}
          open={copied}
          text="Copied!"
        />
        <Grid
          container
          wrap="nowrap"
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <ReceiveIcon className={classes.icon} />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="outlined-number"
            label="Amount"
            value={displayValue}
            type="number"
            margin="normal"
            variant="outlined"
            onChange={evt => this.updatePaymentHandler(evt.target.value)}
            error={error != null}
            helperText={error}
          />
        </Grid>
        <Grid item xs={12}>
          <QRGenerate value={qrUrl} />
        </Grid>
        <Grid item xs={12}>
          {/* <CopyIcon style={{marginBottom: "2px"}}/> */}
          <CopyToClipboard
            onCopy={this.handleCopy}
            text={error == null || error.indexOf('too precise') != -1 && amountToken != null ? qrUrl : ''}
          >
            <Button variant="outlined" fullWidth onClick={this.validatePayment}>
              <Typography noWrap variant="body1">
                <Tooltip
                  disableFocusListener
                  disableTouchListener
                  title="Click to Copy"
                >
                  <span>{qrUrl}</span>
                </Tooltip>
              </Typography>
            </Button>
          </CopyToClipboard>
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

export default withStyles(styles)(ReceiveCard);
