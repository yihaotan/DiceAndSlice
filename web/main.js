function generateCharts(){
    //airlineCount;
    //distanceCount = dc.numberDisplay('#dc-distance-count');
    
    airlineEmissionChart = dc.barChart('#dc-airline-emission');
    airlineBubbleChart = dc.bubbleChart('#dc-airline-bubble');
    //airlineDistanceChart = dc.barChart('#dc-airline-distance');
    //var emissionCount = dc.numberDisplay('#dc-emission-count');
    //var profitCount = dc.numberDisplay('#dc-profit-count');
    
    d3.csv('sample.csv',function(data){
        //read the csv file
        var emissionArray = [];
        var distanceArray = [];
        var taxArray =[];
        var profitArray =[];
        var airlineDistanceMap ={};
        
        data.forEach(function(d){
            d.airline = d.Airline;
            d.emission = +d.Emission;
            d.profit = +d.Profit;
            d.tax = +d.Tax;
            d.afterTax = +d.AfterTax;
            d.distance = +d.Distance;
            emissionArray.push(d.emission);
            airlineDistanceMap[d.airline] = d.distance;
        });
        var facts = crossfilter(data);
        var all = facts.groupAll();
       
        emissionArray = crossfilter.quicksort(emissionArray,0,emissionArray.length);
        function getMaxProfit() {
            var maxProfit = d3.max(data, function (d) {
                return d.profit;
            });
            return maxProfit;
        }
        function getMinProfit(){
             var minProfit = d3.max(data, function (d) {
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
        function getMaxTax(data) {
            var maxTax = d3.max(data, function (d) {
                return d.tax;
            });
            return maxTax;
        }
        function getMinTax(data) {
            var minTax = d3.min(data, function (d) {
                return d.tax;
            });
            return minTax;
        }
        function getMaxDistance(data) {
            var maxDistance = d3.max(data, function (d) {
                return d.distance;
            });
            return maxDistance;
        }
        function getMinDistance(data) {
            var minDistance = d3.max(data, function (d) {
                return d.distance;
            });
            return minDistance;
        }
       
        
        // For the bubble chart
        var bubbleDimension = facts.dimension(function(d){return d.airline;});
        var bubbleGroup = bubbleDimension.group().reduce(
            function(p,v){
                
                p.distance = p.distance + v.distance;
                p.emission = p.emission + v.emission;
                p.tax = p.tax + v.tax;
                p.profit = p.profit + v.profit;
                p.count = p.count + 1;
                p.index = p.emission/p.distance;
                p.total += v.total;
                return p;
            },
            function (p,v){
                
                p.distance = p.distance - v.distance;
                p.emission = p.emission - v.emission;
                p.tax = p.tax - v.tax;
                p.profit = p.profit - v.profit;
                p.count = p.count - 1;
                p.index = p.emission/p.distance;
                p.total -= v.total;
                return p;
            },
            function(){
                
                return {
                    distance:0,
                    emission:0,
                    tax:0,
                    profit:0,
                    count:0,
                    index:0,
                    total:0
                };
            }
               
        );
        emissionArray = crossfilter.quicksort(emissionArray,0,emissionArray.length);
        var sortByEmission = crossfilter.quicksort.by(function(d){return -d.emission;});
        var sortByEmissionData = sortByEmission(data,0,data.length);

        var airlineDistanceDimension = facts.dimension(function(d){return d.airline;});
        var airlineDistanceGroup = airlineDistanceDimension.group().reduceSum(function(d){return d.distance;});
        
        var airlineEmissionDimension = facts.dimension(function(d){return d.airline;});
        var airlineEmissionGroup = airlineEmissionDimension.group().reduceSum(function(d){return d.emission;});
        
        //number display for airline count //buggy
        function plotAirlineCount(){
            airlineCount = dc.numberDisplay('#dc-airline-count');
            airlineCount.group(airlineEmissionGroup).valueAccessor(function(d){return airlineEmissionDimension.top('Infinity').length;});
        }
        function plotDistanceCount(){
            distanceCount = dc.numberDisplay('#dc-distance-count');
            //var distanceArray = [];
            var distanceSum = 0;
            var airlineArray =[];
            distanceCount.group(bubbleGroup).valueAccessor(function(d){
                airlineArray = airlineEmissionDimension.top('Infinity');
                for (var i =0 ; i < airlineArray.length; i++){
                    distanceSum += (airlineDistanceMap[airlineArray[i].airline]);
               
                };
                return distanceSum;
            });
        }
        function plotEmissionCount(){
            
        }
        function plotProfitCount(){
            
        }
        //distanceCount.group(all).valueAccessor(function(d){return airlineEmissionDimension.top('Infinity').length});
        
        //bind the event
        airlineEmissionChart.on('filtered',function(){
            //airlineCount.group(all).valueAccessor(function(d){airlineEmissionDimension.top('Infinity').length});
            plotAirlineCount();
            plotDistanceCount();
            dc.redrawAll();
        });
        airlineBubbleChart.on('filtered',function(){
            plotAirlineCount();
            plotDistanceCount();
            dc.redrawAll();
        });
        
       
         
        
        //plot the airline emission column chart
        airlineEmissionChart.width(990)
            .height(300)
            .margins({top: 10, right: 10, bottom: 20, left:55})
            .dimension(airlineEmissionDimension)
            .group(airlineEmissionGroup)
            .transitionDuration(10)
            .renderTitle(true)
            .title(function (d) {
                return  d.key + ": " + d.value;
            })
            .colors(d3.scale.ordinal().domain(["0-25","26-50","51-75","75-100"]).range(colorbrewer.Reds[4]))                  
            .colorAccessor(function(d) { 
                if(d.value < emissionArray[16]){
                    return "0-25";
                }else if(d.value < emissionArray[32]){
                    return "26-50";
                }else if(d.value < emissionArray[50]){
                    return "51-75";
                }
                return "75-100";
             })
            .centerBar(true)
            .barPadding(0.05)
            .outerPadding([1])
            .x(d3.scale.ordinal().domain(data.map(function (d) {return d.airline; })))
            .xUnits(dc.units.ordinal)
            .elasticY(true)
            .brushOn(false)
            .xAxis().tickFormat();
    
        //airlineEmissionChart.onClick = function() {};
    
        //plot the bubble chart
         airlineBubbleChart
            .width(990) 
            .height(500)  
            .margins({top: 10, right: 50, bottom: 40, left: 50})
            .dimension(bubbleDimension)
            .group(bubbleGroup)
            .colors(colorbrewer.RdYlGn[9]) 
            .colorDomain([-194246, 499954]) 
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
                return d.value.index;
            })
            .maxBubbleRelativeSize(5)
            .x(d3.scale.linear().domain([0, getMaxDistance(data)+1000]))
            .y(d3.scale.linear().domain([0, getMaxEmission(data)+1000]))
            .r(d3.scale.linear().domain([0, 9000]))
            .elasticY(true)
            .elasticX(true)
            .yAxisPadding(100)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true) 
            .renderVerticalGridLines(true) 
            .xAxisLabel('Distance') 
            .yAxisLabel('Emission') 
            .renderLabel(true) 
            .label(function (p) {
                return p.key;
            })
            .renderTitle(true) 
            .title(function(d){
                return d.key+": "+"Profit: "+d.value.profit;
            })
           
         plotAirlineCount();
         plotDistanceCount();
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

