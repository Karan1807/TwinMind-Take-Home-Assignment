/**
 * Temporal Query Parser
 * Extracts date/time information from natural language queries
 */

export interface TemporalRange {
  startDate?: Date;
  endDate?: Date;
  isRelative: boolean;
  relativeText?: string;
}

/**
 * Parse temporal references from a query
 * Examples:
 * - "last Tuesday" -> { startDate, endDate, isRelative: true }
 * - "last month" -> { startDate, endDate, isRelative: true }
 * - "in December" -> { startDate, endDate, isRelative: false }
 * - "What did I work on last month?" -> extracts "last month"
 */
export function parseTemporalQuery(query: string): {
  cleanedQuery: string;
  temporalRange?: TemporalRange;
} {
  const lowerQuery = query.toLowerCase();
  let cleanedQuery = query;
  let temporalRange: TemporalRange | undefined;

  // Patterns for relative dates
  const relativePatterns = [
    {
      pattern: /last\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      handler: (match: RegExpMatchArray) => {
        const dayName = match[1].toLowerCase();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = days.indexOf(dayName);
        const today = new Date();
        const currentDay = today.getDay();
        let daysAgo = currentDay - targetDay;
        if (daysAgo <= 0) daysAgo += 7; // If same day or in future, go to last week
        
        const lastDay = new Date(today);
        lastDay.setDate(today.getDate() - daysAgo);
        lastDay.setHours(0, 0, 0, 0);
        
        const endDate = new Date(lastDay);
        endDate.setHours(23, 59, 59, 999);
        
        return {
          startDate: lastDay,
          endDate,
          isRelative: true,
          relativeText: match[0],
        };
      },
    },
    {
      pattern: /last\s+month/i,
      handler: () => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        
        return {
          startDate: lastMonth,
          endDate: endOfLastMonth,
          isRelative: true,
          relativeText: 'last month',
        };
      },
    },
    {
      pattern: /this\s+month/i,
      handler: () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        
        return {
          startDate: startOfMonth,
          endDate: endOfMonth,
          isRelative: true,
          relativeText: 'this month',
        };
      },
    },
    {
      pattern: /last\s+week/i,
      handler: () => {
        const now = new Date();
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - 7 - now.getDay()); // Start of last week (Sunday)
        lastWeekStart.setHours(0, 0, 0, 0);
        
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        lastWeekEnd.setHours(23, 59, 59, 999);
        
        return {
          startDate: lastWeekStart,
          endDate: lastWeekEnd,
          isRelative: true,
          relativeText: 'last week',
        };
      },
    },
    {
      pattern: /this\s+week/i,
      handler: () => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(now);
        weekEnd.setHours(23, 59, 59, 999);
        
        return {
          startDate: weekStart,
          endDate: weekEnd,
          isRelative: true,
          relativeText: 'this week',
        };
      },
    },
    {
      pattern: /last\s+(\d+)\s+(day|days)/i,
      handler: (match: RegExpMatchArray) => {
        const days = parseInt(match[1]);
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        
        return {
          startDate,
          endDate,
          isRelative: true,
          relativeText: match[0],
        };
      },
    },
    {
      pattern: /q(\d)\s+(\d{4})/i, // Q1 2024, Q2 2024, etc.
      handler: (match: RegExpMatchArray) => {
        const quarter = parseInt(match[1]);
        const year = parseInt(match[2]);
        const startMonth = (quarter - 1) * 3;
        const startDate = new Date(year, startMonth, 1);
        const endDate = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
        
        return {
          startDate,
          endDate,
          isRelative: false,
          relativeText: match[0],
        };
      },
    },
    {
      pattern: /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
      handler: (match: RegExpMatchArray) => {
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december'];
        const month = monthNames.indexOf(match[1].toLowerCase());
        const year = parseInt(match[2]);
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        
        return {
          startDate,
          endDate,
          isRelative: false,
          relativeText: match[0],
        };
      },
    },
    {
      pattern: /(\d{4})/i, // Just a year
      handler: (match: RegExpMatchArray) => {
        const year = parseInt(match[1]);
        if (year >= 2000 && year <= new Date().getFullYear() + 1) {
          const startDate = new Date(year, 0, 1);
          const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
          
          return {
            startDate,
            endDate,
            isRelative: false,
            relativeText: match[0],
          };
        }
        return null;
      },
    },
  ];

  // Try to match patterns
  for (const { pattern, handler } of relativePatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const range = handler(match);
      if (range) {
        temporalRange = range;
        // Remove the temporal phrase from the query
        cleanedQuery = query.replace(new RegExp(match[0], 'i'), '').trim();
        break;
      }
    }
  }

  return { cleanedQuery, temporalRange };
}

/**
 * Build Qdrant filter for date range
 */
export function buildDateRangeFilter(
  temporalRange?: TemporalRange,
  dateField: string = 'createdAt',
): any {
  if (!temporalRange) {
    return undefined;
  }

  const filterConditions: any[] = [];

  if (temporalRange.startDate) {
    filterConditions.push({
      key: dateField,
      range: {
        gte: temporalRange.startDate.toISOString(),
      },
    });
  }

  if (temporalRange.endDate) {
    filterConditions.push({
      key: dateField,
      range: {
        lte: temporalRange.endDate.toISOString(),
      },
    });
  }

  if (filterConditions.length === 0) {
    return undefined;
  }

  // Combine with AND logic
  if (filterConditions.length === 1) {
    return filterConditions[0];
  }

  return {
    must: filterConditions,
  };
}

