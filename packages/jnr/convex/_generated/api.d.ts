/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as cardPacks from "../cardPacks.js";
import type * as consent from "../consent.js";
import type * as dataManagement from "../dataManagement.js";
import type * as messages from "../messages.js";
import type * as seedCardPack from "../seedCardPack.js";
import type * as tasks from "../tasks.js";
import type * as tenantMembers from "../tenantMembers.js";
import type * as tenants from "../tenants.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  cardPacks: typeof cardPacks;
  consent: typeof consent;
  dataManagement: typeof dataManagement;
  messages: typeof messages;
  seedCardPack: typeof seedCardPack;
  tasks: typeof tasks;
  tenantMembers: typeof tenantMembers;
  tenants: typeof tenants;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
