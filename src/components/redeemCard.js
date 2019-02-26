import { withStyles, Button } from "@material-ui/core";
import ReceiveIcon from "@material-ui/icons/SaveAlt";
import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import DepositIcon from "@material-ui/icons/AttachMoney";
import QRGenerate from "./qrGenerate";
import { CopyToClipboard } from "react-copy-to-clipboard";


const queryString = require("query-string");

const styles = theme => ({
  icon: {
    width: "40px",
    height: "40px"
  }
});

class RedeemCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      secret: null,
    };
  }

  async componentWillMount() {
    const { location } = this.props;
    const query = queryString.parse(location.search);
    console.log("query", query);
    if (query.secret) {
      this.setState({ secret: query.secret });
    }
  }

  generateQrUrl(secret) {
    const { publicUrl } = this.props;
    const url = `${publicUrl}/redeem?secret=${secret ? secret : ""}`;
    return url;
  }

  render() {
    const { secret } = this.state;
    const { classes } = this.props;
    const url = this.generateQrUrl(secret);
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
        <Grid item xs={12}>
          <ReceiveIcon className={classes.icon} />
        </Grid>
        <Grid item xs={12}>
          <QRGenerate value={url} />
        </Grid>
        <Grid item xs={12}>
          <CopyToClipboard text={url}>
            <Button variant="outlined" fullWidth>
              <Typography noWrap variant="body1">
                <Tooltip
                  disableFocusListener
                  disableTouchListener
                  title="Click to Copy"
                >
                  <span>{url}</span>
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
              width: "15%"
            }}
            size="medium"
            onClick={() => this.props.history.push("/")}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(RedeemCard);
