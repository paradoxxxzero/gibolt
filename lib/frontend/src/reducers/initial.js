const emptyResults = {
  results: {},
  loading: false,
  mustLoad: true,
  error: null,
}

export default {
  labels: {
    ...emptyResults,
    results: {
      priority: [{ text: 'Urgent', color: '#e73c7d' }],
      ack: [],
      qualifier: [],
    },
  },
  search: '',
  issues: {
    ...emptyResults,
    results: {
      issues: [],
    },
  },
  timeline: {
    ...emptyResults,
    results: {
      milestones: [],
    },
  },
  report: {
    ...emptyResults,
    results: {
      issues: [],
    },
  },
  repositories: {
    ...emptyResults,
    results: {
      repositories: [],
    },
  },
  repository: {
    ...emptyResults,
    results: {
      labels: [],
      missingLabels: [],
      overlyLabels: [],
      repository: { permissions: { push: false } },
    },
  },
  users: {
    ...emptyResults,
    results: [],
  },
  user: '',
  modifiers: { ctrl: false, shift: false, alt: false },
}