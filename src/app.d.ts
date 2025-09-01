
// See https://kit.svelte.dev/docs/types#app
declare namespace App {
  interface Locals {
    user: { id: string, email: string } | null;
    org: { id: string, name: string } | null;
  }
}
