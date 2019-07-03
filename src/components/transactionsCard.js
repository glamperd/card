import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { Grid, Typography } from "@material-ui/core";

import TransactionsTable from './transactionsTable';

class TransactionsCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      txHistory: null,
    };
  }

  componentDidMount() {
    this.fetchTxHistory();
  }

  componentDidUpdate() {
    if (!this.state.txHistory) {
      this.fetchTxHistory();
    }
  }

  fetchTxHistory = async () => {
    if (this.props.connext) {
      const txHistory = await this.props.connext.getPaymentHistory();
      this.setState({ txHistory });
    }
  }

  render() {
    const { txHistory } = this.state;

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
        <Grid item xs={12}>
          <Typography variant="h5">
            Transactions
          </Typography>
          <TransactionsTable
            txHistory={txHistory}
            address={this.props.address}
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
