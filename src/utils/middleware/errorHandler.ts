import { ZodError } from "zod";
import { NextFunction, Request, Response } from "express";
import { zodErrorToString } from "../zodErrorToString";

interface handleErrorType {
    message: string;
    code: number;
    uncaught?: string;
}

// will be used to create custom errors for endpoints
class createError extends Error {
    code: number;
    constructor(message: string, code: number = 500) {
        super(message);
        this.code = code;
    }
}

// will be used to handle all type of errors
function handleError({
    _error,
    uncaught,
}: {
    _error: unknown;
    uncaught?: boolean;
}): handleErrorType {

    //default error
    let error: { message: string; code: number; uncaught?: string } = {
        message: 'Unexpected error has occurred',
        code: 500,
    };

    // if error is just a string
    if (typeof _error === 'string') {
        error = new createError(_error);
    }
    // if error is from the createError class
    else if (_error instanceof createError) {
        error = { code: _error.code, message: _error.message };
    }
    // if the error is from zod validation
    else if (_error instanceof ZodError) {
        error = { code: 400, message: zodErrorToString(_error) };
    }
    // if the error is from the node js
    else if (_error instanceof Error) {
        error = { code: 500, message: _error.stack || 'Unknown error' };
    }
    // if the error is uncaught, it is defined in index.ts file
    // in this case, node server will be ended, and no response will be sent to client
    if (uncaught) {
        // and it is adding a message to the error object
        error = {
            ...error,
            uncaught:
                'uncaught exception or unhandled rejection, Node process finished !!',
        };
    }
    return error;
}

// middleware to handle all type of errors
function errorHandler(
    error: Error,
    _req: Request,
    res: Response,
    next: NextFunction,
) {
    const { message, code, ...rest } = handleError({ _error: error });

    // send the error to the client
    res.status(code).json({ message: message, ...rest });
    next();
}


// It will end the node server if there is an uncaught exception
// also log the error to the console
const uncaughtExceptionHandler = async (error: unknown) => {
    const uncaughtError = handleError({ _error: error, uncaught: true });
    console.log(uncaughtError);
    process.exit(1);
}

export { uncaughtExceptionHandler, errorHandler, handleError , createError};