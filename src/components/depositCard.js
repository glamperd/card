import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import DepositIcon from "@material-ui/icons/AttachMoney";
import Tooltip from "@material-ui/core/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Typography from "@material-ui/core/Typography";
//import CopyIcon from "@material-ui/icons/FileCopy";
import Grid from "@material-ui/core/Grid";
import QRGenerate from "./qrGenerate";
//import IconButton from "@material-ui/core/IconButton";
//import HighlightOffIcon from "@material-ui/icons/HighlightOff";
//import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core";
import ConfirmationSnackbar from './snackBar';

const styles = theme => ({ 
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
      error: null,
      copied: null
    };
  }

  handleClick = async() => {
    await this.setState({copied:false});
  }

  render() {
    const { classes, address } = this.props;
    const { copied } = this.state;

    return (
      <Grid container spacing={24} direction="column" style={{ paddingLeft: 12, paddingRight: 12, paddingTop: "10%", paddingBottom: "10%", textAlign: "center", justifyContent: "center" }}>
      <ConfirmationSnackbar
            handleClick={() => this.handleClick()}
            onClose={() => this.handleClick()}
            open={copied}
            text="Copied!"/>
        <Grid
          container
          wrap="nowrap"
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <DepositIcon className={classes.icon} />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">
            <Tooltip disableFocusListener disableTouchListener title="Because gas">
              <span>{`Deposit fee: ${this.props.minDepositWei / Math.pow(10, 18)} Eth 
                      or ${(this.props.minDepositWei / Math.pow(10,18) * this.props.exchangeRate).toString().substring(0,4)} Dai.`}</span>
            </Tooltip>
          </Typography>
          <Typography variant="body2">
          {`This covers gas fees for depositing and emergencies.`}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <QRGenerate value={address} />
        </Grid>
        <Grid item xs={12}>
          {/* <CopyIcon style={{marginBottom: "2px"}}/> */}
          <CopyToClipboard 
              onCopy={() => this.setState({copied: true})}
              text={address}>
            <Button variant="outlined" fullWidth>
              <Typography noWrap variant="body1">
                <Tooltip disableFocusListener disableTouchListener title="Click to Copy">
                  <span>{address}</span>
                </Tooltip>
              </Typography>
            </Button>
          </CopyToClipboard>
        </Grid>
        <Grid item xs={12}>
          <Button 
            variant="outlined" 
            style={{
              background: "#FFF",
              border: "1px solid #F22424",
              color: "#F22424",
              width: "15%",
            }}
            size="medium" 
            onClick={()=>this.props.history.push("/")}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(DepositCard);
