import React, { Component } from 'react';
import _ from 'lodash';
import d3 from 'd3';
import ReactDOM from 'react-dom'

// *****************************************************
// ** Graph and App components
// *****************************************************

export default class Graph extends Component {

  static propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    charge: React.PropTypes.number.isRequired,
    linkDistance: React.PropTypes.number.isRequired,
    linkStrength: React.PropTypes.number.isRequired,
  }

  componentDidMount() {
    // console.log('Graph componentDidMount');
    this.d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));
    this.shouldComponentUpdate(this.props);
  }

  shouldComponentUpdate(nextProps) {
    console.log('Graph shouldComponentUpdate', this.props, nextProps);

    let force = this.force || d3.layout.force();
    let width = nextProps.width;
    let height = nextProps.height;
    // let shouldUpdate = (//!force ||
    //     this.props.width !== width ||
    //     this.props.height !== height ||
    //     this.props.charge !== nextProps.charge ||
    //     this.props.linkDistance !== nextProps.linkDistance ||
    //     this.props.linkStrength !== nextProps.linkStrength
    //   );

    force = force.charge(nextProps.charge)
      .linkDistance(nextProps.linkDistance)
      .linkStrength(nextProps.linkStrength)
      .size([width, height]);
    force.on('tick', () => {
      // after force calculation starts, call updateGraph
      // which uses d3 to manipulate the attributes,
      // and React doesn't have to go through lifecycle on each tick
      this.d3Graph.call(updateGraph);
    });
    this.force = force;

    // *****************************************************
    // ** d3 functions to manipulate attributes
    // *****************************************************
    var enterNode = (selection) => {
      selection.classed('node', true);

      function openNode(node) {
        console.log('node dblclicked!', node);
        if (node.url) {
          window.open(node.url, '_blank');
        }
      }

      selection.append('text')
        .attr("x", (d) => d.size + 5)
        .attr("dy", ".35em")
        .text((d) => d.text)
        .on('dblclick', openNode);

      selection.append('circle')
        .attr("r", (d) => Math.log10(d.size + 1)*10)
        .call(force.drag)
        // .call(drag)
        .on('dblclick', openNode);

    };

    // Cite: http://jsfiddle.net/JSDavi/qvco2Ljy/
    //
    // var drag = d3.behavior.drag()
    //     .origin(function(d) { return d; })
    //     .on("dragstart", dragstarted)
    //     .on("drag", dragged)
    //     .on("dragend", dragended);
    //
    // function dragstarted(d) {
    //   d3.event.sourceEvent.stopPropagation();
    //   d3.select(this).classed("dragging", true);
    //   force.start();
    // }
    //
    // function dragged(d) {
    //   d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    // }
    //
    // function dragended(d) {
    //   d3.select(this).classed("dragging", false);
    // }

    var updateNode = (selection) => {
      selection.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
    };

    var enterLink = (selection) => {
      selection.classed('link', true)
        .attr("stroke-width", (d) => 3*(d.size+1));
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


    let g = d3.select(ReactDOM.findDOMNode(this.refs.graph));
    this.d3Graph = g;

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
    // .scaleExtent([1, 100])
    svg.call(d3.behavior.zoom().on("zoom", () => {
      g.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
    }))
    .on("dblclick.zoom", null);

    // we should actually clone the nodes and links
    // since we're not supposed to directly mutate
    // props passed in from parent, and d3's force function
    // mutates the nodes and links array directly
    // we're bypassing that here for sake of brevity in example
    force.nodes(nextProps.nodes).links(nextProps.links);
    force.start();

    return false;
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('componentWillUpdate', nextProps, nextState);
    this.shouldComponentUpdate(nextProps);
  }

  render() {
    console.log('Render Graph!', this.props);
    return (
      <svg width={this.props.width} height={this.props.height} className="graph">
        <g ref='graph' />
      </svg>
    );
  }

};
