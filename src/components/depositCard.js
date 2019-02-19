import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import DepositIcon from "@material-ui/icons/AttachMoney";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Switch from "@material-ui/core/Switch";
import HelpIcon from "@material-ui/icons/Help";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import CopyIcon from "@material-ui/icons/FileCopy";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/Grid";
import QRGenerate from "./qrGenerate";
const Web3 = require("web3");
const eth = require("ethers");

class DepositCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "0",
      error: null
    };
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
        width: "100%",
        padding: "2% 2% 2% 2%"
      },
      row: {
        width: "100%",
        textAlign: "center",
        padding: "2% 2% 2% 2%"
      }
    };

    return (
      <Card style={cardStyle.card}>
        <CardContent>
          <Grid container spacing={24} direction="column" alignItems="center">
            <Grid item xs={12}>
              <DepositIcon style={cardStyle.icon} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">
                <Tooltip
                  disableFocusListener
                  disableTouchListener
                  title="Because gas"
                >
                  <span>{`Deposit minimum ${
                    this.props.minDepositWei
                  } wei to card.`}</span>
                </Tooltip>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <QRGenerate value={this.props.address} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined">
                <CopyIcon style={{ marginRight: "5px" }} />
                <CopyToClipboard text={this.props.address}>
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
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

export default DepositCard;
