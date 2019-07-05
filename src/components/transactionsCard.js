import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { Grid, Typography } from "@material-ui/core";

import QrCode from "qrcode.react";
import TransactionsTable from './transactionsTable';

class TransactionsCard extends Component {
  // constructor(props) {
  //   super(props);

  //   this.state = {
  //     txHistory: null,
  //   };
  // }

  // componentDidMount() {
  //   this.fetchTxHistory();
  // }

  // componentDidUpdate() {
  //   if (!this.state.txHistory) {
  //     this.fetchTxHistory();
  //   }
  // }

  // fetchTxHistory = async () => {
  //   if (this.props.connext) {
  //     const txHistory = await this.props.connext.getPaymentHistory();
  //     this.setState({ txHistory });
  //   }
  // }

  render() {
    const { address, txHistory } = this.props;
    console.log(txHistory);

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
        <Grid item xs={12} style={{marginBottom: "30px"}}>
          <QrCode
            value={address}
            size={45}
            style={{
              float: "left",
              marginRight: "30px"
            }}
          />
          <Typography
            noWrap
            color="primary"
            variant="h6"
            style={{
              border: "1px solid #FCA311",
              borderRadius: "5px",
              padding: "5px 10px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {address}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">
            Transactions
          </Typography>
          <TransactionsTable
            txHistory={txHistory}
            address={address}
          />
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

export default TransactionsCard;
