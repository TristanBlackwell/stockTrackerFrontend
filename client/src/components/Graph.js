import React, { Component } from "react";
import ReactHighChart from 'react-highcharts/ReactHighstock.src'

class Graph extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tickerData: [], // Holds the stock data pulled from quandl
            options : {
                xAxis: {
                    type: "datetime"
                },
                title: {
                  text: ''
                },
                series: []
              }
        }
    }

    componentDidMount() {

        // Ticker symbols are passed as props from parent in order to poll for individual symbols.
        // ***
        // Symbols and Dates are very limited with the free Quandl API making this purely demonstrative
        // ***
        this.props.symbols.forEach(async (symbol) => {
            const response = await fetch("https://www.quandl.com/api/v3/datasets/EOD/" + symbol + "?start_date=2017-01-01&end_date=2020-12-01&api_key=" + process.env.REACT_APP_QUANDL_KEY);
            const json = await response.json();
            this.setState(state => {
                const tickerData = state.tickerData.concat(json);

                let tickerItem = [] 

                // For every day, create an array of that date and the close price.
                // Data is reversed as API brings in latest date first.
                json.dataset.data.slice().reverse().forEach(day => {
                    let date = day[0].toString();
                    date = date.split("-");
                    let close = day[4];

                    let item = [Date.UTC(parseInt(date[0]), parseInt(date[1]), parseInt(date[2])), close]
                    tickerItem.push(item);   
                })

                // Ensure that loaded symbols are not unnecessarily re-added on state changes.
                let match = false;
                let options = state.options;
                let series = options.series;
                series.forEach(item => {
                    if (item.name === symbol) {
                        match = true;
                    }
                })
                if (!match) {
                    options.series.push({ name: symbol, data: tickerItem });
                }
                
                return {
                    tickerData,
                    options
                }
            })
        })
    }

    render() {
        return (
            <div id="graphContainer">
                <div id="graphArea">
                <ReactHighChart config={this.state.options}/>
                </div>
            </div>
        )
    }
}

export default Graph;