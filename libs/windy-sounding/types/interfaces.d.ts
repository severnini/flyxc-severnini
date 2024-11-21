/**
 * Main Windy interfaces
 */
import { ClientMessage } from '@plugins/offline/offline';
import { Weekday } from '@windy/Calendar.d';
import { ExtendedTileParams } from '@windy/DataTiler.d';
import { FullRenderParameters } from '@windy/Layer.d';
import { Particles } from '@windy/Particles';
import { PluginsOpenParams, type PluginsQsParams } from '@windy/plugin-params.d';
import { Plugins } from '@windy/plugins.d';
import { AcTimes, Isolines, Levels, Overlays, PointProducts, Products } from '@windy/rootScope.d';
import {
  BatteryPreferences,
  CapAlertInfo,
  CapAlertSeverity,
  CapAlertType,
  DetailDisplayType,
  DetailRows,
  Directions,
  FavType,
  GoogleServicesPreferences,
  GpsPreferences,
  ISODateString,
  LocationPreferences,
  MeteogramLayers,
  MeteogramLevels,
  NotificationPreferences,
  NumOrNull,
  NumValue,
  Path,
  Pixel,
  Platform,
  SearchType,
  StationOrPoiType,
  Timestamp,
  WidgetNotificationPreferences,
  YearMonthDay,
  type MigrationResult,
} from '@windy/types.d';

export interface ExportedObj {
  default?: unknown;
}

/**
 * # LatLon
 *
 * Major LatLon Windy's interface.
 *
 * Although Leaflet uses `{ lat, lng }` we use `{ lat, lon }`.
 */
export interface LatLon {
  /**
   * Latitude.
   *
   * While typed as number, due to some parsing, it can be string in some cases.
   */
  lat: number;

  /**
   * Longitude.
   *
   * While typed as number, due to some parsing, it can be string in some cases.
   */
  lon: number;
}

export interface Coords extends LatLon {
  zoom: number;
}

export interface PickerCoords extends LatLon {
  zoom?: number;
  noEmit?: boolean;
}

export interface BcastHistory {
  ts: Timestamp;
  txt: string;
}

/**
 * # GeolocationInfo
 *
 * Represents information about user's location.
 */
export interface GeolocationInfo extends LatLon {
  /**
   * Which source was used to get the last location
   */
  source: 'fallback' | 'gps' | 'ip' | 'meta' | 'api' | 'last';

  /**
   * Recommended map zoom level based on precision of the location.
   *
   * Higher precision means higher zoom level, we can offer to the user.
   */
  zoom?: number;

  /**
   * Optional lowercase 2 letter ISO country code
   */
  cc?: string;

  /**
   * Optional name of the place
   */
  name?: string;

  /**
   * Time of the last update of location info
   */
  ts: Timestamp;
}

/**
 * TODO: This is basically copied favorite
 */
export interface HomeLocation extends LatLon {
  title: string;
  updated?: string;
}

export interface Alert {
  /**
   * Is alert temporarily disabled (true) or not (false)
   */
  suspended: boolean;

  /**
   * If email alerts are active, address where to send an alert
   */
  email?: string;

  /**
   * Since client v29 we moved to Capacitor and new backend notification pusher had to be used.
   * This is filled by client to recognize which pusher should be used.
   */
  version?: number;

  /**
   * Wind conditions for the alert
   */
  wind: {
    active: boolean;
    min: number;
    max: number;
    directions: Directions[];
  };

  /**
   * Swell conditions for the alert
   */
  swell: Alert['wind']; // same as wind

  /**
   * Snow conditions for the alert
   */
  snow: {
    active: boolean;
    min: number;
  };

  /**
   * Rain conditions for the alert.
   * WARNING: This is the only option which is missing for some items in DB
   */
  rain: {
    active: boolean;
    min: number;
    hours: 3 | 6 | 12 | 24 | 48;
  };

  /**
   * Temperature conditions for the alert
   */
  temp: {
    active: boolean;
    min: number;
    max: number;
    weather: ('OVC' | 'BKN' | 'FEW' | 'SKC')[];
  };

  /**
   * Time and terms conditions for the alert
   */
  time: {
    active: boolean;
    occurence: number;
    days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
    hours: ('00' | '03' | '06' | '09' | '12' | '15' | '18' | '21')[];
  };

  /**
   * Model conditions for the alert
   * WARNING: This had been disabled in favor of ECMWF, but some old alerts still use GFS. Backend needs this value so it is presented in all alerts.
   */
  model: {
    active: boolean;
    model: 'ecmwf' | 'gfs';
  };

  /**
   * Which lang shoud be used for the alert (en is default)
   */
  lang?: string;

  /**
   * Time zone offset of the user. It is used to send the alert in the midday
   */
  userTZoffset?: number;

  /**
   * Which metrics shoud be used for the alert
   */
  metrics?: {
    wind: string; // TODO - improve with correct types after metrics refactor
    temp: string; // TODO - improve with correct types after metrics refactor
    waves: string; // TODO - improve with correct types after metrics refactor
    rain: string; // TODO - improve with correct types after metrics refactor
    snow: string; // TODO - improve with correct types after metrics refactor
  };

  // TODO - check if these properties really exist in DB or are added in client
  tzName?: string;
  utcOffset?: number;
}

export interface AlertProps {
  /**
   * Timestamps when the alert is active
   */
  timestamps: Timestamp[];

  /**
   * Timestamp where the state of the alert has been checked on server last time
   */
  checked: Timestamp;

  // TODO - it seems it is not use anywhere, remove?
  seen: number;

  /** Whether alert is active (true) or not (false) */
  triggered: boolean;

  /** Weather alert is temporarily disabled (true) or not (false) */
  suspended?: boolean;
}

export interface Fav extends LatLon {
  /** Unique ID of item */
  id: string;

  /* How many times was this item hit/used */
  counter?: number;

  /** Title of item */
  title: string;

  /** @deprecated Name was used till 2019, all should be refactored to `title` if it is safe */
  name?: string;

  /** Unique invented key, for access */
  key?: string;

  /** Type of item */
  type: FavType | SearchType;

  /** Airport ICAO code in case of airport */
  icao?: string;

  /** Weather station ID (if WX station) */
  stationId?: string;

  /** Webcam ID in case of webcam */
  webcamId?: number;

  /** For saved routes */
  route?: string;

  /**
   * If user wants to pin to top this fav, this timestamp enable us to sort all the favs
   * so the last pinned is on top
   */
  pin2top?: Timestamp | null;

  /**
   * If user wants to pin to homepage this fav, this timestamp enable us to sort all the favs
   * so the last pinned is first in line
   */
  pin2homepage?: Timestamp | null;
}

/** Search result payload as received from backend */
export interface SearchResult extends Fav {
  /** Localized Search result */
  title: string;

  /** Type of item */
  type: SearchType;

  /** Localized, human readable country name */
  country?: string | null;

  /** Lowercase ISO-2 CC */
  cc?: string;

  /** Localized, human readable region */
  region?: string | null;

  /** Localized, human readable state */
  state?: string;

  /** Stringified bounds of found item for case of island, country etc */
  bounds?: string;

  /**
   * Added properties for purpose of recent searches
   */

  /** Creation date */
  timestamp?: Timestamp;

  /** Search query under which was item stored to recents */
  query?: string;
}

export interface HttpSearchPayload {
  header: {
    type: 'search' | 'coordinates' | 'query-error' | '2airports';
  };
  data: SearchResult[];
}

export interface SavedFav extends Fav {
  /** Title of item */
  title: string;

  /** Unique invented key, for access */
  key: string;

  /** Type of item */
  type: FavType;

  /** Alert settings (conditions, properties, ...) if any */
  alert?: Alert;

  /** Basic info about alert if any */
  alertProps?: AlertProps;

  /**
   * Query params of the route needed for creating the route again
   *
   * @example car/50.43,21.49;48.14,20.61;49.18,21.41
   */
  route?: string;

  /**
   * Timestamp when the item has been updated for the last time. It is used for updating items on all devices (the most up-to-date wins)
   */
  updated?: Timestamp;

  overflowed?: boolean;

  /** @deprecated Use `title` instead. This property is presented only because of in local storage saved old favs compatibility. */
  name?: string;
  /** Used for alerts to open slider on active timestamp */
  moveToTimestamp?: boolean;
}

export interface UpcomingFav extends Fav {
  // TODO - is it necessary? Isn't just some migration deprecated stuff?
  name?: string;

  /** Type of item */
  type: FavType;

  // TODO - is it necessary? Can unsaved fav has a route property?
  route?: string;

  // TODO - is it necessary? Can unsaved fav has an alert property?
  alert?: Alert;

  // TODO - is it necessary? Can unsaved fav has an updated property?
  updated?: Timestamp;
}

export interface SavedAlertFav extends UpcomingFav {
  _id?: string;
  alert: Alert;
}

export interface WeatherParameters {
  overlay: Overlays;
  acTime: AcTimes;
  level: Levels;
  isolines: Isolines;
  path: Path;
  product: Products;
}

export interface InputTarget extends EventTarget {
  value: string;
}

export interface HTMLInputElementKeyEvent extends KeyboardEvent {
  target: InputTarget;
}

/**
 * Last device info sent to backend for purpose of pushNotifications
 */
export interface LastSentDevice {
  deviceID: string;
  platform: string;
  target: string;
  version: string;
  deactivated?: boolean;
  updated?: number;
  screen?: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  registrationHash?: string;
  notifPluginVersion?: 1 | 2;
}

export interface Bounds {
  west: number;
  east: number;
  north: number;
  south: number;
}

/**
 * Leaflet's tilePoint
 */
export interface TilePoint {
  x: number;
  y: number;
  z: number;
}

/**
 * Celestial object as received from backend
 */
export interface Celestial {
  /**
   * Time zone abbreviation (for instance CEST)
   */
  TZabbrev: string;

  /**
   * Time zone name (for instance 'Europe/Luxembourg)
   */
  TZname: string;

  /**
   * TZ offset in hours
   */
  TZoffset: number;

  /**
   * TZ offset nicely formatted
   */
  TZoffsetFormatted: string;

  /**
   * TZ offset in minutes
   */
  TZoffsetMin: number;

  /**
   * Type of TZ type t..terrestrial, n..nautical
   */
  TZtype: 't' | 'n';

  /**
   * Determines probability if the location is at sea or not as number from 1..0
   */
  atSea: number;

  /**
   * Formatted time of dusk
   */
  dusk: `${number}:${number}`;
  duskTs: Timestamp;

  /**
   * Current time is night or not
   */
  isDay: boolean;

  /**
   * When the night starts
   */
  night: ISODateString;

  /**
   * Monet when, the data object was created (for check of being obsolete)
   */
  nowObserved: ISODateString;

  sunrise: `${number}:${number}`;
  sunriseTs: Timestamp;
  sunset: `${number}:${number}`;
  sunsetTs: Timestamp;
}

/**
 * Summary day as received from backend
 */
export interface SummaryDay {
  /**
   * Identifier of the day
   */
  date: YearMonthDay;

  /**
   * Day of the month (starting with 1)
   */
  day: number;

  /**
   * Weather icon identifier
   */
  icon: number;

  /**
   * At which index, in the data table, the day starts
   */
  index: number;

  /**
   * How many segments, in the data table, the forecast has
   */
  segments: number;

  /**
   * Max temp in K
   */
  tempMax: NumValue;

  /**
   * Min temp in K
   */
  tempMin: NumValue;

  /**
   * Timestamp of midnight when the segment starts
   */
  timestamp: Timestamp;

  /**
   * Translation string for weekday
   */
  weekday: Weekday;

  /**
   * Mean/Average Wind force
   */
  wind: NumValue;

  /**
   * Prevailing wind direction
   */
  windDir: NumValue;

  /**
   * CAP Alert warning identifier as two letter designator
   */
  warning?: string;

  /**
   * Indicates that these data are fake, just for purpose to
   * show non-premium users how the extended fcst looks like
   */
  isFake?: boolean;
}

/**
 * Weather data object as received from backend (compacted version)
 */
export interface SummaryDataHash {
  /**
   * Precip amount
   */
  mm: NumValue[];

  /**
   * Is the precipitation in a form fo snow?
   */
  snow: (1 | 0)[];

  /**
   * Temp in K
   */
  temp: NumValue[];

  /**
   * Timestamp of beginning of segment
   */
  ts: Timestamp[];

  /**
   * Wind force
   */
  wind: NumValue[];
}

export interface IsDay {
  /**
   * Is the segment day/night or sunrise/sunset as 0,1 or day/night ratio
   */
  isDay: (0 | 1 | number)[];
}

/**
 * Weather data object as received from backend (full version)
 */

export interface DataHash extends SummaryDataHash, IsDay {
  /**
   * Day identifier
   */
  day: YearMonthDay[];

  /**
   * Feeling temperature
   */
  feelTemp?: NumValue[];

  /**
   * Wind gust
   */
  gust: NumValue[];

  /**
   * Local Time hour for given place in 24h format
   */
  hour: number[];

  /**
   * Weather icon identifier
   */
  icon: number[];

  /**
   * Moon phase icon identifier
   */
  moonPhase: number[];

  /**
   * ?????
   */
  //precipitation: NumValue[];

  /**
   * Surface air pressure
   */
  pressure: NumValue[];

  /**
   * Relative humidity
   */
  rh: NumValue[];

  /**
   * Is the forecasted precipitation rain?
   */
  rain: (0 | 1)[];

  /**
   * ????
   */
  //snowFraction: NumValue[];

  /**
   * Amount of snow precipitation
   */
  snowPrecip: NumValue[];

  /**
   * Amount of convective precipitation
   */
  convPrecip?: NumValue[];

  /**
   * Weather code, that explains used weather icon
   */
  weathercode: string[];

  /**
   * Wind direction
   */
  windDir: NumValue[];

  /**
   * Dew point
   */
  dewPoint: NumValue[];

  /**
   * CAP warnings as a string /^[MSE][Type]/
   * can be easilly typed later on
   */
  warnings?: string[];

  /**
   * Cloud base
   */
  cbase?: NumValue[];

  /**
   * These properties are prosent, onoy in certail modelsin the sea or nearby of sea
   */
  swell?: NumValue[];
  swellDir?: NumValue[];
  swellPeriod?: NumValue[];

  swell1?: NumValue[];
  swell1Dir?: NumValue[];
  swell1Period?: NumValue[];

  swell2?: NumValue[];
  swell2Dir?: NumValue[];
  swell2Period?: NumValue[];

  waves?: NumValue[];
  wavesDir?: NumValue[];
  wavesPeriod?: NumValue[];

  /**
   * These properties are monkey patched to data table by detail plugin
   * TODO: put in diff type
   */
  [key: `${string}/wind`]: NumValue[];
  [key: `${string}/windDir`]: NumValue[];
  [key: `${string}/gust`]: NumValue[];

  /**
   * TODO This is ugly. Plugin station renames `mm` to `precip` property just to suit its rendering
   */
  precip?: NumValue[];

  turbulence?: NumValue[];
  icing?: NumValue[];

  /**
   * Indicates, that these data are fake, just for purpose to show non-premium users how the extended fcst looks like
   */
  isFake?: boolean[];
}

/**
 * It picks all properties from DataHash which extends type passed to U parameter.
 * Strict means the extension has to be from both sides.
 *
 * @example
 * PickDataHashPropsByType<string[]> = { date: ..., weathercode: ... };
 * PickDataHashPropsByType<string, false> even with `warnings`, because the could be undefined and undefined does not extend number[]
 */
export type PickDataHashPropsByType<U, Strict = true> = Pick<
  DataHash,
  {
    [P in keyof Required<DataHash>]: Strict extends true
      ? DataHash[P] extends U
        ? U extends DataHash[P]
          ? P
          : never
        : never
      : U extends DataHash[P]
      ? P
      : never;
  }[keyof DataHash]
>;

/**
 * node-forecast header object
 */
export interface NodeForecastHeader {
  /**
   * Quality of served data
   */
  cache: 'nearbyHit' | 'proximitiHit' | 'miss';

  /**
   * Elevation above sea level
   */
  elevation: number;

  /**
   * Height of something (it is possible, that value is monkey patched from weatherTableRender FIXME:)
   */
  height?: number;

  /**
   * Data contain info about waves
   */
  hasWaves?: number;

  /**
   * Number of available days in forecast
   */
  daysAvail: number;

  /**
   * Served model
   */
  model: Products;

  /**
   * Ref time in format "2021-09-11"
   */
  refTime: YearMonthDay;

  /**
   * Ref time as timestamp
   */
  refTimeOrig: Timestamp;

  /**
   * Hour model step
   */
  step: 1 | 3;

  /**
   * Update time of weather model
   */
  update: ISODateString;

  /**
   * Update time of weather model
   */
  updateTs: Timestamp;

  /**
   * Some basic celestial stuff (why is it here???)
   */
  sunrise: Timestamp;
  sunset: Timestamp;
  tzName: string;

  /**
   * Resulted data table consist of two merged models together
   */
  merged: boolean;

  /**
   * Which model was merged with previous
   */
  mergedModel: Products;

  /**
   * Human readable merged model name
   */
  mergedModelName: string;

  /**
   * Ref time of merged model
   */
  mergedModelRefTime: ISODateString;

  /**
   * [DEPRECATED, use mergedModelStartTs instead] At which table index, merged model starts
   */
  mergedModelStart: number;

  /**
   * Timestamp where the merged model starts
   */
  mergedModelStartTs: number;

  /**
   * Elevation of model grid
   */
  modelElevation: number;

  /**
   * UTC offset in hours
   */
  utcOffset: number;

  /**
   * Surface sea temperature
   */
  sst?: number;
}

/**
 * Forecasted weather data for NOW
 */

export interface WeatherDataNow {
  icon: number;
  temp: NumValue;
  wind: NumValue;
  windDir: NumValue;
  moonPhase: NumValue;
}

/**
 * Weather data or Summary Weather data JSON as received from node-forecast
 */
export interface WeatherDataPayload<T extends DataHash | SummaryDataHash> {
  header: NodeForecastHeader;
  celestial: Celestial;
  summary: Record<YearMonthDay, SummaryDay>;
  data: T;
  now?: T extends SummaryDataHash ? WeatherDataNow : never;
}

/**
 * Minimal required options for RendererWeatherTable
 */
export interface WeatherTableRenderingOptions {
  /**
   * How to display detail
   */
  display: DetailDisplayType;

  /**
   * Which rows to render
   */
  rows: DetailRows[];

  /**
   * 1h or 3h step
   */
  step: 1 | 3;

  /**
   * Width of each table cell (in pixels)
   */
  tdWidth: Pixel;

  /**
   * How many days to display
   */
  days: number;

  /**
   * Size of weather icons
   */
  iconSize: Pixel;

  /**
   * Array of times, when Alert was triggered
   */
  timestamps?: null | Timestamp[];

  /**
   * Should we display detail with Z times?
   */
  zuluMode?: boolean;

  /**
   * Shoud we display 12 or 24h format
   */
  is12hFormat?: boolean;

  /**
   * Content to put in header of legend
   */
  legendHeaderContent?: string;

  /**
   * Surface sea temperature if available
   */
  sst?: number;
}

// TS cannot extend from [] syntax, just create proxy type and use it in the next line
type DetailPluginOpenParams = PluginsOpenParams['detail'];

/**
 * Parameters used for displaying detail (point forecast)
 */
export interface DetailParams extends DetailPluginOpenParams, WeatherTableRenderingOptions {
  display: DetailDisplayType;
  /**
   * Which kind of action led to displaying the detail
   */
  emitter?: 'externalOpen' | 'locationChange';

  /**
   * Should we display extended 10hours forecast?
   */
  extended: boolean;

  /**
   * Height of background canvas
   */
  height?: Pixel;

  /**
   * Required point product
   */
  model: Products;

  /**
   * Required multiple point products
   * TODO - split to more interfaces, for multimodel and others
   */
  models?: Products[];

  //source: PluginOpenEventSource;

  /**
   * Type of POI that was clicked to open detail or was contained in URL on page load
   */
  poiType?: StationOrPoiType;

  /**
   * POI id that was clicked to open detail or was contained in URL on page load
   */
  id?: string;

  /**
   * height of temperature background canvas
   */
  tempBgH?: Pixel;

  /**
   * Always incrementing synchronization number, that enables
   * to cancel async tasks, if we will have new version of params
   * available
   */
  syncCounter: number;
}

/**
 * Multimple weather models loaded by multiLoad.ts
 */
export interface MultiLoadPayload {
  model: PointProducts;
  fcst: WeatherDataPayload<DataHash>;
}

export type MeteogramDataHash = {
  [data in `${MeteogramLayers}-${MeteogramLevels}`]: NumValue[];
} & {
  'gh-surface': null[];
  hours: Timestamp[];
};

export interface MeteogramDataPayload {
  header: NodeForecastHeader;
  celestial: Celestial;
  data: MeteogramDataHash;
}

/**
 * Particle animation parameters
 */
export interface ExtendedRenderParams extends ExtendedTileParams, FullRenderParameters {
  canvas: HTMLCanvasElement;

  /**
   * Actual instance of particles
   */
  partObj: Particles;

  /**
   * Pointer to dest table
   */
  vectors: Float32Array;

  speed2pixel: number;
}

/**
 * Info about articles, user has already seen
 */
export interface SeenArticle {
  /**
   * Last time, the article has been displayed to the user
   */
  checked: Timestamp;

  /**
   * How many times the article has been seen
   * (one count is added only if the article has been seen after 12 hours from the last seen time)
   */
  count: number;

  /**
   * Marks beginning of 12h interval
   */
  seen: Timestamp;
}

/**
 * How good are observations by this AD or WX station?
 */
export interface ObservationInfo {
  avgDelayMin: number;
  avgFreqMin: number;
  latestObs: ISODateString;
  records: number;
}

export interface ServiceGeoipResponse {
  country: string;
  region: `${number}`;
  eu: '0' | '1';
  timezone: string;
  city: string;
  ll: [number, number];
  metro: number;
  area: number;
  ip: string;

  /**
   * @deprecated
   */
  hash: 'oiurouoweruouoiuou';
}

export interface BillingPluginMinimalProduct {
  productId: string;
  isSubscription: boolean;
}

export interface BillingPlugin {
  /** Retrieves a list of full product data from Apple/Google. This function must be called before making purchases. */
  getProducts: (opts: { products: BillingPluginMinimalProduct[] }) => Promise<{
    values: import('@plugins/_shared/subscription-services/subscription-services.d').IAPProduct[];
  }>;

  /** Buy the one-time product */
  buy: (opts: {
    productId: string;
  }) => Promise<import('@plugins/_shared/subscription-services/subscription-services.d').IAPBuyResponse>;

  /** Buy the subscription */
  subscribe: (opts: {
    productId: string;
    offerToken?: string;
  }) => Promise<import('@plugins/_shared/subscription-services/subscription-services.d').IAPBuyResponse>;

  /**
   * This function is only relevant to Android purchases. On Android, you must consume products that you want to let the user purchase multiple times.
   * All 3 parameters are returned by the buy() or restorePurchases() functions.
   */
  consume: (opts: { purchaseToken: string; transactionId: string; productId: string }) => Promise<void>;

  restorePurchases: () => Promise<{
    values: string;
  }>;

  /**
   * On iOS, you can get the receipt at any moment by calling the getReceipt() function. Note that on iOS the receipt can contain multiple transactions. If successful, the promise returned by this function will resolve to a string with the receipt.
   * On Android this function will always return an empty string since it's not needed for Android purchases.
   */
  getReceipt: () => Promise<string>;
}

export interface TimeLocal {
  weekday: Weekday;
  day: string;
  month: string;
  year: string;
  /** '09' */
  hour: string;
}

export interface CapAlertHeadline {
  start: Timestamp;
  end: Timestamp;
  type: CapAlertType;
  severity: CapAlertSeverity;
  headline: string;
  event: string;
  startLocal: TimeLocal;
  endLocal: TimeLocal;
}

export interface CapAlertData extends CapAlertHeadline {
  id: string;
  ident: string;
  info: CapAlertInfo;
  lat: number;
  lon: number;
  areaDesc: string;
  languages: string[];
  senderName: string;
  updated: Timestamp;
  author: string;
  certainty: string;
}

export interface CapAlertPayload {
  version: number;
  celestial: Celestial;
  data: CapAlertData[];
}

export interface CapAlertTags {
  start: Timestamp;
  end: Timestamp;
  id: string;

  /**
   * '-' is an invalid type.
   * TODO: Client should not get invalid values. Fix it on the server side.
   */
  type: CapAlertType | '-';
  severity: CapAlertSeverity;
  lat: number;
  lon: number;
  info: CapAlertInfo;

  /**
   * monkey patched prop
   */
  x: number;

  /**
   * monkey patched prop
   */
  y: number;
}

type GeometryPoints = [number, number][];
type GeometryPolygons = GeometryPoints[];

export interface CapAlertTile {
  features: {
    /**
     * Array that contains EITHER array of arrays with two elements = GeometryPolygons
     * f.ex.: [
     *          [
     *              [0, 1],
     *              [2, 3],
     *              ...
     *          ],
     *          ...
     *     ]
     * OR it is just array of arrays with two element = GeometryPoints
     *     [
     *          [0, 1],
     *          [2, 3],
     *          ...
     *     ],
     */
    geometry: GeometryPoints | GeometryPolygons;
    tags: CapAlertTags;
    type: number;
  }[];
}

export interface IsAppleWatchPairedResult {
  value: boolean;
}

export interface IsAppleWatchCompanionAppInstalledResult {
  value: boolean;
}

export interface WatchConnectObject {
  key: string;
  value: string;
}

export interface WindyWatchPlugin {
  /**
   * Returns void, because this method only leave message to system
   * for sending and returns void, when message is saved, not delivered to watch
   * @param {WatchConnectObject} arg Object for save
   */
  sendDataToWatch(arg: WatchConnectObject): Promise<void>;
  /**
   * Watch conditions for the alert
   */
  isPaired: () => Promise<IsAppleWatchPairedResult>;
  isWatchAppInstalled: () => Promise<IsAppleWatchCompanionAppInstalledResult>;
  addWatchFace: () => Promise<unknown>;
}

export interface WindyServicePlugin {
  openSettings: () => Promise<void | string>;
  getLocationPermissions: () => Promise<LocationPreferences>;
  getNotificationPermissions: () => Promise<NotificationPreferences>;
  openApplicationSettings: () => Promise<void | string>;
  isGpsEnabled: () => Promise<GpsPreferences>;
  getBatteryUsagePermissions: () => Promise<BatteryPreferences>;
  openBatterySettings: () => Promise<void>;
  getGoogleServicesAvailability: () => Promise<GoogleServicesPreferences>;
  getWidgetNotificationPermissions: () => Promise<WidgetNotificationPreferences>;
  openWidgetNotificationSettings: () => Promise<void>;
  getBackgroundLocationPermission: () => Promise<GpsPreferences>;
  openBackgroundLocationSettings: () => Promise<void>;
  logError: (arg: { moduleName: string; msg: string; error?: string }) => Promise<void>;
  getId: () => Promise<{ identifier: string }>;
}
/**
 * A migration tool for transferring old Web View local storage to a new location.
 * This migration is necessary when the hostname is changed in the native Capacitor configuration.
 *
 * "Old" configuration:
 * - Host: localhost
 * - Scheme: capacitor (for iOS)
 *
 * "New" configuration:
 * - Host: windy.com
 * - Scheme: capacitor (for iOS)
 */
export interface WindyMigrationPlugin {
  /**
   * Returns the paths to old local storage based on the system. The iOS16 version is preferred if available.
   */
  findPathOldLocalStorages(): Promise<{ ios14: string | null; ios16: string | null }>;
  /**
   * Checks if at least one old local storage was found.
   */
  findOldLocalStorage: () => Promise<{ result: boolean }>;
  /**
   * Returns the file and directory structure from '/Libraries/WebKit' on iOS.
   */
  getWebKitHierarchy: () => Promise<{ result: [string] }>;
  /**
   * Initiates the migration process and natively restarts the app upon successful completion.
   * Note: This method does not control if the migration was previously done.
   */
  migrate: () => Promise<void>;
  /**
   * Will return [String:String?]? dictionary from old database
   */
  getOldLocalStorageData: () => Promise<[string: string | null] | null>;
  /**
   * Returns the timestamp of the latest migration or null if the migration hasn't been executed yet.
   */
  lastMigration: () => Promise<{ result: number | null }>;
  /**
   * Marks migration as completed and restart WebView from origin
   */
  markMigrationCompleted: () => Promise<void>;
  /**
   * Returns migration status flag - either migrationNotPerformed or migratingData
   */
  getMigrationStatus: () => Promise<MigrationResult>;
  /**
   * Sends migration data to native layer
   */
  setMigrationData: (opts: { data: string }) => Promise<void>;
  /**
   * Returns old localStorage data (sent to native layer via setMigrationData function)
   */
  getOldLocalStorageDataAndroid: () => Promise<{ result: string | null }>;
}

export interface SocialLoginParams {
  purpose: string;
  deviceId: string;
  clientLang: string;
  targetMobile: boolean;
  platform: Platform;
  redirectUrl: string;
}

/**
 * Observation Weather Summary used in station plugin
 */
export interface ObservationSummaryRecord {
  date: YearMonthDay;
  day: number;
  end: Timestamp;
  index: number;
  segments: number;
  tempMax: NumOrNull;
  tempMaxTs: Timestamp;
  tempMin: NumOrNull;
  tempMinTs: Timestamp;
  timestamp: Timestamp;
  weekday: Weekday;
}

export type ObservationSummaryHash = Record<YearMonthDay, ObservationSummaryRecord>;

/**
 * Opening options for Window class
 */
export interface WindowOpeningOptions {
  /**
   * Should we open the window without animation?
   */
  disableOpeningAnimation?: boolean;
}

/**
 * Closing options for Window class
 */
export interface WindowClosingOptions {
  /**
   * Should we close the window without animation?
   */
  disableClosingAnimation?: boolean;

  /**
   * Event that led to closing
   */
  ev?: MouseEvent | KeyboardEvent | TouchEvent;
}

/**
 * Opening parameters for WindowPlugin opening
 */
export interface PluginOpeningOptions<P extends keyof Plugins> extends WindowOpeningOptions {
  /**
   * Opening parameters
   */
  params?: PluginsOpenParams[P];

  /**
   * Additional query string passed from URL
   */
  qs?: PluginsQsParams[P];
}

/**
 * Point used in rplanner
 */
export interface RplannerPoint {
  ident: number;
  marker: L.Marker;
  position: L.LatLng;
}

/**
 * Waypoint used in rplanner
 */
export interface RplannerWaypoint {
  distance?: number;
  ident?: number;
  initialBearing?: number;
  point: L.LatLng;
  rads?: {
    cosInitialBearing: number;
    cosLat: number;
    lng: number;
    sinInitialBearing: number;
    sinLat: number;
  };
}

/**
 * Handy utility to calculate scales (inspired by D3 library)
 */
export interface LinearScale {
  get: (val: NumValue) => Pixel;
  invert: (val: NumValue) => Pixel;
}

/**
 * Main GDPR, privacy or cookie consent object
 */
export interface Consent {
  /**
   * Version of the consent user agreed on. Use form 'YYYY/MM'
   *
   *  If the text on consent window will have to evolve and we will HAVE to show
   *  new version to the user.
   */
  version: string;

  /**
   * Last time when user clicked on YES or NO button
   */
  timestamp: Timestamp;

  /**
   * User agreed on anonymous analytics
   */
  analytics: boolean;

  /**
   * Was the consent explicit or just not required
   */
  explicit: boolean;
}

export interface LocationState {
  url: string;
  search: string;
}

export interface WindyOfflinePlugin {
  // startOfflineMode: () => Promise<unknown>;
  // stopOfflineMode: () => Promise<unknown>;
  controlReadiness: () => Promise<{ value: boolean }>;
  // fetchOfflineData: (payload: DownloadPayload) => Promise<unknown>;
  postMessage: (message: ClientMessage) => Promise<unknown>;
  addListener: (eventName: 'offlineMessage', callback: (message: { data: string }) => void) => void;
}

/**
 * # Plugin configuration
 *
 * Your plugin's main configuration file is named `pluginConfig.ts` and must adhere to `ExternalPluginConfig` interface.
 *
 * Properly configured editor, will help you to edit this file, and will provide you with autocompletion and type checking.
 *
 * Just remember, that any external plugin, must have a name, that starts with `windy-plugin-` prefix.
 *
 * @example
 * ```typescript
 * const config: ExternalPluginConfig = {
 *   name: 'windy-plugin-airspace-example',
 *   version: '1.0.0',
 *   title: 'Airspaces example',
 *   icon: '🚁',
 *   description: 'This plugin demonstrates capabilities...',
 *   author: 'IL (Windy.com)',
 *   repository: 'https://github.com/windycom/windy-plugins',
 *   desktopUI: 'embedded',
 *   mobileUI: 'small',
 *};
 *```
 */
export interface ExternalPluginConfig {
  /**
   * Name of the plugin, that (in order to separate external and
   * our internal plugins) MUST contain `windy-plugin-` prefix
   *
   * @example 'windy-plugin-hello-world'
   */
  name: `windy-plugin-${string}`;

  /**
   * If set, indicates, that plugin is private and should not be
   * offered to other users in plugins gallery. Companies and
   * institutions, can display their sensitive data on Windy.com
   * without any fear, that their API endpoints will be exposed.
   */
  private?: boolean;

  /**
   * Optional path to be used for routing and displaying of plugin's
   * path as URL in browser. Must have form of SEO friendly string,
   * with express.js inspired parameters.
   *
   * If defined installed plugins can user access via URL
   * https://www.windy.com/plugin/hello-world
   *
   * @example '/hello-world'
   * @example '/hello-world/:lat/:lon'
   * @example '/hello-world/:optional?'
   */
  routerPath?: `/${string}`;

  /**
   * Version of the plugin in semver format.
   *
   * @example '1.0.0'
   */
  version: string;

  /**
   * Official title of the plugin, that will be displayed as a browser title,
   * when plugin will be opened
   *
   * @example 'Hello World plugin'
   */
  title: string;

  /**
   * Unicode emoji icon, that will be displayed in plugins gallery
   * and in menu associated with this plugin
   *
   * @example '👋'
   */
  icon: string;

  /**
   * Optional plugin description that will be displayed in plugins gallery
   *
   * @example 'This plugin demonstrates capabilities of Windy Plugin System'
   */
  description?: string;

  /**
   * Plugin's author name
   *
   * @example 'John Doe (optional company name)'
   */
  author: string;

  /**
   * Location of repository, with source code of the plugin
   *
   * @example 'https://github.com/windycom/hello-world-plugin'
   */
  repository?: string;

  /**
   * Optional homepage, where plugin is described in more details
   *
   * @example 'https://www.company.com/about-our-plugin
   */
  homepage?: string;

  /**
   * If user can open plugin from context menu on map (RH button mouse click)
   * so plugin can be opened with lat, lon parameters.
   */
  addToContextmenu?: boolean;

  /**
   * Whether plugin (if opened) want to receive singleclick events
   * from map.
   */
  listenToSingleclick?: boolean;

  /**
   * Plugin behavior on desktop and tablet devices
   *
   * `rhpane` plugins occupy RH pane on desktop, which provides
   * enormous amount of space, and enables to scroll down, but
   * results in automatic closing or the plugin, when any other
   * UI element opens from right side (menu, settings etc...).
   *
   * Simply put only one rhpane plugin can be opened at the same time.
   *
   * You can use `embedded` position, whose space is limited, but plugin
   * is embedded into main page and stays open.
   */
  desktopUI: 'rhpane' | 'embedded';

  /**
   * Width of `rhpane` plugin in pixels (default is 400).
   */
  desktopWidth?: number;

  /**
   * Plugin behavior on mobile devices
   *
   * `fullscreen` plugin occupies whole screen, while `small` takes only minimum
   * space on the bottom of the screen.
   */
  mobileUI: 'fullscreen' | 'small';

  /**
   * The plugin has NO LINK in the main menu, can be open only programmatically
   * and its installation is not persistent.
   */
  internal?: boolean;
}

export interface CompiledExternalPluginConfig extends ExternalPluginConfig {
  /**
   * When was this plugin built
   */
  built: Timestamp;
  builtReadable: ISODateString;

  /**
   * If the final build contains screenshot, they are stored here
   */
  screenshot?: string;

  /**
   * User ID of the author of the plugin
   */
  windyUserId: number;

  /**
   * URL of users profile
   */
  communityProfileUrl: string;
}

/**
 * Already installed external plugin
 */
export interface InstalledExternalPluginConfig extends CompiledExternalPluginConfig {
  /**
   * URL of the plugin is used as unique identifier
   */
  url: string;

  /**
   * From which process was plugin installed
   */
  installedBy: 'dev' | 'gallery' | 'url' | 'patch';

  /**
   * When was this plugin installed by specific user
   */
  installed: Timestamp;
}

interface PromoFilteringParams {
  isLoggedIn: boolean;
  sessionCounter: number;
  isPremium: boolean;
}

/**
 * Main promo object, used in `client-patch`
 */
interface PromoObj {
  /**
   * Main ID of the promo. This key is also used in `promo` object in localStorage
   */
  readonly id: string;

  /**
   * ISO date, when the promo expires
   */
  readonly end: string;

  /**
   * How many times display promo to the user (respective on one device)
   */
  counter: number;

  /**
   * How often to display promo on particular device (in ms)
   */
  delay: number;

  /**
   * Any others filters, deciding whether to display promo or not
   */
  filter: () => boolean;

  /**
   * Should we display HP articles together with promo
   * @deprecated
   */
  loadArticles?: boolean;

  /**
   * Required method to be run, when promo is executed. In this stage we can also
   * do some additional checks, if promo should be displayed or not, so we must
   * call `promo.hitCounter()` method ourselves.
   */
  readonly run: () => void;

  /**
   * Optional HTML code to be used internally in `run` method
   */
  html?: string;
}

/**
 * Client patch object
 */
interface ClientPatch {
  __version: string;
  __css: string;
  exclusivePromos: PromoObj[];
  otherPromos: PromoObj[];
}