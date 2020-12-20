import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import Graph from "./Graph";
import Ticker from "./Ticker";

class Tickers extends Component {

    constructor() {
        super();

        this.state = ({
            socket: null,
            err: null,
            search: "",
            symbols: [],
            count: 0,
            maxCount: -1, // Number of symbols in the DB used for rendering component
        })

        this.searchSymbol = this.searchSymbol.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.testSymbol = this.testSymbol.bind(this);
        this.configureSocket = this.configureSocket.bind(this);
    }

    // Connect socket and pull in Tickers
    componentDidMount() {
        this.setState({
            symbols: [],
            err: null,
            search: "",
        })
        this.configureSocket();
    }

    componentWillUnmount() {
        this.state.socket.disconnect();
    }

    configureSocket = () => {
        let socket = socketIOClient(process.env.REACT_APP_BACKEND);

        socket.on("connection", () => {
            console.log("Backend connected");
        })

        socket.on("connect_error", error => {
            console.log(error);
            this.setState({
                err: error
            })
        })

        socket.on("connect_failed", err => {
            this.setState({
                err: err
            })
        })

        // Get tickers from DB
        socket.on("symbol_list", res => {

            if (res.msg === "error") {
                this.setState({
                    err: "Error retrieving tickers"
                })
            } else {
                this.setState({
                    symbols: [],
                    count: 0,
                    maxCount: 0
                })
    
                res.data[1].forEach(symbol => {
                    this.setState(state => {
                        const symbols = state.symbols.concat(symbol.name);
    
                        return {
                            symbols,
                            count: this.state.count + 1,
                            maxCount: res.data[0]
                        }
                    })
                })
            }
        });

        // Response from socket on new ticker request
        socket.on("created", res => {
            if (res.msg === "success") {
                socket.emit("update");
            } else {
                this.setState({
                    err: "Error on creation" 
                })
            }
        })

        // Response from socket on delete ticker request
        socket.on("deleted", res => {
            if (res.msg === "success") {
                socket.emit("update");
            } else {
                this.setState({
                    err: "Error on deletion"
                })
            }
        })

        // Hold socket in state to reference across component
        this.setState({
            socket: socket
        })
    }

    async searchSymbol() {

        if (this.state.symbols.includes(this.state.search)) {
            alert("You already have this symbol.");
        } else {
            if (this.state.search.length < 2) {
                alert("Symbol length too short.");
            } else if (this.state.search.length > 5) {
                alert("Symbol length too long.");
            } else {

                // Check if input is a valid ticker
                let goodCode = await this.testSymbol(this.state.search);
                if (goodCode.quandl_error) {
                    alert("Bad code");
                } else {
                    if (goodCode) {
                        this.state.socket.emit("createTicker", this.state.search);
                    } else {
                        alert("Bad code")
                    }
                }
            }
        }
    }

    // Before adding Ticker to DB sends API request to check if the symbol is valid.
    async testSymbol(symbol) {
        const response = await fetch("https://www.quandl.com/api/v3/datasets/EOD/" + symbol + "?start_date=2016-02-02&end_date=2016-02-03&api_key=" + process.env.REACT_APP_QUANDL_KEY);
        const json = await response.json();
        return json;
        
    }

    handleSearchChange(e) {

        let value = e.target.value;

        value = value.replace(/[^A-Za-z]/ig, '') // Allow only letters
        this.setState({
            search : value.toUpperCase(),
        })
    }

    handleDelete(name) {

        this.state.socket.emit("deleteTicker", name);

    }

    render() {

        // Allow tickers have been populated so load view
        if (this.state.count === this.state.maxCount) {
            return (
                <div id="tickers">
                    <Graph symbols={this.state.symbols}/>
                    <div id="tickerSearch">
                        <input 
                            type="text" 
                            name="search" 
                            placeholder="Search..." 
                            value={this.state.search} 
                            onChange={this.handleSearchChange}/>
                            <div className="search"></div>
                        <button type="submit" onClick={this.searchSymbol}>Search</button>
                    </div>
                    {this.state.err === null ? "" : <div>{this.state.err}</div>}
                    <div id="tickersContainer">
                        {this.state.symbols.map((symbol, i) => {
                            return (<Ticker name={symbol} key={symbol} handleDelete={this.handleDelete} />)
                        })}
                    
                    </div>
                    
                </div>
            )
        } else { // tickers still loading or connection not yet made
            return (
                <div>
                    <h1>Loading...</h1>
                </div>
            )
        }
    }
}

export default Tickers;