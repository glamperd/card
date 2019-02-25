import React, { Component } from "react";
import {
  Button,
  Grid,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  TextField,
  InputAdornment,
  withStyles,
  Modal
} from "@material-ui/core";
import { CopyToClipboard } from "react-copy-to-clipboard";
import CopyIcon from "@material-ui/icons/FileCopy";
import SubmitIcon from "@material-ui/icons/ArrowRight";
import { createWallet, createWalletFromMnemonic } from "../walletGen";
import SettingsIcon from "@material-ui/icons/Settings";
import Snackbar from './snackBar';


const styles = {
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
  button:{
    marginBottom:"0px"
  }

};

class SettingsCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showRecovery: false,
      inputRecovery: false,
      rpc: localStorage.getItem("rpc"),
      mnemonic: null,
      copied: null,
      showWarning: false
    };
  }

  handleClick = async() => {
    await this.setState({copied:false});
  }

  async generateNewAddress() {
    // NOTE: DelegateSigner is always recoveredwhic from browser storage.
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
    const rpc = event.target.value;
    this.setState({ rpc });
    await this.props.networkHandler(rpc);
    window.location.reload();
  }

  render() {
    const { classes } = this.props;
    const { copied } = this.state;
    return (
      <Grid
        container
        spacing={24}
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
      <Snackbar 
            handleClick={() => this.handleClick()}
            onClose={() => this.handleClick()}
            open={copied}
            text="Copied!"/>
        <Grid item xs={12} style={{justifyContent: "center"}}>
          <SettingsIcon className={classes.icon} />
        </Grid>
        <Grid item xs={12}>
          <Select
            fullWidth
            value={this.state.rpc}
            onChange={event => this.updateRPC(event)}
            style={{
              border: "1px solid #3CB8F2",
              color: "#3CB8F2",
              textAlign: "center",
              borderRadius: "4px",
              height: "45px"
            }}
            disableUnderline
            IconComponent={() => null}
          >
            <MenuItem disabled={true} value={"MAINNET"}>
              MAINNET
            </MenuItem>
            <MenuItem value={"RINKEBY"}>RINKEBY</MenuItem>
            <MenuItem value={"LOCALHOST"}>LOCALHOST</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} className={classes.button}>
          <Button
            fullWidth
            style={{
              background: "#FFF",
              border: "1px solid #7289da",
              color: "#7289da"
            }}
            onClick={() => {window.open('https://discord.gg/q2cakRc','_blank');window.close();return false}}
            size="large"
          >
            Discord
          </Button>
        </Grid>
        <Grid item xs={12} className={classes.button}>
          {!this.state.showRecovery ? (
            <Button
              fullWidth
              className={classes.button}
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => this.setState({ showRecovery: true })}
            >
              Show Backup Phrase
            </Button>
          ) : (
            <CopyToClipboard
            text={localStorage.getItem("mnemonic")}
            color="primary"
            >
              <Button
                fullWidth
                className={classes.button}
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => this.setState({ showRecovery: true })}
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
          )}
        </Grid>
        <Grid item xs={12} className={classes.button}>
          {!this.state.inputRecovery ? (
            <Button
              fullWidth
              className={classes.button}
              color="primary"
              variant="outlined"
              size="large"
              onClick={() => this.setState({ inputRecovery: true })}
            >
              Import from Backup
            </Button>
          ) : (
            <TextField
              style={{ height: "40px", width: "80%" }}
              color="primary"
              variant="outlined"
              size="large"
              placeholder="Enter backup phrase and submit"
              value={this.state.mnemonic}
              onChange={event =>
                this.setState({ mnemonic: event.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      fullWidth
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
        </Grid>
        <Grid item xs={12} className={classes.button}>
          <Button
          fullWidth
          style={{
            background: "#FFF",
            border: "1px solid #F22424",
            color: "#F22424"
          }}
          size="large"
          onClick={() => this.setState({ showWarning: true })}
          >
            Burn Card
          </Button>
          <Modal
            open={this.state.showWarning}
            onBackdropClick={() => this.setState({showWarning: false})}
            style={{
              justifyContent: "center", 
              alignItems: "center", 
              textAlign: "center", 
              position: "absolute", 
              top: "25%", 
              width: "375px",
              marginLeft: "auto",
              marginRight: "auto",
              left: "0",
              right: "0",
            }}
          >
            <Grid container style={{backgroundColor: "#FFF", padding: "5%", flexDirection: "column"}}>
              <Grid item style={{margin: "1em"}}>
                <Typography variant="h5" style={{color:"#F22424"}}>
                  Are you sure you want to burn your Card? 
                </Typography>
              </Grid>
              <Grid item style={{margin: "1em"}}>
                <Typography variant="body1" style={{color:"#F22424"}}>
                  You will lose access to your funds unless you save your backup phrase!
                </Typography>
              </Grid>
              <Grid item style={{margin: "1em"}}>
                <Button
                  style={{
                    background: "#F22424",
                    border: "1px solid #F22424",
                    color: "#FFF",
                  }}
                  variant="contained"
                  size="small"
                  onClick={() => this.generateNewAddress()}
                >
                Burn
                </Button>
                <Button
                  style={{
                    background: "#FFF",
                    border: "1px solid #F22424",
                    color: "#F22424",
                    marginLeft: "5%",
                  }}
                  variant="outlined"
                  size="small"
                  onClick={() => this.setState({ showWarning: false })}
                >
                Cancel
                </Button>
              </Grid>
            </Grid>
          </Modal>
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

export default withStyles(styles)(SettingsCard);
