import React, { Component } from "react";
import QrCode from "qrcode.react";
 
class QRGenerate extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <QrCode
            value={this.props.value}
            size={256}
        />
    );
  }
}

export default QRGenerate;