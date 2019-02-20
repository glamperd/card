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
      this.props.handleResult(data)
    }
  }

  render() {
    return (
      <div>
        <QrReader
            delay={this.state.delay}
            onError={(error) => this.setState({error})}
            onScan={this.handleScan}
            style={{ width: "100%" }}
        />
        {/* <h1 style={{textAlign: "center"}}>
            {this.state.result}
        </h1> */}
      </div>
    );
  }
}

export default QRScan;