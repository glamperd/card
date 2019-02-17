import React, { Component } from "react";
import QrReader from "react-qr-reader";
 
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
      this.setState({
        result: data
      });
      console.log("TEST===============================")
      console.log(data)
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