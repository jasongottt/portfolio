import * as THREE from "three";
import { landCode, seaCode } from "./dither";
import { flightPlan } from "./skipStones";

/**
 * Skipping stones, in the world: the stone in flight, and the rings it leaves
 * on the water (skipStones.js has the rules). One stone flies at a time.
 */

// Rings on the water: how many can show at once, how long one lasts, and
// how far it spreads (wider where the stone sinks).
const RINGS = 16;
const RING_SECONDS = 0.6;
const RING_REACH = 0.6;
const SINK_REACH = 0.95;
// Where the stone leaves the hand, and how long it takes to sink.
const HAND = { ahead: 0.4, up: 1 };
const SINK_SECONDS = 0.35;

/**
 * Stones skipped from the shore. `isWater(x, z)` says where a stone can skip,
 * `groundY(x, z)` where it comes to rest on land, and `waveAt(x, z, seconds)`
 * how high the sea is.
 */
export function createSkipping({ isWater, groundY, waveAt }) {
  const disposables = [];
  const keep = (thing) => {
    disposables.push(thing);
    return thing;
  };
  const flat = keep(new THREE.DodecahedronGeometry(0.13, 0).scale(1, 0.45, 1));
  const stoneMaterial = keep(new THREE.MeshLambertMaterial({ color: landCode(0.6), flatShading: true }));

  const stone = new THREE.Mesh(flat, stoneMaterial);
  stone.visible = false;

  const ringGeometry = keep(new THREE.RingGeometry(0.8, 1, 18).rotateX(-Math.PI / 2));
  const ringMaterial = keep(new THREE.MeshBasicMaterial({ color: seaCode(0.98) }));
  const rings = Array.from({ length: RINGS }, () => {
    const mesh = new THREE.Mesh(ringGeometry, ringMaterial);
    mesh.visible = false;
    return { mesh, born: 0, reach: RING_REACH };
  });
  let nextRing = 0;
  const ripple = (x, z, seconds, reach) => {
    const ring = rings[nextRing];
    nextRing = (nextRing + 1) % RINGS;
    ring.mesh.position.set(x, 0, z);
    Object.assign(ring, { born: seconds, reach });
  };

  // The throw in flight: its plan, when each hop starts, how many touches
  // it has made, and who to tell.
  let flight = null;

  const finish = () => {
    const { handlers, plan } = flight;
    flight = null;
    handlers.onDone?.({ skips: plan.skips, ashore: plan.ashore });
  };

  return {
    objects: [stone, ...rings.map((ring) => ring.mesh)],
    /**
     * Throws a stone from someone standing at `from` ([x, y, z]) along
     * `heading` (a unit [x, z]), meant to skip `skips` times, at `seconds`.
     * `handlers` hear each skip, onTouch(count), and the end, onDone({ skips,
     * ashore }). `still` (reduced motion) skips the flight and just tells the
     * result.
     */
    throwStone(from, heading, skips, seconds, still, handlers) {
      const hand = [from[0] + heading[0] * HAND.ahead, from[1] + HAND.up, from[2] + heading[1] * HAND.ahead];
      const plan = flightPlan(hand, heading, skips, isWater);
      if (flight) finish();
      flight = { plan, handlers, touches: 0, starts: [], sinkAt: null };
      let at = seconds;
      for (const hop of plan.hops) {
        flight.starts.push(at);
        at += hop.seconds;
      }
      if (still) {
        stone.visible = false;
        finish();
      }
    },
    /** Where the stone is while it's in the air, or null. */
    stoneAt: () => (flight && stone.visible ? stone.position.toArray() : null),
    /** Moves the stone and the rings along to `seconds`. */
    update(seconds, still) {
      if (flight && still) {
        stone.visible = false;
        finish();
      }
      if (flight) {
        const { plan, starts } = flight;
        // Touches since the last frame: skips, then the last one sinks or
        // comes ashore.
        while (flight.touches < plan.hops.length && seconds >= starts[flight.touches] + plan.hops[flight.touches].seconds) {
          const hop = plan.hops[flight.touches];
          flight.touches += 1;
          const last = flight.touches === plan.hops.length;
          if (hop.wet) ripple(hop.to[0], hop.to[1], seconds, last ? SINK_REACH : RING_REACH);
          if (!last) flight.handlers.onTouch?.(flight.touches);
          else if (hop.wet) flight.sinkAt = seconds;
        }
        const index = Math.min(flight.touches, plan.hops.length - 1);
        const hop = plan.hops[index];
        stone.visible = true;
        if (flight.touches < plan.hops.length) {
          // In the air: along the hop, arcing up and back down.
          const t = (seconds - starts[index]) / hop.seconds;
          const fromY = index === 0 ? hop.from[1] : waveAt(hop.from[0], hop.from[2], starts[index]);
          const toY = hop.wet ? waveAt(...hop.to, seconds) : groundY(...hop.to);
          stone.position.set(
            hop.from[0] + (hop.to[0] - hop.from[0]) * t,
            fromY + (toY - fromY) * t + hop.lift * 4 * t * (1 - t),
            hop.from[2] + (hop.to[1] - hop.from[2]) * t
          );
          stone.rotation.y = seconds * 14;
        } else if (hop.wet) {
          // Sinking.
          const sunk = (seconds - flight.sinkAt) / SINK_SECONDS;
          stone.position.y = waveAt(...hop.to, seconds) - sunk * 0.4;
          if (sunk >= 1) {
            stone.visible = false;
            finish();
          }
        } else {
          // Ashore, where it stays until the next throw.
          stone.position.set(hop.to[0], groundY(...hop.to) + 0.04, hop.to[1]);
          finish();
        }
      }
      for (const ring of rings) {
        const age = (seconds - ring.born) / RING_SECONDS;
        ring.mesh.visible = !still && age >= 0 && age < 1;
        if (!ring.mesh.visible) continue;
        const { x, z } = ring.mesh.position;
        ring.mesh.position.y = waveAt(x, z, seconds) + 0.05;
        ring.mesh.scale.setScalar(0.15 + ring.reach * age);
      }
    },
    dispose() {
      for (const thing of disposables) thing.dispose();
    },
  };
}
