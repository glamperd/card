import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import {
  withStyles,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Dialog,
  Typography,
  DialogContentText,
  LinearProgress,
  Tooltip
} from "@material-ui/core";
import { CurrencyType } from "connext/dist/state/ConnextState/CurrencyTypes";
import getExchangeRates from "connext/dist/lib/getExchangeRates";
import CurrencyConvertable from "connext/dist/lib/currency/CurrencyConvertable";
import Currency from "connext/dist/lib/currency/Currency";
import { CopyToClipboard } from "react-copy-to-clipboard";
import CopyIcon from "@material-ui/icons/FileCopy";

const styles = theme => ({
  icon: {
    width: "40px",
    height: "40px"
  }
});

const screens = (classes, minEth, minDai, maxEth, maxDai) => [
  {
    title: "Welcome to Your Dai Card!",
    message: "Here are some helpful tips to get you setup."
  },
  {
    title: "Beta Software",
    message:
      "This is beta software, and there may be bugs. Don't hesitate to contact us by going to Settings > Support if you find any!"
  },
  {
    title: "Your Mnemonic",
    message:
      "All your funds are attached to this mnemonic. Make sure to copy it down and keep it in a safe place in case you ever need to recover your account.",
    extra: (
      <Grid container style={{ padding: "2% 2% 2% 2%" }}>
        <CopyToClipboard
          text={localStorage.getItem("mnemonic")}
          color="primary"
        >
          <Button
            fullWidth
            className={classes.button}
            variant="outlined"
            color="primary"
            size="small"
          >
            <CopyIcon style={{ marginRight: "5px" }} />
            <Typography noWrap variant="body1" color="primary">
              <Tooltip
                disableFocusListener
                disableTouchListener
                title="Click to Copy"
              >
                <span>{localStorage.getItem("mnemonic")}</span>
              </Tooltip>
            </Typography>
          </Button>
        </CopyToClipboard>
      </Grid>
    )
  },
  {
    title: "Deposit Boundaries",
    message: `The card needs a minimum deposit of ${minEth ||
      "0.00"} eth (${minDai ||
      "0.00"} dai) to cover the gas costs of getting setup. Cards only accept deposits of ${maxEth ||
      "0.00"} eth (${maxDai ||
      "0.00"} dai) or less, with any excess getting refunded.`
  }
];

class SetupCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      index: 0,
      open: !localStorage.getItem("hasBeenWarned")
    };
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClickNext = () => {
    const { index } = this.state;
    this.setState({ index: index + 1 });
  };

  handleClickPrevious = () => {
    const { index } = this.state;
    this.setState({ index: index - 1 });
  };

  handleClose = () => {
    localStorage.setItem("hasBeenWarned", "true");
    this.setState({ open: false });
  };

  render() {
    const {
      classes,
      connextState,
      browserMinimumBalance,
      maxTokenDeposit
    } = this.props;
    const { index, open } = this.state;

    // get proper display values
    // max token in BEI, min in wei and DAI
    let minDai, minEth;
    let maxDai, maxEth;
    if (connextState && browserMinimumBalance) {
      const minConvertable = new CurrencyConvertable(
        CurrencyType.WEI,
        browserMinimumBalance.wei,
        () => getExchangeRates(connextState)
      );

      const maxConvertable = new CurrencyConvertable(
        CurrencyType.BEI,
        maxTokenDeposit,
        () => getExchangeRates(connextState)
      );

      minEth = minConvertable
        .toETH()
        .amountBigNumber.toFixed()
        .substr(0, 5);
      minDai = Currency.USD(browserMinimumBalance.dai).format({});
      maxEth = maxConvertable
        .toETH()
        .amountBigNumber.toFixed()
        .substr(0, 5);
      maxDai = Currency.USD(maxConvertable.toUSD().amountBigNumber).format({});
    }

    const display = screens(classes, minEth, minDai, maxEth, maxDai);

    const isFinal = index == display.length - 1;

    const progress = 100 * ((index + 1) / display.length);

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
          textAlign: "center"
        }}
        zeroMinWidth={true}
      >
        {display.length != 0 && (
          <Dialog open={open} fullWidth>
            <Grid container justify="center">
              <Grid item xs={12} style={{ padding: "2% 2% 2% 2%" }}>
                <LinearProgress variant="determinate" value={progress} />
              </Grid>

              <Grid item xs={12}>
                <DialogTitle variant="h5">{display[index].title}</DialogTitle>
              </Grid>

              {display[index].extra && (
                <Grid item xs={12}>
                  {display[index].extra}
                </Grid>
              )}

              <DialogContent>
                <Grid item xs={12} style={{ padding: "2% 2% 2% 2%" }}>
                  <DialogContentText variant="body1">
                    {display[index].message}
                  </DialogContentText>
                </Grid>

                <Grid item xs={12}>
                  <DialogActions style={{ padding: "2% 2% 2% 2%" }}>
                    {index != 0 && (
                      <Button
                        onClick={this.handleClickPrevious}
                        className={classes.button}
                        variant="outlined"
                        color="primary"
                        size="small"
                      >
                        Back
                      </Button>
                    )}
                    {isFinal ? (
                      <Button
                        onClick={this.handleClose}
                        className={classes.button}
                        variant="outlined"
                        color="primary"
                        size="small"
                      >
                        Got it!
                      </Button>
                    ) : (
                      <Button
                        onClick={this.handleClickNext}
                        className={classes.button}
                        variant="outlined"
                        color="primary"
                        size="small"
                      >
                        Next
                      </Button>
                    )}
                  </DialogActions>
                </Grid>
              </DialogContent>
            </Grid>
          </Dialog>
        )}
      </Grid>
    );
  }
}

export default withStyles(styles)(SetupCard);
