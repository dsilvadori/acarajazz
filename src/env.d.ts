/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** E-mail de quem está logado no /admin */
    usuario?: string;
  }
}
