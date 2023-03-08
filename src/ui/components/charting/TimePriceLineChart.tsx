import { CSSProperties, useEffect, useRef, useState } from "react";
import {
  DeepPartial,
  ChartOptions,
  ColorType,
  LineStyleOptions,
  SeriesOptionsCommon,
  IChartApi,
  createChart,
  ISeriesApi,
  ITimeScaleApi,
  LineData,
  MouseEventParams,
} from "lightweight-charts";
import clamp from "lodash/clamp";

import { SxProps, Theme, Box, Stack, Typography } from "@mui/material";

import { APP_ZOOM } from "common/manifest";

import { ChartPeriod, TimePriceLineChartData } from "ui/types";

import { formatPrice, mixSx } from "ui/common/utils";
import { formatTimeCrosshairByPeriod, getChartClosestPoint } from "ui/common/charting";
import { defaultTheme } from "ui/common/theme";

const MARKER_SIZE = 16;
const TOOLTIP_HEIGHT = 52;
const TOOLTIP_OFFSET = 15;

const sxStyles: Record<string, SxProps<Theme>> = {
  common: {
    zIndex: 50,
    display: "none",
    position: "absolute",
    top: 0,
    left: 0,
    boxSizing: "border-box",
    pointerEvents: "none",
  },
  noData: {
    width: 0,
    height: 0,
    overflow: "hidden",
  },
};

sxStyles.marker = {
  ...sxStyles.common,
  width: MARKER_SIZE,
  height: MARKER_SIZE,
  border: (theme: Theme) => `5px solid ${theme.palette.custom.grey["35"]}`,
  bgcolor: "common.white",
  borderRadius: `${MARKER_SIZE / 2}px`,
};

sxStyles.tooltip = {
  ...sxStyles.common,
  height: TOOLTIP_HEIGHT,
  py: 0.75,
  px: 2,
  bgcolor: "background.paper",
  textAlign: "center",
  borderRadius: "10px",
};

interface TimePriceLineChart {
  data: TimePriceLineChartData;
  width?: number | string;
  height?: number | string;
  period?: ChartPeriod;
  chartOptions?: Omit<DeepPartial<ChartOptions>, "width" | "height">;
  lineOptions?: DeepPartial<LineStyleOptions & SeriesOptionsCommon>;
  hasMarker?: boolean;
  hasTooltip?: boolean;
}

const defaultChartOptions: DeepPartial<ChartOptions> = {
  layout: {
    textColor: defaultTheme.palette.common.white,
    background: {
      type: ColorType.Solid,
      color: "transparent",
    },
  },
  handleScale: false,
  handleScroll: false,
  grid: {
    vertLines: { visible: false },
    horzLines: { visible: false },
  },
  timeScale: {
    visible: false,
    borderVisible: false,
    fixLeftEdge: true,
    fixRightEdge: true,
  },
  leftPriceScale: {
    visible: false,
    borderVisible: false,
  },
  rightPriceScale: {
    visible: false,
    borderVisible: false,
  },
  crosshair: {
    vertLine: { visible: false },
    horzLine: { visible: false },
  },
};

const defaultLineOptions: DeepPartial<LineStyleOptions & SeriesOptionsCommon> = {
  lineWidth: 2,
  color: defaultTheme.palette.primary.main,
  crosshairMarkerVisible: false,
  priceLineVisible: false,
};

export default function TimePriceLineChart(props: TimePriceLineChart) {
  const { data, width = "auto", height = "auto", period, chartOptions, lineOptions, hasMarker, hasTooltip } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const chartRenderDivRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [chart, setChart] = useState<IChartApi | null>(null);
  const [markerStyle, setMarkerStyle] = useState<CSSProperties>();
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties>();
  const [tooltipPrice, setTooltipPrice] = useState<string>();
  const [tooltipTime, setTooltipTime] = useState<string>();

  useEffect(() => {
    const chartRenderDiv = chartRenderDivRef.current;

    if (chartRenderDiv) {
      const chartInstance = createChart(chartRenderDiv, {
        width: chartRenderDiv.clientWidth,
        height: chartRenderDiv.clientHeight,
        ...defaultChartOptions,
      });

      setChart(chartInstance);

      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const {
            contentRect: { width, height },
          } = entry;

          chartInstance.applyOptions({ width, height });
        }
      });

      resizeObserver.observe(chartRenderDiv);

      return () => {
        chartInstance.remove();
        resizeObserver.unobserve(chartRenderDiv);
      };
    }
  }, []);

  useEffect(() => {
    if (!chart) {
      return;
    }

    chart.applyOptions({
      ...chartOptions,
    });

    let lineSeries: ISeriesApi<"Line"> | null = null;
    let timeScale: ITimeScaleApi | null = null;

    try {
      lineSeries = chart.addLineSeries();

      lineSeries.applyOptions({ ...defaultLineOptions, ...lineOptions });
      lineSeries.setData(data as LineData[]);

      timeScale = chart.timeScale();

      timeScale.fitContent();
      timeScale.setVisibleLogicalRange({ from: 0.5, to: clamp(data.length - 1.5, 0.5, Infinity) });
    } catch {
      // ignore
    }

    const root = rootRef.current;
    const tooltip = tooltipRef.current;

    const crosshairMoveHandler = (params: MouseEventParams) => {
      if (!root || !tooltip || !lineSeries || !timeScale) {
        return;
      }

      const { point } = params;

      if (point === undefined || point.x < 0 || point.x > root.clientWidth || point.y < 0 || point.y > root.clientHeight) {
        setMarkerStyle({ display: "none" });
        setTooltipStyle({ display: "none" });
      } else {
        const time = timeScale.coordinateToTime(point.x / APP_ZOOM);

        if (typeof time !== "number") {
          return;
        }

        const closestPoint = getChartClosestPoint(data, time);

        if (!closestPoint) {
          return;
        }

        const price = closestPoint.value;

        if (typeof price !== "number") {
          return;
        }

        const formattedPrice = `$${formatPrice(price)}`;
        const formattedTime = formatTimeCrosshairByPeriod(period)(time);

        setTooltipPrice(formattedPrice);
        setTooltipTime(formattedTime);

        const coordinateX = timeScale.timeToCoordinate(time);
        const coordinateY = lineSeries.priceToCoordinate(price);

        if (coordinateY === null || coordinateX === null) {
          return;
        }

        const markerY = coordinateY - MARKER_SIZE / 2;
        const markerX = coordinateX - MARKER_SIZE / 2;

        setMarkerStyle({ display: "block", top: markerY, left: markerX });

        const tooltipWidth = tooltip.clientWidth;

        const tooltipY =
          coordinateY - TOOLTIP_HEIGHT - TOOLTIP_OFFSET > 0
            ? coordinateY - TOOLTIP_HEIGHT - TOOLTIP_OFFSET
            : Math.max(0, Math.min(root.clientHeight - TOOLTIP_HEIGHT - TOOLTIP_OFFSET, coordinateY + TOOLTIP_OFFSET));
        const tooltipX = Math.max(0, Math.min(root.clientWidth - tooltipWidth, coordinateX - tooltipWidth / 2));

        setTooltipStyle({ display: "flex", top: tooltipY, left: tooltipX });
      }
    };

    if (hasMarker || hasTooltip) {
      chart.subscribeCrosshairMove(crosshairMoveHandler);
    }

    return () => {
      try {
        if (hasMarker || hasTooltip) {
          chart.unsubscribeCrosshairMove(crosshairMoveHandler);
        }

        if (lineSeries) {
          chart.removeSeries(lineSeries);
        }
      } catch {
        // ignore;
      }
    };
  }, [chart, data, width, height, period, chartOptions, lineOptions, hasMarker, hasTooltip]);

  const noData = data.length === 0;

  return (
    <>
      {noData && (
        <Stack width={width} height={height} alignItems="center" justifyContent="center">
          <Typography variant="large" color="text.secondary">
            No data
          </Typography>
        </Stack>
      )}
      <Box position="relative" ref={rootRef} sx={mixSx(noData && sxStyles.noData)}>
        <Box width={width} height={height} ref={chartRenderDivRef} />
        {hasMarker && <Box sx={sxStyles.marker} style={markerStyle} />}
        {hasTooltip && (
          <Stack ref={tooltipRef} alignItems="center" justifyContent="center" sx={sxStyles.tooltip} style={tooltipStyle}>
            {tooltipPrice && (
              <Typography variant="medium" fontSize={16} fontWeight={500} lineHeight={20 / 16} align="center" whiteSpace="nowrap">
                {tooltipPrice}
              </Typography>
            )}
            {tooltipTime && (
              <Typography variant="medium" color="text.secondary" align="center" whiteSpace="nowrap">
                {tooltipTime}
              </Typography>
            )}
          </Stack>
        )}
      </Box>
    </>
  );
}
