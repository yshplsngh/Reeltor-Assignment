import { ZodError } from 'zod';

/**
 * Flattens a Zod error object into a simple error string.
 * @returns e.g. "Invite Code is in an invalid format"
 * or if it fails, a standard "Validation error" message is returned
 */
export const zodErrorToString = (err: ZodError) => {
    try {
        return Object.entries((err as ZodError).flatten().fieldErrors)
            .reduce((acc, [field, errorMessages]) => {
                errorMessages?.forEach((msg) =>
                    acc.push(`${camelCaseToSentenceCase(field)} ${msg}`),
                );
                return acc;
            }, [] as string[])
            .join(', ');
    } catch (err) {
        return 'Validation error';
    }
};

/**
 * convert the camel case to sentance case
 * @param str - eg: "userId"
 * @returns "User Id"
 */
export const camelCaseToSentenceCase = (str: string) => {
    let result = str.charAt(0).toUpperCase();
    for (let i = 1; i < str.length; i++) {
        const char = str.charAt(i);
        if (char === char.toUpperCase()) {
            result += ' ' + char;
        } else {
            result += char;
        }
    }
    return result;
};