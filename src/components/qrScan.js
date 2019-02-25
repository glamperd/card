import React, { Component } from "react";
import QrReader from "react-qr-reader";
import {Grid, Button} from "@material-ui/core";
 
class QRScan extends Component {
  constructor(props) {
    super(props);

    this.state = {
      delay: 300,
      result: "No result",
      error: null,
    };
    this.handleScan = this.handleScan.bind(this);
  }
  handleScan(data) {
    if (data) {
      this.props.handleResult(data)
    }
  }

  render() {
    return (
      <Grid
        container
        spacing={24}
        direction="column"
        style={{
          display: "flex",
          paddingTop: "5%",
          paddingBottom: "5%",
          textAlign: "center",
          justifyContent: "center",
          background: "#FFF"
        }}
      >
        <Grid item xs={12}>
          <QrReader
              delay={this.state.delay}
              onError={(error) => this.setState({error})}
              onScan={this.handleScan}
              style={{ width: "100%" }}
          />
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

export default QRScan;