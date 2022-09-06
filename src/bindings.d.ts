export interface Bindings {
  TERRAFORM_STATE: KVNamespace
  SENTRY_DSN: string
}

declare global {
  function getMiniflareBindings(): Bindings
}
