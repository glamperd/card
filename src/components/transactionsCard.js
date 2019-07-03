import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { withStyles, Grid, Typography } from "@material-ui/core";
import Web3 from "web3";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { formatTxDateObj } from '../utils/datetimeFormatting';

const styles = theme => ({
  table: {
    tableLayout: 'fixed',
    whiteSpace: 'nowrap'
  },
  tableCell: {
    width: "25%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
});

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

  getFormattedTxHistory = () => {
    const { txHistory } = this.state;
    const txs = [];
    if (txHistory) {
      // address, type, amount, date
      for (const tx of txHistory) txs.push(this.formatRawTx(tx));
    }
    return txs;
  }

  formatRawTx = (tx) => {
    // console.log(tx);
    const convertedAmount = Web3.utils.fromWei(tx.amount.amountToken, "ether");
    const amount = tx.amountWei ? `${convertedAmount}ETH` : `$${convertedAmount}`;

    let type;
    let address;
    let date;
    if (tx.recipient === this.props.address) {
      type = 'receive';
      address = tx.sender;
    }
    else {
      type = 'send';
      address = tx.recipient;
    }
    date = formatTxDateObj(new Date(tx.createdOn));

    return {address, type, amount, date};
  }

  render() {
    const { classes } = this.props;
    const txHistory = this.getFormattedTxHistory();

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
          <Table
            className={classes.table}
            size="small"
          >
            <TableHead>
              <TableRow>
                <TableCell align="center" padding="none">Address</TableCell>
                <TableCell align="center" padding="none">Type</TableCell>
                <TableCell align="center" padding="none">Amount</TableCell>
                <TableCell align="center" padding="none">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {txHistory.map(tx => (
                <TableRow>
                  <TableCell align="center" padding="none" className={classes.tableCell}>{tx.address}</TableCell>
                  <TableCell align="center" padding="none" className={classes.tableCell}>{tx.type}</TableCell>
                  <TableCell align="center" padding="none" className={classes.tableCell}>{tx.amount}</TableCell>
                  <TableCell align="center" padding="none" className={classes.tableCell}>{tx.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

export default withStyles(styles)(TransactionsCard);
