import {z} from "zod";

export type AuthProvider = "google" | "me"

export const authProviderObject = z.object({
    authProvider: z.string(),
    isPasswordSet: z.boolean(),
})

export type authProviderModel = z.infer<typeof authProviderObject>;