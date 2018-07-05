
import * as crypto from 'crypto'

export function uniqByProp<T>(items: T[], prop: keyof T): T[] {
    const map: { [index: string]: any } = {}
    const list: T[] = []

    for (let item of items) {
        if (map[(<any>item)[prop]] === undefined) {
            map[(<any>item)[prop]] = 1;
            list.push(item)
        }
    }

    return list;
}

export function isTimeoutError(error: any) {
    return error && error.code && ['ESOCKETTIMEDOUT', 'ETIMEDOUT'].indexOf(error.code) > -1;
}

export function md5(value: string): string {
    return crypto.createHash('md5').update(value, 'utf8').digest('hex').toLowerCase();
}

export function uniq<T>(items: T[]) {
    return items.filter((value, index, self) => self.indexOf(value) === index);
}

export function mapPromise<T, R>(keys: T[], callback: (key: T) => Promise<R>):
    Promise<Map<T, R>> {
    const tasks = keys.map(key => callback(key).then(result => ({ key, result })));

    return Promise.all(tasks)
        .then(results => {
            const response: Map<T, R> = new Map();

            for (let item of results) {
                response.set(item.key, item.result);
            }

            return response;
        });
}

export const LANG_REG = /^[a-z]{2}$/;
export const COUNTRY_REG = /^[a-z]{2}$/;

export function unixTimestamp() {
    return Math.round(Date.now() / 1000);
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function filterStrings(str: (string | undefined | null)[]): string[] {
    return (str && str.filter(item => item && item.trim().length > 0) || []) as string[];
}
