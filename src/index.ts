import "whatwg-fetch";
import { Art } from "./lib/art";
import { makeFetch, useFetch, makeSubmit, useSubmit } from "./lib/fetch";
import { useAutoRun } from "./lib/hooks";
import resso from "./lib/obs/resso";

export * from "./lib/model";
export { Art, resso, makeFetch, makeSubmit, useFetch, useSubmit, useAutoRun };
