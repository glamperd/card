import React, { Component } from "react";
import { withStyles } from '@material-ui/core';
import ConfirmationSnackbar from "./snackBar";

const styles = ({
  success: {
    backgroundColor: "#08B22D",
    color: "#FFF"
  },
  pending: {
    backgroundColor: "#3CB8F2",
    color: "#FFF"
  },
  error: {
    backgroundColor: "#FCA311",
    color: "#FFF"
  }
});


class Confirmations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      depositStatus: null,
      withdrawStatus: null,
      payStatus: null
    };
  }

  handleClick = async () => {
    await this.setState({ depositStatus: "AWAITING" });
    await this.setState({ withdrawStatus: "AWAITING" });
    await this.setState({ payStatus: "AWAITING" });
  };

  async checkDepositState() {
    const { channelState, runtime } = this.props;
    let depositStatus;
    try {
      if (runtime.syncResultsFromHub[0].update) {
        switch (runtime.syncResultsFromHub[0].update.reason) {
          case "ProposePendingDeposit":
            depositStatus = "PENDING";
            break;
          case "ConfirmPending":
            if (
              channelState.pendingDepositWeiUser !== "0" ||
              channelState.pendingDepositTokenUser !== "0"
            ) {
              depositStatus = "SUCCESS";
            }
            break;
          // case("Exchange"):
          // if(channelState.pendingDepositWeiUser !== "0" || channelState.pendingDepositTokenUser !== "0"){
          //   depositStatus = "SUCCESS";
          // }
          //  break;
          default:
            depositStatus = "AWAITING";
        }
      }

      await this.setState({ depositStatus });
    } catch (e) {}
  }

  // async checkPaymentState() {
  //   const { runtime } = this.props;
  //   let payStatus;
  //   try {
  //     if (runtime.syncResultsFromHub[0].update) {
  //       switch (runtime.syncResultsFromHub[0].update.reason) {
  //         case "Payment":
  //           payStatus = "PAID";
  //           break;
  //         default:
  //           payStatus = "AWAITING";
  //       }
  //       }
  //     await this.setState({ payStatus });
  //   } catch (e){
  //     console.log(`error caught: ${e}`)
  //   }
  // }

  async checkWithdrawState() {
    const { channelState, runtime } = this.props;
    let withdrawStatus;
    try {
      if (runtime.syncResultsFromHub[0].update) {
        switch (runtime.syncResultsFromHub[0].update.reason) {
          case "ProposePendingWithdrawal":
            withdrawStatus = "PENDING";
            break;
          case "ConfirmPending":
            if (
              channelState.pendingWithdrawalWeiUser !== "0" ||
              channelState.pendingWithdrawalTokenUser !== "0"
            ) {
              withdrawStatus = "SUCCESS";
            }
            break;
          default:
            withdrawStatus = "AWAITING";
        }
      }
      await this.setState({ withdrawStatus });
    } catch (e) {}
  }

  poller = async () => {
    var deposit = setInterval(async () => {
      await this.checkDepositState();
    }, 200);

    var withdraw = setInterval(async () => {
      await this.checkWithdrawState();
    }, 200);

    // var payment = setInterval(async () => {
    //   await this.checkPaymentState();
    // }, 200);
  };

  componentDidMount = async () => {
    setTimeout(await this.poller(), 4000);
  };

  render() {
    const { classes } = this.props;
    const { depositStatus, withdrawStatus, payStatus } = this.state;
    return (
      <div>
        <ConfirmationSnackbar
          //bodyStyle={{backgroundColor:"#3CB8F2", color:"white"}}
          handleClick={() => this.handleClick()}
          open={depositStatus === "PENDING"}
          text="Processing deposit, we'll let you know when it's done."
        />
        <ConfirmationSnackbar
          className={styles.success}
         //bodyStyle={{backgroundColor:"#08B22D", color:"white"}}
          handleClick={() => this.handleClick()}
          open={true}//depositStatus === "SUCCESS"}
          text="Deposit Confirmed!" 
        />
        <ConfirmationSnackbar
        className={classes.pending}
         //bodyStyle={{backgroundColor:"#3CB8F2", color:"white"}}
          handleClick={() => this.handleClick()}
          open={withdrawStatus === "PENDING"}
          text="Processing deposit, we'll let you know when it's done."
        />
        <ConfirmationSnackbar
        className={classes.success}
         // bodyStyle={{backgroundColor:"#08B22D", color:"white"}}
          handleClick={() => this.handleClick()}
          open={withdrawStatus === "SUCCESS"}
          text="Withdrawal Confirmed!"
        />
        <ConfirmationSnackbar
          handleClick={() => this.handleClick()}
          open={payStatus === "PAID"}
          text="Payment sent successfully!"
        />
      </div>
    );
  }
}

export default withStyles(styles)(Confirmations);
