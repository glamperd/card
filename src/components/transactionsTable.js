import React, { Component } from "react";
import { withStyles } from "@material-ui/core";
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

class TransactionsTable extends Component {
  getFormattedTxHistory = () => {
    const { txHistory } = this.props;
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
      console.log(tx)
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
    );
  }
}

export default withStyles(styles)(TransactionsTable);
