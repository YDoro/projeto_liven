import { LoadAccountByToken } from "../../domain/usecases/load-account-by-token";
import { HttpRequest, HttpResponse } from "../controllers/protocols/http";
import { Middleware } from "../controllers/protocols/middleware";
import { AccessDeniedError } from "../errors/access-denied-error";
import { forbidden } from "../helpers/http/http-helper";

export class AuthMiddleware implements Middleware{
    constructor(private readonly loadAccountByToken: LoadAccountByToken) {}
    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        const accessToken = httpRequest.headers?.['x-access-token']
        if(accessToken){
            await this.loadAccountByToken.load(accessToken)
        }
        
        return forbidden(new AccessDeniedError())
    }
}