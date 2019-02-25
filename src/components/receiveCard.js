import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import ReceiveIcon from "@material-ui/icons/SaveAlt";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Typography from "@material-ui/core/Typography";
import CopyIcon from "@material-ui/icons/FileCopy";
import QRGenerate from "./qrGenerate";
import IconButton from "@material-ui/core/IconButton";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { withRouter } from "react-router-dom";
import { withStyles, Grid } from "@material-ui/core";

const styles = theme => ({
  icon: {
    width: "40px",
    height: "40px"
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

class ReceiveCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "0",
      error: null,
      qrUrl: this.generateQrUrl("0")
    };
  }

  async updatePaymentHandler(evt) {
    const qrUrl = this.generateQrUrl(evt.target.value);
    this.setState({
      value: evt.target.value,
      qrUrl
    });
    console.log(`Updated value: ${this.state.value}`);
  }

  generateQrUrl(value) {
    const { publicUrl, address } = this.props;
    // function should take a payment value
    // and convert it to the url with
    // appropriate strings to prefill a send
    // modal state (recipient, amountToken)
    const url = `${publicUrl}/send?amountToken=${value}&recipient=${address}`;
    console.log("QR code url:", url);
    return url;
  }

  render() {
    const { classes } = this.props;
    const { qrUrl, error, displayVal } = this.state;
    return (
      <Grid
        container
        spacing={16}
        direction="column"
        style={{
          paddingLeft: 12,
          paddingRight: 12,
          paddingTop: "10%",
          paddingBottom: "10%",
          textAlign: "center",
          justifyContent: "center"
        }}
      >
        <Grid
          container
          wrap="nowrap"
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <ReceiveIcon className={classes.icon} />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="outlined-number"
            label="Amount"
            value={displayVal}
            type="number"
            margin="normal"
            variant="outlined"
            onChange={evt => this.updatePaymentHandler(evt)}
            error={error != null}
            helperText={error}
          />
        </Grid>
        <Grid item xs={12}>
          <QRGenerate value={qrUrl} />
        </Grid>
        <Grid item xs={12}>
          {/* <CopyIcon style={{marginBottom: "2px"}}/> */}
          <CopyToClipboard text={qrUrl}>
            <Button variant="outlined" fullWidth>
              <Typography noWrap variant="body1">
                <Tooltip disableFocusListener disableTouchListener title="Click to Copy">
                  <span>{qrUrl}</span>
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
            size="small" 
            onClick={()=>this.props.history.push("/")}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(ReceiveCard);
