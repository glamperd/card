import React, { Component } from "react";
import { Button, Card, Select, MenuItem, Typography, Tooltip, TextField, InputAdornment } from "@material-ui/core";
import { CopyToClipboard } from "react-copy-to-clipboard";
import CopyIcon from "@material-ui/icons/FileCopy";
import SubmitIcon from "@material-ui/icons/ArrowRight";
import { createWallet, createWalletFromMnemonic } from "../walletGen";
import SettingsIcon from "@material-ui/icons/Settings";

class SettingsCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showRecovery: false,
      inputRecovery: false,
      rpc: null,
      mnemonic: null
    };
  }

  componentWillReceiveProps() {
    //   this.setState({rpc: this.props.web3})
  }

  async generateNewAddress() {
    // NOTE: DelegateSigner is always recovered from browser storage.
    //       It is ONLY set to state from within app on load.
    await createWallet(this.state.web3);
    // Then refresh the page
    window.location.reload();
  }

  async recoverAddressFromMnemonic() {
    await createWalletFromMnemonic(this.state.mnemonic);
    window.location.reload();
  }

  async updateRPC(event) {
    this.setState({ rpc: event.target.value });
    console.log("RPC UPDATE ", event.target.value);
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
        height: "40px"
      },
      input: {
        width: "100%"
      },
      button: {
        height: "40px",
        width: "80%",
        marginLeft: "5px",
        marginRight: "5px"
      }
    };

    return (
      <Card style={cardStyle.card}>
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <SettingsIcon style={cardStyle.icon} />
        </div>
        <Select
          value={this.state.rpc}
          onChange={event => this.updateRPC(event)}
          style={{
            height: "40px",
            width: "70%",
            marginLeft: "5px",
            marginRight: "5px",
            border: "1px solid #3CB8F2",
            textAlign: "center",
            paddingLeft: "10%",
            color: "#3CB8F2",
            borderRadius: "5px"
          }}
          disableUnderline
          IconComponent={() => null}
        >
          <MenuItem value={"MAINNET"}>Mainnet</MenuItem>
          <MenuItem value={"RINKEBY"}>Rinkeby</MenuItem>
          <MenuItem value={"LOCALHOST"}>Localhost</MenuItem>
        </Select>
        {!this.state.showRecovery ? (
          <Button style={cardStyle.button} variant="outlined" color="primary" size="large" onClick={() => this.setState({ showRecovery: true })}>
            Show Mnemonic
          </Button>
        ) : (
          <Button style={cardStyle.button} variant="outlined" color="primary" size="large" onClick={() => this.setState({ showRecovery: true })}>
            <CopyIcon style={{ marginRight: "5px" }} />
            <CopyToClipboard text={localStorage.getItem("mnemonic")} color="primary">
              <Typography noWrap variant="body1" color="primary">
                <Tooltip disableFocusListener disableTouchListener title="Click to Copy">
                  <span>{localStorage.getItem("mnemonic")}</span>
                </Tooltip>
              </Typography>
            </CopyToClipboard>
          </Button>
        )}
        {!this.state.inputRecovery ? (
          <Button style={cardStyle.button} color="primary" variant="outlined" size="large" onClick={() => this.setState({ inputRecovery: true })}>
            Import Wallet
          </Button>
        ) : (
          <TextField
            style={{ height: "40px", width: "80%" }}
            color="primary"
            variant="outlined"
            size="large"
            placeholder="Enter mnemonic and submmit"
            value={this.state.mnemonic}
            onChange={event => this.setState({ mnemonic: event.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ color: "#FFF", marginRight: "-10%" }}
                    onClick={() => this.recoverAddressFromMnemonic()}
                  >
                    <SubmitIcon />
                  </Button>
                </InputAdornment>
              )
            }}
          />
        )}
        <Button
          style={{
            background: "#FFF",
            border: "1px solid #F22424",
            color: "#F22424",
            height: 40,
            padding: "0 30px",
            width: "80%"
          }}
          size="large"
          onClick={() => this.generateNewAddress()}
        >
          Burn Wallet
        </Button>
      </Card>
    );
  }
}

export default SettingsCard;
