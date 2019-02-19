import React from "react";
import "../App.css";
import ReceiveCard from "./receiveCard";
import SendCard from "./sendCard";
import CashOutCard from "./cashOutCard";
import ChannelCard from "./channelCard";
import QRScan from "./qrScan";
import SettingsCard from "./settingsCard";
import QRIcon from "mdi-material-ui/QrcodeScan";
import SendIcon from "@material-ui/icons/Send";
import ReceiveIcon from "@material-ui/icons/SaveAlt";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import { Fab, Grid, withStyles } from "@material-ui/core";

const styles = theme => ({
  paper: {
    paddingBottom: theme.spacing.unit * 2
  }
});

class Home extends React.Component {
  state = {
    modals: {}
  };

  scanQRCode(data) {
    const { publicUrl } = this.props;

    data = data.split("?");
    if (data[0] === publicUrl) {
      let temp = data[1].split("&");
      let amount = temp[0].split("=")[1];
      let recipient = temp[1].split("=")[1];
      const { sendScanArgs, modals } = this.state;
      this.setState({
        sendScanArgs: { ...sendScanArgs, amount, recipient },
        modals: { ...modals, send: true }
      });
    } else {
      console.log("incorrect site");
    }
  }

  render() {
    const { modals } = this.state;
    const { classes, address, channelState, publicUrl } = this.props;
    return (
      <>
        <Modal
          id="settings"
          open={this.state.modals.settings}
          onClose={() => this.setState({ modals: { ...modals, settings: false } })}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <SettingsCard />
        </Modal>
        <div className="row" style={{ marginBottom: "-7.5%" }}>
          <div className="column" style={{ justifyContent: "space-between", flexGrow: 1 }}>
            <ChannelCard channelState={channelState} address={address} />
          </div>
        </div>
        <div className="row">
          <div className="column" style={{ marginRight: "5%", marginLeft: "80%" }}>
            <Fab
              style={{
                color: "#FFF",
                backgroundColor: "#fca311",
                size: "large"
              }}
              onClick={() => this.setState({ modals: { ...modals, scan: true } })}
            >
              <QRIcon />
            </Fab>
            <Modal
              id="qrscan"
              open={this.state.modals.scan}
              onClose={() => this.setState({ modals: { ...modals, scan: false } })}
              style={{ width: "full", height: "full" }}
            >
              <QRScan handleResult={this.scanQRCode.bind(this)} />
            </Modal>
          </div>
        </div>
        <Grid container spacing={16} direction="column" alignItems="center" justify="center">
          <Grid item xs={12}>
            <Grid container spacing={16} direction="row" alignItems="center" justify="center">
              <Grid item xs={6}>
                <Button
                  fullWidth
                  style={{
                    marginRight: "5px",
                    color: "#FFF",
                    backgroundColor: "#FCA311"
                  }}
                  variant="contained"
                  size="large"
                  onClick={() => this.setState({ modals: { ...modals, receive: true } })}
                >
                  Receive
                  <ReceiveIcon style={{ marginLeft: "5px" }} />
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  style={{
                    marginLeft: "5px",
                    color: "#FFF",
                    backgroundColor: "#FCA311"
                  }}
                  size="large"
                  variant="contained"
                  onClick={() => this.setState({ modals: { ...modals, send: true } })}
                >
                  Send
                  <SendIcon style={{ marginLeft: "5px" }} />
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth color="primary" variant="outlined" size="large" onClick={() => this.setState({ modals: { ...modals, cashOut: true } })}>
              Cash Out
            </Button>
            <Modal
              open={this.state.modals.cashOut}
              onClose={() => this.setState({ modals: { ...modals, cashOut: false } })}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <CashOutCard />
            </Modal>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withStyles(styles)(Home);
