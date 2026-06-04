'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'legislator' | 'bill';
  party?: string;
  status?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  vote: 'yea' | 'nay' | 'abstain';
}

export default function LegislativeNetwork() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous drawing
    d3.select(svgRef.current).selectAll('*').remove();

    // Mock Data representing seeded database entities
    const nodes: Node[] = [
      { id: 'schumer', name: 'Chuck Schumer (D)', type: 'legislator', party: 'Democratic' },
      { id: 'cruz', name: 'Ted Cruz (R)', type: 'legislator', party: 'Republican' },
      { id: 'bill-110', name: 'S. 110: Infrastructure Act', type: 'bill', status: 'Enacted' },
      { id: 'bill-242', name: 'S. 242: Salary Adjustment', type: 'bill', status: 'Passed Senate' },
      { id: 'bill-450', name: 'S. 450: Ethics Reform', type: 'bill', status: 'Introduced' }
    ];

    const links: Link[] = [
      { source: 'schumer', target: 'bill-110', vote: 'yea' },
      { source: 'schumer', target: 'bill-242', vote: 'yea' },
      { source: 'schumer', target: 'bill-450', vote: 'yea' },
      { source: 'cruz', target: 'bill-110', vote: 'nay' },
      { source: 'cruz', target: 'bill-242', vote: 'yea' },
      { source: 'cruz', target: 'bill-450', vote: 'nay' }
    ];

    const width = svgRef.current.clientWidth || 500;
    const height = 350;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Simulation Setup
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', (d) => {
        if (d.vote === 'yea') return '#10B981'; // Emerald for yea
        if (d.vote === 'nay') return '#EF4444';  // Crimson for nay
        return '#64748B';
      })
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d) => d.vote === 'abstain' ? '4 4' : 'none');

    // Tooltip helper
    const tooltip = d3.select('body').append('div')
      .style('position', 'absolute')
      .style('z-index', '1000')
      .style('visibility', 'hidden')
      .style('background', 'rgba(18, 18, 20, 0.95)')
      .style('border', '1px solid rgba(255, 255, 255, 0.08)')
      .style('padding', '8px 12px')
      .style('border-radius', '8px')
      .style('font-family', 'sans-serif')
      .style('font-size', '11px')
      .style('color', '#F8FAFC')
      .style('backdrop-filter', 'blur(10px)')
      .style('box-shadow', '0 10px 25px -5px rgba(0, 0, 0, 0.5)');

    // Draw nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.type === 'legislator' ? 24 : 18)
      .attr('fill', (d) => {
        if (d.type === 'legislator') {
          return d.party === 'Democratic' ? '#3B82F6' : '#EF4444'; // Blue vs Red
        }
        return '#06B6D4'; // Cyan for bills
      })
      .attr('stroke', '#070708')
      .attr('stroke-width', 2.5)
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )
      .on('mouseover', (event, d) => {
        tooltip.style('visibility', 'visible')
          .html(`
            <strong style="font-family: var(--font-display);">${d.name}</strong><br/>
            <span style="color: #94A3B8; text-transform: uppercase;">Type: ${d.type}</span>
            ${d.status ? `<br/><span style="color: #06B6D4;">Status: ${d.status}</span>` : ''}
          `);
      })
      .on('mousemove', (event) => {
        tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 15) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    // Draw labels inside/near nodes
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('dy', (d) => d.type === 'legislator' ? 32 : 26)
      .attr('text-anchor', 'middle')
      .text((d) => d.type === 'legislator' ? d.name.split(' ')[1] : d.name.split(':')[0])
      .attr('fill', '#94A3B8')
      .attr('font-size', '10px')
      .attr('font-weight', '500');

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as Node).x || 0)
        .attr('y1', (d) => (d.source as Node).y || 0)
        .attr('x2', (d) => (d.target as Node).x || 0)
        .attr('y2', (d) => (d.target as Node).y || 0);

      node
        .attr('cx', (d) => d.x || 0)
        .attr('cy', (d) => d.y || 0);

      label
        .attr('x', (d) => d.x || 0)
        .attr('y', (d) => d.y || 0);
    });

    // Drag handlers
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      tooltip.remove();
    };
  }, []);

  return (
    <div className="w-full p-6 rounded-3xl glass-panel h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
          <h3 className="font-display font-bold text-slate-100 text-xl tracking-tight">Voting Alignment Cluster</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Force-directed layout mapping relationships between bills (cyan) and legislators (red/blue). 
          Emerald links represent <span className="text-emerald-400 font-bold">Yea</span> votes, and crimson links represent <span className="text-red-400 font-bold">Nay</span> votes. Drag nodes to interact.
        </p>
      </div>

      <div className="w-full flex-1 min-h-[350px] bg-black/40 border border-white/5 rounded-2xl overflow-hidden relative shadow-inner">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}
