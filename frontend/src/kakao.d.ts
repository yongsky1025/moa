declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void;

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      setLevel(level: number): void;
      setBounds(bounds: LatLngBounds): void;
      getCenter(): LatLng;
    }

    interface MapOptions {
      center: LatLng;
      level: number;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class LatLngBounds {
      constructor();
      extend(latlng: LatLng): void;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
    }

    interface MarkerOptions {
      map: Map;
      position: LatLng;
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions);
      open(map: Map, marker: Marker): void;
      close(): void;
    }

    interface InfoWindowOptions {
      content: string;
      removable?: boolean;
    }

    namespace event {
      function addListener(target: any, type: string, handler: () => void): void;
    }

    namespace services {
      class Places {
        keywordSearch(
          keyword: string,
          callback: (result: PlaceItem[], status: Status) => void
        ): void;
      }

      interface PlaceItem {
        id: string;
        place_name: string;
        category_name: string;
        road_address_name: string;
        address_name: string;
        x: string; // 경도 (longitude)
        y: string; // 위도 (latitude)
      }

      enum Status {
        OK = 'OK',
        ZERO_RESULT = 'ZERO_RESULT',
        ERROR = 'ERROR',
      }
    }
  }
}
