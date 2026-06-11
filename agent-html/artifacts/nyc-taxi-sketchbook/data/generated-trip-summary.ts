export const taxiMeta = {
  "title": "NYC Taxi Data Sketchbook",
  "month": "2024-10",
  "vehicle": "Yellow taxi",
  "generatedFrom": "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-10.parquet",
  "zoneLookup": "https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv",
  "generatedAt": "2026-06-10T16:00:38.733Z",
  "filters": "Pickup in October 2024; positive fare, amount, duration, and distance; distance <= 80 miles; total_amount <= $400; valid pickup and dropoff taxi zones.",
  "note": "Tip amounts in TLC trip records are credit-card tips; cash tips are not captured in the tip_amount field."
} as const

export const taxiKpis = {
  "rawTrips": 3833771,
  "keptTrips": 3672841,
  "droppedTrips": 160930,
  "totalAmount": 107688593,
  "averageFare": 20.31,
  "averageTotal": 29.32,
  "averageDistance": 3.49,
  "medianDistance": 1.8,
  "medianTotal": 21.84,
  "averageTip": 3.51,
  "cardTipRate": 94.4,
  "averagePassengers": 1.31
} as const
