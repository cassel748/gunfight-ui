// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = "";

// ----------------------------------------------------------------------

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,

  general: {
    home: path(ROOTS_DASHBOARD, "/home"),
  },
  actions: {
    root: path(ROOTS_DASHBOARD, "/actions-root"),
    invoices: path(ROOTS_DASHBOARD, "/actions/invoices"),
    schedules: path(ROOTS_DASHBOARD, "/actions/schedules"),
    army_form: path(ROOTS_DASHBOARD, "/actions/army-form"),
  },
  associates: {
    root: path(ROOTS_DASHBOARD, "/associates"),
    register: path(ROOTS_DASHBOARD, "/associates/register"),
    profile: path(ROOTS_DASHBOARD, "/associates/profile"),
    history: path(ROOTS_DASHBOARD, "/associates/history"),
    documents: path(ROOTS_DASHBOARD, "/associates/documents"),
  },
  internal_operation: {
    root: path(ROOTS_DASHBOARD, "/internal-root"),
    user: path(ROOTS_DASHBOARD, "/internal/users"),
    events: path(ROOTS_DASHBOARD, "/internal/events"),
    createProduct: path(ROOTS_DASHBOARD, "/internal/products"),
    createWeapon: path(ROOTS_DASHBOARD, "/internal/weapons"),
    marketing: path(ROOTS_DASHBOARD, "/internal/marketing"),
    commission: path(ROOTS_DASHBOARD, "/internal/commission"),
  },
};
