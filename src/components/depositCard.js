import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import DepositIcon from "@material-ui/icons/AttachMoney";
import Tooltip from "@material-ui/core/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Typography from "@material-ui/core/Typography";
import CopyIcon from "@material-ui/icons/FileCopy";
import Grid from "@material-ui/core/Grid";
import QRGenerate from "./qrGenerate";
import { withStyles } from "@material-ui/core";

const styles = theme => ({
  paper: {
    paddingBottom: theme.spacing.unit * 2
  },
  icon: {
    width: "40px",
    height: "40px"
  }
});

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
      <Grid container spacing={24} direction="column" style={{ paddingLeft: 12, paddingRight: 12, paddingTop: "10%", paddingBottom: "10%", textAlign: "center" }}>
        <Grid item xs={12}>
          <DepositIcon className={classes.icon} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption">
            <Tooltip disableFocusListener disableTouchListener title="Because gas">
              <span>{`Deposit minimum ${this.props.minDepositWei} wei to card.`}</span>
            </Tooltip>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <QRGenerate value={address} />
        </Grid>
        <Grid item xs={12}>
          <Button variant="outlined" fullWidth>
            <CopyIcon style={{ marginRight: "5px" }} />
            <CopyToClipboard text={address}>
              <Typography noWrap variant="body1">
                <Tooltip disableFocusListener disableTouchListener title="Click to Copy">
                  <span>{address}</span>
                </Tooltip>
              </Typography>
            </CopyToClipboard>
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(DepositCard);
