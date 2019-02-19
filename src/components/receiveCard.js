import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import ReceiveIcon from "@material-ui/icons/SaveAlt";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Switch from "@material-ui/core/Switch";
import HelpIcon from "@material-ui/icons/Help";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import CopyIcon from "@material-ui/icons/FileCopy"
import { store } from "../App.js";
import QRGenerate from "./qrGenerate"
const Web3 = require("web3");
const eth = require("ethers");

class ReceiveCard extends Component {
  constructor(props){
    super(props)

    this.state = {
      value: "0",
      error: null,
      qrUrl: this.generateQrUrl("0")
    };
  }

  async updateDepositHandler(evt) {
    const qrUrl = this.generateQrUrl(evt.target.value)
    this.setState({
      value: evt.target.value,
      qrUrl,
    });
    console.log(
      `Updated value: ${this.state.value}`
    );
  }

  generateQrUrl(value) {
    // function should take a payment value
    // and convert it to the url with
    // appropriate strings to prefill a send
    // modal state (recipient, amountToken)
    const url = `${this.props.publicUrl}?amountToken=${value}&recipient=${this.props.address}`
    console.log('QR code url:', url)
    return url
  }

  render() {
    const cardStyle = {
      card: {
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        width: "100%",
        height: "70%",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        padding: "4% 4% 4% 4%"
      },
      icon: {
        width: "40px",
        height: "40px",
      },
      input: {
        width: "100%"
      },
    };

    return (
      <Card style={cardStyle.card}>
        <ReceiveIcon style={cardStyle.icon} />
        <TextField
          style={cardStyle.input}
          id="outlined-number"
          label="Amount"
          value={this.state.displayVal}
          type="number"
          margin="normal"
          variant="outlined"
          onChange={evt => this.updateDepositHandler(evt)}
          error={this.state.error != null}
          helperText={this.state.error}
        />
        <QRGenerate
          value={this.state.qrUrl}
        />
        <Button variant="outlined">
          <CopyIcon style={{marginRight: "5px"}} />
          <CopyToClipboard text={(this.props.address)}>
            <Typography noWrap variant="body1">
              <Tooltip
                disableFocusListener
                disableTouchListener
                title="Click to Copy"
              >
                <span>{this.props.address}</span>
              </Tooltip>
            </Typography>
          </CopyToClipboard>
        </Button>
      </Card>
    );
  }
}

export default ReceiveCard;
