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
  }
  handleScan = (data) => {
    if (data) {
      this.props.handleResult(data)
    }
  }

  render() {
    return (
      <QrReader
        delay={this.state.delay}
        onError={(error) => this.setState({error})}
        onScan={this.handleScan}
        style={{ width: "100%" }}
      />
    );
  }
}

export default QRScan;