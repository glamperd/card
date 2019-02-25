import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import { Modal, Grid, Typography} from "@material-ui/core";
import { withStyles } from "@material-ui/core";
import { getDollarSubstring } from "../utils/getDollarSubstring";
import CircularProgress from "@material-ui/core/CircularProgress";


const styles = theme => ({
  card: {
    display: "flex",
    flexDirection: "row",
    flexBasis:"100%",
    width: "100%",
    height: "auto",
    marginTop: "-2%",
    justifyContent: "center",
    backgroundColor: "#282b2e",
    elevation: "0",
    square: true,
    color: "white",
    paddingTop: "25%",
    paddingBottom: "25%"
  },
  row: {
    color: "white"
  },
  pending:{
    marginBottom:"3%",
    color:"white"
  },
  clipboard: {
    cursor: "pointer"
  },
  modal:{
      position: "fixed",
      width:"200px",
      height:"100px",
      [theme.breakpoints.down(600)]: {
        marginLeft: "28%",
        marginTop:"22%"
      },
      [theme.breakpoints.up(600)]: {
        marginLeft: "46%",
        marginTop:"75px"
      },
      backgroundColor: "transparent",
      ':focus':{
        outline:"none"
      },
      alignItems:"center",
      textAlign:"center",
      outline:"none"
  },
  progress: {
    ':focus':{
      outline:"none"
    },
    marginTop:"50px",
    marginBottom:"20px",
  },
  progressSmall: {
    ':focus':{
      outline:"none",
      boxShadow:"none"
    },
    [theme.breakpoints.up(600)]: {
      marginLeft: "-78%",
      marginTop:"-10%"
    },
    [theme.breakpoints.down(600)]: {
      marginLeft: "-28%",
      marginTop:"-40%"
    },
    // backgroundColor: "transparent",
    // boxShadow:"none"
  }

  
});

const ProgressModal = ({ classes, handleClick, small, depositing }) => (
  <div>
  { small ? 
  (<Grid>
    {depositing ? 
    (<Grid container direction="column" 
        alignItems="center"
        style={{
          marginTop:"70px",
          position: "absolute",
          backgroundColor: "inherit",
          ':focus':{
            outline:"none"
          }
        }}>
      <CircularProgress
                size={20}
                className={classes.progressSmall}
                color="primary"
                variant="indeterminate"
              />
      </Grid>)
      :
      (null)}
  </Grid>)
  :
  (
    <Modal 
    className={classes.modal}
    onBackdropClick={ handleClick }
    //hideBackdrop={true}
    disablePortal={true}
    open={depositing}
  >
    {/* <Grid container direction="column" 
    style={{
      marginTop:"80px",
      backgroundColor: "transparent",
      ':focus':{
        outline:"none"
      }
    }}> */}
      <Grid item>
      <Typography variant="h6" style={{color:"white", marginTop:"20%",marginBottom: "-20%"}}>Deposit found!</Typography>
      <CircularProgress
          className={classes.progress}
          color="primary"
          variant="indeterminate"
        />
        </Grid>
    {/* </Grid> */}
  </Modal>
  )}
  </div>
);

const ProgressModalWrapped = withStyles(styles)(ProgressModal);

class ChannelCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      depositDetected:false,
      progressSmall:false
    };
  }

  handleClick = async() => {
    console.log("click handled! setting progress spinner to small")
    await this.setState({ progressSmall: true})
    console.log(`setState: ${JSON.stringify(this.state.progressSmall)}`)
  }

  async checkState() {
    const { channelState } = this.props;
    try{
      if (channelState.pendingDepositWeiUser !== "0" || channelState.pendingDepositTokenUser !== "0" ) {
        console.log(``)
        return true;
      } else {
        console.log(`No deposit found :(`)
        return false;
      }
    }catch{
      console.log("No channel state found")
    }
  }

  //withRouter(async ({ history })

  poller = async () => {
    setInterval(async () => {
      var depositing = await this.checkState();
      if (depositing) {
        await this.setState({ depositDetected: true });
        //history.push("/");
      }else{
        await this.setState({ depositDetected: false })
      }
    }, 1000);
  };
  


  componentDidMount = async() => {
    this.poller();
  }


  render() {
    const { classes, channelState } = this.props
    const { depositDetected, progressSmall } = this.state
    const substr = channelState ? getDollarSubstring(channelState.balanceTokenUser) : ["0","00"]
    return (
      <Card className={classes.card}>
      <Grid container direction="column" alignItems="center">
      <ProgressModalWrapped handleClick={() => this.handleClick()} small={progressSmall} depositing={depositDetected} />
       <Grid item>
        <span>
          <Typography inline={true} variant="h5" className={classes.row}>
            {"$ "}
          </Typography>
          <Typography inline={true} variant="h1" className={classes.row}>
            <span>{substr[0]}</span>
          </Typography>
          <Typography inline={true} variant="h3" className={classes.row}>
            <span>{"." + substr[1].substring(0, 2)}</span>
          </Typography>
        </span>
        </Grid>
        </Grid>
      </Card>
    );
  }
}

export default withStyles(styles)(ChannelCard);
