import React, { Component } from "react";
import Web3 from "web3";

import { withStyles } from "@material-ui/core";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { formatTxDateObj } from '../utils/datetimeFormatting';

const styles = theme => ({
  table: {
    tableLayout: 'fixed',
    whiteSpace: 'nowrap'
  },
  tableCell: {
    width: "100%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
});

class TransactionsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 0,
    };
    this.paginationPerPage = 5;
    this.processedTxHistory = [];
  }

  componentDidMount() {
    const { paginationPerPage } = this.props;

    // Set pagination options
    if (paginationPerPage) this.paginationPerPage = paginationPerPage;

    // Set processed txHistory
    this.setProcessedTxHistory()
  }

  componentDidUpdate(prevProps) {
    if (this.props.txHistory !== prevProps.txHistory) {
      // Set processed txHistory
      this.setProcessedTxHistory()
    }
  }

  setProcessedTxHistory = () => {
    const { filter, txHistory } = this.props;
    let newTxHistory;

    newTxHistory = this.filterTxHistory(txHistory, filter);
    newTxHistory = this.formatTxHistory(newTxHistory, filter);
    this.processedTxHistory = newTxHistory;
  }

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

  formatTxHistory = (txHistory, filter) => {
    const txs = [];
    if (txHistory) {
      for (const tx of txHistory) txs.push(this.formatRawTx(tx, filter));
    }
    return txs;
  }

  getColLabels = () => {
    switch (this.props.filter) {
      case 'send':
        return ["Recipient", "Amount", "Date"]
      case 'receive':
        return ["Sender", "Amount", "Date"]
      case 'deposit':
        return ["Recipient", "Amount", "Date"]
      case 'withdrawal':
        return ["Recipient", "Amount", "Date"]
      default:
        return ["Address", "Type", "Amount", "Date"]
    }
  }

  getSelectedTxHistory = () => {
    const { page } = this.state;
    const { pagination } = this.props;
    const { processedTxHistory, paginationPerPage } = this;

    if (pagination) {
      const offset = Math.ceil(page * paginationPerPage);
      return processedTxHistory.slice(offset).slice(0, paginationPerPage);
    }

    return processedTxHistory
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

  getTableHeadData = () => {
    return (
      <TableRow>
        {this.getColLabels().map((label, i) =>
          <TableCell
            key={label}
            align="center"
            padding="none"
            className={this.props.classes.tableCell}
          >
            {label}
          </TableCell>
        )}
      </TableRow>
    );
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  }

  render() {
    const { page } = this.state;
    const { classes, pagination } = this.props;
    const txHistory = this.getSelectedTxHistory();

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
        {pagination &&
          <TableFooter>
            <TableRow>
              <TablePagination
                count={this.processedTxHistory.length}
                rowsPerPage={this.paginationPerPage}
                rowsPerPageOptions={[this.paginationPerPage]}
                onChangePage={this.handleChangePage}
                page={page}
              />
            </TableRow>
          </TableFooter>
        }
      </Table>
    );
  }
}

export default withStyles(styles)(TransactionsTable);
