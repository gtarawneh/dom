window.onload = function () {

  $("#writingarea").focus();

  drawGraph();

}

// global vars

var nodeArr = [], edgeArr = [];
var nodes, edges, nodeLabels, force, svg;

// functions

function onWindowResize() {

    var w = $('#svg1').width();
    var h = $('#svg1').height();

    force.size([w, h]);

}

function drawGraph() {

    var w = 400, h = w;

    force = d3.layout.force().nodes(nodeArr).links(edgeArr).size([w, h])
                    .linkDistance([75]).charge([-500]).start();

    svg = d3.select("#grapharea").append("svg").attr("width", "100%").attr("height", "100%").attr("id", "svg1");

    $(window).resize(onWindowResize);

    onWindowResize();

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

    nodeLabels.text(function (d) { return d.name; })
       .attr("x", function(d) { return d.x; })
       .attr("y", function(d) { return d.y - 20; });

 }

 function getRegexMatches(txt, re) {

     var matches = [];

     var m;

     while ((m = re.exec(txt)) !== null) {

         if (m.index === re.lastIndex) re.lastIndex++;

         matches.push(m[0]);

     }

     return matches;

 }

 function getRegexMatchesGroups(txt, re) {

    var matches = [];

    var m;

    while ((m = re.exec(txt)) !== null) {

        if (m.index === re.lastIndex) re.lastIndex++;

        matches.push(m);

    }

    return matches;

 }

function onTextChange() {

    const txt = $('#writingarea').val();

    var labelDefs = {};  // name -> label

    const nodeMatches = getRegexMatchesGroups(txt, /\[([a-zA-Z]+)(:([^\].]+))?\]/g);

    var newNodesAll = nodeMatches.map(function (el) {
        var nodeName = el[3] || el[1];
        labelDefs[el[1]] = nodeName;
        return nodeName;
    });

    // keep unique values (NB this is a poor way of doing it, will work for now)

    var newNodes = newNodesAll.filter(function (el, pos) {
        return pos == newNodesAll.indexOf(el);
    })

    // remove any deleted nodes:

    // loop through nodeArr (backwards), any nodes which do not exist in
    // newNodes must have been removed

    for (var i=nodeArr.length-1; i>=0; i--) {

        if (newNodes.indexOf(nodeArr[i].name) == -1) {

            console.log('removed node: ' + nodeArr[i].name);

            nodeArr.splice(i, 1);
        }

    }

    // add new nodes

    // create array `nodeNamesToAdd` of node objects to add

    var nodeNameArr = nodeArr.map(function (el) { return el.name;});

    var nodeNamesToAdd = $(newNodes).not(nodeNameArr).get();

    // loop through elements in `nodeNamesToAdd` adding them to nodeArr

    nodeNamesToAdd.map(function (el) {
        nodeArr.push({name: el});
        console.log('added node: ' + el);
    });

    // scan for edges

    // first, update nodeNameArr to reflect any changes made above

    nodeNameArr = nodeArr.map(function (el) { return el.name;});

    // second, parse for edge specifications

    var newEdges = getRegexMatches(txt, /\[[a-zA-Z]+-[a-zA-Z]+\]/g);

    // lastly, re-populate edgeArr ...

    edgeArr.splice(0, edgeArr.length);

    newEdges.map(function (el) {

        var p = parseEdgeStr(el);
        const node1 = labelDefs[p.source];
        const node2 = labelDefs[p.target];
        var srcInd = nodeNameArr.indexOf(node1);
        var tgtInd = nodeNameArr.indexOf(node2);

        if (srcInd != -1 && tgtInd != -1) {

            edgeArr.push({source: srcInd, target: tgtInd});

        }

    });

    // parse sentences

    var sentences = getRegexMatches(txt, /\b[a-zA-Z\s\',\-:()–]+[.?!]/g);

    sentences.map(function (sen) {

        // find which node namess are contained in this sentence

        var senNodeIndices = [];

        for (var i=0; i<nodeNameArr.length; i++) {

            if (sen.toLowerCase().indexOf(nodeNameArr[i]) > -1) {

                senNodeIndices.push(i);

            }

        }

        // adding edges between nodes whose indices are in `senNodeIndices`

        senNodeIndices.map(function (ind1) {

            senNodeIndices.map(function (ind2) {

                edgeArr.push({source: ind1, target: ind2});

            });

        });

    });

    updateSVG();

}

function parseEdgeStr(str) {

    var k = str.indexOf('-');

    var s = str.substring(1, k);
    var d = str.substring(k+1, str.length-1);

    return {source: s, target: d};

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

    // reorder svg elements so that lines are first (and thus at bottom depth)

    var svgLines = $('#svg1>line').detach();

    svgLines.prependTo('#svg1');

}
