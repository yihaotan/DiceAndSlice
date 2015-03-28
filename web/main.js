function generateCharts(){
    
    airlineEmissionChart = dc.barChart('#dc-airline-emission');
    airlineBubbleChart = dc.bubbleChart('#dc-airline-bubble');
    //airlineProfitChart = dc.lineChart('#dc-airline-profitLine');
    //airlineTaxChart = dc.lineChart('#dc-airline-taxLine');
    //airlineAfterTaxChart = dc.lineChart('#dc-airline-afterTaxLine');
    airlineCompositeChart = dc.compositeChart('#dc-airline-compositeLine')
     
     
    //count inconsistent (.0) for the count not needed
    //color hardcode for bubblechart in dc.js
    //put legend for dc.js 
     d3.csv('final.csv',function(data){
        //read the csv file
        var emissionArray = [];
        //var distanceArray = [];
        //var taxArray =[];
        //var profitArray =[];
        var airlineDistanceMap ={};
        var airlineEmissionMap = {};
        var airlineProfitMap = {};
        data.forEach(function(d){
            d.airlineName = d.Airline_Unique_Name;
            d.airlineKey = d.Airline_Iata_Faa;
            d.profit = Math.round(+(d.Total_Op_Profit_Loss_2013));
            d.distance = Math.round(+(d.Total_Distance_In_Km));
            d.emission = Math.round(+(d.Total_Emission));
            d.tax = 5 * d.emission;
            d.afterTax = d.profit - d.tax;
            d.ratio = +(d.emission / d.distance);
            emissionArray.push(d.emission);
            airlineDistanceMap[d.airlineKey] = d.distance;
            airlineEmissionMap[d.airlineKey] = d.emission;
            airlineProfitMap[d.airlineKey] = d.profit;
            
        });
        var facts = crossfilter(data);
        var all = facts.groupAll();
       
        function getMaxProfit() {
            var maxProfit = d3.max(data, function (d) {
                return d.profit;
            });
            return maxProfit;
        }
        function getMinProfit(){
             var minProfit = d3.min(data, function (d) {
                return d.profit;
            });
            return minProfit;
          
        }
        function getMaxEmission() {
            var maxEmission = d3.max(data, function (d) {
                return d.emission;
            });
            return maxEmission;
        }
        function getMinEmission() {
             var minEmission = d3.min(data, function (d) {
                return d.emission;
            });
            return minEmission;
        }
        function getMaxTax() {
            var maxTax = d3.max(data, function (d) {
                return d.tax;
            });
            return maxTax;
        }
        function getMinTax() {
            var minTax = d3.min(data, function (d) {
                return d.tax;
            });
            return minTax;
        }
        function getMaxDistance() {
            var maxDistance = d3.max(data, function (d) {
                return d.distance;
            });
            return maxDistance;
        }
        function getMinDistance() {
            var minDistance = d3.min(data, function (d) {
                return d.distance;
            });
            return minDistance;
        }
        function getMinAfterTax(){
             var minAfterTax = d3.min(data, function (d) {
                return d.afterTax;
            });
            return minAfterTax;
        }
        function getMaxAfterTax(){
            var maxAfterTax = d3.max(data, function (d) {
                return d.afterTax;
            });
            return maxAfterTax;
        }
        function getMinRatio(){
            var minRatio = d3.max(data, function (d) {
                return d.ratio;
            });
            return minRatio;
        }
        function getMaxRatio(){
            var maxRatio = d3.max(data, function (d) {
                return d.ratio;
            });
            return maxRatio;
        }
        
        var bubbleDimension = facts.dimension(function(d){return d.airlineKey;});
        var bubbleGroup = bubbleDimension.group().reduce(
            function(p,v){
                
                p.distance = p.distance + v.distance;
                p.emission = p.emission + v.emission;
                p.tax = p.tax + v.tax;
                p.afterTax = p.afterTax + v.afterTax;
                p.profit = p.profit + v.profit;
                p.count = p.count + 1;
                p.ratio = p.ratio + v.ratio;
                p.total += v.total;
                return p;
            },
            function (p,v){
                
                p.distance = p.distance - v.distance;
                p.emission = p.emission - v.emission;
                p.tax = p.tax - v.tax;
                p.afterTax = p.afterTax - v.afterTax;
                p.profit = p.profit - v.profit;
                p.count = p.count - 1;
                p.ratio = p.ratio - v.ratio;
                p.total -= v.total;
                return p;
            },
            function(){
                
                return {
                    distance:0,
                    emission:0,
                    tax:0,
                    afterTax:0,
                    profit:0,
                    count:0,
                    ratio:0,
                    total:0
                };
            }    
        );
        emissionArray = crossfilter.quicksort(emissionArray,0,emissionArray.length);
        
        var sortByEmission = crossfilter.quicksort.by(function(d){return -d.emission;});
        var sortByEmissionData = sortByEmission(data,0,data.length);
        
     
        var airlineDistanceDimension = facts.dimension(function(d){return d.airlinKey;});
        var airlineDistanceGroup = airlineDistanceDimension.group().reduceSum(function(d){return d.distance;});
        
        var airlineEmissionDimension = facts.dimension(function(d){return d.airlineKey;});
        var airlineEmissionGroup = airlineEmissionDimension.group().reduceSum(function(d){return d.emission;});
        
        var airlineProfitDimension = facts.dimension(function(d){return d.airlineKey;});
        var airlineProfitGroup = airlineProfitDimension.group().reduceSum(function(d){return d.profit;});
        
        var airlineTaxDimension = facts.dimension(function(d){return d.airlineKey;});
        var airlineTaxGroup = airlineTaxDimension.group().reduceSum(function(d){return d.tax;});
        
        var airlineAfterTaxDimension = facts.dimension(function(d){return d.airlineKey;});
        var airlineAfterTaxGroup = airlineAfterTaxDimension.group().reduceSum(function(d){return d.afterTax;});
        
        function plotAirlineCount(){
            airlineCount = dc.numberDisplay('#dc-airline-count');
            airlineCount.group(airlineEmissionGroup).valueAccessor(function(d){return airlineEmissionDimension.top('Infinity').length;}).formatNumber(d3.format(".0f"));
        }
        function plotDistanceCount(){
            distanceCount = dc.numberDisplay('#dc-distance-count');
            var distanceSum = 0;
            var airlineArray =[];
            distanceCount.group(bubbleGroup).valueAccessor(function(d){
                airlineArray = airlineEmissionDimension.top('Infinity');
                for (var i =0 ; i < airlineArray.length; i++){
                    distanceSum += (airlineDistanceMap[airlineArray[i].airlineKey]);
               
                };
                return distanceSum;
            });
        }
        function plotEmissionCount(){
            emissionCount = dc.numberDisplay('#dc-emission-count');
            var emissionSum = 0;
            var airlineArray = [];
            emissionCount.group(bubbleGroup).valueAccessor(function(d){
                airlineArray = airlineEmissionDimension.top('Infinity');
                for (var i=0; i <airlineArray.length; i++){
                    emissionSum += (airlineEmissionMap[airlineArray[i].airlineKey]);
                }
                return emissionSum;
            });
        }
        function plotProfitCount(){
            profitCount = dc.numberDisplay('#dc-profit-count');
            var profitSum = 0;
            var airlineArray = [];
            profitCount.group(bubbleGroup).valueAccessor(function(d){
                airlineArray = airlineEmissionDimension.top('Infinity');
                for (var i=0; i <airlineArray.length; i++){
                    profitSum += (airlineProfitMap[airlineArray[i].airlineKey]);
                }
                return profitSum;
            });
        }
        //plot the airline emission column chart
        //need to rotate the axis label
        airlineEmissionChart.width(990)
                .height(300)
                .margins({top: 10, right: 10, bottom: 40, left: 50})
                .dimension(airlineEmissionDimension)
                .group(airlineEmissionGroup)
                .transitionDuration(10)
                .xAxisLabel('Airlines') 
                .yAxisLabel('Emission / Tonnes')
                .renderHorizontalGridLines(true)
                .renderTitle(true)
                .title(function (d) {
                    return  d.key + ": " + d.value;
                })
                .colors(d3.scale.ordinal().domain(["0-25", "26-50", "51-75", "75-100"]).range(colorbrewer.Reds[4]))
                .colorAccessor(function (d) {
                    if (d.value < emissionArray[10]) {
                        return "0-25";
                    } else if (d.value < emissionArray[21]) {
                        return "26-50";
                    } else if (d.value < emissionArray[32]) {
                        return "51-75";
                    }
                    return "75-100";
                })
                 .barPadding(0.05)
                .outerPadding([1])
                .x(d3.scale.ordinal().domain(data.map(function (d) {
                    return d.airlineKey;
                })))
                .elasticY(true)
                .xUnits(dc.units.ordinal)
                .xAxis().tickFormat();
        //airlineEmissionChart.onClick = function() {};
        //plot the bubble chart x,y domain not fixed yet
         airlineBubbleChart
            .width(990) 
            .height(500)  
            .margins({top: 10, right: 10, bottom: 40, left: 50})
            .dimension(bubbleDimension)
            .group(bubbleGroup)
            .colors(colorbrewer.RdYlGn[9]) 
            .colorDomain([getMinProfit(), getMaxProfit()]) 
            .colorAccessor(function (d) {
                return d.value.profit;
            })
            .keyAccessor(function (d) {
                return d.value.distance;
            })
            .valueAccessor(function (d) {
                return d.value.emission;
            })
            .radiusValueAccessor(function (d) {
                return d.value.ratio;
            })
            .maxBubbleRelativeSize(20)
            .x(d3.scale.linear().domain([getMinDistance(), getMaxDistance()]))
            .y(d3.scale.linear().domain([getMinEmission(), getMaxEmission()]))
            .r(d3.scale.linear().domain([0,20]))
            .yAxisPadding(200000)
            .xAxisPadding(5000000)
            .elasticX(true)
            .elasticY(true)
            .renderHorizontalGridLines(true) 
            .renderVerticalGridLines(true) 
            .xAxisLabel('Distance / Km') 
            .yAxisLabel('Emission / Tonnes') 
            .renderLabel(true) 
            .label(function (p) {
                return p.key;
            })
            .renderTitle(true) 
            .title(function(d){
                return d.key+": "+"Profit: "+d.value.profit;
            });
            
            
        airlineProfitChart = dc.lineChart(airlineCompositeChart)
            .group(airlineProfitGroup,"BeforeTax Profit")
            .renderDataPoints({radius:3})
            .colors("#2ca25f")
            //.renderArea(true)
    
        airlineTaxChart = dc.lineChart(airlineCompositeChart)
           .group(airlineTaxGroup,"Tax")
            .renderDataPoints({radius:3})
            .colors("#3182bd")
            //.renderArea(true)
          
        airlineAfterTaxChart = dc.lineChart(airlineCompositeChart)
            .group(airlineAfterTaxGroup,"AfterTax Profit")
            .renderDataPoints({radius:3})
            .colors("#e6550d")
            
            //.renderArea(true)
            
           
        airlineCompositeChart
                .width(990)
                .height(300)
                .margins({top: 10, right: 10, bottom: 40, left: 60})
                .dimension(airlineDistanceDimension)
                .x(d3.scale.ordinal().domain(data.map(function (d) {return d.airlineKey;}).sort()))
                .xUnits(dc.units.ordinal)
                .yAxisLabel("USD")
                .xAxisLabel("Airlines")
                .yAxisPadding(200000)
                 .renderVerticalGridLines(true)
                .renderHorizontalGridLines(true)
                .renderlet(function(chart){
                     chart.selectAll("g.x text")
                      .attr('dx', '-10');
                
                })
                        
                .elasticY(true)
                .compose([airlineProfitChart,airlineTaxChart,airlineAfterTaxChart])
                .legend(dc.legend().x(880).y(10).itemHeight(13).gap(5))
        
        //plot the composite graph
        /*airlineCompositeChart
            .width(990)
            .height(300)
            .margins({top: 10, right: 10, bottom: 40, left: 60})
            .dimension(airlineDistanceDimension)
            .x(d3.scale.ordinal().domain(data.map(function (d) {return d.airlineKey;}).sort()))
            .xUnits(dc.units.ordinal)
            .yAxisLabel("USD")
            //.y(d3.scale.linear().domain([getMinAfterTax()-500000, getMaxAfterTax()+500000]))
             .elasticY(true)
            .xAxisLabel("Airlines")
            .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
             //.shareTitle(false)
            .yAxisPadding(200000)
            .renderTitle(true)
            .renderHorizontalGridLines(true)
            .compose([
                dc.lineChart(airlineCompositeChart)
                    .dimension(airlineProfitDimension)
                    .group(airlineProfitGroup,'Profit')
                    .x(d3.scale.ordinal().domain(data.map(function (d) {return d.airlineKey;}).sort()))
                    .xUnits(dc.units.ordinal)
                    .colors('red')
                    .title(function(d){
                        return d.key +":" +d.value;
                    })
                    .renderTitle(true)
                    .renderDataPoints({radius:5})
                        
                ,dc.lineChart(airlineCompositeChart)
                    .dimension(airlineTaxDimension)
                    .group(airlineTaxGroup,"Tax")
                    .x(d3.scale.ordinal().domain(data.map(function (d) {return d.airlineKey;}).sort()))
                    .xUnits(dc.units.ordinal)
                    .title(function(d){
                        return d.key +":" +d.value;
                    })
                    .renderTitle(true)
                    .renderDataPoints({radius:5})
                    .colors('blue')
                    
                    

                ])*/
                

       
        /*airlineCompositeChart.width(900)
            .height(300)
            .margins({top: 10, right: 10, bottom: 30, left:55})
            .dimension(airlineAfterTaxDimension)
            .y(d3.scale.linear().domain([getMinAfterTax()-500000, getMaxAfterTax()+500000]))
            .x(d3.scale.ordinal().domain(data.map(function (d) {return d.airlineKey;}).sort()))
            .xUnits(dc.units.ordinal)
            .shareTitle(true)
            .compose([dc.lineChart(airlineCompositeChart)
                     .interpolate('linear')
                     .group(airlineProfitGroup,'Before Tax')
                      .colors('green')
                      .renderTitle(true)
                     
             ,
             dc.lineChart(airlineCompositeChart)
                     .interpolate('linear')
                     .group(airlineTaxGroup,'Tax')
                     .colors('blue')
                     .renderTitle(true) 
             ,
             dc.lineChart(airlineCompositeChart)
                     .interpolate('linear')
                     .group(airlineAfterTaxGroup,'After Tax')
                      .renderDataPoints({radius: 5})
                     .colors('red')
                     .renderTitle(true)
            ])
          .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))*/
            
            
        //bind the event
        airlineEmissionChart.on('filtered',function(){
            plotAirlineCount();
            plotDistanceCount();
            plotEmissionCount();
            plotProfitCount();
            dc.redrawAll();
        });
        airlineBubbleChart.on('filtered',function(){
            plotAirlineCount();
            plotDistanceCount();
            plotEmissionCount();
            plotProfitCount();
            dc.redrawAll();
        });
        
        /*dc.dataCount('.dc-data-count')
            .dimension(facts)
            .group(all);*/
      
        plotAirlineCount();
        plotDistanceCount();
        plotEmissionCount();
        plotProfitCount();
        dc.renderAll();
         
         
         
         
        /*airlineDistanceChart.width(990)
            .height(300)
            .margins({top: 10, right: 10, bottom: 20, left:35})
            .dimension(airlineDistanceDimension)
            .group(airlineDistanceGroup)
            .transitionDuration(10)
            .renderTitle(true)
            .title(function (d) {
                return  d.key + ": " + d.value;
            })
            .centerBar(true)
            .barPadding(0.05)
            .outerPadding([1])
            .x(d3.scale.ordinal().domain(data.map(function (d) {return d.airline; })))
            .xUnits(dc.units.ordinal)
            .elasticY(true)
            .xAxis().tickFormat();*/
    
        //airlineDistanceChart.onClick = function() {};
        
    });
    
    
    
}

