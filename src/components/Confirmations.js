import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import MySnackbar from './snackBar';

const styles = theme => ({
  margin: {
    margin: theme.spacing.unit
  }
});

class Confirmations extends Component {
  render() {
    const { type, txHash, reset } = this.props.status;
    return (
      <div>

        <MySnackbar
          variant="warning"
          openWhen={!!type}
          onClose={() => this.props.closeConfirmations()}
          message={`Refunding ${
            !!hasRefund && hasRefund[0] ? hasRefund[0].substr(0, 6) : ""
          } finney to ${
            !!hasRefund && hasRefund[1]
              ? hasRefund[1].substr(0, 5).toLowerCase() + "..."
              : ""
          }.`}
          duration={30000}
        />

        <MySnackbar
          variant="warning"
          openWhen={deposit === "PENDING"}
          onClose={() => this.props.closeConfirmations("deposit")}
          message="Processing deposit, we'll let you know when it's done."
          duration={30000}
        />

        <MySnackbar
          variant="warning"
          openWhen={withdraw === "PENDING"}
          onClose={() => this.props.closeConfirmations("withdraw")}
          message="Processing withdrawal, we'll let you know when it's done."
          duration={30000}
        />

        <MySnackbar
          variant="success"
          openWhen={deposit === "SUCCESS"}
          onClose={() => this.props.closeConfirmations()}
          message="Pending deposit confirmed!"
        />

        <MySnackbar
          variant="success"
          openWhen={withdraw === "SUCCESS"}
          onClose={() => this.props.closeConfirmations()}
          message="Pending withdraw confirmed!"
        />

      </div>
    );
  }
}

Confirmations.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Confirmations);
