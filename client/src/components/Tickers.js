import React, { Component } from "react";

import Ticker from "./Ticker";

class Tickers extends Component {

    constructor(props) {
        super();

        this.state = ({
            search: "",
            symbols: ["AAPL", "MSFT", "INTC", "MMM"]
        })

        this.searchSymbol = this.searchSymbol.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    searchSymbol(e) {
        if (this.state.symbols.includes(this.state.search)) {
            alert("You already have this symbol.");
        } else {
            console.log("Search: " + this.state.search);
            this.setState(state => {
                const symbols = state.symbols.concat(state.search);

                return {
                    symbols
                }
            })
        }
    }

    handleSearchChange(e) {
        this.setState({
            search : e.target.value.toUpperCase(),
        })
    }

    handleDelete(name) {
        console.log("Delete: " + name);
        this.setState(state => {
            const symbols = state.symbols.filter(symbol => {
                return symbol != name;
            });

            return {
                symbols
            }
        })
    }

    componentDidMount() {
    
        {/*this.state.symbols.forEach((symbol) => {
            fetch("https://cors-anywhere.herokuapp.com/https://www.quandl.com/api/v3/datasets/EOD/" + symbol + "?start_date=2017-12-28&end_date=2017-12-28&api_key=BzYF1zaPpg73abPyvrp4")
            .then(res => res.json())
            .then(json => console.log(json))
        })*/}
    }

    render() {
        return (
            <div id="tickers">
                <div id="tickerSearch">
                    <input type="text" name="search" placeholder="Enter Symbol" onChange={this.handleSearchChange}/>
                    <button type="submit" onClick={this.searchSymbol}>Search</button>
                </div>
                <div id="tickersContainer">
                    {this.state.symbols.map((symbol, i) => {
                        return (<Ticker name={symbol} key={symbol} handleDelete={this.handleDelete} />)
                    })}
                    
                </div>
            </div>
        )
    }
}

export default Tickers;