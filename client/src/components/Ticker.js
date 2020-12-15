import React, { Component } from "react";

class Ticker extends Component {

    constructor(props) {
        super();
    }

    deleteTicker(e) {
       
    }

    render() {
        return (
            <div id="tickerContainer">
                <h3>{this.props.name}</h3>
                <button onClick={()=>this.props.handleDelete(this.props.name)}>X</button>
            </div>
        )
    }
}

export default Ticker;