import { LoaderParameters } from "./LoaderParameters";

export interface LoaderFunctionArguments {
    request: Request;
    params: LoaderParameters;
    context?: any;
  }