export async function retry
    <T extends (...args: any) => any | Promise<any>, K = never>(
        fn: T,
        args?: Parameters<T>,
        max?: number,
        onError?: (e: any) => K
    ): Promise<Exclude<Awaited<ReturnType<T>>, undefined> | K> {
    const errorFunction = onError ? onError : (e: any) => { throw e };
    const maxRetry = max ? max : 3;
    let tries = 0;
    let res;
    do {
        try {
            res = fn(args);
            if (res instanceof Promise) {
                res = await res;
            }
            tries++;
            if (res) break;
        } catch (e) {
            errorFunction(e);
        }
    } while (tries < maxRetry);
    if (tries >= maxRetry) errorFunction(`Failed to meet success standard after ${maxRetry} retries`);
    return res;
}