export type CustomTabInstance<T extends typeof CustomTabBase = typeof CustomTabBase> =
    InstanceType<T>;

export type CustomTabConstructor<T extends typeof CustomTabBase = typeof CustomTabBase> = new (
    ...args: ConstructorParameters<T>
) => CustomTabInstance<T>;

export abstract class CustomTabBase {
    protected tab: object;

    protected el: HTMLElement;

    constructor(tab: object, el: HTMLElement) {
        this.tab = tab;
        this.el = el;
    }

    abstract render(): void;
}
