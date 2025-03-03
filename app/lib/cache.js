import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500, 
  ttl: 1000 * 60 * 10, 
});

export default cache;
