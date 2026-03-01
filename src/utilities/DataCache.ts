import {Currency} from "#root/src/types.js";

class DataCache<K, V> {

    readonly #name: string;
    #data: Map<K, V>;

    constructor(name: string) {

        this.#name = name;
        this.#data = new Map<K, V>();
    }

    async init(fetchFn: () => Promise<V[]>, keyFn: (e: V) => K) {

        const result = await fetchFn();

        this.#data = new Map<K, V>();

        result.forEach((element: V) => {
            const key = keyFn(element);
            this.#data.set(key, element);
        });
    }

    get(): Map<K, V> {

        if (this.#data.size === 0) throw new Error(`${this.#name} cache is empty`);
        return this.#data;
    }
}

const CurrencyCache = new DataCache<string, Currency>('currency');

export {
    CurrencyCache
}