import {z} from "zod";

export const authProviderObject = z.object({
    authProvider: z.string(),
    isPasswordSet: z.boolean(),
})

export type authProviderModel = z.infer<typeof authProviderObject>;