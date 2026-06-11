"use client"

import { useEffect, useMemo, useState } from "react"
import { Clock, RouteIcon } from "lucide-react"

import {
  Map,
  MapMarker,
  MapRoute,
  MarkerContent,
} from "../../components/map"
import { MediaFigure } from "../../components/media-figure"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Status } from "../../components/ui/status"

import {
  tokyoMap,
  tokyoPoints,
  tokyoRoutes,
} from "./data/map"
import { mediaAssets } from "./data/media"
import { selectorOptions } from "./data/route-planner"
import type { TokyoRoute } from "./data/types"

type RouteGeometry = {
  coordinates: [number, number][]
  distance?: number
  duration?: number
  status: "fallback" | "loaded" | "loading"
}

const routeStripeClass = {
  arrival: "bg-muted-foreground",
  density: "bg-destructive",
  quiet: "bg-primary",
}

const markerStatusVariantBySpeed = {
  arrival: "default",
  density: "destructive",
  openLoop: "info",
  quiet: "success",
} as const

function buildOsrmUrl(waypoints: [number, number][]) {
  const coordinatePath = waypoints
    .map(([longitude, latitude]) => `${longitude},${latitude}`)
    .join(";")

  return `https://router.project-osrm.org/route/v1/driving/${coordinatePath}?overview=full&geometries=geojson`
}

export function RoutePlannerBlock() {
  const [selectedInterest, setSelectedInterest] = useState("bookstores")
  const [selectedRouteId, setSelectedRouteId] = useState("quiet-route")
  const [routeGeometry, setRouteGeometry] = useState<
    Record<string, RouteGeometry>
  >(() =>
    Object.fromEntries(
      tokyoRoutes.map((route) => [
        route.id,
        {
          coordinates: [],
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
  const viewport = selectedRoute.viewport

  useEffect(() => {
    let cancelled = false

    async function loadRoutes() {
      const nextEntries = await Promise.all(
        tokyoRoutes.map(async (route) => {
          try {
            const response = await fetch(buildOsrmUrl(route.waypoints))
            if (!response.ok) {
              throw new Error("OSRM request failed")
            }

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

  function selectRoute(route: TokyoRoute) {
    setSelectedRouteId(route.id)
    setSelectedInterest(route.interestLabel)
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
    selectedGeometry?.status === "loaded" ? "road trace loaded" : "route preview"

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">route planner</Badge>
          <Badge variant="outline">three speeds</Badge>
        </div>
        <h1 className="canvas-text-title">
          Tokyo is too rich to conquer; the real question is how to choose.
        </h1>
      </div>

      <div className="grid overflow-hidden rounded-md bg-muted/40 md:min-h-[680px] md:grid-cols-[0.78fr_1.22fr]">
        <div className="canvas-stack-lg p-5 md:p-6">
          <div className="canvas-stack-md">
            <InspectorPhoto assetKey={selectedRoute.evidenceKey} />
            <p className="canvas-text-body">{selectedRoute.summary}</p>

            <div className="canvas-wrap-sm items-center">
              <Badge>{selectedOption.label}</Badge>
              <Badge variant="outline">
                {selectedRoute.day} / {selectedRoute.speed}
              </Badge>
              <Badge variant="outline">{routeStatusLabel}</Badge>
            </div>
            <p className="canvas-text-body">{selectedOption.route}</p>
            <div className="canvas-stack-sm">
              {tokyoRoutes.map((route) => {
                const isActive = route.id === selectedRoute.id
                const distance = route.distanceLabel
                const duration = route.durationLabel

                return (
                  <Button
                    className={
                      isActive
                        ? "h-auto min-h-14 w-full items-stretch justify-start gap-3 whitespace-normal bg-foreground px-3 py-2 text-background"
                        : "h-auto min-h-14 w-full items-stretch justify-start gap-3 whitespace-normal bg-background/90 px-3 py-2"
                    }
                    key={route.id}
                    onClick={() => selectRoute(route)}
                    size="sm"
                    variant={isActive ? "default" : "secondary"}
                  >
                    <span
                      className={`w-1 self-stretch rounded-full ${routeStripeClass[route.speed]}`}
                    />
                    <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                      <span className="canvas-text-caption">{route.tag}</span>
                      <span
                        className={
                          isActive
                            ? "canvas-wrap-sm items-center text-background/70"
                            : "canvas-wrap-sm items-center text-muted-foreground"
                        }
                      >
                        <Clock data-icon="inline-start" />
                        <span className="canvas-text-caption">{duration}</span>
                        <RouteIcon data-icon="inline-start" />
                        <span className="canvas-text-caption">{distance}</span>
                      </span>
                    </span>
                  </Button>
                )
              })}
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

            {tokyoPoints.map((point) => {
              const isActiveStop = point.routeId === selectedRoute.id

              return (
                <MapMarker
                  key={point.label}
                  latitude={point.coordinates[1]}
                  longitude={point.coordinates[0]}
                >
                <MarkerContent>
                  <Status
                    className={isActiveStop ? "opacity-90" : "opacity-55"}
                    size={isActiveStop ? "lg" : "md"}
                    variant={markerStatusVariantBySpeed[point.speed]}
                  />
                </MarkerContent>
              </MapMarker>
              )
            })}
          </Map>
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
    coordinates: [],
    status: "loading" as const,
  }
  const isFallback = geometry.status === "fallback"
  const coordinates = geometry.coordinates

  if (geometry.status === "loading" || coordinates.length < 2) {
    return null
  }

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
    <MediaFigure
      asset={asset}
      density="compact"
      imageClassName="aspect-[16/9]"
      key={assetKey}
      showCredit={false}
    />
  )
}
