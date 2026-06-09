"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Clock, MapPin, RouteIcon } from "lucide-react"

import {
  Map,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  MarkerTooltip,
} from "../../components/map"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"

import {
  mediaAssets,
  selectorOptions,
  tokyoMap,
  tokyoPoints,
  tokyoRoutes,
  type TokyoPoint,
  type TokyoRoute,
} from "./data"

const markerClass = {
  arrival: "bg-slate-500",
  density: "bg-rose-600",
  openLoop: "bg-amber-500",
  quiet: "bg-emerald-600",
}

export function RouteConsoleBlock() {
  const [selectedInterest, setSelectedInterest] = useState("bookstores")
  const [selectedPointLabel, setSelectedPointLabel] = useState("Jimbocho")
  const [selectedRouteId, setSelectedRouteId] = useState("quiet-route")

  const selectedOption = useMemo(
    () =>
      selectorOptions.find((option) => option.label === selectedInterest) ??
      selectorOptions[0],
    [selectedInterest],
  )
  const selectedRoute = useMemo(
    () =>
      tokyoRoutes.find((route) => route.id === selectedRouteId) ??
      tokyoRoutes[0],
    [selectedRouteId],
  )
  const selectedPoint = useMemo(
    () =>
      tokyoPoints.find((point) => point.label === selectedPointLabel) ??
      tokyoPoints.find((point) => point.routeId === selectedRoute.id) ??
      tokyoPoints[0],
    [selectedPointLabel, selectedRoute.id],
  )
  const viewport = selectedRoute.viewport

  function selectInterest(value: string) {
    if (!value) return
    const nextOption =
      selectorOptions.find((option) => option.label === value) ??
      selectorOptions[0]
    setSelectedInterest(nextOption.label)
    setSelectedRouteId(nextOption.routeId)
    setSelectedPointLabel(nextOption.pointLabels[0])
  }

  function selectPoint(point: TokyoPoint) {
    setSelectedPointLabel(point.label)
    setSelectedRouteId(point.routeId)
    if (!point.interestLabels.includes(selectedInterest)) {
      setSelectedInterest(point.interestLabels[0])
    }
  }

  function selectRoute(route: TokyoRoute) {
    setSelectedRouteId(route.id)
    setSelectedInterest(route.interestLabel)
    setSelectedPointLabel(route.pointLabels[0])
  }

  const sortedRoutes = useMemo(
    () =>
      tokyoRoutes
        .map((route) => ({ route, isSelected: route.id === selectedRoute.id }))
        .sort((a, b) => {
          if (a.isSelected) return 1
          if (b.isSelected) return -1
          return 0
        }),
    [selectedRoute.id],
  )

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">Tokyo Route Console</Badge>
          <Badge variant="outline">three speeds</Badge>
        </div>
        <h1 className="canvas-text-title">
          东京太丰富，所以真正的问题不是去哪，而是如何取舍。
        </h1>
      </div>

      <div className="grid overflow-hidden rounded-md border bg-sidebar md:min-h-[680px] md:grid-cols-[0.92fr_1.18fr]">
        <div className="canvas-stack-lg p-5 md:p-6">
          <div className="canvas-stack-md">
            <div className="canvas-wrap-sm items-center">
              <Badge>{selectedOption.label}</Badge>
              <Badge variant="outline">
                {selectedRoute.day} / {selectedRoute.speed}
              </Badge>
              <Badge variant="outline">{selectedPoint.label}</Badge>
            </div>
            <p className="canvas-text-body">{selectedOption.route}</p>
            <p className="canvas-text-caption text-muted-foreground">
              Switch routes from the map. The inspector follows route clicks,
              marker clicks, and route-option buttons.
            </p>

            <div className="canvas-wrap-sm items-center">
              {selectedOption.dayRewrite.map((item, index) => (
                <span className="canvas-wrap-sm items-center" key={item}>
                  <span className="canvas-text-caption text-muted-foreground">
                    {item}
                  </span>
                  {index < selectedOption.dayRewrite.length - 1 ? (
                    <ArrowRight data-icon="inline-end" />
                  ) : null}
                </span>
              ))}
            </div>

            <InspectorPhoto assetKey={selectedPoint.evidenceKey} />

            <div className="canvas-stack-xs">
              <p className="canvas-text-caption text-muted-foreground">
                active point
              </p>
              <p className="canvas-text-body">{selectedPoint.note}</p>
            </div>

            <div className="canvas-stack-xs">
              <p className="canvas-text-caption text-muted-foreground">
                next open loop
              </p>
              <p className="canvas-text-body">{selectedRoute.summary}</p>
            </div>

            <div className="canvas-grid-gap-md sm:grid-cols-2">
              {selectedOption.load.map((metric) => (
                <div className="canvas-stack-xs" key={metric.label}>
                  <div className="canvas-wrap-sm items-center justify-between">
                    <span className="canvas-text-caption text-muted-foreground">
                      {metric.label}
                    </span>
                    <span className="canvas-text-caption">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 md:p-4">
          <div className="relative h-[520px] overflow-hidden rounded-md border bg-background md:h-full">
            <Map
              center={tokyoMap.center}
              className="h-full"
              maxZoom={15}
              minZoom={8}
              styles={tokyoMap.styles}
              viewport={{
                center: viewport.center,
                zoom: viewport.zoom,
              }}
              onViewportChange={() => undefined}
              zoom={tokyoMap.zoom}
            >
              {sortedRoutes.map(({ route, isSelected }) => (
                <MapRoute
                  color={isSelected ? route.color : "#94a3b8"}
                  coordinates={route.coordinates}
                  id={route.id}
                  interactive
                  key={route.id}
                  onClick={() => selectRoute(route)}
                  opacity={isSelected ? 0.96 : 0.42}
                  width={isSelected ? route.width + 2 : 4}
                />
              ))}

            {tokyoPoints.map((point) => (
                <MapMarker
                  key={point.label}
                  latitude={point.coordinates[1]}
                  longitude={point.coordinates[0]}
                  onClick={() => selectPoint(point)}
                >
                <MarkerContent>
                  <div
                      className={`grid place-items-center rounded-full border-2 border-white shadow-sm ${
                        point.label === selectedPoint.label ? "size-9 ring-2 ring-ring" : "size-7"
                      } ${markerClass[point.speed]}`}
                  >
                    <MapPin className="size-3.5 text-white" />
                  </div>
                  <MarkerLabel position="top">{point.label}</MarkerLabel>
                </MarkerContent>
                  <MarkerTooltip>
                    <div className="space-y-1 text-xs">
                      <p className="canvas-text-body">
                        {point.day} / {point.label}
                      </p>
                      <p className="text-background/70">{point.note}</p>
                    </div>
                  </MarkerTooltip>
              </MapMarker>
            ))}
          </Map>
            <div className="absolute top-3 left-3 canvas-stack-sm">
              {tokyoRoutes.map((route) => {
                const isActive = route.id === selectedRoute.id

                return (
                  <Button
                    className="justify-start gap-3 bg-background/90"
                    key={route.id}
                    onClick={() => selectRoute(route)}
                    size="sm"
                    variant={isActive ? "default" : "secondary"}
                  >
                    <span className="canvas-wrap-sm items-center">
                      <Clock data-icon="inline-start" />
                      <span className="canvas-text-caption">
                        {route.durationLabel}
                      </span>
                    </span>
                    <span className="canvas-wrap-sm items-center text-muted-foreground">
                      <RouteIcon data-icon="inline-start" />
                      <span className="canvas-text-caption">
                        {route.distanceLabel}
                      </span>
                    </span>
                    <Badge variant={isActive ? "secondary" : "outline"}>
                      {route.tag}
                    </Badge>
                  </Button>
                )
              })}
            </div>
            <p className="absolute right-3 bottom-3 rounded-sm bg-background/85 px-2 py-1 canvas-text-caption text-muted-foreground">
              © OpenStreetMap contributors
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function InspectorPhoto({ assetKey }: { assetKey: keyof typeof mediaAssets }) {
  const asset = mediaAssets[assetKey]

  return (
    <figure className="canvas-stack-xs">
      <img
        alt={asset.alt}
        className="h-36 w-full rounded-md object-cover"
        src={asset.src}
      />
      <p className="canvas-text-caption text-muted-foreground">
        {asset.caption}
      </p>
    </figure>
  )
}
