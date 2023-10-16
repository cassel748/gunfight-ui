import { alpha } from "@material-ui/core/styles";

// ----------------------------------------------------------------------

function createGradient(color1, color2) {
  return `linear-gradient(to bottom, ${color1}, ${color2})`;
}

// SETUP COLORS
const GREY = {
  0: "#FFFFFF",
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#212B36",
  900: "#161C24",
  500_8: alpha("#919EAB", 0.08),
  500_12: alpha("#919EAB", 0.12),
  500_16: alpha("#919EAB", 0.16),
  500_24: alpha("#919EAB", 0.24),
  500_32: alpha("#919EAB", 0.32),
  500_48: alpha("#919EAB", 0.48),
  500_56: alpha("#919EAB", 0.56),
  500_80: alpha("#919EAB", 0.8),
};

const CHARTS = {
  lighter: "#993399",
  light: "#5BE584",
  main: "#00AB55",
  dark: "#007B55",
  darker: "#005249",
  contrastText: "#fff",
};
const PRIMARY = {
  lighter: "#FF7272",
  light: "#F2F2F2",
  main: "#F23545",
  dark: "#262526",
  darker: "#D93654",
  contrastText: "#fff",
};
const PRIMARY_DARK = {
  lighter: "#FF7272",
  light: "#F2F2F2",
  main: "#F23545",
  dark: "#151d2a",
  darker: "#161c24",
  contrastText: "#fff",
  sidebarActive: "#3175b4",
};
const SECONDARY = {
  lighter: "#D6E4FF",
  light: "#84A9FF",
  main: "#3366FF",
  dark: "#1939B7",
  darker: "#091A7A",
  contrastText: "#fff",
};
const INFO = {
  lighter: "#D0F2FF",
  light: "#74CAFF",
  main: "#1890FF",
  dark: "#0C53B7",
  darker: "#04297A",
  contrastText: "#fff",
};
const SUCCESS = {
  lighter: "#E9FCD4",
  light: "#AAF27F",
  main: "#54D62C",
  dark: "#229A16",
  darker: "#08660D",
  contrastText: GREY[800],
};
const WARNING = {
  lighter: "#FFF7CD",
  light: "#FFE16A",
  main: "#FFC107",
  dark: "#B78103",
  darker: "#7A4F01",
  contrastText: GREY[800],
};
const ERROR = {
  lighter: "#FFE7D9",
  light: "#FFA48D",
  main: "#FF4842",
  dark: "#B72136",
  darker: "#7A0C2E",
  contrastText: "#fff",
};

const GRADIENTS = {
  primary: createGradient(PRIMARY.light, PRIMARY.main),
  charts: createGradient(CHARTS.light, CHARTS.main),
  info: createGradient(INFO.light, INFO.main),
  success: createGradient(SUCCESS.light, SUCCESS.main),
  warning: createGradient(WARNING.light, WARNING.main),
  error: createGradient(ERROR.light, ERROR.main),
};

const COMMON = {
  common: { black: "#000", white: "#fff" },
  secondary: { ...SECONDARY },
  info: { ...INFO },
  success: { ...SUCCESS },
  warning: { ...WARNING },
  error: { ...ERROR },
  grey: GREY,
  gradients: GRADIENTS,
  divider: GREY[500_24],
  action: {
    hover: GREY[500_8],
    selected: GREY[500_16],
    disabled: GREY[500_80],
    disabledBackground: GREY[500_24],
    focus: GREY[500_24],
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

export const palette = {
  light: {
    ...COMMON,
    primary: { ...PRIMARY },
    charts: { ...CHARTS },

    eb: { main: "#1a440c", contrastText: "#fff" },
    pf: { main: "#e5c32c", contrastText: "#000" },
    coffee: { main: "#8e4c34", contrastText: "#fff" },
    championship: { main: "#1aff5e", contrastText: "#000" },
    store: { main: "#3f51b5", contrastText: "#fff" },
    ammunition: { main: "#00bcd4", contrastText: "#000" },
    ammunitionHard: { main: "#cddc39", contrastText: "#000" },
    service: { main: "#ffb10a", contrastText: "#000" },
    annuity: { main: "#AF7AC5", contrastText: "#000" },
    renewalAnnuity: { main: "#5DADE2", contrastText: "#000" },
    introduction: { main: "#34495E", contrastText: "#fff" },
    accessory: { main: "#A2D9CE", contrastText: "#000" },
    bench: { main: "#A569BD", contrastText: "#000" },
    track: { main: "#EC7063", contrastText: "#000" },
    personal: { main: "#BA4A00", contrastText: "#fff" },
    testShot: { main: "#1A5276", contrastText: "#fff" },
    clinic: { main: "#DFFF00", contrastText: "#000" },
    thirdChampionship: { main: "#0000FF", contrastText: "#fff" },
    package: { main: "#808000", contrastText: "#000" },
    gunStore: { main: "#7FFFD4", contrastText: "#000" },
    event: { main: "#f71d2f", contrastText: "#fff" },
    other: { main: "#dedede", contrastText: "#282828" },
    experience: { main: "#009BFF", contrastText: "#000" },

    text: { primary: GREY[800], secondary: GREY[600], disabled: GREY[500] },
    background: { paper: "#fff", default: "#fff", neutral: GREY[200] },
    action: { active: GREY[600], ...COMMON.action },

    debit: { main: "#FF4842", contrastText: "#fff" },
    credit: { main: "#54D62C", contrastText: "#fff" },
  },
  dark: {
    ...COMMON,

    primary: { ...PRIMARY_DARK },
    charts: { ...CHARTS },

    eb: { main: "#1a440c", contrastText: "#fff" },
    pf: { main: "#e5c32c", contrastText: "#000" },
    coffee: { main: "#8e4c34", contrastText: "#fff" },
    championship: { main: "#1aff5e", contrastText: "#000" },
    store: { main: "#3f51b5", contrastText: "#fff" },
    ammunition: { main: "#00bcd4", contrastText: "#000" },
    ammunitionHard: { main: "#cddc39", contrastText: "#000" },
    service: { main: "#ffb10a", contrastText: "#000" },
    annuity: { main: "#AF7AC5", contrastText: "#000" },
    renewalAnnuity: { main: "#5DADE2", contrastText: "#000" },
    introduction: { main: "#34495E", contrastText: "#fff" },
    accessory: { main: "#A2D9CE", contrastText: "#000" },
    bench: { main: "#A569BD", contrastText: "#000" },
    track: { main: "#EC7063", contrastText: "#000" },
    personal: { main: "#BA4A00", contrastText: "#fff" },
    testShot: { main: "#1A5276", contrastText: "#fff" },
    clinic: { main: "#DFFF00", contrastText: "#000" },
    thirdChampionship: { main: "#0000FF", contrastText: "#fff" },
    package: { main: "#808000", contrastText: "#000" },
    gunStore: { main: "#7FFFD4", contrastText: "#000" },
    event: { main: "#f71d2f", contrastText: "#fff" },
    other: { main: "#dedede", contrastText: "#282828" },
    text: { primary: "#fff", secondary: GREY[500], disabled: GREY[600] },
    background: { paper: GREY[800], default: GREY[900], neutral: GREY[500_16] },
    action: { active: GREY[500], ...COMMON.action },
    experience: { main: "#009BFF", contrastText: "#000" },
    debit: { main: "#FF4842", contrastText: "#fff" },
    credit: { main: "#54D62C", contrastText: "#fff" },
  },
};

export default palette;
