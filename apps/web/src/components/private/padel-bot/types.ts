export interface HeaderField {
  key: string;
  value: string;
}

export interface BotConfig {
  targetHour: string;
  daysAhead: string;
  withLight: boolean;
  twoHours: boolean;
  maxWait: string;
}
