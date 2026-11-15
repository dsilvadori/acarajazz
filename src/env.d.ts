/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** E-mail de quem está no /admin (Cloudflare Access) */
    usuario?: string;
  }
}
