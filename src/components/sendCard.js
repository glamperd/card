import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import SendIcon from "@material-ui/icons/Send";
import TextField from "@material-ui/core/TextField";
import QRIcon from "mdi-material-ui/QrcodeScan";
import LinkIcon from "@material-ui/icons/Link";
import InputAdornment from "@material-ui/core/InputAdornment";
import Tooltip from "@material-ui/core/Tooltip";
import Modal from "@material-ui/core/Modal";
import QRScan from "./qrScan";
import { emptyAddress } from "connext/dist/Utils";
import { withStyles, Grid } from "@material-ui/core";

const styles = {
  icon: {
    width: "40px",
    height: "40px"
  },
  input: {
    width: "100%"
  },
  button: {
    backgroundColor: "#FCA311",
    color: "#FFF"
  }
};

class PayCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      paymentVal: {
        meta: {
          purchaseId: "payment"
          // memo: "",
        },
        payments: [
          {
            recipient: emptyAddress.substr(0, 4) + "...",
            amount: {
              amountToken: "0"
            },
            type: "PT_CHANNEL"
          }
        ]
      },
      addressError: null,
      balanceError: null,
      scan: false
    };

    if (this.props.scanArgs.recipient && this.props.scanArgs.amount) {
      this.state = {
        paymentVal: {
          meta: {
            purchaseId: "payment"
            // memo: "",
          },
          payments: [
            {
              recipient: this.props.scanArgs.recipient,
              amount: {
                amountToken: this.props.scanArgs.amount
              },
              type: "PT_CHANNEL"
            }
          ]
        }
      };
    }
  }

  async updatePaymentHandler(value) {
    await this.setState(oldState => {
      oldState.paymentVal.payments[0].amount.amountToken = value;
      return oldState;
    });
    console.log(`Updated paymentVal: ${JSON.stringify(this.state.paymentVal, null, 2)}`);
  }

  async updateRecipientHandler(value) {
    await this.setState(oldState => {
      oldState.paymentVal.payments[0].recipient = value;
      return oldState;
    });
    this.setState({ scan: false });
    console.log(`Updated recipient: ${JSON.stringify(this.state.paymentVal.payments[0].recipient, null, 2)}`);
  }

  async paymentHandler() {
    console.log(`Submitting payment: ${JSON.stringify(this.state.paymentVal, null, 2)}`);
    this.setState({ addressError: null, balanceError: null });
    const { connext, web3 } = this.props;

    // if( Number(this.state.paymentVal.payments[0].amount.amountToken) <= Number(channelState.balanceTokenUser) &&
    //     Number(this.state.paymentVal.payments[0].amount.amountWei) <= Number(channelState.balanceWeiUser)
    // ) {
    if (web3.utils.isAddress(this.state.paymentVal.payments[0].recipient)) {
      let paymentRes = await connext.buy(this.state.paymentVal);
      console.log(`Payment result: ${JSON.stringify(paymentRes, null, 2)}`);
    } else {
      this.setState({ addressError: "Please choose a valid address" });
    }
    // } else {
    //   this.setState({balanceError: "Insufficient balance in channel"})
    // }
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid container spacing={24} direction="column" style={{ paddingLeft: 12, paddingRight: 12, textAlign: "center" }}>
        <Grid item xs={12}>
          <SendIcon className={classes.icon} />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            className={classes.input}
            id="outlined-number"
            label="Amount"
            placeholder="$0.00"
            required
            value={this.state.paymentVal.payments[0].amount.amountToken}
            onChange={evt => this.updatePaymentHandler(evt.target.value)}
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
            label="Recipient"
            placeholder="0x0... (Optional for Link)"
            value={this.state.paymentVal.payments[0].recipient}
            onChange={evt => this.updateRecipientHandler(evt.target.value)}
            margin="normal"
            variant="outlined"
            helperText={this.state.addressError}
            error={this.state.addressError != null}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip disableFocusListener disableTouchListener title="Scan with QR code">
                    <Button variant="contained" color="primary" style={{ color: "#FFF" }} onClick={() => this.setState({ scan: true })}>
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
        {/* <TextField
          className={classes.input}
          id="outlined-number"
          label="Message"
          placeholder="Groceries, etc. (Optional)"
          value={this.state.paymentVal.meta.memo}
          onChange={evt => this.setState({paymentVal: {meta: {memo: evt.target.value }}})}
          type="string"
          margin="normal"
          variant="outlined"
          helperText={this.state.balanceError}
          error={this.state.balanceError != null}
        /> */}
        <Grid item xs={12}>
          <Grid container direction="row" alignItems="center" justify="center" spacing={16}>
            <Grid item xs={6}>
              <Button
                fullWidth
                className={classes.button}
                variant="contained"
                size="large"
                disabled
                //TODO ENABLE THIS WHEN WE ADD FUNCTIONALITY
              >
                Link
                <LinkIcon style={{ marginLeft: "5px" }} />
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button fullWidth className={classes.button} variant="contained" size="large" onClick={() => this.paymentHandler()}>
                Send
                <SendIcon style={{ marginLeft: "5px" }} />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(PayCard);
