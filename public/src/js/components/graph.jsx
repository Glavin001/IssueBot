import React, { Component } from 'react';
import _ from 'lodash';
import d3 from 'd3';
import ReactDOM from 'react-dom'

var width = 960;
var height = 500;
var force = d3.layout.force()
  .charge(-300)
  .linkDistance(100)
  .size([width, height]);

// *****************************************************
// ** d3 functions to manipulate attributes
// *****************************************************

var enterNode = (selection) => {
  selection.classed('node', true);

  selection.append('circle')
    .attr("r", (d) => d.size + 1)
    .call(force.drag)
    .on('click', (event) => {
      console.log('node clicked!', event);
    });

  selection.append('text')
    .attr("x", (d) => d.size + 5)
    .attr("dy", ".35em")
    .text((d) => d.text);
};

var updateNode = (selection) => {
  selection.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
};

var enterLink = (selection) => {
  selection.classed('link', true)
    .attr("stroke-width", (d) => d.size);
};

var updateLink = (selection) => {
  selection.attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);
};

var updateGraph = (selection) => {
  selection.selectAll('.node')
    .call(updateNode);
  selection.selectAll('.link')
    .call(updateLink);
};

// *****************************************************
// ** Graph and App components
// *****************************************************

export default class Graph extends Component {
  componentDidMount() {
    console.log('Graph componentDidMount');
    this.d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));
    console.log(this.d3Graph);
    force.on('tick', () => {
      // after force calculation starts, call updateGraph
      // which uses d3 to manipulate the attributes,
      // and React doesn't have to go through lifecycle on each tick
      this.d3Graph.call(updateGraph);
    });
    this.shouldComponentUpdate(this.props);
  }

  shouldComponentUpdate(nextProps) {
    console.log('Graph shouldComponentUpdate', nextProps);
    let g = d3.select(ReactDOM.findDOMNode(this.refs.graph));
    this.d3Graph = g;
    console.log(this.d3Graph);


    var d3Nodes = this.d3Graph.selectAll('.node')
      .data(nextProps.nodes, (node) => node.key);
    d3Nodes.enter().append('g').call(enterNode);
    d3Nodes.exit().remove();
    d3Nodes.call(updateNode);

    var d3Links = this.d3Graph.selectAll('.link')
      .data(nextProps.links, (link) => link.key);
    d3Links.enter().insert('line', '.node').call(enterLink);
    d3Links.exit().remove();
    d3Links.call(updateLink);

    // Zoom
    let svg = d3.select('svg.graph');
    console.log('svg', svg, g);
    svg.call(d3.behavior.zoom().on("zoom", () => {
      console.log('zoom');
      g.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
    }));

    // we should actually clone the nodes and links
    // since we're not supposed to directly mutate
    // props passed in from parent, and d3's force function
    // mutates the nodes and links array directly
    // we're bypassing that here for sake of brevity in example
    force.nodes(nextProps.nodes).links(nextProps.links);
    force.start();

    return false;
  }

  render() {
    return (
      <svg width={width} height={height} className="graph">
        <g ref='graph' />
      </svg>
    );
  }

};
