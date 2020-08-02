var interval;

function showMap() {
    f = document.getElementById("fromrange").value.split("-");
    t = document.getElementById("torange").value.split("-");
    interval = '' + parseInt(f[0]) + '.' + parseInt(f[1]) + '-' + '' + parseInt(t[0]) + '.' + parseInt(t[1])
    plot(f, t);
}

var w = 800;
var h = 650;
var proj = d3.geo.mercator();
var path = d3.geo.path().projection(proj);
var t = proj.translate();
var s = proj.scale()
var color_white = ["#00000"]
var buckets = 10,
    colors = ["#fdfae5", "#faf3c0", "#f5ea92", "#f3e260", "#f5dd29", "#f2d600", "#e6c60d", "#d9b51c", "#cca42b", "#bd903c"];
var map = d3.select("#chart").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .call(initialize);
var india = map.append("svg:g")
    .attr("id", "india");
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


function plot(f, t) {
    if ((document.getElementById('legend')) !== null) {
        var el = document.getElementById('legend');
        el.remove();
    }
    if ((document.getElementById('india')) !== null) {
        var el = document.getElementById('india');
        el.querySelectorAll('*').forEach(n => n.remove());
    }
    if (document.getElementById("district").checked == false) {
        d3.json("json/states.json", function (json) {
            d3.json("http://api.nightlights.io/months/" + interval + "/states", function (j) {
                if (j == null || (f[0] > t[0] && f[1] <= t[1])) {
                    alert("Select only between Jan 1993 and  Dec 2013");
                    location.reload();
                    return false;
                }
                json.features.forEach(element => {
                    var t = 0;
                    j.forEach(e => {
                        if (e.key.split("-").join("").split("&").join("and") == element.id.toLowerCase().split(" ").join("")) {
                            if (document.getElementById("state").value == "All") {
                                t = t + e.count;
                            } else {
                                if (document.getElementById("state").value == element.id) {
                                    t = t + e.count;
                                }
                            }
                        }
                    })
                    element.total = t.toString();
                });
            });
            setTimeout(() => {
                var maxTotal = d3.max(json.features, function (d) { return d.total });
                var colorScale = d3.scale.quantile()
                    .domain(d3.range(buckets).map(function (d) { return (d / buckets) * maxTotal }))
                    .range(colors);
                var y = d3.scale.sqrt()
                    .domain([0, maxTotal])
                    .range([0, 300]);
                var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickValues(colorScale.domain())
                    .orient("right");
                india.selectAll("path")
                    .data(json.features)
                    .enter().append("path")
                    .attr("d", path)
                    .style("fill", colors[0])
                    .style("opacity", 0.5)
                    .on('mouseover', function (d, i) {
                        d3.select(this).transition().duration(300).style("opacity", 1);
                        div.transition().duration(300)
                            .style("opacity", 1)
                        div.text(d.id + " : " + d.total)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 30) + "px");
                    })
                    .on('mouseleave', function (d, i) {
                        d3.select(this).transition().duration(300)
                            .style("opacity", 0.5);
                        div.transition().duration(300)
                            .style("opacity", 0);
                    })
                india.selectAll("path").transition().duration(1000)
                    .style("fill", function (d) { return colorScale(d.total); });
                var g;
                g = india.append("g")
                    .attr("class", "key")
                    .attr('id', 'legend')
                    .attr("transform", "translate(100, 20)")
                    .call(yAxis);
                g.selectAll("rect")
                    .data(colorScale.range().map(function (d, i) {
                        return {
                            y0: i ? y(colorScale.domain()[i - 1]) : y.range()[0],
                            y1: i < colorScale.domain().length ? y(colorScale.domain()[i]) : y.range()[1],
                            z: d
                        };
                    }))
                    .enter().append("rect")
                    .attr("width", 7)
                    .attr("y", function (d) { return d.y0; })
                    .attr("height", function (d) { return d.y1 - d.y0; })
                    .style("fill", function (d) { return d.z; });

            }, 2000);
        });
    } else if (document.getElementById("state").value != "All") {

        d3.json("json/districts.json", function (json) {
            if ((f[0] > t[0] && f[1] <= t[1])) {
                alert("Select only between Jan 1993 and  Dec 2013");
                location.reload();
                return false;
            }
            var localjson;
            if (document.getElementById("state").value == "Jammu and Kashmir") {
                d3.json("http://api.nightlights.io/months/2010.3-2010.4/states/jammu-&-kashmir/districts", function (j) {
                    localjson = j;
                });
            }
            else {
                d3.json("http://api.nightlights.io/months/2010.3-2010.4/states/" + document.getElementById("state").value.toLowerCase().split(" ").join("-") + "/districts", function (j) {
                    localjson = j;
                });
            }
            setTimeout(() => {
                var mx, cS, yA, yy;
                india.selectAll("path")
                    .data(json.features)
                    .enter().append("path")
                    .attr("d", path)
                    .style("fill", color_white[0])
                    .style("opacity", 0.5)
                    .append("title")
                    .text(function (d) {
                        return d.properties.NAME_1 + " " + d.properties.NAME_2;
                    })
                india.selectAll("path").transition().duration(1000)
                    .style("fill", function (d) {
                        temp1 = Object.values(localjson);
                        var t = 0;
                        mx = d3.max(temp1, function (e) { return e.count });
                        cS = d3.scale.quantile()
                            .domain(d3.range(buckets).map(function (d) { return (d / buckets) * mx }))
                            .range(colors);
                        yy = d3.scale.sqrt()
                            .domain([0, mx])
                            .range([0, 300]);
                        yA = d3.svg.axis()
                            .scale(yy)
                            .tickValues(cS.domain())
                            .orient("right");
                        temp1.forEach(element => {
                            if (typeof d.properties.NAME_1 != 'undefined') {
                                if (d.properties.NAME_1.toLowerCase() == document.getElementById("state").value.toLowerCase()) {
                                    if (element.key.split("-").pop() == d.properties.NAME_2.toLowerCase()) {
                                        t = t + element.count;
                                    }
                                }
                            }
                        });
                        return cS(t);
                    });
                var g;
                g = india.append("g")
                    .attr("class", "key")
                    .attr('id', 'legend')
                    .attr("transform", "translate(100, 20)")
                    .call(yA);
                g.selectAll("rect")
                    .data(cS.range().map(function (d, i) {
                        return {
                            y0: i ? yy(cS.domain()[i - 1]) : yy.range()[0],
                            y1: i < cS.domain().length ? yy(cS.domain()[i]) : yy.range()[1],
                            z: d
                        };
                    }))
                    .enter().append("rect")
                    .attr("width", 7)
                    .attr("y", function (d) { return d.y0; })
                    .attr("height", function (d) { return d.y1 - d.y0; })
                    .style("fill", function (d) { return d.z; });
            }, 1000);
        });
    }
    else {
        alert("To see data for districts, select particular state");
    }
}

function initialize() {
    proj.scale(6700);
    proj.translate([-1000, 780]);
}