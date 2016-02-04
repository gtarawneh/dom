window.onload = function () {

  //$("#writingarea").css("color", "red");

  $("#writingarea").focus();

  drawGraph();

}

// global vars

var nodeArr = [], edgeArr = [];
var nodeMap = {}; // maps node name to node object
var nodes, edges, nodeLabels, force, svg;

// functions

function drawGraph() {

    var w = 400, h = w;

    force = d3.layout.force().nodes(nodeArr).links(edgeArr).size([w, h])
                    .linkDistance([150]).charge([-500]).start();

    svg = d3.select("#grapharea").append("svg").attr("width", w).attr("height", h);
    edges = svg.selectAll("line").data(edgeArr);
    nodes = svg.selectAll("circle").data(nodeArr);
    nodeLabels = svg.selectAll("text").data(nodeArr);

    updateSVG();

    force.on("tick", onForceTick);

    $('#writingarea').on("input", onTextChange);

}

function onForceTick() {

    edges.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    nodes.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    nodeLabels.text(function (d) { return d.name.substring(1, d.name.length-1); })
       .attr("x", function(d) { return d.x; })
       .attr("y", function(d) { return d.y - 20; });

 }


function addNode(nodeName) {

    nodeObj = {name: nodeName};

    nodeArr.push(nodeObj);

    nodeMap[nodeName] = nodeObj;

}


function onTextChange() {

    var txt = $('#writingarea').val();

    var result = "";

    var re = /\[[a-zA-Z]+\]/g;

    var m;

    var newNodes = [];

    while ((m = re.exec(txt)) !== null) {

        if (m.index === re.lastIndex) re.lastIndex++;

        result = result + m ;

        newNodes.push(m[0]);

    }

    // remove any deleted nodes:

    // loop through nodeArr (backwards), any nodes which do not exist in
    // newNodes must have been removed

    var anyChanges = false;

    for (var i=nodeArr.length-1; i>=0; i--) {

        if (newNodes.indexOf(nodeArr[i].name) == -1) {

            nodeArr.splice(i, 1);

            anyChanges = true;
        }

    }

    // add new nodes

    // create array `nodeNamesToAdd` of node objects to add

    var nodeNameArr = nodeArr.map(function (el) { return el.name;});

    var nodeNamesToAdd = $(newNodes).not(nodeNameArr).get();

    // loop through elements in `nodeNamesToAdd` adding them to nodeArr

    nodeNamesToAdd.map(function (el) {
        nodeArr.push({name: el});
        anyChanges = true;
    });

    $('#console1').text(result);

    if (anyChanges) updateSVG();

}


function updateSVG() {

    edges = edges.data(force.links());
    nodes = nodes.data(force.nodes());
    nodeLabels = nodeLabels.data(force.nodes());

    edges.exit().remove();
    nodes.exit().remove();
    nodeLabels.exit().remove();

    edges.enter()
         .append("line")
         .style("stroke", "#ccc")
         .style("stroke-width", 1);

    nodes.enter()
        .append("circle")
        .attr("r", 10)
        .style("stroke", "black")
        .style("fill", "white")
        .call(force.drag);

    nodeLabels.enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .attr("user-select", "none")
        .attr("cursor", "default ")
        .call(force.drag);

    force.start();

}
