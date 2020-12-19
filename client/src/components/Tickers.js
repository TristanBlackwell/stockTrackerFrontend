import React, { Component } from "react";
import socketIOClient, { io } from "socket.io-client";
import Graph from "./Graph";
import Ticker from "./Ticker";

class Tickers extends Component {

    constructor(props) {
        super();

        this.state = ({
            socket: null,
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

    configureSocket = () => {
        let socket = socketIOClient(process.env.REACT_APP_BACKEND);

        socket.on("connection", () => {
            console.log("Backend connected");
        })

        socket.on("symbol_list", res => {
            this.setState({
                symbols: [],
                count: 0,
                maxCount: 0
            })

            res[1].forEach(symbol => {
                this.setState(state => {
                    const symbols = state.symbols.concat(symbol.name);

                    return {
                        symbols,
                        count: this.state.count + 1,
                        maxCount: res[0]
                    }
                })
            })
        });

        socket.on("created", data => {
            if (data.msg === "Symbol saved") {
                socket.emit("update");
            }
        })

        socket.on("deleted", data => {
            if (data.msg === "Symbol deleted") {
                socket.emit("update");
            }
        })

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

                let goodCode = await this.testSymbol(this.state.search);
                if (goodCode.quandl_error) {
                    alert("Bad code");
                } else {
                    if (goodCode) {
                        this.state.socket.emit("createTicker", this.state.search);

                        /*fetch(process.env.REACT_APP_BACKEND, requestOptions)
                            .then(res => res.json())
                            .then(res => {
                                if (res.created === false) {
                                    alert(res.msg);
                                } else {
                                    console.log(res.msg)
                                    this.setState(state => {
                                        const symbols = state.symbols.concat(state.search);
                    
                                        return {
                                            symbols
                                        }
                                    })
                                }
                            })
                        .catch(err => console.log(err))*/
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

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name })
        };

        this.state.socket.emit("deleteTicker", name);

        fetch(process.env.REACT_APP_BACKEND + "delete", requestOptions)
            .then(res => res.json())
            .then(res => {
                if (res.deleted === false) {
                    alert(res.msg);
                } else {
                    console.log(res.msg);
                    this.setState(state => {
                        const symbols = state.symbols.filter(symbol => {
                            return symbol !== name;
                        });
            
                        return {
                            symbols
                        }
                    })
                }
            })
            .catch(err => console.log(err));
    }

    componentDidMount() {
        this.configureSocket();
    }

    componentWillUnmount() {
        this.socket.disconnect();
    }

    render() {

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
                    <div id="tickersContainer">
                        {this.state.symbols.map((symbol, i) => {
                            return (<Ticker name={symbol} key={symbol} handleDelete={this.handleDelete} />)
                        })}
                    
                    </div>
                    
                </div>
            )
        } else {
            return (
                <div>
                    <h1>Loading...</h1>
                </div>
            )
        }
    }
}

export default Tickers;