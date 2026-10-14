export abstract class AppError extends Error {
    constructor(
        message: string,
    ) {
        super(message)
        this.name = this.constructor.name
    }
}



export class UnauthorizedError extends AppError {}

export const ErrUnauthorized = new UnauthorizedError("Не авторизован")