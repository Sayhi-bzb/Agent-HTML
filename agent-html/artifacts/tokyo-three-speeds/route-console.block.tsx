"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Clock, RouteIcon } from "lucide-react"

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

type RouteGeometry = {
  coordinates: [number, number][]
  distance?: number
  duration?: number
  status: "fallback" | "loaded" | "loading"
}

const markerClass = {
  arrival: "bg-slate-500",
  density: "bg-rose-600",
  openLoop: "bg-amber-500",
  quiet: "bg-emerald-600",
}

const routeStripeClass = {
  arrival: "bg-slate-500",
  density: "bg-rose-600",
  quiet: "bg-emerald-600",
}

function formatDistance(meters?: number) {
  if (!meters) return null
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function formatDuration(seconds?: number) {
  if (!seconds) return null
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function buildOsrmUrl(waypoints: [number, number][]) {
  const coordinatePath = waypoints
    .map(([longitude, latitude]) => `${longitude},${latitude}`)
    .join(";")

  return `https://router.project-osrm.org/route/v1/driving/${coordinatePath}?overview=full&geometries=geojson`
}

export function RouteConsoleBlock() {
  const [selectedInterest, setSelectedInterest] = useState("bookstores")
  const [selectedPointLabel, setSelectedPointLabel] = useState("Jimbocho")
  const [selectedRouteId, setSelectedRouteId] = useState("quiet-route")
  const [routeGeometry, setRouteGeometry] = useState<
    Record<string, RouteGeometry>
  >(() =>
    Object.fromEntries(
      tokyoRoutes.map((route) => [
        route.id,
        {
          coordinates: route.coordinates,
          status: "loading",
        },
      ]),
    ),
  )

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

  useEffect(() => {
    let cancelled = false

    async function loadRoutes() {
      const nextEntries = await Promise.all(
        tokyoRoutes.map(async (route) => {
          try {
            const response = await fetch(buildOsrmUrl(route.waypoints))
            const data = (await response.json()) as {
              routes?: Array<{
                distance?: number
                duration?: number
                geometry?: {
                  coordinates?: [number, number][]
                }
              }>
            }
            const firstRoute = data.routes?.[0]
            const coordinates = firstRoute?.geometry?.coordinates

            if (!coordinates || coordinates.length < 2) {
              throw new Error("OSRM returned no route geometry")
            }

            return [
              route.id,
              {
                coordinates,
                distance: firstRoute.distance,
                duration: firstRoute.duration,
                status: "loaded" as const,
              },
            ]
          } catch {
            return [
              route.id,
              {
                coordinates: route.coordinates,
                status: "fallback" as const,
              },
            ]
          }
        }),
      )

      if (!cancelled) {
        setRouteGeometry(Object.fromEntries(nextEntries))
      }
    }

    void loadRoutes()

    return () => {
      cancelled = true
    }
  }, [])

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
  const selectedGeometry = routeGeometry[selectedRoute.id]
  const routeStatusLabel =
    selectedGeometry?.status === "loaded" ? "real road route" : "route preview"
  const selectedDistance =
    formatDistance(selectedGeometry?.distance) ?? selectedRoute.distanceLabel
  const selectedDuration =
    formatDuration(selectedGeometry?.duration) ?? selectedRoute.durationLabel

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
              <Badge variant="outline">{routeStatusLabel}</Badge>
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

            <div className="canvas-wrap-sm items-center">
              <Badge variant="secondary">{selectedDuration}</Badge>
              <Badge variant="secondary">{selectedDistance}</Badge>
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
                <RouteLines
                  isSelected={isSelected}
                  key={route.id}
                  onSelect={() => selectRoute(route)}
                  route={route}
                  routeGeometry={routeGeometry[route.id]}
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
                      className={`grid place-items-center rounded-full border border-white/90 text-[10px] font-semibold text-white shadow-sm ${
                        point.label === selectedPoint.label ? "size-8 ring-2 ring-ring" : "size-6"
                      } ${markerClass[point.speed]}`}
                  >
                    {point.day.replace("D", "")}
                  </div>
                  {point.label === selectedPoint.label ? (
                    <MarkerLabel position="top">{point.label}</MarkerLabel>
                  ) : null}
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
                const geometry = routeGeometry[route.id]
                const distance =
                  formatDistance(geometry?.distance) ?? route.distanceLabel
                const duration =
                  formatDuration(geometry?.duration) ?? route.durationLabel

                return (
                  <Button
                    className={
                      isActive
                        ? "justify-start gap-3 bg-foreground text-background"
                        : "justify-start gap-3 bg-background/90"
                    }
                    key={route.id}
                    onClick={() => selectRoute(route)}
                    size="sm"
                    variant={isActive ? "default" : "secondary"}
                  >
                    <span
                      className={`h-4 w-1 rounded-full ${routeStripeClass[route.speed]}`}
                    />
                    <span className="canvas-wrap-sm items-center">
                      <Clock data-icon="inline-start" />
                      <span className="canvas-text-caption">
                        {duration}
                      </span>
                    </span>
                    <span
                      className={
                        isActive
                          ? "canvas-wrap-sm items-center text-background/70"
                          : "canvas-wrap-sm items-center text-muted-foreground"
                      }
                    >
                      <RouteIcon data-icon="inline-start" />
                      <span className="canvas-text-caption">
                        {distance}
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

function RouteLines({
  isSelected,
  onSelect,
  route,
  routeGeometry,
}: {
  isSelected: boolean
  onSelect: () => void
  route: TokyoRoute
  routeGeometry?: RouteGeometry
}) {
  const geometry = routeGeometry ?? {
    coordinates: route.coordinates,
    status: "fallback" as const,
  }
  const isFallback = geometry.status === "fallback"
  const coordinates = geometry.coordinates

  return (
    <>
      {isSelected ? (
        <MapRoute
          color="#ffffff"
          coordinates={coordinates}
          dashArray={isFallback ? [1.2, 1.2] : undefined}
          id={`${route.id}-case`}
          interactive={false}
          opacity={isFallback ? 0.32 : 0.56}
          width={route.width + 7}
        />
      ) : null}
      <MapRoute
        color={isSelected ? route.color : "#94a3b8"}
        coordinates={coordinates}
        dashArray={isFallback ? [1.2, 1.4] : undefined}
        id={route.id}
        interactive
        onClick={onSelect}
        opacity={isSelected ? 0.96 : 0.36}
        width={isSelected ? route.width + 1 : 3}
      />
    </>
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
