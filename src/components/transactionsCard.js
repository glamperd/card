import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { Grid, Typography } from "@material-ui/core";
import HistoryIcon from "@material-ui/icons/History";

import { getOwedBalanceInDAI } from "../utils/currencyFormatting";

import TransactionsTable from './transactionsTable';

class TransactionsCard extends Component {
  render() {
    const { address, txHistory, connextState } = this.props;

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
          <Grid item xs={12} style={{ justifyContent: "center" }}>
            <HistoryIcon
              style={{ width: "40px", height: "40px" }}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="row" justify="center" alignItems="center">
              <Typography variant="h2">
                <span>
                  {getOwedBalanceInDAI(connextState)}
                </span>
              </Typography>
            </Grid>
          </Grid>
          <TransactionsTable
            txHistory={txHistory}
            address={address}
            pagination={true}
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
