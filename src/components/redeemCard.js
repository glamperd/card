import { DepositCard } from "./depositCard";
import { withStyles, Button } from "@material-ui/core";
import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import DepositIcon from "@material-ui/icons/AttachMoney";


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
      redeemer: null
    };
  }

  render() {
    const { classes, address } = this.props;
    return (
      <Button
        fullWidth
        color="primary"
        style={{
          background: "#FFF",
          border: "1px solid #7289da",
          color: "#7289da"
        }}
        size="large"
      >
      Import from Backup
      </Button>
      
    );
  }
}

export default withStyles(styles)(RedeemCard);
