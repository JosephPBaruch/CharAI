import type { FeatureCollection } from 'geojson';

export const samplePrescriptionData: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    // -----------------------------------------------------
    // 1. Outer Farm Boundary (small, irregular polygon)
    // -----------------------------------------------------
    {
      type: "Feature",
      properties: { type: "boundary" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24210, 43.60220],
          [-116.23890, 43.60225],
          [-116.23840, 43.60010],
          [-116.23910, 43.59830],
          [-116.24180, 43.59820],
          [-116.24240, 43.59960],
          [-116.24210, 43.60220]
        ]]
      }
    },

    // -----------------------------------------------------
    // Inner polygons perfectly fill the boundary
    // These are arranged like a puzzle so no gaps/overlaps
    // -----------------------------------------------------

    // 2. Zone A
    {
      type: "Feature",
      properties: { priority: "high", applicationRate: 160 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24210, 43.60220],
          [-116.24070, 43.60222],
          [-116.24060, 43.60130],
          [-116.24205, 43.60128],
          [-116.24210, 43.60220]
        ]]
      }
    },

    // 3. Zone B
    {
      type: "Feature",
      properties: { priority: "medium", applicationRate: 120 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24070, 43.60222],
          [-116.23890, 43.60225],
          [-116.23888, 43.60120],
          [-116.24060, 43.60130],
          [-116.24070, 43.60222]
        ]]
      }
    },

    // 4. Zone C
    {
      type: "Feature",
      properties: { priority: "low", applicationRate: 70 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24205, 43.60128],
          [-116.24060, 43.60130],
          [-116.24055, 43.60060],
          [-116.24200, 43.60055],
          [-116.24205, 43.60128]
        ]]
      }
    },

    // 5. Zone D
    {
      type: "Feature",
      properties: { priority: "medium", applicationRate: 95 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24060, 43.60130],
          [-116.23888, 43.60120],
          [-116.23880, 43.60070],
          [-116.24055, 43.60060],
          [-116.24060, 43.60130]
        ]]
      }
    },

    // 6. Zone E
    {
      type: "Feature",
      properties: { priority: "high", applicationRate: 180 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24200, 43.60055],
          [-116.24055, 43.60060],
          [-116.24052, 43.59990],
          [-116.24195, 43.59988],
          [-116.24200, 43.60055]
        ]]
      }
    },

    // 7. Zone F
    {
      type: "Feature",
      properties: { priority: "medium-low", applicationRate: 85 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24055, 43.60060],
          [-116.23880, 43.60070],
          [-116.23875, 43.59995],
          [-116.24052, 43.59990],
          [-116.24055, 43.60060]
        ]]
      }
    },

    // 8. Zone G
    {
      type: "Feature",
      properties: { priority: "low", applicationRate: 50 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24195, 43.59988],
          [-116.24052, 43.59990],
          [-116.24050, 43.59930],
          [-116.24185, 43.59925],
          [-116.24195, 43.59988]
        ]]
      }
    },

    // 9. Zone H
    {
      type: "Feature",
      properties: { priority: "medium", applicationRate: 100 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24052, 43.59990],
          [-116.23875, 43.59995],
          [-116.23870, 43.59930],
          [-116.24050, 43.59930],
          [-116.24052, 43.59990]
        ]]
      }
    },

    // 10. Zone I
    {
      type: "Feature",
      properties: { priority: "high", applicationRate: 170 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24185, 43.59925],
          [-116.24050, 43.59930],
          [-116.24048, 43.59870],
          [-116.24180, 43.59865],
          [-116.24185, 43.59925]
        ]]
      }
    },

    // 11. Zone J
    {
      type: "Feature",
      properties: { priority: "low", applicationRate: 55 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-116.24050, 43.59930],
          [-116.23870, 43.59930],
          [-116.23910, 43.59830],
          [-116.24048, 43.59870],
          [-116.24050, 43.59930]
        ]]
      }
    }
  ]
};
