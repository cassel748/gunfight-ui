import { merge } from "lodash";
import {
  useTheme,
  experimentalStyled as styled,
} from "@material-ui/core/styles";
import { Card, CardHeader } from "@material-ui/core";

import { fNumber } from "../../../utils/formatNumber";

import { BaseOptionChart } from "../../charts";

import dynamic from "next/dynamic";
import { INTERNAL_USER_TYPE } from "src/utils/enums";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
const CHART_HEIGHT = 372;
const LEGEND_HEIGHT = 72;

const ChartWrapperStyle = styled("div")(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  "& .apexcharts-canvas svg": { height: CHART_HEIGHT },
  "& .apexcharts-canvas svg,.apexcharts-canvas foreignObject": {
    overflow: "visible",
  },
  "& .apexcharts-legend": {
    height: LEGEND_HEIGHT,
    alignContent: "center",
    position: "relative !important",
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

export default function AnalyticsCurrentVisits({ userTypes }) {
  const theme = useTheme();

  const chartOptions = merge(BaseOptionChart(), {
    colors: [
      theme.palette.info.main,
      theme.palette.charts.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.charts.lighter,
      theme.palette.success.main,
      theme.palette.primary.main,
    ],
    labels: Object.keys(userTypes),
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: true, horizontalAlign: "center" },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (seriesName) => fNumber(seriesName),
        title: {
          formatter: (seriesName) => `#${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: { donut: { labels: { show: false } } },
    },
  });

  return (
    <Card>
      <CardHeader title="Usuários" />
      <ChartWrapperStyle dir="ltr">
        <ReactApexChart
          type="pie"
          series={Object.values(userTypes)}
          options={chartOptions}
          height={280}
        />
      </ChartWrapperStyle>
    </Card>
  );
}
