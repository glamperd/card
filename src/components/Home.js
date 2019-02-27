import React from "react";
import "../App.css";
import ChannelCard from "./channelCard";
import QRScan from "./qrScan";
import QRIcon from "mdi-material-ui/QrcodeScan";
import SendIcon from "@material-ui/icons/Send";
import ReceiveIcon from "@material-ui/icons/SaveAlt";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import { Fab, Grid, withStyles } from "@material-ui/core";
import { Link } from 'react-router-dom'

const styles = {}

class Home extends React.Component {
  state = {
    modals: {
      scan: false
    },
    sendScanArgs: null,
  };

  scanQRCode = async (data) => {
    const { publicUrl } = this.props;
    console.log("PUBLIC URL")
    console.log(publicUrl)

    data = data.split("/send?");
    console.log(data[0])
    if (data[0] === publicUrl) {
      let temp = data[1].split("&");
      let amount = temp[0].split("=")[1];
      let recipient = temp[1].split("=")[1];
      await this.props.scanURL(amount, recipient)
      this.props.history.push("/send")
    } else {
      console.log("incorrect site");
    }
    this.setState({
      modals: { scan: false }
    });
  }

  render() {
    const { modals } = this.state;
    const { address, channelState, connextState } = this.props;
    return (
      <>
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
              style={{
                justifyContent: "center", 
                alignItems: "center", 
                textAlign: "center", 
                position: "absolute", 
                top: "10%", 
                width: "375px",
                marginLeft: "auto",
                marginRight: "auto",
                left: "0",
                right: "0",
              }}
            >
              <QRScan handleResult={this.scanQRCode} history={this.props.history} />
            </Modal>
          </div>
        </div>
        <Grid container spacing={24} direction="column" style={{ paddingLeft: 12, paddingRight: 12, textAlign: "center" }}>
          <Grid item xs={12} style={{paddingTop: 40}}>
            <Grid container spacing={8} direction="row" alignItems="center" justify="center">
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  style={{
                    color: "#FFF",
                    backgroundColor: "#FCA311"
                  }}
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/receive"
                >
                  Request
                  <ReceiveIcon style={{ marginLeft: "5px" }} />
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  style={{
                    color: "#FFF",
                    backgroundColor: "#FCA311"
                  }}
                  size="large"
                  variant="contained"
                  component={Link}
                  to="/send"
                >
                  Send
                  <SendIcon style={{ marginLeft: "5px" }} />
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Button style={{marginBottom: "20%"}} fullWidth color="primary" variant="outlined" size="large" component={Link} to="/cashout">
              Cash Out
            </Button>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withStyles(styles)(Home);
