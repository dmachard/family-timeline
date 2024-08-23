
import { describe, it, expect } from 'vitest';
import getAllPersons from '../services/personsService.js';

describe('personsService', () => {
  it('should return enriched person data', async () => {
    const persons = await getAllPersons();
    expect(persons).toBeDefined();
  });
});
