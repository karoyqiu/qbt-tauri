import store from 'store';

type Config = {
  listRefreshInterval: number;
  smallFileThreshold: number;
  seedingThreshold: number;
};

class Settings {
  private config: Config;

  constructor() {
    this.config = store.get('settings') as Config;

    if (!this.config) {
      this.config = {
        listRefreshInterval: 1000, // 1s
        smallFileThreshold: 209715200, // 200M
        seedingThreshold: 3600, // 1h
      };
    }
  }

  public get listRefreshInterval() {
    return this.config.listRefreshInterval;
  }

  public set listRefreshInterval(value: number) {
    this.config.listRefreshInterval = value;
    this.save();
  }

  public get smallFileThreshold() {
    return this.config.smallFileThreshold;
  }

  public set smallFileThreshold(value: number) {
    this.config.smallFileThreshold = value;
    this.save();
  }

  public get seedingThreshold() {
    return this.config.seedingThreshold;
  }

  public set seedingThreshold(value: number) {
    this.config.seedingThreshold = value;
    this.save();
  }

  private save() {
    store.set('settings', this.config);
  }
}

const settings = new Settings();

export default settings;
