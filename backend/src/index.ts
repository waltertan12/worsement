import { Portfolio, ModeratelyAggressive } from './model';
// Start the API
import './api';

// Start the WebSocket
import './stream';

import { greedy } from './service/strategy';
import { getPortfolio } from './service/portfolio-service';

const portfolio = getPortfolio(ModeratelyAggressive.id) as Portfolio;
greedy(portfolio.allocations, []);
