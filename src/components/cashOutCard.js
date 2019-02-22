import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { withRouter } from "react-router-dom";
import UnarchiveIcon from "@material-ui/icons/Unarchive";
import TextField from "@material-ui/core/TextField";
import QRIcon from "mdi-material-ui/QrcodeScan";
import EthIcon from "../assets/Eth.svg";
import DaiIcon from "../assets/dai.svg";
import Tooltip from "@material-ui/core/Tooltip";
import InputAdornment from "@material-ui/core/InputAdornment";
import Modal from "@material-ui/core/Modal";
import CircularProgress from "@material-ui/core/CircularProgress";
import QRScan from "./qrScan";
import { withStyles, Grid, Typography } from "@material-ui/core";
import { convertChannelState } from "connext/dist/types";
import { bigNumberify } from "ethers/utils";
import { ethers } from "ethers";
import { getDollarSubstring } from "../utils/getDollarSubstring";
import { ConnextState } from "connext/dist/state/store";
import { getAggregateChannelBalance } from "../utils/getAggregateChannelBalance";

const styles = theme => ({
  icon: {
    [theme.breakpoints.down(600)]: {
      marginLeft: "170px"
    },
    [theme.breakpoints.up(600)]: {
      marginLeft: "255px"
    },
    width: "40px",
    height: "40px",
    float: "right"
  },
  cancelIcon: {
    marginLeft: "100px",
    width: "50px",
    height: "50px",
    float: "right",
    cursor: "pointer"
  },
  button: {
    backgroundColor: "#FCA311",
    color: "#FFF"
  },
  modal: {
    position: 'absolute',
    top:"-400px",
    left:"150px",
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    outline: 'none',
    
  }
});

/* CANCEL BUTTON */
const CancelButton = withRouter(({ history }) => (
  <IconButton
    onClick={() => {
      history.push("/");
    }}
  >
    <HighlightOffIcon />
  </IconButton>
));

class CashOutCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      withdrawalVal: {
        withdrawalWeiUser: "0",
        tokensToSell: "0",
        withdrawalTokenUser: "0",
        weiToSell: "0",
        recipient: "0x0..."
      },
      addressError: null,
      balanceError: null,
      scan: false,
      withdrawEth: true,
      aggregateBalance: "0.00",
      withdrawing: false
    };
  }

  async updateWithdrawalVals(withdrawEth) {
    this.setState({ withdrawEth });

    // set the state to contain the proper withdrawal args for
    // eth or dai withdrawal
    const { channelState, exchangeRate } = this.props;
    let { withdrawalVal } = this.state;
    if (withdrawEth) {
      // withdraw all channel balance in eth
      withdrawalVal = {
        ...withdrawalVal,
        exchangeRate,
        tokensToSell: channelState.balanceTokenUser,
        withdrawalWeiUser: channelState.balanceWeiUser,
        weiToSell: "0",
        withdrawalTokenUser: "0"
      };
    } else {
      // handle withdrawing all channel balance in dai
      withdrawalVal = {
        ...withdrawalVal,
        exchangeRate,
        tokensToSell: "0",
        withdrawalWeiUser: "0",
        weiToSell: channelState.balanceWeiUser,
        withdrawalTokenUser: channelState.balanceTokenUser
      };
    }

    this.setState({ withdrawalVal });

    console.log(
      `Updated withdrawalVal: ${JSON.stringify(withdrawalVal, null, 2)}`
    );
    return withdrawalVal;
  }

  // examines if the display value should be updated
  // when the component is mounting, or when the props change
  async updateDisplayValue() {
    const { channelState, exchangeRate } = this.props;
    if (
      !channelState ||
      (channelState.balanceWeiUser == "0" &&
        channelState.balanceTokenUser == "0")
    ) {
      this.setState({ aggregateBalance: "$0.00" });
      return;
    }

    const aggUSD = getAggregateChannelBalance(channelState, exchangeRate);

    const substr = getDollarSubstring(aggUSD);
    const aggregateBalance = "$" + substr[0] + "." + substr[1].substr(0, 2);

    this.setState({ aggregateBalance });
  }

  // update display value with the exchange rate/
  // channel balance changes
  async componentWillReceiveProps() {
    await this.updateDisplayValue();
  }

  async componentDidMount() {
    await this.updateDisplayValue();
  }

  async updateRecipientHandler(value) {
    this.setState({
      recipientDisplayVal: value,
      scan: false
    });
    await this.setState(oldState => {
      oldState.withdrawalVal.recipient = value;
      return oldState;
    });
    console.log(
      `Updated recipient: ${JSON.stringify(
        this.state.withdrawalVal.recipient,
        null,
        2
      )}`
    );
  }

  async checkState() {
    const { channelState, connext, web3, exchangeRate } = this.props;
    if (channelState.pendingWithdrawalWeiUser !== "0") {
      return true;
    } else {
      return false;
    }
  }

  //withRouter(async ({ history })

  poller = async () => {
    var interval = setInterval(async () => {
      var didWithdraw = this.checkState();
      if (didWithdraw) {
        await this.setState({ withdrawing: false });
        //history.push("/");
        clearInterval(interval);
      }
    }, 1000);
  };

  async withdrawalHandler(withdrawEth) {
    const { channelState, connext, web3, exchangeRate } = this.props;
    const withdrawalVal = await this.updateWithdrawalVals(withdrawEth);
    this.setState({ addressError: null, balanceError: null });
    // check for valid address
    // let addressError = null
    // let balanceError = null
    if (!web3.utils.isAddress(withdrawalVal.recipient)) {
      const addressError = `${
        withdrawalVal.recipient == "0x0..."
          ? "Must provide address."
          : withdrawalVal.recipient + " is not a valid address"
      }`;
      this.setState({ addressError });
      return;
    }
    // check the input balance is under channel balance
    // TODO: allow partial withdrawals?
    //invoke withdraw modal
    this.setState({ withdrawing: true });

    console.log(`Withdrawing: ${JSON.stringify(withdrawalVal, null, 2)}`);
    let withdrawalRes = await connext.withdraw(withdrawalVal);
    console.log(`Withdrawal result: ${JSON.stringify(withdrawalRes, null, 2)}`);

    this.poller();
  }

  render() {
    const { classes, exchangeRate, connextState } = this.props;
    const {
      recipientDisplayVal,
      addressError,
      scan,
      withdrawEth,
      aggregateBalance
    } = this.state;
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
          textAlign: "center"
        }}
      >
        <Modal
          style={{
            position:"absolute",
            backgroundColor:"transparent"
          }}
          history={this.props.history}
          hideBackdrop={true}
          disablePortal={true}
          open={this.state.withdrawing}
          onClose={() => this.props.history.push("/")}
        >
          <CircularProgress
            className={classes.modal}
            style={{ marginTop: "40%", marginLeft: "40%" }}
            color="primary"
            variant="indeterminate"
          />
        </Modal>
        <Grid
          container
          wrap="nowrap"
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <UnarchiveIcon className={classes.icon} />
          </Grid>
          <Grid item xs={12} className={classes.cancelIcon}>
            <CancelButton />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container direction="row" justify="center" alignItems="center">
            <Typography variant="h2">
              <span>{aggregateBalance}</span>
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption">
            <span>{"ETH price: $" + exchangeRate}</span>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            style={{ width: "100%" }}
            id="outlined-with-placeholder"
            label="Address"
            placeholder="0x0..."
            value={recipientDisplayVal || ""}
            onChange={evt => this.updateRecipientHandler(evt.target.value)}
            margin="normal"
            variant="outlined"
            required
            helperText={addressError}
            error={addressError != null}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip
                    disableFocusListener
                    disableTouchListener
                    title="Scan with QR code"
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ color: "primary" }}
                      onClick={() => this.setState({ scan: true })}
                    >
                      <QRIcon />
                    </Button>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Modal
          id="qrscan"
          open={scan}
          onClose={() => this.setState({ scan: false })}
          style={{ width: "full", height: "full" }}
        >
          <QRScan handleResult={this.updateRecipientHandler.bind(this)} />
        </Modal>
        <Grid item xs={12}>
          <Grid
            container
            spacing={8}
            direction="row"
            alignItems="center"
            justify="center"
          >
            <Grid item xs={6}>
              <Button
                className={classes.button}
                fullWidth
                onClick={() => this.withdrawalHandler(true)}
                disabled={!connextState || !connextState.runtime.canWithdraw}
              >
                Cash Out Eth
                <img
                  src={EthIcon}
                  style={{ width: "15px", height: "15px", marginLeft: "5px" }}
                  alt=""
                />
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                className={classes.button}
                variant="contained"
                fullWidth
                onClick={() => this.withdrawalHandler(false)}
                disabled
              >
                Cash Out Dai
                <img
                  src={DaiIcon}
                  style={{ width: "15px", height: "15px", marginLeft: "5px" }}
                  alt=""
                />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(CashOutCard);
