class Container {
  private services = new Map<string, unknown>();
  private factories = new Map<string, () => unknown>();

  register<T>(name: string, value: T): void {
    this.services.set(name, value);
  }

  factory<T>(name: string, factoryFn: () => T): void {
    this.factories.set(name, factoryFn);
  }

  resolve<T>(name: string): T {
    if (this.services.has(name)) {
      return this.services.get(name) as T;
    }
    if (this.factories.has(name)) {
      const instance = this.factories.get(name)!() as T;
      this.services.set(name, instance);
      return instance;
    }
    throw new Error(`Service '${name}' not found in container.`);
  }
}

export const container = new Container();
