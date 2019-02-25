import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import DepositIcon from "@material-ui/icons/AttachMoney";
import Tooltip from "@material-ui/core/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Typography from "@material-ui/core/Typography";
import CopyIcon from "@material-ui/icons/FileCopy";
import Grid from "@material-ui/core/Grid";
import QRGenerate from "./qrGenerate";
import IconButton from "@material-ui/core/IconButton";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core";

const styles = theme => ({
  icon: {
    width: "40px",
    height: "40px"
  },
  cancelIcon: {
    marginLeft: "100px",
    width: "50px",
    height: "50px",
    float: "right",
    cursor: "pointer"
  }
});

/* CANCEL BUTTON */
const CancelButton = withRouter(({ history }) => (
  <IconButton
    onClick={() => {
      history.push("/");
    }}
  >
    <HighlightOffIcon />
  </IconButton>
));

class DepositCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "0",
      error: null
    };
  }

  render() {
    const { classes, address } = this.props;

    return (
      <Grid container spacing={24} direction="column" style={{ paddingLeft: 12, paddingRight: 12, paddingTop: "10%", paddingBottom: "10%", textAlign: "center", justifyContent: "center" }}>

        <Grid
          container
          wrap="nowrap"
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <DepositIcon className={classes.icon} />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption">
            <Tooltip disableFocusListener disableTouchListener title="Because gas">
              <span>{`Deposit minimum + gas fee = ${this.props.minDepositWei / Math.pow(10, 18)} Eth 
                      or ${(this.props.minDepositWei / Math.pow(10,18) * this.props.exchangeRate).toString().substring(0,4)} Dai.`}</span>
            </Tooltip>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <QRGenerate value={address} />
        </Grid>
        <Grid item xs={12}>
          <CopyIcon style={{marginBottom: "2px"}}/>
          <CopyToClipboard text={address}>
            <Button variant="outlined" fullWidth>
              <Typography noWrap variant="body1">
                <Tooltip disableFocusListener disableTouchListener title="Click to Copy">
                  <span>{address}</span>
                </Tooltip>
              </Typography>
            </Button>
          </CopyToClipboard>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(DepositCard);
