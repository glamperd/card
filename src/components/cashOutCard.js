import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import UnarchiveIcon from "@material-ui/icons/Unarchive";
import TextField from "@material-ui/core/TextField";
import QRIcon from "mdi-material-ui/QrcodeScan";
import EthIcon from "../assets/Eth.svg";
import DaiIcon from "../assets/dai.svg";
import Tooltip from "@material-ui/core/Tooltip";
import InputAdornment from "@material-ui/core/InputAdornment";
import { BigNumber } from "bignumber.js";
import Modal from "@material-ui/core/Modal";
import QRScan from "./qrScan";
import { withStyles, Grid } from "@material-ui/core";

const styles = {
  icon: {
    width: "40px",
    height: "40px"
  },
  button: {
    backgroundColor: "#FCA311",
    color: "#FFF"
  }
};

class CashOutCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      withdrawalVal: {
        withdrawalWeiUser: "0",
        tokensToSell: "0",
        withdrawalTokenUser: "0",
        weiToSell: "0",
        exchangeRate: "0.00",
        recipient: "0x0..."
      },
      addressError: null,
      balanceError: null,
      scan: false
    };
  }

  async updateWithdrawHandler(evt) {
    this.setState({
      displayVal: evt.target.value
    });
    var value = evt.target.value;
    if (!this.state.checkedB) {
      await this.setState(oldState => {
        oldState.withdrawalVal.withdrawalWeiUser = value;
        return oldState;
      });
    } else if (this.state.checkedB) {
      await this.setState(oldState => {
        oldState.withdrawalVal.tokensToSell = value;
        return oldState;
      });
    }
    console.log(`Updated withdrawalVal: ${JSON.stringify(this.state.withdrawalVal, null, 2)}`);
  }

  async updateRecipientHandler(value) {
    this.setState({
      recipientDisplayVal: value
    });
    await this.setState(oldState => {
      oldState.withdrawalVal.recipient = value;
      return oldState;
    });
    this.setState({ scan: false });
    console.log(`Updated recipient: ${JSON.stringify(this.state.withdrawalVal.recipient, null, 2)}`);
  }

  async maxHandler() {
    let withdrawalVal = {
      ...this.state.withdrawalVal,
      tokensToSell: this.props.channelState.balanceTokenUser,
      withdrawalWeiUser: this.props.channelState.balanceWeiUser
    };
    let balance = new BigNumber(this.props.channelState.balanceTokenUser);
    let tokenBalance = new BigNumber(this.props.channelState.balanceWeiUser);
    let exchangeRate = new BigNumber(this.props.exchangeRate);
    const tokenBalanceConverted = tokenBalance.dividedToIntegerBy(exchangeRate);
    // const aggBalance = String(balance.plus(tokenBalanceConverted));
    // console.log(aggBalance);

    // i dont think we need the aggregate balance here, i think we can show both ETH and Token withdrawals separately
    if (this.state.checkedB) {
      this.setState({ displayVal: withdrawalVal.tokensToSell, withdrawalVal });
    } else {
      this.setState({ displayVal: withdrawalVal.withdrawalWeiUser, withdrawalVal });
    }
  }

  async withdrawalHandler() {
    let withdrawalVal = {
      ...this.state.withdrawalVal,
      exchangeRate: this.props.exchangeRate
    };
    console.log(`Withdrawing: ${JSON.stringify(this.state.withdrawalVal, null, 2)}`);
    this.setState({ addressError: null, balanceError: null });
    const { channelState, connext, web3 } = this.props;
    // if (
    //   Big(this.state.withdrawalVal.withdrawalWeiUser).isLessThanOrEqualTo(channelState.balanceWeiUser) &&
    //   Big(this.state.withdrawalVal.tokensToSell).isLessThanOrEqualTo(channelState.balanceTokenUser)
    // ) {
    if (web3.utils.isAddress(this.state.withdrawalVal.recipient)) {
      let withdrawalRes = await connext.withdraw(withdrawalVal);
      console.log(`Withdrawal result: ${JSON.stringify(withdrawalRes, null, 2)}`);
    } else {
      this.setState({ addressError: "Please enter a valid address" });
    }
    // } else {
    //   this.setState({balanceError: "Insufficient balance in channel"})
    // }
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid container spacing={24} direction="column" style={{ paddingLeft: 12, paddingRight: 12 }}>
        <Grid item xs={12}>
          <UnarchiveIcon className={classes.icon} />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="outlined-number"
            label="Amount"
            placeholder="$0.00"
            required
            value={this.state.amountToken}
            onChange={evt => this.updatePaymentHandler(evt)}
            type="number"
            margin="normal"
            variant="outlined"
            helperText={this.state.balanceError}
            error={this.state.balanceError != null}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            style={{ width: "100%" }}
            id="outlined-with-placeholder"
            label="Address"
            placeholder="0x0..."
            value={this.state.recipientDisplayVal}
            onChange={evt => this.updateRecipientHandler(evt.target.value)}
            margin="normal"
            variant="outlined"
            required
            helperText={this.state.addressError}
            error={this.state.addressError != null}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip disableFocusListener disableTouchListener title="Scan with QR code">
                    <Button variant="contained" color="primary" style={{ color: "primary" }} onClick={() => this.setState({ scan: true })}>
                      <QRIcon />
                    </Button>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Modal id="qrscan" open={this.state.scan} onClose={() => this.setState({ scan: false })} style={{ width: "full", height: "full" }}>
          <QRScan handleResult={this.updateRecipientHandler.bind(this)} />
        </Modal>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="outlined-with-placeholder"
            label="Exchange Rate"
            variant="outlined"
            InputProps={{ "text-align": "center" }}
            disabled
            value={this.props.exchangeRate}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={8} direction="row" alignItems="center" justify="center">
            <Grid item xs={6}>
              <Button className={classes.button} fullWidth>
                Cash Out Eth
                <img src={EthIcon} style={{ width: "15px", height: "15px", marginLeft: "5px" }} />
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button className={classes.button} fullWidth>
                Cash Out Dai
                <img src={DaiIcon} style={{ width: "15px", height: "15px", marginLeft: "5px" }} />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(CashOutCard);
