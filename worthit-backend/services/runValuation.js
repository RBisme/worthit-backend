import { getSoldCompsPipeline } from './ebaySoldComps.js';
import { calculateValuation } from './CalculateValuation.js';

export async function runValuation(input) {
const comps = await getSoldCompsPipeline(input.description);




  const value = calculateValuation(comps);

  return {
    value,
    comps_used: comps.length
  };
}
