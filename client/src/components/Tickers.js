import React, { Component } from "react";

import Graph from "./Graph";
import Ticker from "./Ticker";

class Tickers extends Component {

    constructor(props) {
        super();

        this.state = ({
            search: "",
            symbols: [],
            count: 0,
            maxCount: -1 // Number of symbols in the DB used for rendering component
        })

        this.searchSymbol = this.searchSymbol.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.testSymbol = this.testSymbol.bind(this);
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
                        const requestOptions = {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: this.state.search })
                        };
                        fetch(process.env.REACT_APP_BACKEND, requestOptions)
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
                        .catch(err => console.log(err))
                    } else {
                        alert("Incorrect code")
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

        fetch(process.env.REACT_APP_BACKEND)
            .then(res => res.json().then(data => {
                data.results[1].forEach(symbol => {
                    this.setState(state => {
                        const symbols = state.symbols.concat(symbol.name)
    
                        return {
                            symbols,
                            count: this.state.count + 1,
                            maxCount: data.results[0]
                        }
                    })
                })
            }))
            .catch(err => console.log(err))
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
                            <div class="search"></div>
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
                <h1>Loading...</h1>
            )
        }
    }
}

export default Tickers;