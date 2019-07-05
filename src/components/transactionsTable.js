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
  filterTxHistory = (txHistory, filter) => {
    switch (filter) {
      case 'send':
        return txHistory.filter(tx =>
          tx.type === 'PT_CHANNEL' &&
          tx.sender === this.props.address
        );
      case 'receive':
        return txHistory.filter(tx =>
          tx.type === 'PT_CHANNEL' &&
          tx.recipient === this.props.address
        );
      case 'deposit': // TODO
      case 'withdrawal':  // TODO
      default:
        return txHistory;
    }
  }

  formatAmount = amountObj => {
    let formattedAmount;
    // ETH
    if (amountObj.amountWei > 0) {
      formattedAmount = `${Web3.utils.fromWei(amountObj.amountWei, "ether")}ETH`;
    }
    // DAI
    else {
      formattedAmount = `$${Web3.utils.fromWei(amountObj.amountToken, "ether")}`;
    }
    return formattedAmount;
  }

  formatRawTx = (tx, filter) => {
    switch (filter) {
      case 'send':
      case 'receive':
      case 'deposit':
      case 'withdrawal':
        return this.formatRawTxNoType(tx);
      default:
        return this.formatRawTxDefault(tx);
    }
  }


  formatRawTxDefault = tx => {
    const amount = this.formatAmount(tx.amount);

    let address, type;
    if (tx.recipient === this.props.address) {
      type = 'receive';
      address = tx.sender;
    }
    else {
      type = 'send';
      address = tx.recipient;
    }
    const date = formatTxDateObj(new Date(tx.createdOn));

    return {address, type, amount, date};
  }

  formatRawTxNoType = tx => {
    const convertedAmount = Web3.utils.fromWei(tx.amount.amountToken, "ether");
    const amount = tx.amountWei ? `${convertedAmount}ETH` : `$${convertedAmount}`;

    const address = tx.recipient;

    const date = formatTxDateObj(new Date(tx.createdOn));

    return {address, amount, date};
  }

  getFormattedTxHistory = () => {
    const { txHistory, filter } = this.props;
    const txs = [];
    if (txHistory) {
      // Filter the txs for the specified table
      const filteredTxHistory = this.filterTxHistory(txHistory, filter);
      // address, type, amount, date
      for (const tx of filteredTxHistory) txs.push(this.formatRawTx(tx, filter));
    }
    return txs;
  }

  getTableBodyData = txHistory => {
    let tableBodyData;
    if (txHistory.length) {
      tableBodyData = txHistory.map((tx, i) => (
        <TableRow key={i}>
          {Object.keys(tx).map((label, j) =>
            <TableCell
              key={`${label}-${j}`}
              align="center"
              padding="none"
              className={this.props.classes.tableCell}
            >
              {tx[label]}
            </TableCell>
          )}
        </TableRow>
      ));
    }
    return tableBodyData;
  }

  getTableHeadData = txHistory => {
    let tableHeadData;
    if (txHistory.length) {
      tableHeadData =
        <TableRow>
          {Object.keys(txHistory[0]).map((label, i) =>
            <TableCell
              key={label}
              align="center"
              padding="none"
              style={{textTransform: "capitalize"}}
            >
              {label}
            </TableCell>)}
        </TableRow>
    }
    return tableHeadData;
  }

  render() {
    const { classes } = this.props;
    const txHistory = this.getFormattedTxHistory();

    const tableHeadData = this.getTableHeadData(txHistory);
    const tableBodyData = this.getTableBodyData(txHistory);

    return (
      <Table
        className={classes.table}
        size="small"
      >
        <TableHead>
          {tableHeadData}
        </TableHead>
        <TableBody>
          {tableBodyData}
        </TableBody>
      </Table>
    );
  }
}

export default withStyles(styles)(TransactionsTable);
