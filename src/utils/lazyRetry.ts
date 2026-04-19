import { ComponentType, lazy } from 'react';

/**
 * A wrapper around React.lazy that retries the dynamic import if it fails.
 * Useful for handling network flakiness when loading chunks.
 *
 * @param factory - The dynamic import function (e.g. () => import('./Component'))
 * @param retries - Number of retry attempts (default: 3)
 * @param interval - Delay between retries in ms (default: 1000)
 */
export const lazyRetry = <T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
    retries: number = 3,
    interval: number = 1000
) => {
    return lazy(() => {
        return new Promise<{ default: T }>((resolve, reject) => {
            const attempt = (left: number) => {
                factory()
                    .then(resolve)
                    .catch((error) => {
                        if (left === 0) {
                            reject(error);
                            return;
                        }

                        console.warn(`Lazy load failed, retrying... (${left} attempts left)`);
                        setTimeout(() => attempt(left - 1), interval);
                    });
            };

            attempt(retries);
        });
    });
};
