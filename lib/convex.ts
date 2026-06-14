import { ConvexHttpClient } from "convex/browser";

// create a singleton instance of the convex http client
export const getConvexClient = () =>{
    return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
};