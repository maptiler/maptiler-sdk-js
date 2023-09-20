import { describe, it, expect } from "vitest";
import { polygonArea, multiPolygonArea, area } from "../../src/geometry";

// test distance
describe("polygonArea", () => {
  it("calculates area of a large polygon", () => {
    const polygon = [
      [
        [1.404283598062392, 25.671203401104208],
        [1.4976545637456127, 23.867678415533746],
        [7.510639559396992, 22.690145037917404],
        [1.0258574133136733, 18.768380252608438],
        [14.157693326148063, 16.244283776311903],
        [12.827041515434559, 28.531285183216582],
        [10.004494946945528, 26.25510984318427],
        [3.151111353650606, 29.805262395793633],
        [1.404283598062392, 25.671203401104208],
      ],
    ];
    expect(polygonArea(polygon)).toBeCloseTo(1249125795191.9192);

    const polygonGeometry = {
      type: "Polygon" as const,
      coordinates: polygon,
    };
    expect(polygonArea(polygonGeometry)).toBeCloseTo(1249125795191.9192);
  });

  it("calculates area of a small polygon", () => {
    const polygon = [
      [
        [-73.98285854447201, 40.737949277809946],
        [-73.98234693946917, 40.73795818917185],
        [-73.98205291360522, 40.73845276788296],
        [-73.98307024309403, 40.738613171],
        [-73.98348775982026, 40.73816760583179],
        [-73.98285854447201, 40.737949277809946],
      ],
    ];
    expect(polygonArea(polygon)).toBeCloseTo(5917.869674028372);

    const polygonGeometry = {
      type: "Polygon" as const,
      coordinates: polygon,
    };
    expect(polygonArea(polygonGeometry)).toBeCloseTo(5917.869674028372);
  });
});

describe("multiPolygonArea", () => {
  it("calculates area of a large multiPolygon", () => {
    const multiPolygon = [
      [
        [
          [1.404283598062392, 25.671203401104208],
          [1.4976545637456127, 23.867678415533746],
          [7.510639559396992, 22.690145037917404],
          [1.0258574133136733, 18.768380252608438],
          [14.157693326148063, 16.244283776311903],
          [12.827041515434559, 28.531285183216582],
          [10.004494946945528, 26.25510984318427],
          [3.151111353650606, 29.805262395793633],
          [1.404283598062392, 25.671203401104208],
        ],
      ],
      [
        [
          [1.404283598062392, 25.671203401104208],
          [1.4976545637456127, 23.867678415533746],
          [7.510639559396992, 22.690145037917404],
          [1.0258574133136733, 18.768380252608438],
          [14.157693326148063, 16.244283776311903],
          [12.827041515434559, 28.531285183216582],
          [10.004494946945528, 26.25510984318427],
          [3.151111353650606, 29.805262395793633],
          [1.404283598062392, 25.671203401104208],
        ],
      ],
    ];
    expect(multiPolygonArea(multiPolygon)).toBeCloseTo(2498251590383.8384);

    const multiPolygonGeometry = {
      type: "MultiPolygon" as const,
      coordinates: multiPolygon,
    };
    expect(multiPolygonArea(multiPolygonGeometry)).toBeCloseTo(
      2498251590383.8384,
    );
  });

  it("calculates area of a small multiPolygon", () => {
    const multiPolygon = [
      [
        [
          [-73.98285854447201, 40.737949277809946],
          [-73.98234693946917, 40.73795818917185],
          [-73.98205291360522, 40.73845276788296],
          [-73.98307024309403, 40.738613171],
          [-73.98348775982026, 40.73816760583179],
          [-73.98285854447201, 40.737949277809946],
        ],
      ],
      [
        [
          [-73.98285854447201, 40.737949277809946],
          [-73.98234693946917, 40.73795818917185],
          [-73.98205291360522, 40.73845276788296],
          [-73.98307024309403, 40.738613171],
          [-73.98348775982026, 40.73816760583179],
          [-73.98285854447201, 40.737949277809946],
        ],
      ],
    ];
    expect(multiPolygonArea(multiPolygon)).toBeCloseTo(11835.739348056744);
    const multiPolygonGeometry = {
      type: "MultiPolygon" as const,
      coordinates: multiPolygon,
    };
    expect(multiPolygonArea(multiPolygonGeometry)).toBeCloseTo(
      11835.739348056744,
    );
  });
});

describe("area", () => {
  it("calculates area of a large polygon", () => {
    const polygon = [
      [
        [1.404283598062392, 25.671203401104208],
        [1.4976545637456127, 23.867678415533746],
        [7.510639559396992, 22.690145037917404],
        [1.0258574133136733, 18.768380252608438],
        [14.157693326148063, 16.244283776311903],
        [12.827041515434559, 28.531285183216582],
        [10.004494946945528, 26.25510984318427],
        [3.151111353650606, 29.805262395793633],
        [1.404283598062392, 25.671203401104208],
      ],
    ];
    const polygonGeometry = {
      type: "Polygon" as const,
      coordinates: polygon,
    };
    expect(area(polygonGeometry)).toBeCloseTo(1249125795191.9192);

    const polygonFeature = {
      type: "Feature" as const,
      geometry: polygonGeometry,
      properties: {},
    };
    expect(area(polygonFeature)).toBeCloseTo(1249125795191.9192);
  });

  it("calculates area of a small polygon", () => {
    const polygon = [
      [
        [-73.98285854447201, 40.737949277809946],
        [-73.98234693946917, 40.73795818917185],
        [-73.98205291360522, 40.73845276788296],
        [-73.98307024309403, 40.738613171],
        [-73.98348775982026, 40.73816760583179],
        [-73.98285854447201, 40.737949277809946],
      ],
    ];
    const polygonGeometry = {
      type: "Polygon" as const,
      coordinates: polygon,
    };
    expect(area(polygonGeometry)).toBeCloseTo(5917.869674028372);

    const polygonFeature = {
      type: "Feature" as const,
      geometry: polygonGeometry,
      properties: {},
    };
    expect(area(polygonFeature)).toBeCloseTo(5917.869674028372);
  });

  it("calculates area of a large multiPolygon", () => {
    const multiPolygon = [
      [
        [
          [1.404283598062392, 25.671203401104208],
          [1.4976545637456127, 23.867678415533746],
          [7.510639559396992, 22.690145037917404],
          [1.0258574133136733, 18.768380252608438],
          [14.157693326148063, 16.244283776311903],
          [12.827041515434559, 28.531285183216582],
          [10.004494946945528, 26.25510984318427],
          [3.151111353650606, 29.805262395793633],
          [1.404283598062392, 25.671203401104208],
        ],
      ],
      [
        [
          [1.404283598062392, 25.671203401104208],
          [1.4976545637456127, 23.867678415533746],
          [7.510639559396992, 22.690145037917404],
          [1.0258574133136733, 18.768380252608438],
          [14.157693326148063, 16.244283776311903],
          [12.827041515434559, 28.531285183216582],
          [10.004494946945528, 26.25510984318427],
          [3.151111353650606, 29.805262395793633],
          [1.404283598062392, 25.671203401104208],
        ],
      ],
    ];
    const multiPolygonGeometry = {
      type: "MultiPolygon" as const,
      coordinates: multiPolygon,
    };
    expect(area(multiPolygonGeometry)).toBeCloseTo(2498251590383.8384);
    const multiPolygonFeature = {
      type: "Feature" as const,
      geometry: multiPolygonGeometry,
      properties: {},
    };
    expect(area(multiPolygonFeature)).toBeCloseTo(2498251590383.8384);
  });

  it("calculates area of a small multiPolygon", () => {
    const multiPolygon = [
      [
        [
          [-73.98285854447201, 40.737949277809946],
          [-73.98234693946917, 40.73795818917185],
          [-73.98205291360522, 40.73845276788296],
          [-73.98307024309403, 40.738613171],
          [-73.98348775982026, 40.73816760583179],
          [-73.98285854447201, 40.737949277809946],
        ],
      ],
      [
        [
          [-73.98285854447201, 40.737949277809946],
          [-73.98234693946917, 40.73795818917185],
          [-73.98205291360522, 40.73845276788296],
          [-73.98307024309403, 40.738613171],
          [-73.98348775982026, 40.73816760583179],
          [-73.98285854447201, 40.737949277809946],
        ],
      ],
    ];
    const multiPolygonGeometry = {
      type: "MultiPolygon" as const,
      coordinates: multiPolygon,
    };
    expect(area(multiPolygonGeometry)).toBeCloseTo(11835.739348056744);
    const multiPolygonFeature = {
      type: "Feature" as const,
      geometry: multiPolygonGeometry,
      properties: {},
    };
    expect(area(multiPolygonFeature)).toBeCloseTo(11835.739348056744);
  });
});
